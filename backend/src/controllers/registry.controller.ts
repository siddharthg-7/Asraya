/**
 * @fileoverview Registry Controller
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { registryService } from '../services/registry.service.js';

export class RegistryController {
  static async getIssuer(
    request: FastifyRequest<{ Params: { did: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const issuer = await registryService.getIssuer(request.params.did);
    if (!issuer) {
      reply.status(404).send({ message: 'Issuer not found in trust registry' });
      return;
    }
    reply.status(200).send(issuer);
  }

  static async getCheckpoint(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const checkpoint = await registryService.getLatestCheckpoint();
    reply.status(200).send(checkpoint);
  }
}
