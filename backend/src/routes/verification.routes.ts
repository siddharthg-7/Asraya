/**
 * @fileoverview Verification Routes
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import { FastifyInstance } from 'fastify';
import { VerificationController } from '../controllers/verification.controller.js';

export async function verificationRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/api/v1/verifications', VerificationController.verifyProof);
}
