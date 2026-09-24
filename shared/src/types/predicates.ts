/**
 * @fileoverview Bounded Predicate Grammar Specification
 * Pramāṇa Protocol - Phase 1 Foundation / Shared Contract Lock
 *
 * Authoritative Canonical Predicate Grammar:
 * - Grammatical form: attr {EQ, LT, LTE, IN<=8} constant
 * - Unsupported operators (GT, GTE, NEQ) are strictly rejected per specification
 * - IN operator is bounded to a maximum of 8 set elements (IN<=8)
 * - Multiple predicates are joined strictly using logical AND
 * - No disjunction (OR), arbitrary script execution, or expression trees
 */

export type PredicateOperator = 'EQ' | 'LT' | 'LTE' | 'IN';

export type PredicateConstant = string | number | boolean;

export interface SinglePredicate {
  readonly attributeId: string;
  readonly operator: PredicateOperator;
  /**
   * For scalar operators (EQ, LT, LTE): a single primitive constant.
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
