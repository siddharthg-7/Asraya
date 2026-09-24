/**
 * @fileoverview Legacy System Adapter Abstraction
 * Pramāṇa Protocol - Phase 3 Schema Mediation
 */

import { CanonicalAttributeValue } from '@pramana/shared';

export interface ISourceAdapter<TInput = unknown> {
  readonly adapterId: string;
  readonly sourceFormat: string;
  readonly targetSchemaId: string;
  readonly supportedAttributes: readonly string[];
  adapt(sourceRecord: TInput): Promise<CanonicalAttributeValue[]>;
  adaptToClaims(sourceRecord: TInput): Promise<Record<string, string | number | boolean>>;
}

// Backward-compatible alias for Phase 0/1
export type ILegacyAdapter<TInput = unknown> = ISourceAdapter<TInput>;
