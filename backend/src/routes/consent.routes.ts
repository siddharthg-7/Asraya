/**
 * @fileoverview Citizen Consent Protocol Routes
 * Pramāṇa Protocol - Phase 4 Request -> Policy -> Consent
 */

import { FastifyInstance } from 'fastify';
import {
  ConsentController,
  PrepareConsentBody,
  RecordDecisionBody,
} from '../controllers/consent.controller.js';

export async function consentRoutes(fastify: FastifyInstance): Promise<void> {
  // Prepare structured ConsentInformation (WHO, WHAT, NOT SHARED)
  fastify.post<{ Body: PrepareConsentBody }>(
    '/api/v1/consent/prepare',
    ConsentController.prepareConsent,
  );
  fastify.post<{ Body: PrepareConsentBody }>('/consent/prepare', ConsentController.prepareConsent);

  // Record citizen consent decision (APPROVED / REJECTED)
  fastify.post<{ Body: RecordDecisionBody }>(
    '/api/v1/consent/decision',
    ConsentController.recordDecision,
  );
  fastify.post<{ Body: RecordDecisionBody }>('/consent/decision', ConsentController.recordDecision);

  // Query consent decision status by request binding
  fastify.get<{ Params: { requestId: string; nonce: string } }>(
    '/api/v1/consent/decision/:requestId/:nonce',
    ConsentController.getDecision,
  );
  fastify.get<{ Params: { requestId: string; nonce: string } }>(
    '/consent/decision/:requestId/:nonce',
    ConsentController.getDecision,
  );
}
