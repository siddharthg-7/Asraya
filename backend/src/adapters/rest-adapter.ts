/**
 * @fileoverview Municipal REST/JSON Data Adapter
 * Pramāṇa Protocol - Phase 3 Schema Mediation
 *
 * Translates municipal registration payloads into canonical identity and civil attributes.
 * Strictly prevents leaking residential addresses or municipal ward identifiers.
 */

import { ISourceAdapter } from './adapter-interface.js';
import { MunicipalRestCitizenPayload } from '../sources/synthetic-fixtures.js';
import {
  CANONICAL_ATTRIBUTES,
  CanonicalAttributeValue,
  PramanaError,
  ERROR_CODES,
} from '@pramana/shared';
import { trustRegistry } from '../registry/trust-registry.js';

export class MunicipalRestAdapter implements ISourceAdapter<MunicipalRestCitizenPayload> {
  readonly adapterId = 'adapter:civil:rest-json';
  readonly sourceFormat = 'REST_JSON';
  readonly targetSchemaId = 'urn:pramana:schema:civil:identity:v1';
  /**
   * SPECIFICATION MISMATCH / TBD NOTE:
   * Phase 2 Trust Registry defined "bridge:civil:sql-to-age" with sourceSystem: 'CIVIL_DATABASE_SQL',
   * while Phase 3 specifies a Municipal REST source. The adapter binds to "bridge:civil:sql-to-age"
   * as the canonical Phase 2 registered bridge for AGE calculation, but an explicit REST bridge
   * (e.g. "bridge:civil:rest-to-age") should be formalized in a future registry update/ADR.
   */
  readonly bridgeId = 'bridge:civil:sql-to-age';
  readonly supportedAttributes = [
    CANONICAL_ATTRIBUTES.AGE,
    CANONICAL_ATTRIBUTES.BIRTHDATE,
    CANONICAL_ATTRIBUTES.DOMICILE_STATE,
    CANONICAL_ATTRIBUTES.DISTRICT,
    CANONICAL_ATTRIBUTES.CITIZENSHIP,
  ] as const;

  async adapt(payload: MunicipalRestCitizenPayload): Promise<CanonicalAttributeValue[]> {
    // 1. Validate registry bridge resolution
    const bridge = await trustRegistry.getBridge(this.bridgeId);
    if (!bridge) {
      throw new PramanaError(
        ERROR_CODES.BRIDGE_NOT_FOUND,
        `Bridge "${this.bridgeId}" not registered for adapter "${this.adapterId}"`,
      );
    }

    // 2. Validate input record structure
    if (!payload || typeof payload !== 'object') {
      throw new PramanaError(
        ERROR_CODES.SOURCE_INVALID,
        'Municipal REST payload must be a non-null object',
      );
    }

    if (!payload.registration_id || typeof payload.registration_id !== 'string') {
      throw new PramanaError(ERROR_CODES.SOURCE_MISSING_FIELD, 'Missing required registration_id');
    }

    if (!payload.date_of_birth || typeof payload.date_of_birth !== 'string') {
      throw new PramanaError(ERROR_CODES.SOURCE_MISSING_FIELD, 'Missing required date_of_birth');
    }

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(payload.date_of_birth) ||
      isNaN(Date.parse(payload.date_of_birth))
    ) {
      throw new PramanaError(
        ERROR_CODES.SOURCE_INVALID,
        'Invalid date_of_birth: Expected format YYYY-MM-DD',
      );
    }

    if (!payload.state_code || typeof payload.state_code !== 'string') {
      throw new PramanaError(ERROR_CODES.SOURCE_MISSING_FIELD, 'Missing required state_code');
    }

    if (!payload.district_name || typeof payload.district_name !== 'string') {
      throw new PramanaError(ERROR_CODES.SOURCE_MISSING_FIELD, 'Missing required district_name');
    }

    // 3. Deterministic transformation (COMPUTE_AGE_FROM_DATE)
    const birthDate = new Date(payload.date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // 4. Output strictly canonical attributes (Zero municipal ward IDs or street addresses)
    return [
      {
        attributeId: CANONICAL_ATTRIBUTES.AGE,
        value: age,
        sourceAdapterId: this.adapterId,
        bridgeId: this.bridgeId,
      },
      {
        attributeId: CANONICAL_ATTRIBUTES.BIRTHDATE,
        value: payload.date_of_birth,
        sourceAdapterId: this.adapterId,
        bridgeId: this.bridgeId,
      },
      {
        attributeId: CANONICAL_ATTRIBUTES.DOMICILE_STATE,
        value: payload.state_code.trim().toUpperCase(),
        sourceAdapterId: this.adapterId,
        bridgeId: this.bridgeId,
      },
      {
        attributeId: CANONICAL_ATTRIBUTES.DISTRICT,
        value: payload.district_name.trim(),
        sourceAdapterId: this.adapterId,
        bridgeId: this.bridgeId,
      },
      {
        attributeId: CANONICAL_ATTRIBUTES.CITIZENSHIP,
        value: (payload.nationality_code || 'IND').trim().toUpperCase(),
        sourceAdapterId: this.adapterId,
        bridgeId: this.bridgeId,
      },
    ];
  }

  async adaptToClaims(
    payload: MunicipalRestCitizenPayload,
  ): Promise<Record<string, string | number | boolean>> {
    const canonicalAttrs = await this.adapt(payload);
    const claims: Record<string, string | number | boolean> = {};
    for (const attr of canonicalAttrs) {
      claims[attr.attributeId] = attr.value;
    }
    return claims;
  }
}
