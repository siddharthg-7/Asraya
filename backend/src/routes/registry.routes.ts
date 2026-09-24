/**
 * @fileoverview Trust Registry Routes
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import { FastifyInstance } from 'fastify';
import { RegistryController } from '../controllers/registry.controller.js';

export async function registryRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/api/v1/registry/checkpoint', RegistryController.getCheckpoint);
  fastify.get<{ Params: { did: string } }>(
    '/api/v1/registry/issuers/:did',
    RegistryController.getIssuer,
  );
}
