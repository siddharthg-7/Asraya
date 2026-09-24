/**
 * @fileoverview ISO 20022 CAMT.053 Bank Statement Adapter
 * Pramāṇa Protocol - Phase 3 Schema Mediation
 *
 * Translates ISO 20022 CAMT.053 banking statements into canonical financial attributes.
 * Strictly prevents leaking IBANs, account numbers, or transaction histories to verifiers.
 */

import { ISourceAdapter } from './adapter-interface.js';
import { Camt053StatementSource } from '../sources/synthetic-fixtures.js';
import {
  CANONICAL_ATTRIBUTES,
  CanonicalAttributeValue,
  PramanaError,
  ERROR_CODES,
} from '@pramana/shared';
import { trustRegistry } from '../registry/trust-registry.js';

export class Camt053BankAdapter implements ISourceAdapter<Camt053StatementSource | string> {
  readonly adapterId = 'adapter:banking:iso20022-camt053';
  readonly sourceFormat = 'ISO20022_CAMT053';
  readonly targetSchemaId = 'urn:pramana:schema:fin:earnings:v1';
  readonly bridgeId = 'bridge:bank:camt053-to-trailing12m';
  readonly supportedAttributes = [
    CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS,
    CANONICAL_ATTRIBUTES.ACCOUNT_BALANCE,
    CANONICAL_ATTRIBUTES.CURRENCY,
  ] as const;

  /**
   * Helper to parse synthetic ISO 20022 XML string if raw XML is supplied
   */
  private parseXmlStatement(xml: string): Camt053StatementSource {
    const amtMatch = xml.match(/<Amt\s+Ccy="([^"]+)">([^<]+)<\/Amt>/);
    const indMatch = xml.match(/<CdtDbtInd>([^<]+)<\/CdtDbtInd>/);
    const ibanMatch = xml.match(/<IBAN>([^<]+)<\/IBAN>/);
    const idMatch = xml.match(/<Id>([^<]+)<\/Id>/);

    if (!amtMatch || !indMatch) {
      throw new PramanaError(
        ERROR_CODES.SOURCE_INVALID,
        'Malformed ISO 20022 XML: Missing Amt or CdtDbtInd element',
      );
    }

    const currency = amtMatch[1];
    const rawAmt = amtMatch[2];
    if (!currency || !rawAmt) {
      throw new PramanaError(
        ERROR_CODES.SOURCE_INVALID,
        'Malformed ISO 20022 XML: Missing currency or amount value',
      );
    }

    const amountVal = parseFloat(rawAmt);
    if (isNaN(amountVal) || !Number.isFinite(amountVal)) {
      throw new PramanaError(
        ERROR_CODES.SOURCE_INVALID,
        'Invalid numeric balance in XML statement',
      );
    }

    const indRaw = indMatch[1]?.trim();
    if (!indRaw || (indRaw !== 'CRDT' && indRaw !== 'DBIT')) {
      throw new PramanaError(
        ERROR_CODES.SOURCE_INVALID,
        'Malformed ISO 20022 XML: Invalid CdtDbtInd element',
      );
    }
    const ind: 'CRDT' | 'DBIT' = indRaw;

    const statementId = idMatch && idMatch[1] ? idMatch[1] : 'XML-PARSED-STMT';
    const accountIban = ibanMatch && ibanMatch[1] ? ibanMatch[1] : 'MOCK-IBAN';

    return {
      statementId,
      holderSynthId: 'synth:citizen:xml-holder',
      accountIban,
      closingBalanceAmount: amountVal,
      currency,
      creditDebitIndicator: ind,
      trailing12mCreditSum: amountVal * 3, // Deterministic simulation for raw XML
    };
  }

  async adapt(input: Camt053StatementSource | string): Promise<CanonicalAttributeValue[]> {
    // 1. Validate registry bridge resolution
    const bridge = await trustRegistry.getBridge(this.bridgeId);
    if (!bridge) {
      throw new PramanaError(
        ERROR_CODES.BRIDGE_NOT_FOUND,
        `Bridge "${this.bridgeId}" not registered for adapter "${this.adapterId}"`,
      );
    }

    // 2. Normalize and validate input record
    let record: Camt053StatementSource;
    if (typeof input === 'string') {
      record = this.parseXmlStatement(input);
    } else if (typeof input === 'object' && input !== null) {
      record = input;
    } else {
      throw new PramanaError(
        ERROR_CODES.SOURCE_INVALID,
        'CAMT.053 input must be an object or XML string',
      );
    }

    if (typeof record.closingBalanceAmount !== 'number' || isNaN(record.closingBalanceAmount)) {
      throw new PramanaError(
        ERROR_CODES.SOURCE_MISSING_FIELD,
        'Missing valid numeric closingBalanceAmount',
      );
    }

    if (typeof record.trailing12mCreditSum !== 'number' || isNaN(record.trailing12mCreditSum)) {
      throw new PramanaError(
        ERROR_CODES.SOURCE_MISSING_FIELD,
        'Missing valid numeric trailing12mCreditSum',
      );
    }

    if (record.closingBalanceAmount < 0 || record.trailing12mCreditSum < 0) {
      throw new PramanaError(
        ERROR_CODES.SOURCE_INVALID,
        'Statement credit amounts cannot be negative',
      );
    }

    // 3. Deterministic transformation (AGGREGATE_SUM_CREDITS_365D)
    const netBalance =
      record.creditDebitIndicator === 'CRDT'
        ? record.closingBalanceAmount
        : -record.closingBalanceAmount;

    // 4. Output strictly canonical attributes (Zero raw bank account numbers or statement text)
    return [
      {
        attributeId: CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS,
        value: record.trailing12mCreditSum,
        sourceAdapterId: this.adapterId,
        bridgeId: this.bridgeId,
      },
      {
        attributeId: CANONICAL_ATTRIBUTES.ACCOUNT_BALANCE,
        value: netBalance,
        sourceAdapterId: this.adapterId,
        bridgeId: this.bridgeId,
      },
      {
        attributeId: CANONICAL_ATTRIBUTES.CURRENCY,
        value: (record.currency || 'INR').toUpperCase(),
        sourceAdapterId: this.adapterId,
        bridgeId: this.bridgeId,
      },
    ];
  }

  async adaptToClaims(
    input: Camt053StatementSource | string,
  ): Promise<Record<string, string | number | boolean>> {
    const canonicalAttrs = await this.adapt(input);
    const claims: Record<string, string | number | boolean> = {};
    for (const attr of canonicalAttrs) {
      claims[attr.attributeId] = attr.value;
    }
    return claims;
  }
}

// Backward-compatible export
export const Iso20022Camt053Adapter = Camt053BankAdapter;
