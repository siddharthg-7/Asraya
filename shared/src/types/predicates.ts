/**
 * @fileoverview Bounded Predicate Grammar Specification
 * Pramāṇa Protocol - Phase 1 Foundation
 *
 * Rules:
 * - Grammatical form: attr {LT, LTE, EQ, GTE, GT, IN} constant
 * - IN operator is bounded to a maximum of 8 set elements (IN<=8)
 * - Multiple predicates are joined strictly using logical AND
 * - No user-defined arbitrary executable expressions or script execution
 */

export type PredicateOperator = 'LT' | 'LTE' | 'EQ' | 'GTE' | 'GT' | 'IN';

export type PredicateConstant = string | number | boolean;

export interface SinglePredicate {
  readonly attributeId: string;
  readonly operator: PredicateOperator;
  /**
   * For scalar operators (LT, LTE, EQ, GTE, GT): a single primitive constant.
   * For set operator (IN): a bounded array of constants with length <= 8.
   */
  readonly constant: PredicateConstant | readonly PredicateConstant[];
}

/**
 * Compound predicate joining one or more atomic single predicates strictly via logical AND.
 */
export interface CompoundPredicate {
  readonly type: 'COMPOUND_AND';
  readonly predicates: readonly SinglePredicate[];
}

export type Predicate = SinglePredicate | CompoundPredicate;

/**
 * Predicate evaluation result indicating mathematical verification without revealing secret inputs
 */
export interface PredicateEvaluationResult {
  readonly predicate: Predicate;
  readonly satisfied: boolean;
  readonly proofTierUsed: 'BBS' | 'GROTH16';
  readonly evaluatedAt: string; // ISO 8601 UTC
}
