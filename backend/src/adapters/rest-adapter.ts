/**
 * @fileoverview Municipal REST/JSON Payload Adapter
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import { ILegacyAdapter } from './adapter-interface.js';
import { CANONICAL_ATTRIBUTES } from '@pramana/shared';

export interface MunicipalRestCitizenPayload {
  readonly registration_id: string;
  readonly dob: string;
  readonly jurisdiction: string;
  readonly active_status: boolean;
}

export class MunicipalRestAdapter implements ILegacyAdapter<MunicipalRestCitizenPayload> {
  readonly adapterId = 'adapter:municipal-rest:civil:v1';
  readonly targetSchemaId = 'urn:pramana:schema:civil:identity:v1';

  async adapt(
    payload: MunicipalRestCitizenPayload,
  ): Promise<Record<string, string | number | boolean>> {
    const birthYear = new Date(payload.dob).getFullYear();
    const currentYear = new Date().getFullYear();

    return {
      [CANONICAL_ATTRIBUTES.AGE]: currentYear - birthYear,
      [CANONICAL_ATTRIBUTES.BIRTHDATE]: payload.dob,
      [CANONICAL_ATTRIBUTES.DOMICILE_STATE]: payload.jurisdiction.toUpperCase(),
      [CANONICAL_ATTRIBUTES.CITIZENSHIP]: payload.active_status,
    };
  }
}
