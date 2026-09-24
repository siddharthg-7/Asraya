/**
 * @fileoverview Phase 4 Unit Tests: Request -> Policy -> Consent
 * Pramāṇa Protocol - Phase 4 Specification Conformance
 */

import { describe, it, expect } from 'vitest';
import {
  RequestContract,
  PROTOCOL_VERSION,
  PramanaError,
  ERROR_CODES,
} from '../../shared/src/index.js';
import { policyService } from '../../backend/src/services/policy.service.js';
import { consentService } from '../../backend/src/services/consent.service.js';
import { trustRegistry } from '../../backend/src/registry/trust-registry.js';

describe('Phase 4 Unit Tests: Request -> Policy -> Consent Pipeline', () => {
  const baseValidContract: RequestContract = {
    id: 'urn:uuid:req-phase4-test-01',
    protocolVersion: PROTOCOL_VERSION,
    verifier: {
      did: 'did:pramana:verifier:venue-access-01',
      name: 'Untrusted Verifier Display Claim',
    },
    purpose: 'PURPOSE_AGE_VERIFICATION',
    context: 'venue-entry-checkpoint-a',
    predicates: [
      {
        attributeId: 'urn:pramana:attr:civil:age',
        operator: 'LTE',
        constant: 25,
      },
    ],
    revealRequirements: [],
    retention: 'AUDIT_RECEIPT_ONLY_ZERO_PII',
    nonce: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 120000).toISOString(),
  };

  // ==========================================================================
  // 1. REQUEST VALIDATION
  // ==========================================================================
  describe('1. Request Validation', () => {
    it('should validate a compliant request contract', () => {
      const validated = policyService.validateRequest(baseValidContract);
      expect(validated.id).toBe(baseValidContract.id);
      expect(validated.nonce).toBe(baseValidContract.nonce);
      expect(validated.purpose).toBe('PURPOSE_AGE_VERIFICATION');
    });

    it('should reject malformed non-object request', () => {
      expect(() => policyService.validateRequest(null)).toThrow();
      expect(() => policyService.validateRequest('invalid-string')).toThrow();
    });

    it('should reject invalid protocol version', () => {
      const bad = { ...baseValidContract, protocolVersion: '999.0.0' };
      expect(() => policyService.validateRequest(bad)).toThrow();
    });

    it('should reject invalid or missing verifier DID', () => {
      const bad = { ...baseValidContract, verifier: { did: 'not-a-did', name: 'Venue' } };
      expect(() => policyService.validateRequest(bad)).toThrow();
    });

    it('should reject empty purpose', () => {
      const bad = { ...baseValidContract, purpose: '   ' };
      expect(() => policyService.validateRequest(bad)).toThrow();
    });

    it('should reject empty predicates array', () => {
      const bad = { ...baseValidContract, predicates: [] };
      expect(() => policyService.validateRequest(bad)).toThrow();
    });

    it('should reject short nonce (< 32 hex characters)', () => {
      const bad = { ...baseValidContract, nonce: 'too-short-nonce' };
      expect(() => policyService.validateRequest(bad)).toThrow();
    });

    it('should reject expired request contract', () => {
      const expired = {
        ...baseValidContract,
        issuedAt: new Date(Date.now() - 300000).toISOString(),
        expiresAt: new Date(Date.now() - 60000).toISOString(),
      };
      expect(() => policyService.validateRequest(expired)).toThrow();
      try {
        policyService.validateRequest(expired);
      } catch (err: unknown) {
        expect((err as PramanaError).code).toBe(ERROR_CODES.EXPIRED_REQUEST);
      }
    });
  });

  // ==========================================================================
  // 2. VERIFIER POLICY & TRUST REGISTRY ENFORCEMENT
  // ==========================================================================
  describe('2. Verifier Policy', () => {
    it('should authorize active registered verifier with permitted purpose', async () => {
      const result = await policyService.evaluatePolicy(baseValidContract);
      expect(result.status).toBe('AUTHORIZED');
      expect(result.authorized).toBe(true);
      expect(result.verifierDid).toBe('did:pramana:verifier:venue-access-01');
    });

    it('should reject unknown verifier not in Trust Registry', async () => {
      const unknownVerifierContract: RequestContract = {
        ...baseValidContract,
        verifier: {
          did: 'did:pramana:verifier:unknown-999',
          name: 'Unknown Verifier',
        },
      };
      await expect(policyService.evaluatePolicy(unknownVerifierContract)).rejects.toMatchObject({
        code: ERROR_CODES.LICENCE_INVALID,
      });
    });

    it('should reject suspended verifier', async () => {
      const suspendedContract: RequestContract = {
        ...baseValidContract,
        verifier: {
          did: 'did:pramana:verifier:suspended-01',
          name: 'Suspended Gaming Portal Ltd',
        },
      };
      await expect(policyService.evaluatePolicy(suspendedContract)).rejects.toMatchObject({
        code: ERROR_CODES.VERIFIER_NOT_AUTHORIZED,
      });
    });

    it('should reject revoked verifier', async () => {
      const revokedContract: RequestContract = {
        ...baseValidContract,
        verifier: {
          did: 'did:pramana:verifier:revoked-01',
          name: 'Fraudulent Verifier Corp',
        },
      };
      await expect(policyService.evaluatePolicy(revokedContract)).rejects.toMatchObject({
        code: ERROR_CODES.VERIFIER_NOT_AUTHORIZED,
      });
    });

    it('should reject verifier with expired licence', async () => {
      const expiredLicenceContract: RequestContract = {
        ...baseValidContract,
        verifier: {
          did: 'did:pramana:verifier:expired-01',
          name: 'Expired Merchant Corp',
        },
      };
      await expect(policyService.evaluatePolicy(expiredLicenceContract)).rejects.toMatchObject({
        code: ERROR_CODES.LICENCE_INVALID,
      });
    });

    it('should reject unauthorized purpose for verifier', async () => {
      const unauthorizedPurpose: RequestContract = {
        ...baseValidContract,
        purpose: 'PURPOSE_COMMERCIAL_PERMIT', // Venue is only licensed for PURPOSE_AGE_VERIFICATION
      };
      await expect(policyService.evaluatePolicy(unauthorizedPurpose)).rejects.toMatchObject({
        code: ERROR_CODES.PURPOSE_NOT_AUTHORIZED,
      });
    });

    it('should reject predicate using unauthorized attribute for verifier', async () => {
      const unauthorizedAttrPredicate: RequestContract = {
        ...baseValidContract,
        predicates: [
          {
            attributeId: 'urn:pramana:attr:fin:annual_income', // Venue cannot predicate on income!
            operator: 'LTE',
            constant: 500000,
          },
        ],
      };
      await expect(policyService.evaluatePolicy(unauthorizedAttrPredicate)).rejects.toMatchObject({
        code: ERROR_CODES.PREDICATE_NOT_AUTHORIZED,
      });
    });
  });

  // ==========================================================================
  // 3. DATA MINIMIZATION & OVER-ASKING
  // ==========================================================================
  describe('3. Data Minimization', () => {
    it('should accept valid minimal request with zero disclosures', async () => {
      const minimal = {
        ...baseValidContract,
        revealRequirements: [],
      };
      const result = await policyService.evaluatePolicy(minimal);
      expect(result.status).toBe('AUTHORIZED');
    });

    it('should reject over-asking when retention exceeds licence maximum limit', async () => {
      const overRetaining: RequestContract = {
        ...baseValidContract,
        retention: 'TRANSIENT_SESSION_ONLY', // Venue licence allows at most AUDIT_RECEIPT_ONLY_ZERO_PII
      };
      await expect(policyService.evaluatePolicy(overRetaining)).rejects.toMatchObject({
        code: ERROR_CODES.DATA_MINIMIZATION_VIOLATION,
      });
    });

    it('should reject raw source-specific SQL field names in disclosures', async () => {
      const sourceInjection: RequestContract = {
        ...baseValidContract,
        revealRequirements: ['citizens.records.date_of_birth'],
      };
      await expect(policyService.evaluatePolicy(sourceInjection)).rejects.toThrow();
    });

    it('should reject raw source-specific CAMT field names in predicates', async () => {
      const sourcePredInjection: RequestContract = {
        ...baseValidContract,
        predicates: [
          {
            attributeId: 'BkToCstmrStmt.Stmt.Bal.Amt',
            operator: 'LTE',
            constant: 1000,
          },
        ],
      };
      await expect(policyService.evaluatePolicy(sourcePredInjection)).rejects.toThrow();
    });

    it('should reject unregistered attribute disclosure', async () => {
      const unregistered: RequestContract = {
        ...baseValidContract,
        revealRequirements: ['urn:pramana:attr:fake:unregistered_attribute'],
      };
      await expect(policyService.evaluatePolicy(unregistered)).rejects.toThrow();
    });
  });

  // ==========================================================================
  // 4. PREDICATE GRAMMAR & OPERATORS
  // ==========================================================================
  describe('4. Predicate Operators', () => {
    it('should allow valid EQ, LT, LTE predicates', async () => {
      const fintechContract: RequestContract = {
        id: 'urn:uuid:req-fintech-01',
        protocolVersion: PROTOCOL_VERSION,
        verifier: {
          did: 'did:pramana:verifier:fin-eval-01',
          name: 'Micro-Credit Assessment Ltd',
        },
        purpose: 'PURPOSE_INCOME_CHECK',
        context: 'loan-application',
        predicates: [
          {
            attributeId: 'urn:pramana:attr:fin:trailing_12m_earnings',
            operator: 'LTE',
            constant: 500000,
          },
        ],
        revealRequirements: [],
        retention: 'TRANSIENT_SESSION_ONLY',
        nonce: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 120000).toISOString(),
      };

      const result = await policyService.evaluatePolicy(fintechContract);
      expect(result.status).toBe('AUTHORIZED');
    });

    it('should allow valid bounded IN predicate (<= 8 elements)', async () => {
      const permitContract: RequestContract = {
        id: 'urn:uuid:req-permit-01',
        protocolVersion: PROTOCOL_VERSION,
        verifier: {
          did: 'did:pramana:verifier:permit-portal-01',
          name: 'Municipal Commerce Licensing Board',
        },
        purpose: 'PURPOSE_COMMERCIAL_PERMIT',
        context: 'portal-login',
        predicates: [
          {
            attributeId: 'urn:pramana:attr:permit:status',
            operator: 'IN',
            constant: ['ACTIVE', 'VALID'],
          },
        ],
        revealRequirements: [],
        retention: 'AUDIT_RECEIPT_ONLY_ZERO_PII',
        nonce: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 120000).toISOString(),
      };

      const result = await policyService.evaluatePolicy(permitContract);
      expect(result.status).toBe('AUTHORIZED');
    });

    it('should allow valid compound AND predicate', async () => {
      const fintechCompound: RequestContract = {
        id: 'urn:uuid:req-fintech-compound',
        protocolVersion: PROTOCOL_VERSION,
        verifier: {
          did: 'did:pramana:verifier:fin-eval-01',
          name: 'Micro-Credit Assessment Ltd',
        },
        purpose: 'PURPOSE_INCOME_CHECK',
        context: 'loan-application',
        predicates: [
          {
            type: 'COMPOUND_AND',
            predicates: [
              {
                attributeId: 'urn:pramana:attr:fin:trailing_12m_earnings',
                operator: 'LTE',
                constant: 500000,
              },
              {
                attributeId: 'urn:pramana:attr:civil:age',
                operator: 'LTE',
                constant: 65,
              },
            ],
          },
        ],
        revealRequirements: [],
        retention: 'TRANSIENT_SESSION_ONLY',
        nonce: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 120000).toISOString(),
      };

      const result = await policyService.evaluatePolicy(fintechCompound);
      expect(result.status).toBe('AUTHORIZED');
    });

    it('should reject IN predicate with > 8 elements', async () => {
      const oversizedInContract = {
        ...baseValidContract,
        predicates: [
          {
            attributeId: 'urn:pramana:attr:civil:age',
            operator: 'IN',
            constant: [18, 19, 20, 21, 22, 23, 24, 25, 26], // 9 elements
          },
        ],
      };
      await expect(policyService.evaluatePolicy(oversizedInContract as any)).rejects.toThrow();
    });

    it('should reject forbidden operator GT', async () => {
      const badOperatorContract = {
        ...baseValidContract,
        predicates: [
          {
            attributeId: 'urn:pramana:attr:civil:age',
            operator: 'GT',
            constant: 18,
          },
        ],
      };
      await expect(policyService.evaluatePolicy(badOperatorContract as any)).rejects.toThrow();
    });

    it('should reject forbidden operator GTE', async () => {
      const badOperatorContract = {
        ...baseValidContract,
        predicates: [
          {
            attributeId: 'urn:pramana:attr:civil:age',
            operator: 'GTE',
            constant: 18,
          },
        ],
      };
      await expect(policyService.evaluatePolicy(badOperatorContract as any)).rejects.toThrow();
    });

    it('should reject forbidden operator NEQ', async () => {
      const badOperatorContract = {
        ...baseValidContract,
        predicates: [
          {
            attributeId: 'urn:pramana:attr:civil:age',
            operator: 'NEQ',
            constant: 18,
          },
        ],
      };
      await expect(policyService.evaluatePolicy(badOperatorContract as any)).rejects.toThrow();
    });

    it('should reject disjunction operator OR', async () => {
      const orContract = {
        ...baseValidContract,
        predicates: [
          {
            type: 'COMPOUND_OR',
            predicates: [],
          },
        ],
      };
      await expect(policyService.evaluatePolicy(orContract as any)).rejects.toThrow();
    });
  });

  // ==========================================================================
  // 5. CONSENT INFORMATION & STATE
  // ==========================================================================
  describe('5. Consent Information & Decision Separation', () => {
    it('should generate correct WHO from Trust Registry legalName rather than spoofed request name', async () => {
      const consentInfo = await consentService.prepareConsent(baseValidContract);

      // WHO must reflect authoritative Trust Registry record
      expect(consentInfo.who.verifierDid).toBe('did:pramana:verifier:venue-access-01');
      expect(consentInfo.who.verifierName).toBe('Venue Access Control Ltd');
      expect(consentInfo.who.verifierName).not.toBe('Untrusted Verifier Display Claim');
    });

    it('should generate correct WHAT distinguishing disclosed attributes from predicate conditions', async () => {
      const subsidyContract: RequestContract = {
        id: 'urn:uuid:req-subsidy-what-01',
        protocolVersion: PROTOCOL_VERSION,
        verifier: {
          did: 'did:pramana:verifier:fuel-subsidy-01',
          name: 'Municipal Fuel Subsidy Authority',
        },
        purpose: 'fuel_subsidy_eligibility',
        context: 'subsidy-intake-2026',
        predicates: [
          {
            attributeId: 'urn:pramana:attr:fin:trailing_12m_earnings',
            operator: 'LTE',
            constant: 300000,
          },
          {
            attributeId: 'urn:pramana:attr:permit:status',
            operator: 'EQ',
            constant: 'ACTIVE',
          },
        ],
        revealRequirements: ['urn:pramana:attr:civil:district'],
        retention: 'AUDIT_RECEIPT_ONLY_ZERO_PII',
        nonce: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 120000).toISOString(),
      };

      const consentInfo = await consentService.prepareConsent(subsidyContract);

      // Disclosed attributes list (clear-text revealed)
      expect(consentInfo.what.disclosedAttributes.length).toBe(1);
      expect(consentInfo.what.disclosedAttributes[0]!.name).toBe('district');

      // Predicates list (zero-knowledge proven conditions)
      expect(consentInfo.what.predicates.length).toBe(2);
      expect(consentInfo.what.predicates[0]!.humanReadableCondition).toContain(
        'trailing_12m_earnings',
      );
      expect(consentInfo.what.predicates[1]!.humanReadableCondition).toContain(
        'commercial_permit_status',
      );
    });

    it('should generate correct NOT SHARED list without exposing private fields', async () => {
      const consentInfo = await consentService.prepareConsent(baseValidContract);

      expect(consentInfo.notShared).toContain('residential_address');
      expect(consentInfo.notShared).toContain('date_of_birth');
    });

    it('should resolve correct TemplateBundle from Trust Registry and bind hash', async () => {
      const consentInfo = await consentService.prepareConsent(baseValidContract);

      expect(consentInfo.template.templateId).toBe('tmpl:consent:age-verify-v1');
      expect(consentInfo.template.templateHash.length).toBe(64);
      expect(consentInfo.template.renderedSummary).toContain('Venue Access Control Ltd');
    });

    it('should fail explicitly when template does not exist for purpose', async () => {
      // Register custom verifier with purpose that has no template
      await trustRegistry.registerVerifierLicence({
        did: 'did:pramana:verifier:notemplate-01',
        legalName: 'No Template Verifier',
        permittedPurposes: ['PURPOSE_WITHOUT_TEMPLATE'],
        permittedPredicates: ['urn:pramana:attr:civil:age'],
        maxRetentionPolicy: 'AUDIT_RECEIPT_ONLY_ZERO_PII',
        validUntil: '2030-01-01T00:00:00Z',
        status: 'ACTIVE',
      });

      const noTemplateContract: RequestContract = {
        ...baseValidContract,
        verifier: {
          did: 'did:pramana:verifier:notemplate-01',
          name: 'No Template Verifier',
        },
        purpose: 'PURPOSE_WITHOUT_TEMPLATE',
      };

      await expect(consentService.prepareConsent(noTemplateContract)).rejects.toMatchObject({
        code: ERROR_CODES.CONSENT_TEMPLATE_NOT_FOUND,
      });
    });

    it('should maintain strict distinction: POLICY AUTHORIZED !== CITIZEN CONSENTED', async () => {
      // 1. Policy is evaluated
      const policyResult = await policyService.evaluatePolicy(baseValidContract);
      expect(policyResult.status).toBe('AUTHORIZED');

      // 2. Prepare consent information
      const consentInfo = await consentService.prepareConsent(baseValidContract);

      // 3. Citizen consent status MUST be strictly PENDING
      expect(consentInfo.citizenConsentStatus).toBe('PENDING');
      expect(consentInfo.citizenConsentStatus).not.toBe('APPROVED');
    });

    it('should bind citizen consent decision directly to request ID and fresh nonce', async () => {
      const consentInfo = await consentService.prepareConsent(baseValidContract);

      // Record citizen approval
      const decisionRecord = await consentService.recordDecision(
        consentInfo.requestId,
        consentInfo.requestNonce,
        'APPROVED',
      );

      expect(decisionRecord.requestId).toBe(baseValidContract.id);
      expect(decisionRecord.requestNonce).toBe(baseValidContract.nonce);
      expect(decisionRecord.decision).toBe('APPROVED');

      // Lookup decision
      const fetched = await consentService.getDecision(
        baseValidContract.id,
        baseValidContract.nonce,
      );
      expect(fetched?.decision).toBe('APPROVED');
    });

    it('should support explicit citizen consent rejection', async () => {
      const consentInfo = await consentService.prepareConsent(baseValidContract);

      const decisionRecord = await consentService.recordDecision(
        consentInfo.requestId,
        consentInfo.requestNonce,
        'REJECTED',
      );

      expect(decisionRecord.decision).toBe('REJECTED');
    });
  });

  // ==========================================================================
  // 6. SECURITY CONTROLS
  // ==========================================================================
  describe('6. Security Controls', () => {
    it('should prevent spoofing verifier legal name in consent prompt', async () => {
      const spoofed = {
        ...baseValidContract,
        verifier: {
          did: 'did:pramana:verifier:venue-access-01',
          name: 'Official State Supreme Court', // Spoofed name!
        },
      };

      const consentInfo = await consentService.prepareConsent(spoofed);
      expect(consentInfo.who.verifierName).toBe('Venue Access Control Ltd');
      expect(consentInfo.template.renderedSummary).not.toContain('Official State Supreme Court');
      expect(consentInfo.template.renderedSummary).toContain('Venue Access Control Ltd');
    });

    it('should prevent request from bypassing expired licence check', async () => {
      const expiredLicenceReq = {
        ...baseValidContract,
        verifier: {
          did: 'did:pramana:verifier:expired-01',
          name: 'Expired Merchant Corp',
        },
      };
      await expect(consentService.prepareConsent(expiredLicenceReq)).rejects.toMatchObject({
        code: ERROR_CODES.LICENCE_INVALID,
      });
    });

    it('should prevent request from manufacturing citizen consent without wallet confirmation', async () => {
      const consentInfo = await consentService.prepareConsent(baseValidContract);
      expect(consentInfo.citizenConsentStatus).toBe('PENDING');

      const existingDecision = await consentService.getDecision('random-id', 'random-nonce');
      expect(existingDecision).toBeNull();
    });
  });
});
