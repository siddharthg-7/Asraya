/**
 * @fileoverview Unit Tests: Wallet Credential Abstraction & Presentation Service
 * Pramāṇa Protocol - Phase 5 Cryptographic Core
 */

import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { walletService } from '../../backend/src/services/wallet.service.js';
import { bbsService } from '../../backend/src/crypto/bbs-service.js';
import { issuerKeyManager } from '../../backend/src/crypto/issuer-key-manager.js';
import {
  VerifiableCredential,
  RequestContract,
  ConsentInformation,
  CANONICAL_ATTRIBUTES,
  ERROR_CODES,
  PramanaError,
} from '../../shared/src/index.js';

describe('Wallet Credential Management & Presentation Service Tests', () => {
  const issuerDid = 'did:pramana:issuer:transport-dept';
  let sampleCredential: VerifiableCredential;

  beforeAll(async () => {
    await issuerKeyManager.initializeIssuerKeys();

    sampleCredential = await bbsService.signCredential(
      issuerDid,
      {
        schemaId: 'urn:pramana:schema:trans:permit:v1',
        issuerDid,
        subjectId: 'citizen-bob-synth-001',
        claims: {
          [CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS]: 'ACTIVE',
          [CANONICAL_ATTRIBUTES.DISTRICT]: 'DISTRICT_42',
          [CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS]: 180000,
        },
        issuedAt: new Date().toISOString(),
      },
      {
        holderPublicKeyHash: 'holder_pub_hash_sample_01',
        algorithm: 'BLS12-381-G1',
      },
    );
  });

  beforeEach(async () => {
    await walletService.clear();
    await walletService.storeCredential(sampleCredential);
  });

  const mockRequest: RequestContract = {
    id: 'req-contract-uuid-001',
    protocolVersion: '1.0.0',
    verifier: {
      did: 'did:pramana:verifier:fuel-subsidy-corp',
      name: 'Clean Fuel Subsidy Authority',
    },
    purpose: 'COMMERCIAL_PERMIT_SUBSIDY',
    context: 'campaign:ev-subsidy-2026',
    predicates: [
      {
        attributeId: CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS,
        operator: 'LTE',
        constant: 300000,
      },
    ],
    revealRequirements: [CANONICAL_ATTRIBUTES.DISTRICT],
    retention: 'AUDIT_RECEIPT_ONLY_ZERO_PII',
    nonce: 'req-nonce-01234567890123456789012345678901',
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 60000).toISOString(),
  };

  const mockConsent: ConsentInformation = {
    requestId: mockRequest.id,
    requestNonce: mockRequest.nonce,
    who: {
      verifierDid: mockRequest.verifier.did,
      verifierName: mockRequest.verifier.name,
    },
    what: {
      purpose: mockRequest.purpose,
      disclosedAttributes: [
        {
          attributeId: CANONICAL_ATTRIBUTES.DISTRICT,
          name: 'District',
          description: 'Administrative district',
          category: 'CIVIL',
        },
      ],
      predicates: [
        {
          attributeId: CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS,
          name: 'Annual Earnings',
          operator: 'LTE',
          humanReadableCondition: 'Earnings <= 300,000 INR',
        },
      ],
    },
    notShared: [
      CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS,
      CANONICAL_ATTRIBUTES.BANK_ACCOUNT_NUMBER,
    ],
    template: {
      templateId: 'tmpl:subsidy:v1',
      templateVersion: '1.0.0',
      templateHash: 'hash_template_123',
      locale: 'en-US',
      renderedSummary: 'Allow verification of commercial permit and income <= 300,000 INR',
    },
    citizenConsentStatus: 'APPROVED',
    expiresAt: mockRequest.expiresAt,
  };

  it('should store and retrieve credentials in wallet', async () => {
    const creds = await walletService.getCredentials();
    expect(creds).toHaveLength(1);
    expect(creds[0]?.metadata.id).toBe(sampleCredential.metadata.id);
  });

  it('should match stored credentials against request requirements', async () => {
    const matched = await walletService.findMatchingCredential(mockRequest);
    expect(matched.metadata.id).toBe(sampleCredential.metadata.id);
  });

  it('should fail matching when wallet lacks a required attribute', async () => {
    const overaskingRequest: RequestContract = {
      ...mockRequest,
      revealRequirements: [
        CANONICAL_ATTRIBUTES.DISTRICT,
        'urn:pramana:attr:civil:passport-number', // Not present in wallet credential!
      ],
    };

    await expect(walletService.findMatchingCredential(overaskingRequest)).rejects.toThrow(
      'Wallet possesses no single credential satisfying all requested attributes',
    );
  });

  it('should generate distinct, unlinkable pseudonyms per verifier without global citizen ID', () => {
    const holderSecret = 'holder_master_secret_random_seed_98765';

    const nymA = walletService.deriveVerifierPseudonym(
      holderSecret,
      'did:pramana:verifier:authority-a',
    );
    const nymB = walletService.deriveVerifierPseudonym(
      holderSecret,
      'did:pramana:verifier:authority-b',
    );

    // Unlinkability: Different verifiers MUST receive different pseudonyms
    expect(nymA).not.toBe(nymB);

    // Determinism: Same verifier produces identical pseudonym
    const nymA2 = walletService.deriveVerifierPseudonym(
      holderSecret,
      'did:pramana:verifier:authority-a',
    );
    expect(nymA).toBe(nymA2);

    // Privacy: No phone, email, or citizen name leaked
    expect(nymA).toMatch(/^[a-f0-9]{64}$/);
    expect(nymB).toMatch(/^[a-f0-9]{64}$/);
  });

  it('should generate context-scoped nullifiers for duplicate claim prevention', () => {
    const holderSecret = 'holder_master_secret_random_seed_98765';

    const nullifierContext1 = walletService.deriveNullifier(
      holderSecret,
      'campaign:subsidy-ev-2026',
      1,
    );
    const nullifierContext2 = walletService.deriveNullifier(
      holderSecret,
      'campaign:subsidy-solar-2026',
      1,
    );
    const nullifierEpoch2 = walletService.deriveNullifier(
      holderSecret,
      'campaign:subsidy-ev-2026',
      2,
    );

    // Different campaign contexts produce different nullifiers
    expect(nullifierContext1.nullifierHash).not.toBe(nullifierContext2.nullifierHash);

    // Different epochs produce different nullifiers
    expect(nullifierContext1.nullifierHash).not.toBe(nullifierEpoch2.nullifierHash);

    // Same campaign and epoch produce identical nullifier
    const nullifierRepeat = walletService.deriveNullifier(
      holderSecret,
      'campaign:subsidy-ev-2026',
      1,
    );
    expect(nullifierContext1.nullifierHash).toBe(nullifierRepeat.nullifierHash);
  });

  it('should assemble a complete hybrid ProofEnvelope with selective disclosure and predicate proof', async () => {
    const envelope = await walletService.createProofEnvelope({
      requestContract: mockRequest,
      consent: mockConsent,
      holderSecret: 'holder_test_secret_12345',
    });

    expect(envelope.contractId).toBe(mockRequest.id);
    expect(envelope.verifierDid).toBe(mockRequest.verifier.did);
    expect(envelope.nonce).toBe(mockRequest.nonce);
    expect(envelope.proofTier).toBe('TIER_HYBRID_BBS_GROTH16');

    // Check payload structure
    const payload = envelope.payload as import('../../shared/src/index.js').CompositeProofPayload;
    expect(payload.tier).toBe('TIER_HYBRID_BBS_GROTH16');

    // BBS selective disclosure revealed attributes
    expect(payload.bbs.revealedAttributes).toEqual({
      [CANONICAL_ATTRIBUTES.DISTRICT]: 'DISTRICT_42',
    });
    // PRIVACY: earnings MUST NOT be in revealedAttributes
    expect(
      payload.bbs.revealedAttributes[CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS],
    ).toBeUndefined();

    // Groth16 predicate proof
    expect(payload.groth16.circuitId).toBe('urn:pramana:circuit:earnings-lte:v1');
    expect(payload.groth16.publicSignals[0]).toBe('300000');

    // Holder binding and nullifier
    expect(envelope.holderBindingSignature).toBeTypeOf('string');
    expect(envelope.nullifier.contextId).toBe(mockRequest.context);
  });
});
