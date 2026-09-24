/**
 * @fileoverview Verification Controller
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { verificationService } from '../services/verification.service.js';
import { RequestValidator } from '../validation/request-validator.js';

export class VerificationController {
  static async verifyProof(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const envelope = RequestValidator.validateProof(request.body);
    const receipt = await verificationService.processProofEnvelope(envelope);
    reply.status(200).send(receipt);
  }
}
