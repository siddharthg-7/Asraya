/**
 * @fileoverview Mock Issuer Claim Service & Minimal Claim Set Generation
 * Pramāṇa Protocol - Phase 3 Schema Mediation
 *
 * Translates heterogeneous institutional sources into minimal canonical claim sets.
 *
 * NOTICE:
 * MOCK - DEMO ONLY - UNSIGNED MOCK CLAIMS
 * Real BBS+ / BLS12-381 cryptography is deferred to Phase 6.
 * Zero fake signatures or dummy proofs are generated here.
 */

import { trustRegistry } from '../registry/trust-registry.js';
import { adapterResolver } from '../adapters/adapter-resolver.js';
import {
  TransportSqlPermitRow,
  Camt053StatementSource,
  MunicipalRestCitizenPayload,
} from '../sources/synthetic-fixtures.js';
import {
  MinimalClaimSet,
  validateMinimalClaimSet,
  CANONICAL_ATTRIBUTES,
  PramanaError,
  ERROR_CODES,
} from '@pramana/shared';

export interface SourceDataContainer {
  readonly transportSql?: TransportSqlPermitRow | undefined;
  readonly bankCamt053?: (Camt053StatementSource | string) | undefined;
  readonly municipalRest?: MunicipalRestCitizenPayload | undefined;
}

export class MockIssuerService {
  /**
   * Generates a strictly minimized canonical claim set for a citizen based ONLY
   * on the attributes requested by the verifier.
   */
  async createMinimalClaimSet(
    issuerDid: string,
    subjectId: string,
    requestedAttributeIds: readonly string[],
    sources: SourceDataContainer,
  ): Promise<MinimalClaimSet> {
    // 1. Verify issuer authorization in Trust Registry
    const issuer = await trustRegistry.getIssuer(issuerDid);
    if (!issuer) {
      throw new PramanaError(
        ERROR_CODES.ISSUER_NOT_FOUND,
        `Issuer "${issuerDid}" not registered in Trust Registry`,
      );
    }

    if (!issuer.active || issuer.status === 'SUSPENDED' || issuer.status === 'REVOKED') {
      throw new PramanaError(
        ERROR_CODES.ISSUER_NOT_FOUND,
        `Issuer "${issuerDid}" is not currently active in Trust Registry (status: ${issuer.status})`,
      );
    }

    if (!requestedAttributeIds || requestedAttributeIds.length === 0) {
      throw new PramanaError(
        ERROR_CODES.CLAIM_GENERATION_FAILED,
        'Cannot generate claim set: No requested attributes specified',
      );
    }

    const claims: Record<string, string | number | boolean> = {};

    // 2. Iterate through requested attributes and adapt only what is required
    for (const rawAttrId of requestedAttributeIds) {
      // Resolve canonical URN if alias passed
      const attrDef = await trustRegistry.getAttributeDefinition(rawAttrId);
      if (!attrDef) {
        throw new PramanaError(
          ERROR_CODES.ATTRIBUTE_NOT_SUPPORTED,
          `Attribute "${rawAttrId}" is not registered in Trust Registry`,
        );
      }
      const canonicalId = attrDef.id;

      // Select appropriate source based on attribute category / adapter manifest
      let adapted = false;

      // Determine if current issuer is Transport Department
      const isTransportIssuer = issuer.authorizedSchemas.includes(
        'urn:pramana:schema:trans:permit:v1',
      );

      // Transport / Permit attributes
      if (
        canonicalId === CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS ||
        canonicalId === CANONICAL_ATTRIBUTES.LICENSE_CATEGORY
      ) {
        if (!sources.transportSql) {
          throw new PramanaError(
            ERROR_CODES.SOURCE_MISSING_FIELD,
            `Source data missing for transport permit attribute "${canonicalId}"`,
          );
        }
        const attrVal = await adapterResolver.adaptAttribute(
          canonicalId,
          sources.transportSql,
          'adapter:transport:rto-sql',
        );
        claims[canonicalId] = attrVal.value;
        adapted = true;
      }

      // Financial attributes
      if (
        canonicalId === CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS ||
        canonicalId === CANONICAL_ATTRIBUTES.ACCOUNT_BALANCE ||
        canonicalId === CANONICAL_ATTRIBUTES.CURRENCY
      ) {
        if (!sources.bankCamt053) {
          throw new PramanaError(
            ERROR_CODES.SOURCE_MISSING_FIELD,
            `Source data missing for banking attribute "${canonicalId}"`,
          );
        }
        const attrVal = await adapterResolver.adaptAttribute(
          canonicalId,
          sources.bankCamt053,
          'adapter:banking:iso20022-camt053',
        );
        claims[canonicalId] = attrVal.value;
        adapted = true;
      }

      // Civil / Identity attributes (or location attributes like district/domicile)
      if (
        canonicalId === CANONICAL_ATTRIBUTES.AGE ||
        canonicalId === CANONICAL_ATTRIBUTES.BIRTHDATE ||
        canonicalId === CANONICAL_ATTRIBUTES.DOMICILE_STATE ||
        canonicalId === CANONICAL_ATTRIBUTES.DISTRICT ||
        canonicalId === CANONICAL_ATTRIBUTES.CITIZENSHIP
      ) {
        if (
          isTransportIssuer &&
          sources.transportSql &&
          (canonicalId === CANONICAL_ATTRIBUTES.DISTRICT ||
            canonicalId === CANONICAL_ATTRIBUTES.DOMICILE_STATE)
        ) {
          const attrVal = await adapterResolver.adaptAttribute(
            canonicalId,
            sources.transportSql,
            'adapter:transport:rto-sql',
          );
          claims[canonicalId] = attrVal.value;
          adapted = true;
        } else if (sources.municipalRest) {
          const attrVal = await adapterResolver.adaptAttribute(
            canonicalId,
            sources.municipalRest,
            'adapter:civil:rest-json',
          );
          claims[canonicalId] = attrVal.value;
          adapted = true;
        } else if (
          sources.transportSql &&
          (canonicalId === CANONICAL_ATTRIBUTES.DISTRICT ||
            canonicalId === CANONICAL_ATTRIBUTES.DOMICILE_STATE)
        ) {
          const attrVal = await adapterResolver.adaptAttribute(
            canonicalId,
            sources.transportSql,
            'adapter:transport:rto-sql',
          );
          claims[canonicalId] = attrVal.value;
          adapted = true;
        } else {
          throw new PramanaError(
            ERROR_CODES.SOURCE_MISSING_FIELD,
            `Source data missing for civil attribute "${canonicalId}"`,
          );
        }
      }

      if (!adapted) {
        throw new PramanaError(
          ERROR_CODES.CLAIM_GENERATION_FAILED,
          `No adapter available to fulfill attribute "${canonicalId}"`,
        );
      }
    }

    // 3. Assemble and validate strictly minimal claim set
    const schemaId = issuer.authorizedSchemas[0] || 'urn:pramana:schema:generic:v1';
    const claimSet: MinimalClaimSet = {
      schemaId,
      issuerDid,
      subjectId,
      claims,
      issuedAt: new Date().toISOString(),
      isMockUnsigned: true,
    };

    return validateMinimalClaimSet(claimSet);
  }
}

export const mockIssuerService = new MockIssuerService();
