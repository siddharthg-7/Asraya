/**
 * @fileoverview Request Controller
 * Pramāṇa Protocol - Phase 4 Request -> Policy -> Consent
 *
 * Implements endpoints for:
 * - Request Contract creation (Phase 2 backward-compatible)
 * - Request Contract structural & grammar validation (Phase 4 Step 2)
 * - Trust Registry Policy evaluation (Phase 4 Step 3-7)
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { requestService } from '../services/request.service.js';
import { registryService } from '../services/registry.service.js';
import { policyService } from '../services/policy.service.js';
import { Predicate, validatePredicate, RequestContract } from '@pramana/shared';

export interface CreateRequestBody {
  readonly verifierDid: string;
  readonly verifierName: string;
  readonly purpose: string;
  readonly context: string;
  readonly predicates: readonly Predicate[];
  readonly revealRequirements?: readonly string[];
  readonly disclose?: readonly string[];
  readonly disclosures?: readonly string[];
}

export class RequestController {
  /**
   * Validates request syntax, grammar, and bounds without querying registry state.
   */
  static async validate(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply,
  ): Promise<void> {
    const validated = policyService.validateRequest(request.body);
    reply.status(200).send({
      valid: true,
      requestContract: validated,
    });
  }

  /**
   * Evaluates request against Trust Registry permissions (verifier, purpose, attributes, predicates, retention).
   */
  static async evaluatePolicy(
    request: FastifyRequest<{ Body: RequestContract }>,
    reply: FastifyReply,
  ): Promise<void> {
    const result = await policyService.evaluatePolicy(request.body);
    reply.status(200).send(result);
  }

  /**
   * Phase 2 creation endpoint (maintained for backward compatibility).
   */
  static async create(
    request: FastifyRequest<{ Body: CreateRequestBody }>,
    reply: FastifyReply,
  ): Promise<void> {
    const { verifierDid, verifierName, purpose, context, predicates } = request.body;

    // 1. Verifier licence lookup in Trust Registry
    const licence = await registryService.getVerifierLicence(verifierDid);
    if (!licence) {
      reply.status(403).send({
        code: 'LICENCE_INVALID',
        message: `Verifier "${verifierDid}" is not registered in Trust Registry`,
      });
      return;
    }

    if (licence.status !== 'ACTIVE') {
      reply.status(403).send({
        code: 'LICENCE_INVALID',
        message: `Verifier licence status is ${licence.status}`,
      });
      return;
    }

    if (new Date(licence.validUntil).getTime() < Date.now()) {
      reply.status(403).send({
        code: 'LICENCE_INVALID',
        message: `Verifier licence expired at ${licence.validUntil}`,
      });
      return;
    }

    if (!licence.permittedPurposes.includes(purpose)) {
      reply.status(403).send({
        code: 'LICENCE_INVALID',
        message: `Purpose "${purpose}" is not permitted by verifier licence`,
      });
      return;
    }

    // 2. Canonical attribute lookup in Trust Registry
    for (const p of predicates || []) {
      const attrId = 'attributeId' in p ? p.attributeId : (p as any).attribute;
      const attrDef = await registryService.getAttributeDefinition(attrId);
      if (!attrDef) {
        reply.status(400).send({
          code: 'ATTRIBUTE_NOT_SUPPORTED',
          message: `Requested predicate attribute "${attrId}" is not registered in Trust Registry`,
        });
        return;
      }

      if (
        licence.permittedPredicates &&
        !licence.permittedPredicates.includes(attrDef.id) &&
        !licence.permittedPredicates.includes(attrDef.name)
      ) {
        reply.status(403).send({
          code: 'LICENCE_INVALID',
          message: `Attribute "${attrId}" is not authorized by verifier licence`,
        });
        return;
      }
    }

    // 3. Predicate grammar validation
    const validatedPredicates = (predicates || []).map((p) => validatePredicate(p));

    // 4. Create and register request contract
    const contract = await requestService.createRequest(
      verifierDid,
      verifierName,
      purpose,
      context,
      validatedPredicates,
    );
    reply.status(201).send(contract);
  }
}
