/**
 * @fileoverview Request Controller
 * Pramāṇa Protocol - Phase 2 Trust Registry & Institution Trust Layer
 *
 * Implements the mandatory Trust Registry validation gate before issuing
 * bounded RequestContracts.
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { requestService } from '../services/request.service.js';
import { registryService } from '../services/registry.service.js';
import { Predicate, validatePredicate } from '@pramana/shared';

export interface CreateRequestBody {
  readonly verifierDid: string;
  readonly verifierName: string;
  readonly purpose: string;
  readonly context: string;
  readonly predicates: readonly Predicate[];
}

export class RequestController {
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
