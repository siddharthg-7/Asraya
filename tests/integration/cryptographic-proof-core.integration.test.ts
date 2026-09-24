/**
 * @fileoverview End-to-End Cryptographic Core Integration Test (Step 26)
 * Pramāṇa Protocol - Phase 5 Cryptographic Core
 *
 * Implements the full end-to-end cryptographic pipeline using the synthetic Bob subsidy scenario:
 *
 * Synthetic sources
 *        ↓
 * Phase 3 adapters
 *        ↓
 * Canonical attributes
 *        ↓
 * Minimal Claim Set
 *        ↓
 * Real BBS Credential (BLS12-381 G2)
 *        ↓
 * Wallet Storage
 *        ↓
 * Phase 4 Consent Approval
 *        ↓
 * BBS Selective Disclosure Presentation + Groth16 zk-SNARK Numeric Predicate Proof
 *        ↓
 * Cryptographic Verifier Service
 *        ↓
 * VALID
 *
 * Strict Privacy & Anti-Hallucination Invariants:
 * - District and permit status can be selectively disclosed.
 * - Exact earnings (180,000) are NOT disclosed in the presentation or wire payload.
 * - Bank IBAN and transaction history are NOT disclosed.
 * - Vehicle registration and municipal residential address are NOT disclosed.
 * - Both BBS and Groth16 proofs verify cryptographically against issuer public key and circuit vKey.
 */

import { describe, it, expect } from 'vitest';
import {
  CANONICAL_ATTRIBUTES,
  PROTOCOL_VERSION,
  RequestContract,
  validateRequestContract,
} from '../../shared/src/index.js';
import {
  mockIssuerService,
  SourceDataContainer,
} from '../../backend/src/issuers/issuer-service.js';
import { walletService } from '../../backend/src/services/wallet.service.js';
import { consentService } from '../../backend/src/services/consent.service.js';
import { cryptographicVerifierService } from '../../backend/src/services/cryptographic-verifier.service.js';
import { SYNTHETIC_BOB } from '../../backend/src/fixtures/synthetic-data.js';

describe('Phase 5 Integration: Cryptographic Core & Zero-Knowledge Verification', () => {
  it('executes complete synthetic Bob fuel subsidy cryptographic flow with zero data leakage', async () => {
    // ------------------------------------------------------------------------
    // Step 1: Synthetic Sources (Bob: permit=ACTIVE, earnings=180000, district=Bangalore Urban)
    // ------------------------------------------------------------------------
    const bobSources: SourceDataContainer = {
      transportSql: SYNTHETIC_BOB.transportSql,
      bankCamt053: SYNTHETIC_BOB.bankCamt053,
      municipalRest: SYNTHETIC_BOB.municipalRest,
    };

    const issuerDid = 'did:pramana:issuer:transport-dept';
    const subjectId = SYNTHETIC_BOB.synthId;

    // ------------------------------------------------------------------------
    // Step 2 & 3: Phase 3 Adapters & Canonical Attribute Transformation -> Minimal Claim Set
    // ------------------------------------------------------------------------
    const requestedAttributes = [
      CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS,
      CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS,
      CANONICAL_ATTRIBUTES.DISTRICT,
    ];

    // Verify Bob's raw source attributes contain sensitive data that MUST NOT leak
    expect(SYNTHETIC_BOB.bankCamt053.accountIban).toBe('IN00MOCK00009876543210');
    expect(SYNTHETIC_BOB.transportSql.RAW_VEHICLE_REG_NO).toBe('KA-02-CD-5678');
    expect(SYNTHETIC_BOB.municipalRest.residential_address).toBeDefined();

    // ------------------------------------------------------------------------
    // Step 4: Issue Real Cryptographic BBS Credential
    // ------------------------------------------------------------------------
    const credential = await mockIssuerService.issueVerifiableCredential(
      issuerDid,
      subjectId,
      requestedAttributes,
      bobSources,
    );

    expect(credential).toBeDefined();
    expect(credential.issuer.did).toBe(issuerDid);
    expect(credential.holderBinding.algorithm).toBe('BLS12-381-G1');
    expect(typeof credential.signature).toBe('string');
    expect(credential.signature.length).toBeGreaterThan(64);
    expect(credential.claims[CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS]).toBe('ACTIVE');
    expect(credential.claims[CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS]).toBe(180000);
    expect(credential.claims[CANONICAL_ATTRIBUTES.DISTRICT]).toBe('Bangalore Urban');

    // ------------------------------------------------------------------------
    // Step 5: Store in Citizen Non-Custodial Wallet
    // ------------------------------------------------------------------------
    await walletService.clear();
    await walletService.storeCredential(credential);

    const storedCredentials = await walletService.getCredentials();
    expect(storedCredentials).toHaveLength(1);

    // ------------------------------------------------------------------------
    // Step 6: Verifier Generates Request Contract (Phase 1 / 4)
    // - Reveal: district, commercial_permit_status
    // - Predicate: trailing_12m_earnings LTE 300000
    // ------------------------------------------------------------------------
    const nonce = 'a1b2c3d4e5f60718293a4b5c6d7e8f00112233445566778899aabbccddeeff00';
    const requestContract: RequestContract = validateRequestContract({
      id: 'urn:uuid:req-fuel-subsidy-crypto-2026',
      protocolVersion: PROTOCOL_VERSION,
      verifier: {
        did: 'did:pramana:verifier:fuel-subsidy-01',
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
      revealRequirements: [
        CANONICAL_ATTRIBUTES.DISTRICT,
        CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS,
      ],
      retention: 'AUDIT_RECEIPT_ONLY_ZERO_PII',
      nonce,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 300000).toISOString(),
    });

    // ------------------------------------------------------------------------
    // Step 7: Phase 4 Consent Preparation & Approval
    // ------------------------------------------------------------------------
    const consentInfo = await consentService.prepareConsent(requestContract);
    expect(consentInfo.who.verifierDid).toBe('did:pramana:verifier:fuel-subsidy-01');
    expect(consentInfo.notShared).toContain('exact_earnings_amount');
    expect(consentInfo.notShared).toContain('bank_account_number');

    await consentService.recordDecision(requestContract.id, requestContract.nonce, 'APPROVED');

    const approvedConsent: import('../../shared/src/index.js').ConsentInformation = {
      ...consentInfo,
      citizenConsentStatus: 'APPROVED',
    };

    // ------------------------------------------------------------------------
    // Step 8: Citizen Wallet Generates Composite Proof Presentation
    // - Selective disclosure of [district, commercial_permit_status] via BBS
    // - Zero-knowledge proof of earnings <= 300000 via Groth16
    // - Unlinkable verifier pseudonym + context nullifier
    // ------------------------------------------------------------------------
    const holderSecret = 'synthetic_bob_secure_seed_phrase_mock';
    const proofEnvelope = await walletService.createProofEnvelope({
      requestContract,
      consent: approvedConsent,
      credentialId: credential.metadata.id,
      holderSecret,
    });

    expect(proofEnvelope).toBeDefined();
    expect(proofEnvelope.proofTier).toBe('TIER_HYBRID_BBS_GROTH16');
    expect(proofEnvelope.contractId).toBe(requestContract.id);
    expect(proofEnvelope.nonce).toBe(requestContract.nonce);
    expect(proofEnvelope.verifierDid).toBe('did:pramana:verifier:fuel-subsidy-01');

    // ------------------------------------------------------------------------
    // Step 9: Strict Wire / Payload Privacy Assertions
    // ------------------------------------------------------------------------
    const serializedEnvelope = JSON.stringify(proofEnvelope);

    // 1. Exact earnings amount must NOT exist anywhere in wire payload
    expect(serializedEnvelope).not.toContain('180000');

    // 2. Sensitive source fields must NOT exist anywhere in wire payload
    expect(serializedEnvelope).not.toContain('IN00MOCK00009876543210'); // Bank IBAN
    expect(serializedEnvelope).not.toContain('KA-02-CD-5678'); // Vehicle Reg
    expect(serializedEnvelope).not.toContain('STMT-2026-BOB-02'); // Bank statement ID
    expect(serializedEnvelope).not.toContain('PERM-KA-2023-2002'); // Transport permit internal ID

    // 3. Holder secret / private keys must NOT exist in envelope
    expect(serializedEnvelope).not.toContain(holderSecret);

    // ------------------------------------------------------------------------
    // Step 10: Cryptographic Verifier Service Verification
    // ------------------------------------------------------------------------
    const verificationResult = await cryptographicVerifierService.verifyPresentation(
      proofEnvelope,
      requestContract,
    );

    expect(verificationResult.isValid).toBe(true);
    expect(verificationResult.errors).toHaveLength(0);

    // Verify structured check results
    expect(verificationResult.checks.issuerStatus).toBe('TRUSTED');
    expect(verificationResult.checks.issuerKeyValid).toBe(true);
    expect(verificationResult.checks.bbsProofStatus).toBe('VALID');
    expect(verificationResult.checks.groth16ProofStatus).toBe('VALID');
    expect(verificationResult.checks.requestBindingStatus).toBe('VALID');
    expect(verificationResult.checks.freshnessStatus).toBe('VALID');

    // Verify revealed claims contains ONLY the requested disclosures
    expect(verificationResult.revealedClaims[CANONICAL_ATTRIBUTES.DISTRICT]).toBe(
      'Bangalore Urban',
    );
    expect(verificationResult.revealedClaims[CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS]).toBe(
      'ACTIVE',
    );
    // Explicitly verify earnings claim is NOT revealed to verifier
    expect(
      verificationResult.revealedClaims[CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS],
    ).toBeUndefined();
  });
});
