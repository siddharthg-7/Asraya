/**
 * @fileoverview Module Boundary: @pramana/adapters
 *
 * Status: SETUP ONLY (Implementation NOT STARTED)
 *
 * Responsibilities:
 * - Isolation of legacy backend data sources
 * - Transformation of source-specific records into Canonical Attribute Definitions
 * - MVP Reference Adapters:
 *   * Legacy SQL database rows
 *   * ISO 20022 camt.053 financial XML records
 *   * Standard REST/JSON institution payloads
 *
 * Invariants:
 * - No core protocol logic or wallet/verifier services may depend directly on
 *   legacy column names or proprietary bank schemas.
 */

export const ADAPTERS_MODULE_STATUS = 'SETUP_ONLY_NOT_STARTED' as const;

export type AdaptersModuleStatus = typeof ADAPTERS_MODULE_STATUS;

export interface ILegacyAdapter<TInput = unknown, TCanonical = unknown> {
  readonly status: AdaptersModuleStatus;
  adapt(input: TInput): Promise<TCanonical>;
}
