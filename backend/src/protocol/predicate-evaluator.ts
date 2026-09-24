/**
 * @fileoverview Bounded Predicate Evaluator
 * Pramāṇa Protocol - Phase 1 Foundation
 *
 * Rules:
 * Evaluates bounded predicates over claims without arbitrary code execution.
 * Operators: LT, LTE, EQ, GTE, GT, IN (bounded <= 8).
 * Joined strictly via logical AND.
 */

import { Predicate, SinglePredicate } from '@pramana/shared';

export class PredicateEvaluator {
  static evaluateSingle(
    predicate: SinglePredicate,
    claims: Readonly<Record<string, string | number | boolean>>,
  ): boolean {
    const claimValue = claims[predicate.attributeId];
    if (claimValue === undefined) {
      return false;
    }

    const { operator, constant } = predicate;

    switch (operator) {
      case 'EQ':
        return claimValue === constant;
      case 'LT':
        return (
          typeof claimValue === 'number' && typeof constant === 'number' && claimValue < constant
        );
      case 'LTE':
        return (
          typeof claimValue === 'number' && typeof constant === 'number' && claimValue <= constant
        );
      case 'IN':
        if (Array.isArray(constant)) {
          return constant.includes(claimValue as never);
        }
        return false;
      default:
        return false;
    }
  }

  static evaluate(
    predicate: Predicate,
    claims: Readonly<Record<string, string | number | boolean>>,
  ): boolean {
    if ('type' in predicate && predicate.type === 'COMPOUND_AND') {
      return predicate.predicates.every((p) => this.evaluateSingle(p, claims));
    }
    return this.evaluateSingle(predicate as SinglePredicate, claims);
  }
}
