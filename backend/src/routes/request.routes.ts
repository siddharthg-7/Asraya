/**
 * @fileoverview Verifier Request Routes
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import { FastifyInstance } from 'fastify';
import { RequestController, CreateRequestBody } from '../controllers/request.controller.js';

export async function requestRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: CreateRequestBody }>('/api/v1/requests', RequestController.create);
}
