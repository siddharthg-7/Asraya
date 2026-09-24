/**
 * @fileoverview Health and Status Routes
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import { FastifyInstance } from 'fastify';
import { PROTOCOL_NAME, PROTOCOL_VERSION } from '@pramana/shared';

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/health', async (_request, reply) => {
    reply.send({
      status: 'UP',
      protocol: PROTOCOL_NAME,
      version: PROTOCOL_VERSION,
      phase: 'PHASE_1_FOUNDATION',
      timestamp: new Date().toISOString(),
    });
  });
}
