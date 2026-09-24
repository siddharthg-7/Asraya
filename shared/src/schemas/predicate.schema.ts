/**
 * @fileoverview Predicate Schema and Runtime Validator
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import { SinglePredicate, Predicate, PredicateOperator } from '../types/predicates.js';
import { MAX_PREDICATE_IN_SET_SIZE } from '../constants/protocol-version.js';
import { ERROR_CODES, PramanaError } from '../constants/errors.js';

const VALID_OPERATORS: readonly PredicateOperator[] = ['LT', 'LTE', 'EQ', 'GTE', 'GT', 'IN'];

export function validateSinglePredicate(input: unknown): SinglePredicate {
  if (typeof input !== 'object' || input === null) {
    throw new PramanaError(ERROR_CODES.INVALID_PREDICATE, 'Predicate must be a non-null object');
  }

  const record = input as Record<string, unknown>;

  if (typeof record['attributeId'] !== 'string' || record['attributeId'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_PREDICATE,
      'Predicate attributeId must be a non-empty string',
    );
  }

  if (
    typeof record['operator'] !== 'string' ||
    !VALID_OPERATORS.includes(record['operator'] as PredicateOperator)
  ) {
    throw new PramanaError(
      ERROR_CODES.INVALID_PREDICATE,
      `Invalid predicate operator: ${String(record['operator'])}`,
    );
  }

  const operator = record['operator'] as PredicateOperator;
  const constant = record['constant'];

  if (operator === 'IN') {
    if (!Array.isArray(constant)) {
      throw new PramanaError(
        ERROR_CODES.INVALID_PREDICATE,
        "Operator 'IN' requires an array constant",
      );
    }
    if (constant.length === 0 || constant.length > MAX_PREDICATE_IN_SET_SIZE) {
      throw new PramanaError(
        ERROR_CODES.INVALID_PREDICATE,
        `Operator 'IN' set size must be between 1 and ${MAX_PREDICATE_IN_SET_SIZE} elements (got ${constant.length})`,
      );
    }
  } else {
    if (
      typeof constant !== 'string' &&
      typeof constant !== 'number' &&
      typeof constant !== 'boolean'
    ) {
      throw new PramanaError(
        ERROR_CODES.INVALID_PREDICATE,
        'Scalar predicate constant must be string, number, or boolean',
      );
    }
  }

  return {
    attributeId: record['attributeId'],
    operator,
    constant: constant as SinglePredicate['constant'],
  };
}

export function validatePredicate(input: unknown): Predicate {
  if (typeof input !== 'object' || input === null) {
    throw new PramanaError(ERROR_CODES.INVALID_PREDICATE, 'Predicate must be an object');
  }

  const record = input as Record<string, unknown>;

  if (record['type'] === 'COMPOUND_AND') {
    if (!Array.isArray(record['predicates']) || record['predicates'].length === 0) {
      throw new PramanaError(
        ERROR_CODES.INVALID_PREDICATE,
        'Compound predicate must have a non-empty array of predicates',
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
