/**
 * @fileoverview Legacy System Adapter Abstraction
 * Pramāṇa Protocol - Phase 1 Foundation
 */

export interface ILegacyAdapter<
  TInput = unknown,
  TOutput = Record<string, string | number | boolean>,
> {
  readonly adapterId: string;
  readonly targetSchemaId: string;
  adapt(sourceRecord: TInput): Promise<TOutput>;
}
