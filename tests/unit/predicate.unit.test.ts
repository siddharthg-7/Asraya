import { describe, it, expect } from 'vitest';
import {
  validateSinglePredicate,
  validatePredicate,
  PramanaError,
  ERROR_CODES,
  MAX_PREDICATE_IN_SET_SIZE,
} from '../../shared/src/index.js';

describe('Unit Tests: Bounded Predicate Grammar & Boundary Validation', () => {
  // ==========================================
  // VALID CASES
  // ==========================================
  describe('VALID Predicates', () => {
    it('should successfully validate an EQ predicate', () => {
      const valid = {
        attributeId: 'urn:pramana:attr:civil:domicile_state',
        operator: 'EQ',
        constant: 'KA',
      };
      const result = validateSinglePredicate(valid);
      expect(result.attributeId).toBe('urn:pramana:attr:civil:domicile_state');
      expect(result.operator).toBe('EQ');
      expect(result.constant).toBe('KA');
    });

    it('should successfully validate an LT predicate', () => {
      const valid = {
        attributeId: 'urn:pramana:attr:civil:age',
        operator: 'LT',
        constant: 65,
      };
      const result = validateSinglePredicate(valid);
      expect(result.operator).toBe('LT');
      expect(result.constant).toBe(65);
    });

    it('should successfully validate an LTE predicate', () => {
      const valid = {
        attributeId: 'urn:pramana:attr:fin:annual_income',
        operator: 'LTE',
        constant: 300000,
      };
      const result = validateSinglePredicate(valid);
      expect(result.operator).toBe('LTE');
      expect(result.constant).toBe(300000);
    });

    it('should successfully validate an IN predicate with exactly 1 item', () => {
      const valid = {
        attributeId: 'urn:pramana:attr:trans:license_category',
        operator: 'IN',
        constant: ['LMV'],
      };
      const result = validateSinglePredicate(valid);
      expect(result.operator).toBe('IN');
      expect(result.constant).toEqual(['LMV']);
    });

    it('should successfully validate an IN predicate with exactly 8 items (boundary limit)', () => {
      const valid = {
        attributeId: 'urn:pramana:attr:trans:license_category',
        operator: 'IN',
        constant: ['1', '2', '3', '4', '5', '6', '7', '8'],
      };
      const result = validateSinglePredicate(valid);
      expect(result.operator).toBe('IN');
      expect((result.constant as string[]).length).toBe(8);
    });

    it('should validate a compound AND predicate', () => {
      const compound = {
        type: 'COMPOUND_AND',
        predicates: [
          { attributeId: 'urn:pramana:attr:civil:age', operator: 'LT', constant: 60 },
          { attributeId: 'urn:pramana:attr:fin:annual_income', operator: 'LTE', constant: 500000 },
        ],
      };
      const result = validatePredicate(compound);
      expect('type' in result && result.type === 'COMPOUND_AND').toBe(true);
      if ('type' in result && result.type === 'COMPOUND_AND') {
        expect(result.predicates.length).toBe(2);
      }
    });
  });

  // ==========================================
  // INVALID CASES
  // ==========================================
  describe('INVALID Predicates', () => {
    it('should reject NEQ operator as unsupported by the bounded grammar', () => {
      const invalid = {
        attributeId: 'urn:pramana:attr:civil:domicile_state',
        operator: 'NEQ',
        constant: 'DL',
      };
      expect(() => validateSinglePredicate(invalid)).toThrowError(PramanaError);
      try {
        validateSinglePredicate(invalid);
      } catch (err) {
        const perr = err as PramanaError;
        expect(perr.code).toBe(ERROR_CODES.INVALID_PREDICATE);
        expect(perr.message).toContain('INVALID OPERATOR');
      }
    });

    it('should reject GT operator as unsupported by the bounded grammar', () => {
      const invalid = {
        attributeId: 'urn:pramana:attr:civil:age',
        operator: 'GT',
        constant: 18,
      };
      expect(() => validateSinglePredicate(invalid)).toThrowError(PramanaError);
      try {
        validateSinglePredicate(invalid);
      } catch (err) {
        const perr = err as PramanaError;
        expect(perr.code).toBe(ERROR_CODES.INVALID_PREDICATE);
        expect(perr.message).toContain('INVALID OPERATOR');
      }
    });

    it('should reject GTE operator as unsupported by the bounded grammar', () => {
      const invalid = {
        attributeId: 'urn:pramana:attr:civil:age',
        operator: 'GTE',
        constant: 18,
      };
      expect(() => validateSinglePredicate(invalid)).toThrowError(PramanaError);
      try {
        validateSinglePredicate(invalid);
      } catch (err) {
        const perr = err as PramanaError;
        expect(perr.code).toBe(ERROR_CODES.INVALID_PREDICATE);
        expect(perr.message).toContain('INVALID OPERATOR');
      }
    });

    it('should reject IN predicate with more than 8 items (9 items)', () => {
      const oversized = {
        attributeId: 'urn:pramana:attr:trans:license_category',
        operator: 'IN',
        constant: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      };
      expect(() => validateSinglePredicate(oversized)).toThrowError(PramanaError);
      try {
        validateSinglePredicate(oversized);
      } catch (err) {
        const perr = err as PramanaError;
        expect(perr.code).toBe(ERROR_CODES.INVALID_PREDICATE);
        expect(perr.message).toContain(`exceeds maximum set size of ${MAX_PREDICATE_IN_SET_SIZE}`);
      }
    });

    it('should reject malformed predicate (non-object or null)', () => {
      expect(() => validateSinglePredicate('not-an-object')).toThrowError(PramanaError);
      expect(() => validateSinglePredicate(null)).toThrowError(PramanaError);
      expect(() => validateSinglePredicate([1, 2, 3])).toThrowError(PramanaError);
    });

    it('should reject unknown attribute', () => {
      const unknownAttr = {
        attributeId: 'urn:custom:unregistered:shoe_size',
        operator: 'EQ',
        constant: 42,
      };
      expect(() => validateSinglePredicate(unknownAttr)).toThrowError(PramanaError);
      try {
        validateSinglePredicate(unknownAttr);
      } catch (err) {
        const perr = err as PramanaError;
        expect(perr.code).toBe(ERROR_CODES.ATTRIBUTE_NOT_SUPPORTED);
        expect(perr.message).toContain('INVALID ATTRIBUTE');
      }
    });

    it('should reject missing attribute', () => {
      const missingAttr = {
        operator: 'EQ',
        constant: 'KA',
      };
      expect(() => validateSinglePredicate(missingAttr)).toThrowError(PramanaError);
      try {
        validateSinglePredicate(missingAttr);
      } catch (err) {
        const perr = err as PramanaError;
        expect(perr.code).toBe(ERROR_CODES.INVALID_PREDICATE);
        expect(perr.message).toContain('INVALID ATTRIBUTE');
      }
    });

    it('should reject missing constant', () => {
      const missingConst = {
        attributeId: 'urn:pramana:attr:civil:age',
        operator: 'LT',
      };
      expect(() => validateSinglePredicate(missingConst)).toThrowError(PramanaError);
      try {
        validateSinglePredicate(missingConst);
      } catch (err) {
        const perr = err as PramanaError;
        expect(perr.code).toBe(ERROR_CODES.INVALID_PREDICATE);
        expect(perr.message).toContain('INVALID CONSTANT');
      }
    });

    it('should reject unsupported arbitrary expression / script field', () => {
      const scriptInjection = {
        attributeId: 'urn:pramana:attr:civil:age',
        operator: 'LT',
        constant: 30,
        expression: 'process.exit(1)',
      };
      expect(() => validateSinglePredicate(scriptInjection)).toThrowError(PramanaError);
      try {
        validateSinglePredicate(scriptInjection);
      } catch (err) {
        const perr = err as PramanaError;
        expect(perr.code).toBe(ERROR_CODES.INVALID_PREDICATE);
        expect(perr.message).toContain('INVALID STRUCTURE');
      }
    });

    it('should reject OR expression (disjunction is forbidden)', () => {
      const orPredicate = {
        type: 'COMPOUND_OR',
        predicates: [
          { attributeId: 'urn:pramana:attr:civil:age', operator: 'LT', constant: 18 },
          { attributeId: 'urn:pramana:attr:civil:age', operator: 'EQ', constant: 21 },
        ],
      };
      expect(() => validatePredicate(orPredicate)).toThrowError(PramanaError);
      try {
        validatePredicate(orPredicate);
      } catch (err) {
        const perr = err as PramanaError;
        expect(perr.code).toBe(ERROR_CODES.INVALID_PREDICATE);
        expect(perr.message).toContain('Disjunction (OR) expressions are not supported');
      }
    });
  });
});
