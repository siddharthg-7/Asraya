/**
 * @fileoverview Request Controller
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { requestService } from '../services/request.service.js';
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

    const validatedPredicates = (predicates || []).map((p) => validatePredicate(p));

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
