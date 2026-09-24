/**
 * @fileoverview Schema Mediation Service
 * Pramāṇa Protocol - Phase 3 Schema Mediation
 *
 * Connects RequestContract predicate requirements to Trust Registry resolution,
 * source adapters, and minimal claim set generation.
 */

import {
  RequestContract,
  validateRequestContract,
  MinimalClaimSet,
  PramanaError,
  ERROR_CODES,
} from '@pramana/shared';
import { mockIssuerService, SourceDataContainer } from '../issuers/issuer-service.js';
import { trustRegistry } from '../registry/trust-registry.js';

export class MediationService {
  /**
   * Extracts unique canonical attribute IDs requested in a RequestContract
   */
  getRequiredAttributes(contract: RequestContract): string[] {
    const validated = validateRequestContract(contract);
    const attrSet = new Set<string>();
    for (const pred of validated.predicates) {
      if ('attributeId' in pred) {
        attrSet.add(pred.attributeId);
      } else if (pred.type === 'COMPOUND_AND') {
        for (const sub of pred.predicates) {
          attrSet.add(sub.attributeId);
        }
      }
    }
    return Array.from(attrSet);
  }

  /**
   * Mediates heterogeneous source records to produce a minimal claim set
   * fulfilling the bounded needs of a verified RequestContract.
   */
  async mediateForRequest(
    contract: RequestContract,
    issuerDid: string,
    subjectId: string,
    sources: SourceDataContainer,
  ): Promise<MinimalClaimSet> {
    const requiredAttrs = this.getRequiredAttributes(contract);
    if (requiredAttrs.length === 0) {
      throw new PramanaError(
        ERROR_CODES.INVALID_REQUEST,
        'RequestContract does not specify any predicate attributes to mediate',
      );
    }

    // Ensure all requested attributes exist in Trust Registry
    for (const attrId of requiredAttrs) {
      const def = await trustRegistry.getAttributeDefinition(attrId);
      if (!def) {
        throw new PramanaError(
          ERROR_CODES.ATTRIBUTE_NOT_SUPPORTED,
          `Requested attribute "${attrId}" is not registered in Trust Registry`,
        );
      }
    }

    return mockIssuerService.createMinimalClaimSet(issuerDid, subjectId, requiredAttrs, sources);
  }

  /**
   * Mediates heterogeneous sources for an explicit list of canonical attribute IDs.
   */
  async mediateAttributes(
    attributeIds: readonly string[],
    issuerDid: string,
    subjectId: string,
    sources: SourceDataContainer,
  ): Promise<MinimalClaimSet> {
    return mockIssuerService.createMinimalClaimSet(issuerDid, subjectId, attributeIds, sources);
  }
}

export const mediationService = new MediationService();
