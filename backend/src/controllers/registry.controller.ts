/**
 * @fileoverview Registry Controller
 * Pramāṇa Protocol - Phase 2 Trust Registry & Institution Trust Layer
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { registryService } from '../services/registry.service.js';
import { AttributeCategory, RequestContract, validateRequestContract } from '@pramana/shared';

export class RegistryController {
  static async getIssuer(
    request: FastifyRequest<{ Params: { did: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const issuer = await registryService.getIssuer(request.params.did);
    if (!issuer) {
      reply.status(404).send({
        code: 'REGISTRY_LOOKUP_FAILED',
        message: `Issuer "${request.params.did}" not found in trust registry`,
      });
      return;
    }
    reply.status(200).send(issuer);
  }

  static async getVerifierLicence(
    request: FastifyRequest<{ Params: { did: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const licence = await registryService.getVerifierLicence(request.params.did);
    if (!licence) {
      reply.status(404).send({
        code: 'REGISTRY_LOOKUP_FAILED',
        message: `Verifier licence for "${request.params.did}" not found in trust registry`,
      });
      return;
    }
    reply.status(200).send(licence);
  }

  static async getAttribute(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const attr = await registryService.getAttributeDefinition(request.params.id);
    if (!attr) {
      reply.status(404).send({
        code: 'ATTRIBUTE_NOT_SUPPORTED',
        message: `Canonical attribute "${request.params.id}" not found in trust registry`,
      });
      return;
    }
    reply.status(200).send(attr);
  }

  static async listAttributes(
    request: FastifyRequest<{ Querystring: { category?: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const category = request.query.category as AttributeCategory | undefined;
    const attributes = await registryService.listAttributes(category);
    reply.status(200).send({
      count: attributes.length,
      attributes,
    });
  }

  static async getBridge(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const bridge = await registryService.getBridge(request.params.id);
    if (!bridge) {
      reply.status(404).send({
        code: 'REGISTRY_LOOKUP_FAILED',
        message: `Bridge definition "${request.params.id}" not found in trust registry`,
      });
      return;
    }
    reply.status(200).send(bridge);
  }

  static async getAdapter(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const adapter = await registryService.getAdapter(request.params.id);
    if (!adapter) {
      reply.status(404).send({
        code: 'REGISTRY_LOOKUP_FAILED',
        message: `Adapter manifest "${request.params.id}" not found in trust registry`,
      });
      return;
    }
    reply.status(200).send(adapter);
  }

  static async getTemplate(
    request: FastifyRequest<{ Params: { purposeCode: string }; Querystring: { locale?: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const locale = request.query.locale || 'en-US';
    const template = await registryService.getTemplate(request.params.purposeCode, locale);
    if (!template) {
      reply.status(404).send({
        code: 'REGISTRY_LOOKUP_FAILED',
        message: `Consent template for purpose "${request.params.purposeCode}" (${locale}) not found`,
      });
      return;
    }
    reply.status(200).send(template);
  }

  static async getCheckpoint(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const checkpoint = await registryService.getLatestCheckpoint();
    reply.status(200).send(checkpoint);
  }

  static async verifyCheckpoint(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      await registryService.verifyCheckpoint(request.body as any);
      reply.status(200).send({ verified: true });
    } catch (err: any) {
      reply.status(501).send({
        code: err.code || 'NOT_IMPLEMENTED',
        message: err.message,
      });
    }
  }

  static async validateRequest(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const contract: RequestContract = validateRequestContract(request.body);

      // 1. Verifier licence lookup
      const licence = await registryService.getVerifierLicence(contract.verifier.did);
      if (!licence) {
        reply.status(403).send({
          code: 'LICENCE_INVALID',
          message: `Verifier "${contract.verifier.did}" is not licensed in the trust registry`,
        });
        return;
      }

      if (licence.status !== 'ACTIVE') {
        reply.status(403).send({
          code: 'LICENCE_INVALID',
          message: `Verifier licence status is ${licence.status}`,
        });
        return;
      }

      if (new Date(licence.validUntil).getTime() < Date.now()) {
        reply.status(403).send({
          code: 'LICENCE_INVALID',
          message: `Verifier licence expired at ${licence.validUntil}`,
        });
        return;
      }

      if (!licence.permittedPurposes.includes(contract.purpose)) {
        reply.status(403).send({
          code: 'LICENCE_INVALID',
          message: `Purpose "${contract.purpose}" is not permitted by verifier licence`,
        });
        return;
      }

      // 2. Canonical attribute lookup for all predicates
      for (const p of contract.predicates) {
        const attrId = 'attributeId' in p ? p.attributeId : (p as any).attribute;
        const attrDef = await registryService.getAttributeDefinition(attrId);
        if (!attrDef) {
          reply.status(400).send({
            code: 'ATTRIBUTE_NOT_SUPPORTED',
            message: `Requested predicate attribute "${attrId}" is not registered in trust registry`,
          });
          return;
        }
      }

      // 3. Canonical attribute lookup for all disclosures
      if (contract.disclosures) {
        for (const d of contract.disclosures) {
          const attrId =
            typeof d === 'string'
              ? d
              : ((d as unknown as Record<string, unknown>)['attributeId'] as string);
          const attrDef = await registryService.getAttributeDefinition(attrId);
          if (!attrDef) {
            reply.status(400).send({
              code: 'ATTRIBUTE_NOT_SUPPORTED',
              message: `Requested disclosure attribute "${attrId}" is not registered in trust registry`,
            });
            return;
          }
        }
      }

      reply.status(200).send({
        valid: true,
        verifier: licence.legalName,
        purpose: contract.purpose,
        attributesResolved: contract.predicates.length + (contract.disclosures?.length || 0),
      });
    } catch (err: any) {
      reply.status(400).send({
        code: err.code || 'INVALID_REQUEST',
        message: err.message,
      });
    }
  }
}
