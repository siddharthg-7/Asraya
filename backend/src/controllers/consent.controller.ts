/**
 * @fileoverview Consent Controller
 * Pramāṇa Protocol - Phase 4 Request -> Policy -> Consent
 *
 * Implements endpoints for:
 * - Preparing structured ConsentInformation (WHO, WHAT, NOT SHARED)
 * - Recording citizen consent decisions (APPROVED / REJECTED)
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { consentService } from '../services/consent.service.js';
import { RequestContract } from '@pramana/shared';

export interface PrepareConsentBody {
  readonly contract?: RequestContract | undefined;
  readonly locale?: string | undefined;
  // Support direct contract payload as root object as well
  readonly [key: string]: unknown;
}

export interface RecordDecisionBody {
  readonly requestId: string;
  readonly requestNonce: string;
  readonly decision: 'APPROVED' | 'REJECTED';
  readonly signature?: string | undefined;
}

export class ConsentController {
  /**
   * Prepares structured ConsentInformation for the citizen wallet.
   * Resolves authoritative WHO, WHAT (disclosed vs predicates), and NOT SHARED.
   * Citizen consent status is initialized as PENDING.
   */
  static async prepareConsent(
    request: FastifyRequest<{ Body: PrepareConsentBody }>,
    reply: FastifyReply,
  ): Promise<void> {
    const body = request.body;
    const contract = (body.contract ?? body) as RequestContract;
    const rawLocale = body['locale'];
    const locale = typeof rawLocale === 'string' ? rawLocale : 'en-US';

    const consentInfo = await consentService.prepareConsent(contract, locale);
    reply.status(200).send(consentInfo);
  }

  /**
   * Records a citizen's explicit consent decision.
   * Directly binds the decision to the specific request ID and fresh nonce.
   */
  static async recordDecision(
    request: FastifyRequest<{ Body: RecordDecisionBody }>,
    reply: FastifyReply,
  ): Promise<void> {
    const { requestId, requestNonce, decision, signature } = request.body;

    const recorded = await consentService.recordDecision(
      requestId,
      requestNonce,
      decision,
      signature,
    );

    reply.status(200).send(recorded);
  }

  /**
   * Retrieves the current consent decision for a given requestId and requestNonce.
   */
  static async getDecision(
    request: FastifyRequest<{ Params: { requestId: string; nonce: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const { requestId, nonce } = request.params;
    const record = await consentService.getDecision(requestId, nonce);
    if (!record) {
      reply.status(404).send({
        code: 'NOT_FOUND',
        message: `No consent decision recorded for request "${requestId}"`,
      });
      return;
    }
    reply.status(200).send(record);
  }
}
