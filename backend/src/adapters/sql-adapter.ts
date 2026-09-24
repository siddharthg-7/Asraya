/**
 * @fileoverview Legacy Transport Relational SQL Data Adapter
 * Pramāṇa Protocol - Phase 3 Schema Mediation
 *
 * Translates relational transport permit rows into canonical attributes.
 * Strictly prevents leaking internal SQL column names or extraneous vehicle data.
 */

import { ISourceAdapter } from './adapter-interface.js';
import { TransportSqlPermitRow } from '../sources/synthetic-fixtures.js';
import {
  CANONICAL_ATTRIBUTES,
  CanonicalAttributeValue,
  PramanaError,
  ERROR_CODES,
} from '@pramana/shared';
import { trustRegistry } from '../registry/trust-registry.js';

export class TransportSqlAdapter implements ISourceAdapter<TransportSqlPermitRow> {
  readonly adapterId = 'adapter:transport:rto-sql';
  readonly sourceFormat = 'SQL_RELATIONAL';
  readonly targetSchemaId = 'urn:pramana:schema:trans:permit:v1';
  readonly bridgeId = 'bridge:rto:sql-to-permit';
  readonly supportedAttributes = [
    CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS,
    CANONICAL_ATTRIBUTES.LICENSE_CATEGORY,
    CANONICAL_ATTRIBUTES.DISTRICT,
    CANONICAL_ATTRIBUTES.DOMICILE_STATE,
  ] as const;

  async adapt(row: TransportSqlPermitRow): Promise<CanonicalAttributeValue[]> {
    // 1. Validate registry resolution
    const bridge = await trustRegistry.getBridge(this.bridgeId);
    if (!bridge) {
      throw new PramanaError(
        ERROR_CODES.BRIDGE_NOT_FOUND,
        `Bridge "${this.bridgeId}" not registered for adapter "${this.adapterId}"`,
      );
    }

    // 2. Validate input record structure
    if (!row || typeof row !== 'object') {
      throw new PramanaError(
        ERROR_CODES.SOURCE_INVALID,
        'Transport SQL record must be a non-null object',
      );
    }

    if (!row.PERMIT_ID || typeof row.PERMIT_ID !== 'string') {
      throw new PramanaError(ERROR_CODES.SOURCE_MISSING_FIELD, 'Missing required field: PERMIT_ID');
    }

    if (!row.STATUS_CD || typeof row.STATUS_CD !== 'string') {
      throw new PramanaError(ERROR_CODES.SOURCE_MISSING_FIELD, 'Missing required field: STATUS_CD');
    }

    if (!['ACTV', 'EXPR', 'SUSP', 'PEND'].includes(row.STATUS_CD)) {
      throw new PramanaError(
        ERROR_CODES.SOURCE_INVALID,
        `Invalid STATUS_CD value: ${row.STATUS_CD}. Expected ACTV, EXPR, SUSP, or PEND`,
      );
    }

    // 3. Deterministic transformation rule (MAP_PERMIT_ENUM)
    let canonicalStatus: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'PENDING';
    switch (row.STATUS_CD) {
      case 'ACTV':
        canonicalStatus = 'ACTIVE';
        break;
      case 'EXPR':
        canonicalStatus = 'EXPIRED';
        break;
      case 'SUSP':
        canonicalStatus = 'SUSPENDED';
        break;
      case 'PEND':
        canonicalStatus = 'PENDING';
        break;
    }

    let canonicalCategory: 'COMMERCIAL' | 'PRIVATE' | 'HEAVY';
    if (row.CLASS_CD === 'COMM_HEAVY') {
      canonicalCategory = 'HEAVY';
    } else if (row.CLASS_CD === 'COMM_LIGHT') {
      canonicalCategory = 'COMMERCIAL';
    } else {
      canonicalCategory = 'PRIVATE';
    }

    // 4. Formulate strictly canonical attribute outputs (Zero raw SQL column names)
    return [
      {
        attributeId: CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS,
        value: canonicalStatus,
        sourceAdapterId: this.adapterId,
        bridgeId: this.bridgeId,
      },
      {
        attributeId: CANONICAL_ATTRIBUTES.LICENSE_CATEGORY,
        value: canonicalCategory,
        sourceAdapterId: this.adapterId,
        bridgeId: this.bridgeId,
      },
      {
        attributeId: CANONICAL_ATTRIBUTES.DISTRICT,
        value: row.DISTRICT_NAME?.trim() || 'Unknown',
        sourceAdapterId: this.adapterId,
        bridgeId: this.bridgeId,
      },
      {
        attributeId: CANONICAL_ATTRIBUTES.DOMICILE_STATE,
        value: row.STATE_CODE?.trim().toUpperCase() || 'UNKNOWN',
        sourceAdapterId: this.adapterId,
        bridgeId: this.bridgeId,
      },
    ];
  }

  async adaptToClaims(
    row: TransportSqlPermitRow,
  ): Promise<Record<string, string | number | boolean>> {
    const canonicalAttrs = await this.adapt(row);
    const claims: Record<string, string | number | boolean> = {};
    for (const attr of canonicalAttrs) {
      claims[attr.attributeId] = attr.value;
    }
    return claims;
  }
}

// Backward-compatible export
export const LegacySqlCitizenAdapter = TransportSqlAdapter;
