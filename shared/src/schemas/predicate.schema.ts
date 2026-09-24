/**
 * @fileoverview Predicate Schema and Runtime Boundary Validator
 * Pramāṇa Protocol - Phase 1 Foundation / Shared Contract Lock
 *
 * Rules:
 * - Bounded grammar: attr {EQ, LT, LTE, IN<=8} constant
 * - Distinguishes: VALID, INVALID OPERATOR, INVALID ATTRIBUTE, INVALID CONSTANT, INVALID STRUCTURE
 * - Disjunctions (OR expressions), arbitrary script/code, and unsupported operators (GT, GTE, NEQ) are rejected
 */

import { SinglePredicate, Predicate, PredicateOperator } from '../types/predicates.js';
import { isKnownCanonicalAttribute } from '../types/attributes.js';
import { MAX_PREDICATE_IN_SET_SIZE } from '../constants/protocol-version.js';
import { ERROR_CODES, PramanaError } from '../constants/errors.js';

export const VALID_PREDICATE_OPERATORS: readonly PredicateOperator[] = [
  'EQ',
  'LT',
  'LTE',
  'IN',
] as const;

export function validateSinglePredicate(input: unknown): SinglePredicate {
  // 1. INVALID STRUCTURE: Object check & expression check
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new PramanaError(
      ERROR_CODES.INVALID_PREDICATE,
      'INVALID STRUCTURE: Predicate must be a non-null object',
    );
  }

  const record = input as Record<string, unknown>;

  // Check for disjunction / OR attempts
  if (
    record['type'] === 'COMPOUND_OR' ||
    record['operator'] === 'OR' ||
    'or' in record ||
    'OR' in record
  ) {
    throw new PramanaError(
      ERROR_CODES.INVALID_PREDICATE,
      'INVALID STRUCTURE: Disjunction (OR) expressions are not supported. Predicates must be joined strictly using AND.',
    );
  }

  // Check for arbitrary expression language injections
  if ('expression' in record || 'script' in record || 'eval' in record) {
    throw new PramanaError(
      ERROR_CODES.INVALID_PREDICATE,
      'INVALID STRUCTURE: Arbitrary expressions or scripts are not permitted in bounded predicates',
    );
  }

  // 2. INVALID ATTRIBUTE: Missing or Unknown attribute
  if (
    !('attributeId' in record) ||
    record['attributeId'] === undefined ||
    record['attributeId'] === null ||
    typeof record['attributeId'] !== 'string' ||
    record['attributeId'].trim() === ''
  ) {
    throw new PramanaError(
      ERROR_CODES.INVALID_PREDICATE,
      'INVALID ATTRIBUTE: Missing or empty predicate attributeId',
    );
  }

  const attributeId = record['attributeId'].trim();
  if (!isKnownCanonicalAttribute(attributeId)) {
    throw new PramanaError(
      ERROR_CODES.ATTRIBUTE_NOT_SUPPORTED,
      `INVALID ATTRIBUTE: Unknown or unsupported attribute '${attributeId}'`,
    );
  }

  // 3. INVALID OPERATOR: Bounded grammar only allows EQ, LT, LTE, IN
  const opStr =
    typeof record['operator'] === 'string' ? record['operator'].trim().toUpperCase() : '';
  if (!VALID_PREDICATE_OPERATORS.includes(opStr as PredicateOperator)) {
    throw new PramanaError(
      ERROR_CODES.INVALID_PREDICATE,
      `INVALID OPERATOR: Unsupported predicate operator '${String(record['operator'])}'. Permitted operators are: EQ, LT, LTE, IN<=8`,
    );
  }
  const operator = opStr as PredicateOperator;

  // 4. INVALID CONSTANT: Missing or malformed constant
  if (!('constant' in record) || record['constant'] === undefined || record['constant'] === null) {
    throw new PramanaError(
      ERROR_CODES.INVALID_PREDICATE,
      'INVALID CONSTANT: Missing predicate constant value',
    );
  }

  const constant = record['constant'];

  if (operator === 'IN') {
    if (!Array.isArray(constant)) {
      throw new PramanaError(
        ERROR_CODES.INVALID_PREDICATE,
        "INVALID CONSTANT: Operator 'IN' requires an array of constants",
      );
    }
    if (constant.length === 0) {
      throw new PramanaError(
        ERROR_CODES.INVALID_PREDICATE,
        "INVALID CONSTANT: Operator 'IN' constant array cannot be empty",
      );
    }
    if (constant.length > MAX_PREDICATE_IN_SET_SIZE) {
      throw new PramanaError(
        ERROR_CODES.INVALID_PREDICATE,
        `INVALID CONSTANT: Operator 'IN' exceeds maximum set size of ${MAX_PREDICATE_IN_SET_SIZE} elements (got ${constant.length})`,
      );
    }
    for (const item of constant) {
      if (typeof item !== 'string' && typeof item !== 'number' && typeof item !== 'boolean') {
        throw new PramanaError(
          ERROR_CODES.INVALID_PREDICATE,
          "INVALID CONSTANT: Elements of 'IN' set must be primitive strings, numbers, or booleans",
        );
      }
    }
  } else if (operator === 'LT' || operator === 'LTE') {
    if (typeof constant !== 'number' || Number.isNaN(constant)) {
      throw new PramanaError(
        ERROR_CODES.INVALID_PREDICATE,
        `INVALID CONSTANT: Numeric operator '${operator}' requires a numeric constant (got ${typeof constant})`,
      );
    }
  } else if (operator === 'EQ') {
    if (
      typeof constant !== 'string' &&
      typeof constant !== 'number' &&
      typeof constant !== 'boolean'
    ) {
      throw new PramanaError(
        ERROR_CODES.INVALID_PREDICATE,
        "INVALID CONSTANT: Operator 'EQ' requires a primitive constant (string, number, or boolean)",
      );
    }
  }

  return {
    attributeId,
    operator,
    constant: constant as SinglePredicate['constant'],
  };
}

export function validatePredicate(input: unknown): Predicate {
  if (typeof input !== 'object' || input === null) {
    throw new PramanaError(
      ERROR_CODES.INVALID_PREDICATE,
      'INVALID STRUCTURE: Predicate must be a non-null object',
    );
  }

  const record = input as Record<string, unknown>;

  if (record['type'] === 'COMPOUND_OR' || record['operator'] === 'OR' || 'or' in record) {
    throw new PramanaError(
      ERROR_CODES.INVALID_PREDICATE,
      'INVALID STRUCTURE: Disjunction (OR) expressions are not supported. Predicates must be joined strictly using AND.',
    );
  }

  if (record['type'] === 'COMPOUND_AND') {
    if (!Array.isArray(record['predicates']) || record['predicates'].length === 0) {
      throw new PramanaError(
        ERROR_CODES.INVALID_PREDICATE,
        'INVALID STRUCTURE: Compound predicate must have a non-empty array of predicates',
      );
    }
    const validatedPredicates = record['predicates'].map((p) => validateSinglePredicate(p));
    return {
      type: 'COMPOUND_AND',
      predicates: validatedPredicates,
    };
  }

  return validateSinglePredicate(input);
}
