/**
 * @fileoverview Legacy Relational SQL Data Adapter
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import { ILegacyAdapter } from './adapter-interface.js';
import { CANONICAL_ATTRIBUTES } from '@pramana/shared';

export interface LegacySqlCitizenRow {
  readonly CUST_ID: number;
  readonly DOB_STR: string; // 'YYYY-MM-DD'
  readonly STATE_CD: string;
  readonly IS_CITIZEN: number; // 1 or 0
}

export class LegacySqlCitizenAdapter implements ILegacyAdapter<LegacySqlCitizenRow> {
  readonly adapterId = 'adapter:legacy-sql:civil-registry:v1';
  readonly targetSchemaId = 'urn:pramana:schema:civil:identity:v1';

  async adapt(row: LegacySqlCitizenRow): Promise<Record<string, string | number | boolean>> {
    const birthYear = new Date(row.DOB_STR).getFullYear();
    const currentYear = new Date().getFullYear();
    const calculatedAge = currentYear - birthYear;

    return {
      [CANONICAL_ATTRIBUTES.AGE]: calculatedAge,
      [CANONICAL_ATTRIBUTES.BIRTHDATE]: row.DOB_STR,
      [CANONICAL_ATTRIBUTES.DOMICILE_STATE]: row.STATE_CD.trim().toUpperCase(),
      [CANONICAL_ATTRIBUTES.CITIZENSHIP]: row.IS_CITIZEN === 1,
    };
  }
}
