/**
 * @fileoverview Trust Registry Routes
 * Pramāṇa Protocol - Phase 2 Trust Registry & Institution Trust Layer
 */

import { FastifyInstance } from 'fastify';
import { RegistryController } from '../controllers/registry.controller.js';

export async function registryRoutes(fastify: FastifyInstance): Promise<void> {
  // Checkpoint & Verifier
  fastify.get('/api/v1/registry/checkpoint', RegistryController.getCheckpoint);
  fastify.post('/api/v1/registry/checkpoint/verify', RegistryController.verifyCheckpoint);

  // Issuers
  fastify.get<{ Params: { did: string } }>(
    '/api/v1/registry/issuers/:did',
    RegistryController.getIssuer,
  );

  // Verifier Licences
  fastify.get<{ Params: { did: string } }>(
    '/api/v1/registry/verifiers/:did',
    RegistryController.getVerifierLicence,
  );

  // Canonical Attributes
  fastify.get<{ Querystring: { category?: string } }>(
    '/api/v1/registry/attributes',
    RegistryController.listAttributes,
  );
  fastify.get<{ Params: { id: string } }>(
    '/api/v1/registry/attributes/:id',
    RegistryController.getAttribute,
  );

  // Bridges & Adapters
  fastify.get<{ Params: { id: string } }>(
    '/api/v1/registry/bridges/:id',
    RegistryController.getBridge,
  );
  fastify.get<{ Params: { id: string } }>(
    '/api/v1/registry/adapters/:id',
    RegistryController.getAdapter,
  );

  // Consent Template Bundles
  fastify.get<{ Params: { purposeCode: string }; Querystring: { locale?: string } }>(
    '/api/v1/registry/templates/:purposeCode',
    RegistryController.getTemplate,
  );

  // Request Contract Registry Validation
  fastify.post('/api/v1/registry/validate-request', RegistryController.validateRequest);
}
