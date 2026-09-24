/**
 * @fileoverview Verifier Request Routes
 * Pramāṇa Protocol - Phase 4 Request -> Policy -> Consent
 */

import { FastifyInstance } from 'fastify';
import { RequestController, CreateRequestBody } from '../controllers/request.controller.js';
import { RequestContract } from '@pramana/shared';

export async function requestRoutes(fastify: FastifyInstance): Promise<void> {
  // Legacy / Phase 2 request creation
  fastify.post<{ Body: CreateRequestBody }>('/api/v1/requests', RequestController.create);

  // Phase 4: Request Validation (grammar, syntax, bounds, expiry)
  fastify.post<{ Body: unknown }>('/api/v1/requests/validate', RequestController.validate);
  fastify.post<{ Body: unknown }>('/requests/validate', RequestController.validate);

  // Phase 4: Policy Evaluation against Trust Registry
  fastify.post<{ Body: RequestContract }>(
    '/api/v1/requests/policy',
    RequestController.evaluatePolicy,
  );
  fastify.post<{ Body: RequestContract }>('/requests/policy', RequestController.evaluatePolicy);
}
