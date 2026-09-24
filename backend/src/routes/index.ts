/**
 * @fileoverview Main Fastify Route Registration
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import { FastifyInstance } from 'fastify';
import { healthRoutes } from './health.routes.js';
import { requestRoutes } from './request.routes.js';
import { verificationRoutes } from './verification.routes.js';
import { registryRoutes } from './registry.routes.js';

export async function registerRoutes(fastify: FastifyInstance): Promise<void> {
  await fastify.register(healthRoutes);
  await fastify.register(requestRoutes);
  await fastify.register(verificationRoutes);
  await fastify.register(registryRoutes);
}
