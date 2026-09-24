import { describe, it, expect } from 'vitest';
import {
  validateRequestContract,
  PROTOCOL_VERSION,
  PramanaError,
  ERROR_CODES,
} from '../../shared/src/index.js';

describe('Unit Tests: RequestContract Boundary Validation', () => {
  const validContract = {
    id: 'urn:uuid:req-test-1234',
    protocolVersion: PROTOCOL_VERSION,
    verifier: {
      did: 'did:pramana:verifier:test-org',
      name: 'Test Verifier Org',
    },
    purpose: 'PURPOSE_AGE_VERIFICATION',
    context: 'test-campaign',
    predicates: [
      {
        attributeId: 'urn:pramana:attr:civil:age',
        operator: 'LTE',
        constant: 18,
      },
    ],
    revealRequirements: [],
    retention: 'AUDIT_RECEIPT_ONLY_ZERO_PII',
    nonce: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 60000).toISOString(),
  };

  it('should accept a compliant request contract', () => {
    const validated = validateRequestContract(validContract);
    expect(validated.id).toBe(validContract.id);
    expect(validated.nonce).toBe(validContract.nonce);
    expect(validated.retention).toBe('AUDIT_RECEIPT_ONLY_ZERO_PII');
  });

  it('should reject a request contract with invalid DID', () => {
    const badDid = {
      ...validContract,
      verifier: { did: 'not-a-did', name: 'Bad Org' },
    };
    expect(() => validateRequestContract(badDid)).toThrowError(PramanaError);
  });

  it('should reject a request contract with short nonce (< 32 chars)', () => {
    const badNonce = {
      ...validContract,
      nonce: 'short-nonce',
    };
    expect(() => validateRequestContract(badNonce)).toThrowError(PramanaError);
  });

  it('should reject expired request contracts where expiresAt <= issuedAt', () => {
    const now = Date.now();
    const expired = {
      ...validContract,
      issuedAt: new Date(now).toISOString(),
      expiresAt: new Date(now - 1000).toISOString(),
    };
    expect(() => validateRequestContract(expired)).toThrowError(PramanaError);
  });
});
