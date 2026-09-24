/**
 * @fileoverview Request Policy Engine & Verification Gate
 * Pramāṇa Protocol - Phase 4 Request -> Policy -> Consent
 *
 * Implements strict Trust Registry validation, purpose binding, attribute
 * authorization, predicate authorization, and data minimization controls.
 *
 * Source of truth: AGENTS.md, Phase 2 Trust Registry, Phase 4 Specification.
 */

import {
  RequestContract,
  PolicyEvaluationResult,
  Predicate,
  SinglePredicate,
  PramanaError,
  ERROR_CODES,
  validateRequestContract,
  VerifierLicence,
  AttributeDefinition,
} from '@pramana/shared';
import { trustRegistry, ITrustRegistry } from '../registry/trust-registry.js';

const ALLOWED_OPERATORS = new Set(['EQ', 'LT', 'LTE', 'IN', 'AND']);
const FORBIDDEN_OPERATORS = new Set(['GT', 'GTE', 'NEQ', 'OR']);

const RETENTION_STRICTNESS: Record<string, number> = {
  NO_RETENTION_VERIFY_ONLY: 1,
  AUDIT_RECEIPT_ONLY_ZERO_PII: 2,
  TRANSIENT_SESSION_ONLY: 3,
};

export class PolicyService {
  constructor(private readonly registry: ITrustRegistry = trustRegistry) {}

  /**
   * Phase 1 / Step 2 Request validation pipeline.
   * Performs structural, cryptographic nonce, and expiry checks.
   */
  validateRequest(input: unknown): RequestContract {
    const contract = validateRequestContract(input);

    const now = Date.now();
    const expiry = Date.parse(contract.expiresAt);
    if (now > expiry) {
      throw new PramanaError(
        ERROR_CODES.EXPIRED_REQUEST,
        `RequestContract has expired at ${contract.expiresAt}`,
        {
          requestId: contract.id,
          expiresAt: contract.expiresAt,
          evaluatedAt: new Date(now).toISOString(),
        },
      );
    }

    return contract;
  }

  /**
   * Phase 4 Policy Evaluation against the Trust Registry.
   *
   * Verifies:
   * 1. Request syntax & expiry
   * 2. Verifier registration & ACTIVE status
   * 3. Licence validity & expiry
   * 4. Purpose binding against licence.permittedPurposes
   * 5. Disclosed attributes registration & authorization
   * 6. Predicate operators, bounded sets, and attribute authorization
   * 7. Data minimization and retention policy conformity
   */
  async evaluatePolicy(contract: RequestContract): Promise<PolicyEvaluationResult> {
    // 1. Expiry & structure re-check
    const validated = this.validateRequest(contract);

    // 2. Verifier identity & licence lookup
    const licence = await this.registry.getVerifierLicence(validated.verifier.did);
    if (!licence) {
      throw new PramanaError(
        ERROR_CODES.LICENCE_INVALID,
        `Verifier "${validated.verifier.did}" is not registered in Trust Registry`,
        { verifierDid: validated.verifier.did },
      );
    }

    if (licence.status !== 'ACTIVE') {
      throw new PramanaError(
        ERROR_CODES.VERIFIER_NOT_AUTHORIZED,
        `Verifier licence is not active (status: ${licence.status})`,
        { verifierDid: licence.did, status: licence.status },
      );
    }

    const licenceValidUntil = Date.parse(licence.validUntil);
    if (Date.now() > licenceValidUntil) {
      throw new PramanaError(
        ERROR_CODES.LICENCE_INVALID,
        `Verifier licence expired at ${licence.validUntil}`,
        { verifierDid: licence.did, validUntil: licence.validUntil },
      );
    }

    // 3. Purpose binding
    if (!licence.permittedPurposes.includes(validated.purpose)) {
      throw new PramanaError(
        ERROR_CODES.PURPOSE_NOT_AUTHORIZED,
        `Purpose "${validated.purpose}" is not permitted by verifier licence`,
        {
          verifierDid: licence.did,
          requestedPurpose: validated.purpose,
          permittedPurposes: licence.permittedPurposes,
        },
      );
    }

    // 4. Data retention check against licence
    const requestedRetentionLevel = RETENTION_STRICTNESS[validated.retention] ?? 99;
    const maxPermittedRetentionLevel = RETENTION_STRICTNESS[licence.maxRetentionPolicy] ?? 99;
    if (requestedRetentionLevel > maxPermittedRetentionLevel) {
      throw new PramanaError(
        ERROR_CODES.DATA_MINIMIZATION_VIOLATION,
        `Requested retention policy "${validated.retention}" exceeds verifier licence limit "${licence.maxRetentionPolicy}"`,
        { requestedRetention: validated.retention, maxRetention: licence.maxRetentionPolicy },
      );
    }

    // 5. Disclosed attributes validation & authorization
    const rawDisclosures =
      validated.revealRequirements ?? validated.disclose ?? validated.disclosures ?? [];
    for (const attr of rawDisclosures) {
      // Reject raw source fields (e.g., SQL columns or CAMT paths)
      if (attr.includes('.') || attr.includes(':records:') || attr.includes('BkToCstmrStmt')) {
        throw new PramanaError(
          ERROR_CODES.DATA_MINIMIZATION_VIOLATION,
          `Raw source-specific field "${attr}" cannot be requested directly. Only registered canonical attributes are allowed.`,
          { attribute: attr },
        );
      }

      const attrDef = await this.registry.getAttributeDefinition(attr);
      if (!attrDef) {
        throw new PramanaError(
          ERROR_CODES.ATTRIBUTE_NOT_SUPPORTED,
          `Requested disclosure attribute "${attr}" is not registered in Trust Registry`,
          { attribute: attr },
        );
      }

      if (licence.permittedAttributes && licence.permittedAttributes.length > 0) {
        const isPermitted =
          licence.permittedAttributes.includes(attrDef.id) ||
          licence.permittedAttributes.includes(attrDef.name);

        if (!isPermitted) {
          throw new PramanaError(
            ERROR_CODES.ATTRIBUTE_NOT_AUTHORIZED,
            `Attribute "${attr}" is not authorized by verifier licence`,
            { verifierDid: licence.did, attribute: attr },
          );
        }
      }
    }

    // 6. Predicate authorization
    for (const predicate of validated.predicates) {
      await this.verifyPredicatePolicy(predicate, licence);
    }

    return {
      status: 'AUTHORIZED',
      authorized: true,
      verifierDid: licence.did,
      purpose: validated.purpose,
      permittedDisclosures: rawDisclosures,
      permittedPredicates: validated.predicates,
      evaluatedAt: new Date().toISOString(),
    };
  }

  private async verifyPredicatePolicy(
    predicate: Predicate,
    licence: VerifierLicence,
  ): Promise<void> {
    if ('type' in predicate && predicate.type === 'COMPOUND_AND') {
      if (!Array.isArray(predicate.predicates) || predicate.predicates.length === 0) {
        throw new PramanaError(
          ERROR_CODES.INVALID_PREDICATE,
          'Compound AND predicate must contain a non-empty predicates array',
        );
      }
      for (const sub of predicate.predicates) {
        await this.verifyPredicatePolicy(sub, licence);
      }
      return;
    }

    const single = predicate as SinglePredicate;
    const operator = single.operator;

    if (FORBIDDEN_OPERATORS.has(operator)) {
      throw new PramanaError(
        ERROR_CODES.INVALID_PREDICATE,
        `Predicate operator "${operator}" is forbidden by protocol policy. Use bounded alternatives (e.g. LTE, LT, EQ, IN, AND).`,
        { operator },
      );
    }

    if (!ALLOWED_OPERATORS.has(operator)) {
      throw new PramanaError(
        ERROR_CODES.INVALID_PREDICATE,
        `Unsupported predicate operator "${operator}"`,
        { operator },
      );
    }

    // Bounded IN set check
    if (operator === 'IN') {
      if (!Array.isArray(single.constant)) {
        throw new PramanaError(
          ERROR_CODES.INVALID_PREDICATE,
          'IN predicate constant must be an array',
        );
      }
      if (single.constant.length > 8) {
        throw new PramanaError(
          ERROR_CODES.INVALID_PREDICATE,
          `IN predicate set size exceeds maximum bound of 8 elements (received ${single.constant.length})`,
          { count: single.constant.length, maxAllowed: 8 },
        );
      }
    }

    // Leaf predicate attribute check
    const attrIdentifier = single.attributeId;

    if (!attrIdentifier || typeof attrIdentifier !== 'string') {
      throw new PramanaError(
        ERROR_CODES.INVALID_PREDICATE,
        'Predicate must specify a valid attribute identifier',
      );
    }

    // Reject raw source fields in predicates
    if (
      attrIdentifier.includes('.') ||
      attrIdentifier.includes(':records:') ||
      attrIdentifier.includes('BkToCstmrStmt')
    ) {
      throw new PramanaError(
        ERROR_CODES.DATA_MINIMIZATION_VIOLATION,
        `Raw source-specific field "${attrIdentifier}" cannot be used in predicates. Use canonical attributes.`,
        { attribute: attrIdentifier },
      );
    }

    const attrDef = await this.registry.getAttributeDefinition(attrIdentifier);
    if (!attrDef) {
      throw new PramanaError(
        ERROR_CODES.ATTRIBUTE_NOT_SUPPORTED,
        `Requested predicate attribute "${attrIdentifier}" is not registered in Trust Registry`,
        { attribute: attrIdentifier },
      );
    }

    // Check licence permittedPredicates
    const isPermittedInLicence =
      licence.permittedPredicates.includes(attrDef.id) ||
      licence.permittedPredicates.includes(attrDef.name);

    if (!isPermittedInLicence) {
      throw new PramanaError(
        ERROR_CODES.PREDICATE_NOT_AUTHORIZED,
        `Predicate attribute "${attrIdentifier}" is not authorized by verifier licence`,
        { verifierDid: licence.did, attribute: attrIdentifier },
      );
    }

    // Validate constant value type against AttributeDefinition
    this.validateConstantValueType(single.constant, operator, attrDef);
  }

  private validateConstantValueType(
    constant: unknown,
    operator: string,
    attrDef: AttributeDefinition,
  ): void {
    if (operator === 'IN') {
      const arr = constant as readonly unknown[];
      for (const item of arr) {
        this.validateSingleConstant(item, attrDef);
      }
      return;
    }

    this.validateSingleConstant(constant, attrDef);
  }

  private validateSingleConstant(value: unknown, attrDef: AttributeDefinition): void {
    if (attrDef.dataType === 'number') {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        throw new PramanaError(
          ERROR_CODES.INVALID_PREDICATE,
          `Predicate constant for numeric attribute "${attrDef.name}" must be a number`,
          { attribute: attrDef.name, receivedType: typeof value },
        );
      }
    } else if (attrDef.dataType === 'string') {
      if (typeof value !== 'string') {
        throw new PramanaError(
          ERROR_CODES.INVALID_PREDICATE,
          `Predicate constant for string attribute "${attrDef.name}" must be a string`,
          { attribute: attrDef.name, receivedType: typeof value },
        );
      }
      if (attrDef.allowedValues && attrDef.allowedValues.length > 0) {
        if (!attrDef.allowedValues.includes(value)) {
          throw new PramanaError(
            ERROR_CODES.INVALID_PREDICATE,
            `Predicate constant "${value}" is not an allowed value for attribute "${attrDef.name}". Allowed values: [${attrDef.allowedValues.join(', ')}]`,
            { attribute: attrDef.name, value, allowedValues: attrDef.allowedValues },
          );
        }
      }
    }
  }
}

export const policyService = new PolicyService();
