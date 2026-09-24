import { describe, it, expect } from 'vitest';
import {
  validateSinglePredicate,
  validatePredicate,
  PramanaError,
  ERROR_CODES,
  MAX_PREDICATE_IN_SET_SIZE,
} from '../../shared/src/index.js';

describe('Unit Tests: Predicate Grammar & Boundary Validation', () => {
  it('should successfully validate a valid scalar GTE predicate', () => {
    const valid = {
      attributeId: 'urn:pramana:attr:civil:age',
      operator: 'GTE',
      constant: 18,
    };
    const result = validateSinglePredicate(valid);
    expect(result.attributeId).toBe('urn:pramana:attr:civil:age');
    expect(result.operator).toBe('GTE');
    expect(result.constant).toBe(18);
  });

  it('should successfully validate an IN predicate with <= 8 elements', () => {
    const validIn = {
      attributeId: 'urn:pramana:attr:civil:domicile_state',
      operator: 'IN',
      constant: ['KA', 'MH', 'DL'],
    };
    const result = validateSinglePredicate(validIn);
    expect(result.operator).toBe('IN');
    expect(Array.isArray(result.constant)).toBe(true);
    expect((result.constant as string[]).length).toBe(3);
  });

  it('should reject an IN predicate exceeding the 8-element boundary (IN<=8 rule)', () => {
    const oversizedIn = {
      attributeId: 'urn:pramana:attr:trans:category',
      operator: 'IN',
      constant: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    };
    expect(() => validateSinglePredicate(oversizedIn)).toThrowError(PramanaError);
    try {
      validateSinglePredicate(oversizedIn);
    } catch (err) {
      const perr = err as PramanaError;
      expect(perr.code).toBe(ERROR_CODES.INVALID_PREDICATE);
      expect(perr.message).toContain(`between 1 and ${MAX_PREDICATE_IN_SET_SIZE}`);
    }
  });

  it('should reject unknown/unsupported operators', () => {
    const invalidOp = {
      attributeId: 'urn:pramana:attr:civil:age',
      operator: 'REGEX_MATCH',
      constant: '.*',
    };
    expect(() => validateSinglePredicate(invalidOp)).toThrowError(PramanaError);
  });

  it('should validate a compound AND predicate', () => {
    const compound = {
      type: 'COMPOUND_AND',
      predicates: [
        { attributeId: 'urn:pramana:attr:civil:age', operator: 'GTE', constant: 21 },
        { attributeId: 'urn:pramana:attr:fin:annual_income', operator: 'GTE', constant: 500000 },
      ],
    };
    const result = validatePredicate(compound);
    expect('type' in result && result.type === 'COMPOUND_AND').toBe(true);
    if ('type' in result && result.type === 'COMPOUND_AND') {
      expect(result.predicates.length).toBe(2);
    }
  });
});
