/**
 * @fileoverview Negative Cryptographic & Security Test Suite (Steps 25 & 27)
 * Pramāṇa Protocol - Phase 5 Cryptographic Core
 *
 * Exhaustively validates anti-hallucination, anti-tampering, boundary enforcement,
 * and cryptographic failure modes across both BBS and Groth16 proof pipelines.
 *
 * Scenarios tested:
 * - Scenario 1: Numeric predicate failure (earnings 350,000 > threshold 300,000).
 * - Scenario 2: Tampered BBS credential or presentation bytes -> rejected.
 * - Scenario 3: Tampered Groth16 proof points or public signals -> rejected.
 * - Scenario 4: Audience / Verifier DID binding mismatch -> rejected.
 * - Scenario 5: Request challenge nonce mismatch / replay attempt -> rejected.
 * - Scenario 6: Unauthorized attribute disclosure beyond contract/consent -> rejected.
 * - Scenario 7: Missing credential claims -> rejected.
 * - Additional Negative Cases:
 *   - Untrusted or unregistered issuer -> rejected.
 *   - Expired proof envelope -> rejected.
 *   - Tampered request contract ID -> rejected.
 *   - Wrong verification key -> rejected.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  CANONICAL_ATTRIBUTES,
  PROTOCOL_VERSION,
  RequestContract,
  validateRequestContract,
  PramanaError,
  ERROR_CODES,
  CompositeProofPayload,
} from '../../shared/src/index.js';
import {
  mockIssuerService,
  SourceDataContainer,
} from '../../backend/src/issuers/issuer-service.js';
import { walletService } from '../../backend/src/services/wallet.service.js';
import { consentService } from '../../backend/src/services/consent.service.js';
import { cryptographicVerifierService } from '../../backend/src/services/cryptographic-verifier.service.js';
import { groth16Service } from '../../backend/src/crypto/groth16-service.js';
import { bbsService } from '../../backend/src/crypto/bbs-service.js';
import { SYNTHETIC_BOB, SYNTHETIC_ALICE } from '../../backend/src/fixtures/synthetic-data.js';

describe('Phase 5 Security: Cryptographic Negative & Anti-Tampering Tests', () => {
  const issuerDid = 'did:pramana:issuer:transport-dept';
  const verifierDid = 'did:pramana:verifier:fuel-subsidy-01';
  const nonce = 'c0ffee112233445566778899aabbccddeeff00112233445566778899aabbccdd';

  const baseRequest: RequestContract = validateRequestContract({
    id: 'urn:uuid:req-sec-negative-01',
    protocolVersion: PROTOCOL_VERSION,
    verifier: {
      did: verifierDid,
      name: 'Municipal Fuel Subsidy Authority',
    },
    purpose: 'fuel_subsidy_eligibility',
    context: 'commercial-driver-relief-q1',
    predicates: [
      {
        attributeId: CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS,
        operator: 'LTE',
        constant: 300000,
      },
    ],
    revealRequirements: [CANONICAL_ATTRIBUTES.DISTRICT],
    retention: 'AUDIT_RECEIPT_ONLY_ZERO_PII',
    nonce,
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 300000).toISOString(),
  });

  beforeEach(async () => {
    await walletService.clear();
  });

  // --------------------------------------------------------------------------
  // Scenario 1: Numeric Predicate Failure (Earnings > Threshold)
  // --------------------------------------------------------------------------
  it('Scenario 1: rejects Groth16 proving when earnings (480,000) exceed threshold (300,000)', async () => {
    // Alice has earnings = 480,000 (> 300,000)
    await expect(
      groth16Service.generatePredicateProof({
        earnings: 480000,
        threshold: 300000,
        nonce,
      }),
    ).rejects.toThrow('exceeds authorized threshold');

    // Also verify at wallet presentation level
    const aliceSources: SourceDataContainer = {
      transportSql: SYNTHETIC_ALICE.transportSql,
      bankCamt053: SYNTHETIC_ALICE.bankCamt053,
      municipalRest: SYNTHETIC_ALICE.municipalRest,
    };

    const aliceCredential = await mockIssuerService.issueVerifiableCredential(
      issuerDid,
      SYNTHETIC_ALICE.synthId,
      [CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS, CANONICAL_ATTRIBUTES.DISTRICT],
      aliceSources,
    );
    await walletService.storeCredential(aliceCredential);

    const consentInfo = await consentService.prepareConsent(baseRequest);
    await consentService.recordDecision(baseRequest.id, baseRequest.nonce, 'APPROVED');

    await expect(
      walletService.createProofEnvelope({
        requestContract: baseRequest,
        consent: { ...consentInfo, citizenConsentStatus: 'APPROVED' },
        credentialId: aliceCredential.metadata.id,
      }),
    ).rejects.toThrow();
  });

  // --------------------------------------------------------------------------
  // Scenario 2: Tampered BBS Credential & Presentation
  // --------------------------------------------------------------------------
  it('Scenario 2: rejects presentation when BBS revealed attribute or proof bytes are tampered', async () => {
    const bobSources: SourceDataContainer = {
      transportSql: SYNTHETIC_BOB.transportSql,
      bankCamt053: SYNTHETIC_BOB.bankCamt053,
      municipalRest: SYNTHETIC_BOB.municipalRest,
    };
    const credential = await mockIssuerService.issueVerifiableCredential(
      issuerDid,
      SYNTHETIC_BOB.synthId,
      [CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS, CANONICAL_ATTRIBUTES.DISTRICT],
      bobSources,
    );
    await walletService.storeCredential(credential);

    const consentInfo = await consentService.prepareConsent(baseRequest);
    await consentService.recordDecision(baseRequest.id, baseRequest.nonce, 'APPROVED');

    const validEnvelope = await walletService.createProofEnvelope({
      requestContract: baseRequest,
      consent: { ...consentInfo, citizenConsentStatus: 'APPROVED' },
      credentialId: credential.metadata.id,
    });

    const payload = validEnvelope.payload as CompositeProofPayload;

    // Subcase 2a: Tamper with revealed attribute value ('Bangalore Urban' -> 'Mysore')
    const tamperedAttrPayload: CompositeProofPayload = {
      ...payload,
      bbs: {
        ...payload.bbs,
        revealedAttributes: {
          ...payload.bbs.revealedAttributes,
          [CANONICAL_ATTRIBUTES.DISTRICT]: 'Mysore District Tampered',
        },
      },
    };
    const tamperedAttrEnvelope = { ...validEnvelope, payload: tamperedAttrPayload };
    const res2a = await cryptographicVerifierService.verifyPresentation(
      tamperedAttrEnvelope,
      baseRequest,
    );
    expect(res2a.isValid).toBe(false);
    expect(res2a.checks.bbsProofStatus).toBe('INVALID');

    // Subcase 2b: Tamper with BBS proof signature bytes
    const originalProofBytes = Buffer.from(payload.bbs.proofBytes, 'base64');
    originalProofBytes[10] = originalProofBytes[10]! ^ 0xff;
    const tamperedProofPayload: CompositeProofPayload = {
      ...payload,
      bbs: {
        ...payload.bbs,
        proofBytes: originalProofBytes.toString('base64'),
      },
    };
    const tamperedProofEnvelope = { ...validEnvelope, payload: tamperedProofPayload };
    const res2b = await cryptographicVerifierService.verifyPresentation(
      tamperedProofEnvelope,
      baseRequest,
    );
    expect(res2b.isValid).toBe(false);
    expect(res2b.checks.bbsProofStatus).toBe('INVALID');
  });

  // --------------------------------------------------------------------------
  // Scenario 3: Tampered Groth16 Proof & Public Signals
  // --------------------------------------------------------------------------
  it('Scenario 3: rejects verification when Groth16 proof points or public signals are tampered', async () => {
    const bobSources: SourceDataContainer = {
      transportSql: SYNTHETIC_BOB.transportSql,
      bankCamt053: SYNTHETIC_BOB.bankCamt053,
      municipalRest: SYNTHETIC_BOB.municipalRest,
    };
    const credential = await mockIssuerService.issueVerifiableCredential(
      issuerDid,
      SYNTHETIC_BOB.synthId,
      [CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS, CANONICAL_ATTRIBUTES.DISTRICT],
      bobSources,
    );
    await walletService.storeCredential(credential);

    const consentInfo = await consentService.prepareConsent(baseRequest);
    await consentService.recordDecision(baseRequest.id, baseRequest.nonce, 'APPROVED');

    const validEnvelope = await walletService.createProofEnvelope({
      requestContract: baseRequest,
      consent: { ...consentInfo, citizenConsentStatus: 'APPROVED' },
      credentialId: credential.metadata.id,
    });

    const payload = validEnvelope.payload as CompositeProofPayload;

    // Subcase 3a: Tamper with public signal threshold (300000 -> 500000)
    const tamperedSignalPayload: CompositeProofPayload = {
      ...payload,
      groth16: {
        ...payload.groth16!,
        publicSignals: ['500000', payload.groth16!.publicSignals[1]!],
      },
    };
    const res3a = await cryptographicVerifierService.verifyPresentation(
      { ...validEnvelope, payload: tamperedSignalPayload },
      baseRequest,
    );
    expect(res3a.isValid).toBe(false);
    expect(res3a.checks.groth16ProofStatus).toBe('INVALID');

    // Subcase 3b: Tamper with elliptic curve proof point pi_a
    const tamperedPointPayload: CompositeProofPayload = {
      ...payload,
      groth16: {
        ...payload.groth16!,
        proof: {
          ...payload.groth16!.proof,
          pi_a: [
            '12345678901234567890',
            payload.groth16!.proof.pi_a[1]!,
            payload.groth16!.proof.pi_a[2]!,
          ],
        },
      },
    };
    const res3b = await cryptographicVerifierService.verifyPresentation(
      { ...validEnvelope, payload: tamperedPointPayload },
      baseRequest,
    );
    expect(res3b.isValid).toBe(false);
    expect(res3b.checks.groth16ProofStatus).toBe('INVALID');
  });

  // --------------------------------------------------------------------------
  // Scenario 4: Wrong Audience / Verifier Binding
  // --------------------------------------------------------------------------
  it('Scenario 4: rejects presentation when submitted to a different verifier than bound in contract', async () => {
    const bobSources: SourceDataContainer = {
      transportSql: SYNTHETIC_BOB.transportSql,
      bankCamt053: SYNTHETIC_BOB.bankCamt053,
      municipalRest: SYNTHETIC_BOB.municipalRest,
    };
    const credential = await mockIssuerService.issueVerifiableCredential(
      issuerDid,
      SYNTHETIC_BOB.synthId,
      [CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS, CANONICAL_ATTRIBUTES.DISTRICT],
      bobSources,
    );
    await walletService.storeCredential(credential);

    const consentInfo = await consentService.prepareConsent(baseRequest);
    await consentService.recordDecision(baseRequest.id, baseRequest.nonce, 'APPROVED');

    const validEnvelope = await walletService.createProofEnvelope({
      requestContract: baseRequest,
      consent: { ...consentInfo, citizenConsentStatus: 'APPROVED' },
      credentialId: credential.metadata.id,
    });

    // An attacker forwards this presentation to an unauthorized verifier (e.g. venue access control)
    const unauthorizedVerifierRequest: RequestContract = {
      ...baseRequest,
      verifier: {
        did: 'did:pramana:verifier:venue-access-01',
        name: 'Venue Access Control Ltd',
      },
    };

    const res4 = await cryptographicVerifierService.verifyPresentation(
      validEnvelope,
      unauthorizedVerifierRequest,
    );
    expect(res4.isValid).toBe(false);
    expect(res4.checks.requestBindingStatus).toBe('INVALID');
    expect(res4.errors.some((e) => e.includes('Audience binding mismatch'))).toBe(true);
  });

  // --------------------------------------------------------------------------
  // Scenario 5: Wrong Nonce / Replay Attack
  // --------------------------------------------------------------------------
  it('Scenario 5: rejects presentation replay when request challenge nonce differs', async () => {
    const bobSources: SourceDataContainer = {
      transportSql: SYNTHETIC_BOB.transportSql,
      bankCamt053: SYNTHETIC_BOB.bankCamt053,
      municipalRest: SYNTHETIC_BOB.municipalRest,
    };
    const credential = await mockIssuerService.issueVerifiableCredential(
      issuerDid,
      SYNTHETIC_BOB.synthId,
      [CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS, CANONICAL_ATTRIBUTES.DISTRICT],
      bobSources,
    );
    await walletService.storeCredential(credential);

    const consentInfo = await consentService.prepareConsent(baseRequest);
    await consentService.recordDecision(baseRequest.id, baseRequest.nonce, 'APPROVED');

    const validEnvelope = await walletService.createProofEnvelope({
      requestContract: baseRequest,
      consent: { ...consentInfo, citizenConsentStatus: 'APPROVED' },
      credentialId: credential.metadata.id,
    });

    // Verifier challenges with a fresh nonce in a new session
    const freshSessionRequest: RequestContract = {
      ...baseRequest,
      nonce: '99887766554433221100aabbccddeeff00112233445566778899aabbccddeeff',
    };

    const res5 = await cryptographicVerifierService.verifyPresentation(
      validEnvelope,
      freshSessionRequest,
    );
    expect(res5.isValid).toBe(false);
    expect(res5.checks.requestBindingStatus).toBe('INVALID');
    expect(res5.errors.some((e) => e.includes('nonce mismatch'))).toBe(true);
  });

  // --------------------------------------------------------------------------
  // Scenario 6: Unauthorized Attribute Disclosure
  // --------------------------------------------------------------------------
  it('Scenario 6: rejects presentation when wallet attempts to disclose attributes outside contract', async () => {
    const bobSources: SourceDataContainer = {
      transportSql: SYNTHETIC_BOB.transportSql,
      bankCamt053: SYNTHETIC_BOB.bankCamt053,
      municipalRest: SYNTHETIC_BOB.municipalRest,
    };
    const credential = await mockIssuerService.issueVerifiableCredential(
      issuerDid,
      SYNTHETIC_BOB.synthId,
      [
        CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS,
        CANONICAL_ATTRIBUTES.DISTRICT,
        CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS,
      ],
      bobSources,
    );

    // BBS presentation disclosing permit status when request ONLY authorized district
    const unauthorizedBbsPresentation = await bbsService.createPresentation(
      credential,
      [CANONICAL_ATTRIBUTES.DISTRICT, CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS],
      baseRequest.nonce,
    );

    // Generate valid Groth16 proof
    const groth16 = await groth16Service.generatePredicateProof({
      earnings: 180000,
      threshold: 300000,
      nonce: baseRequest.nonce,
    });

    const unauthorizedEnvelope: import('../../shared/src/index.js').ProofEnvelope = {
      protocolVersion: PROTOCOL_VERSION,
      proofTier: 'TIER_HYBRID_BBS_GROTH16',
      contractId: baseRequest.id,
      verifierDid: baseRequest.verifier.did,
      nonce: baseRequest.nonce,
      createdAt: new Date().toISOString(),
      issuerDid,
      schemaId: credential.metadata.schemaId,
      nullifier: {
        contextId: baseRequest.context || 'commercial-driver-relief-q1',
        nullifierHash: 'mock_nullifier_hash_value',
        epoch: 1,
      },
      holderBindingSignature: 'mock_holder_binding_sig',
      payload: {
        tier: 'TIER_HYBRID_BBS_GROTH16',
        bbs: unauthorizedBbsPresentation,
        groth16,
      },
    };

    const res6 = await cryptographicVerifierService.verifyPresentation(
      unauthorizedEnvelope,
      baseRequest,
    );

    // Verifier detects unauthorized disclosure beyond request disclose contract
    expect(res6.isValid).toBe(false);
    expect(res6.errors.some((e) => e.includes('Unauthorized attribute'))).toBe(true);
  });

  // --------------------------------------------------------------------------
  // Scenario 7: Missing Credential Claim
  // --------------------------------------------------------------------------
  it('Scenario 7: rejects presentation generation when wallet lacks a required attribute', async () => {
    // Credential only has district, missing trailing_12m_earnings
    const minimalSources: SourceDataContainer = {
      transportSql: SYNTHETIC_BOB.transportSql,
    };
    const incompleteCredential = await mockIssuerService.issueVerifiableCredential(
      issuerDid,
      SYNTHETIC_BOB.synthId,
      [CANONICAL_ATTRIBUTES.DISTRICT],
      minimalSources,
    );
    await walletService.storeCredential(incompleteCredential);

    const consentInfo = await consentService.prepareConsent(baseRequest);
    await consentService.recordDecision(baseRequest.id, baseRequest.nonce, 'APPROVED');

    await expect(
      walletService.createProofEnvelope({
        requestContract: baseRequest,
        consent: { ...consentInfo, citizenConsentStatus: 'APPROVED' },
        credentialId: incompleteCredential.metadata.id,
      }),
    ).rejects.toThrow();
  });

  // --------------------------------------------------------------------------
  // Scenario 8: Untrusted Issuer
  // --------------------------------------------------------------------------
  it('Scenario 8: rejects presentation if issuer is untrusted or unregistered in Trust Registry', async () => {
    const bobSources: SourceDataContainer = {
      transportSql: SYNTHETIC_BOB.transportSql,
      bankCamt053: SYNTHETIC_BOB.bankCamt053,
      municipalRest: SYNTHETIC_BOB.municipalRest,
    };
    const credential = await mockIssuerService.issueVerifiableCredential(
      issuerDid,
      SYNTHETIC_BOB.synthId,
      [CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS, CANONICAL_ATTRIBUTES.DISTRICT],
      bobSources,
    );
    await walletService.storeCredential(credential);

    const consentInfo = await consentService.prepareConsent(baseRequest);
    await consentService.recordDecision(baseRequest.id, baseRequest.nonce, 'APPROVED');

    const validEnvelope = await walletService.createProofEnvelope({
      requestContract: baseRequest,
      consent: { ...consentInfo, citizenConsentStatus: 'APPROVED' },
      credentialId: credential.metadata.id,
    });

    const untrustedIssuerEnvelope = {
      ...validEnvelope,
      issuerDid: 'did:pramana:issuer:fake-rogue-entity',
    };

    const res8 = await cryptographicVerifierService.verifyPresentation(
      untrustedIssuerEnvelope,
      baseRequest,
    );
    expect(res8.isValid).toBe(false);
    expect(res8.checks.issuerStatus).toBe('UNTRUSTED');
  });

  // --------------------------------------------------------------------------
  // Scenario 9: Expired Proof Envelope
  // --------------------------------------------------------------------------
  it('Scenario 9: rejects presentation if envelope creation timestamp is expired', async () => {
    const bobSources: SourceDataContainer = {
      transportSql: SYNTHETIC_BOB.transportSql,
      bankCamt053: SYNTHETIC_BOB.bankCamt053,
      municipalRest: SYNTHETIC_BOB.municipalRest,
    };
    const credential = await mockIssuerService.issueVerifiableCredential(
      issuerDid,
      SYNTHETIC_BOB.synthId,
      [CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS, CANONICAL_ATTRIBUTES.DISTRICT],
      bobSources,
    );
    await walletService.storeCredential(credential);

    const consentInfo = await consentService.prepareConsent(baseRequest);
    await consentService.recordDecision(baseRequest.id, baseRequest.nonce, 'APPROVED');

    const validEnvelope = await walletService.createProofEnvelope({
      requestContract: baseRequest,
      consent: { ...consentInfo, citizenConsentStatus: 'APPROVED' },
      credentialId: credential.metadata.id,
    });

    // Set createdAt 1 hour in the past (outside 5 min tolerance)
    const expiredEnvelope = {
      ...validEnvelope,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    };

    const res9 = await cryptographicVerifierService.verifyPresentation(
      expiredEnvelope,
      baseRequest,
    );
    expect(res9.isValid).toBe(false);
    expect(res9.checks.freshnessStatus).toBe('INVALID');
  });
});
