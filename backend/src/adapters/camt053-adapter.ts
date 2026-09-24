/**
 * @fileoverview ISO 20022 camt.053 Bank Statement Adapter
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import { ILegacyAdapter } from './adapter-interface.js';
import { CANONICAL_ATTRIBUTES } from '@pramana/shared';

export interface Iso20022BalanceRecord {
  readonly IBAN: string;
  readonly ClosingBalanceAmount: number;
  readonly CurrencyCode: string;
  readonly CreditDebitIndicator: 'CRDT' | 'DBIT';
}

export class Iso20022Camt053Adapter implements ILegacyAdapter<Iso20022BalanceRecord> {
  readonly adapterId = 'adapter:iso20022:camt053:v1';
  readonly targetSchemaId = 'urn:pramana:schema:fin:bank-statement:v1';

  async adapt(record: Iso20022BalanceRecord): Promise<Record<string, string | number | boolean>> {
    const netBalance =
      record.CreditDebitIndicator === 'CRDT'
        ? record.ClosingBalanceAmount
        : -record.ClosingBalanceAmount;

    return {
      [CANONICAL_ATTRIBUTES.ACCOUNT_BALANCE]: netBalance,
      [CANONICAL_ATTRIBUTES.CURRENCY]: record.CurrencyCode.toUpperCase(),
    };
  }
}
