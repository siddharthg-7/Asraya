/**
 * @fileoverview Phase 1 Shared Protocol Contract Lock Verification Suite
 * Tests all 16 required invariants defined in the Pramāṇa Phase 1 Specification.
 */

import { describe, it, expect } from 'vitest';
import {
  // Types & Constants
  PROTOCOL_VERSION,
  PROTOCOL_NAME,
  ERROR_CODES,
  PramanaError,
  RequestContract,
  ProofEnvelope,
  VerificationResult,
  // Validators
  validateRequestContract,
  validateSinglePredicate,
  validatePredicate,
  validateProofEnvelope,
  validateVerificationResult,
} from '../../shared/src/index.js';

describe('Shared Protocol Contract Lock (Phase 1 Invariants)', () => {
  const baseValidContract: RequestContract = {
    id: 'urn:uuid:f47ac10b-58cc-4372-a567-0e02b2c3d479',
    protocolVersion: PROTOCOL_VERSION,
    verifier: {
      did: 'did:pramana:verifier:fintech-01',
      name: 'Apex Fintech',
    },
    purpose: 'PURPOSE_AGE_VERIFICATION',
    context: 'loan-app-2026',
    predicates: [
      {
        attributeId: 'urn:pramana:attr:civil:age',
        operator: 'LTE',
        constant: 65,
      },
    ],
    revealRequirements: ['urn:pramana:attr:civil:citizenship'],
    disclose: ['urn:pramana:attr:civil:citizenship'],
    retention: 'AUDIT_RECEIPT_ONLY_ZERO_PII',
    nonce: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    issuedAt: new Date(Date.now() - 1000).toISOString(),
    expiresAt: new Date(Date.now() + 60000).toISOString(),
    expiry: new Date(Date.now() + 60000).toISOString(),
  };

  // Test 1: Valid RequestContract
  it('1. should accept a fully compliant RequestContract', () => {
    const validated = validateRequestContract(baseValidContract);
    expect(validated.id).toBe(baseValidContract.id);
    expect(validated.verifier.did).toBe(baseValidContract.verifier.did);
    expect(validated.nonce).toBe(baseValidContract.nonce);
    expect(validated.predicates.length).toBe(1);
    expect(validated.revealRequirements).toEqual(['urn:pramana:attr:civil:citizenship']);
  });

  // Test 2: Missing verifier
  it('2. should reject a RequestContract with missing verifier', () => {
    const badContract = { ...baseValidContract, verifier: undefined };
    expect(() => validateRequestContract(badContract)).toThrowError(PramanaError);
    try {
      validateRequestContract(badContract);
    } catch (err) {
      expect((err as PramanaError).code).toBe(ERROR_CODES.INVALID_REQUEST);
      expect((err as PramanaError).message).toContain('verifier must be an object');
    }
  });

  // Test 3: Missing purpose
  it('3. should reject a RequestContract with missing or empty purpose', () => {
    const badContract = { ...baseValidContract, purpose: '   ' };
    expect(() => validateRequestContract(badContract)).toThrowError(PramanaError);
    try {
      validateRequestContract(badContract);
    } catch (err) {
      expect((err as PramanaError).code).toBe(ERROR_CODES.INVALID_REQUEST);
      expect((err as PramanaError).message).toContain('purpose must be a non-empty string');
    }
  });

  // Test 4: Missing nonce
  it('4. should reject a RequestContract with missing or short nonce (< 32 chars)', () => {
    const badContract = { ...baseValidContract, nonce: 'too-short' };
    expect(() => validateRequestContract(badContract)).toThrowError(PramanaError);
    try {
      validateRequestContract(badContract);
    } catch (err) {
      expect((err as PramanaError).code).toBe(ERROR_CODES.INVALID_REQUEST);
      expect((err as PramanaError).message).toContain('at least 32 characters');
    }
  });

  // Test 5: Invalid expiry
  it('5. should reject a RequestContract where expiresAt is before issuedAt', () => {
    const now = Date.now();
    const badContract = {
      ...baseValidContract,
      issuedAt: new Date(now).toISOString(),
      expiresAt: new Date(now - 1000).toISOString(),
      expiry: new Date(now - 1000).toISOString(),
    };
    expect(() => validateRequestContract(badContract)).toThrowError(PramanaError);
    try {
      validateRequestContract(badContract);
    } catch (err) {
      expect((err as PramanaError).code).toBe(ERROR_CODES.INVALID_REQUEST);
      expect((err as PramanaError).message).toContain('chronologically after issuedAt');
    }
  });

  // Test 6: Unknown attribute
  it('6. should reject unknown or unregistered attributes in predicates', () => {
    const badPredicate = {
      attributeId: 'urn:unregistered:unknown_tax_secret',
      operator: 'EQ',
      constant: 'secret',
    };
    expect(() => validateSinglePredicate(badPredicate)).toThrowError(PramanaError);
    try {
      validateSinglePredicate(badPredicate);
    } catch (err) {
      expect((err as PramanaError).code).toBe(ERROR_CODES.ATTRIBUTE_NOT_SUPPORTED);
      expect((err as PramanaError).message).toContain('Unknown or unsupported attribute');
    }
  });

  // Test 7: Unsupported predicate operator (NEQ, GT, GTE)
  it('7. should reject unsupported predicate operators (NEQ, GT, GTE)', () => {
    const unsupportedOps = ['NEQ', 'GT', 'GTE', 'LIKE', 'MATCH'];
    for (const op of unsupportedOps) {
      const pred = {
        attributeId: 'urn:pramana:attr:civil:age',
        operator: op,
        constant: 18,
      };
      expect(() => validateSinglePredicate(pred)).toThrowError(PramanaError);
      try {
        validateSinglePredicate(pred);
      } catch (err) {
        expect((err as PramanaError).code).toBe(ERROR_CODES.INVALID_PREDICATE);
        expect((err as PramanaError).message).toContain('INVALID OPERATOR');
      }
    }
  });

  // Test 8: Invalid IN predicate (empty or non-array)
  it('8. should reject an IN predicate with non-array or empty constant', () => {
    const emptyIn = {
      attributeId: 'urn:pramana:attr:civil:domicile_state',
      operator: 'IN',
      constant: [],
    };
    expect(() => validateSinglePredicate(emptyIn)).toThrowError(PramanaError);
    try {
      validateSinglePredicate(emptyIn);
    } catch (err) {
      expect((err as PramanaError).code).toBe(ERROR_CODES.INVALID_PREDICATE);
      expect((err as PramanaError).message).toContain('array cannot be empty');
    }

    const nonArrayIn = {
      attributeId: 'urn:pramana:attr:civil:domicile_state',
      operator: 'IN',
      constant: 'single-string',
    };
    expect(() => validateSinglePredicate(nonArrayIn)).toThrowError(PramanaError);
  });

  // Test 9: IN with exactly 8 values
  it('9. should accept an IN predicate with exactly 8 values', () => {
    const eightItems = {
      attributeId: 'urn:pramana:attr:trans:license_category',
      operator: 'IN',
      constant: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    };
    const validated = validateSinglePredicate(eightItems);
    expect(validated.operator).toBe('IN');
    expect((validated.constant as string[]).length).toBe(8);
  });

  // Test 10: IN with 9 values
  it('10. should reject an IN predicate with 9 values (exceeding IN<=8 bound)', () => {
    const nineItems = {
      attributeId: 'urn:pramana:attr:trans:license_category',
      operator: 'IN',
      constant: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    };
    expect(() => validateSinglePredicate(nineItems)).toThrowError(PramanaError);
    try {
      validateSinglePredicate(nineItems);
    } catch (err) {
      expect((err as PramanaError).code).toBe(ERROR_CODES.INVALID_PREDICATE);
      expect((err as PramanaError).message).toContain('exceeds maximum set size of 8');
    }
  });

  // Test 11: OR rejection
  it('11. should reject disjunctions (OR) in predicate expressions', () => {
    const compoundOr = {
      type: 'COMPOUND_OR',
      predicates: [
        { attributeId: 'urn:pramana:attr:civil:age', operator: 'LT', constant: 18 },
        { attributeId: 'urn:pramana:attr:civil:age', operator: 'EQ', constant: 21 },
      ],
    };
    expect(() => validatePredicate(compoundOr)).toThrowError(PramanaError);
    try {
      validatePredicate(compoundOr);
    } catch (err) {
      expect((err as PramanaError).code).toBe(ERROR_CODES.INVALID_PREDICATE);
      expect((err as PramanaError).message).toContain(
        'Disjunction (OR) expressions are not supported',
      );
    }
  });

  // Test 12: Malformed disclosure
  it('12. should reject malformed disclosures in RequestContract', () => {
    const badDisclosure = {
      ...baseValidContract,
      disclose: ['urn:unknown:attr:unregistered'],
    };
    expect(() => validateRequestContract(badDisclosure)).toThrowError(PramanaError);
    try {
      validateRequestContract(badDisclosure);
    } catch (err) {
      expect((err as PramanaError).code).toBe(ERROR_CODES.ATTRIBUTE_NOT_SUPPORTED);
      expect((err as PramanaError).message).toContain('Malformed disclosure');
    }
  });

  // Test 13: Invalid ProofEnvelope
  it('13. should reject an invalid ProofEnvelope', () => {
    const badEnvelope = {
      contractId: 'urn:uuid:contract-1',
      verifierDid: 'not-a-did',
      nonce: 'short',
      proofTier: 'INVALID_TIER',
    };
    expect(() => validateProofEnvelope(badEnvelope)).toThrowError(PramanaError);
  });

  // Test 14: Invalid verification result
  it('14. should reject a verification result that leaks raw citizen PII', () => {
    const leakingResult = {
      sessionId: 'sess-1234',
      contractId: 'urn:uuid:req-1',
      verifierDid: 'did:pramana:verifier:fintech-01',
      verdict: 'VERIFIED',
      verifiedAt: new Date().toISOString(),
      receiptHash: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      nullifierHash: 'nullifier-hash-123',
      rawCitizenData: { salary: 500000, name: 'Alice Doe' }, // PII leak!
      signature: 'valid-sig',
    };
    expect(() => validateVerificationResult(leakingResult)).toThrowError(PramanaError);
    try {
      validateVerificationResult(leakingResult);
    } catch (err) {
      expect((err as PramanaError).code).toBe(ERROR_CODES.INTERNAL_PROTOCOL_ERROR);
      expect((err as PramanaError).message).toContain('violates data minimization');
    }
  });

  // Test 15: Contract serialization/deserialization
  it('15. should support round-trip JSON serialization and deserialization without data loss', () => {
    const jsonString = JSON.stringify(baseValidContract);
    const parsed = JSON.parse(jsonString);
    const validated = validateRequestContract(parsed);
    expect(validated.id).toBe(baseValidContract.id);
    const firstPred = validated.predicates[0];
    expect(firstPred).toBeDefined();
    if (firstPred && !('type' in firstPred)) {
      expect(firstPred.attributeId).toBe('urn:pramana:attr:civil:age');
      expect(firstPred.operator).toBe('LTE');
    }
  });

  // Test 16: Frontend import compatibility
  it('16. should verify all locked protocol contracts are exportable and resolvable for frontend', () => {
    expect(PROTOCOL_NAME).toBe('Pramāṇa');
    expect(PROTOCOL_VERSION).toBe('0.1.0');
    expect(typeof validateRequestContract).toBe('function');
    expect(typeof validatePredicate).toBe('function');
    expect(typeof validateProofEnvelope).toBe('function');
    expect(typeof validateVerificationResult).toBe('function');
  });
});
