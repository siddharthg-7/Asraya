/**
 * @fileoverview Module Boundary: @pramana/registry
 *
 * Status: SETUP ONLY (Implementation NOT STARTED)
 *
 * Responsibilities:
 * - Tier 1: Identity & Schema Mediation client
 * - Institution DID and public key resolution
 * - Trust checkpoints validation
 * - Issuer authorization validation for specific schemas
 * - Verifier authorization validation for request purposes
 *
 * Prohibitions:
 * - Do not assume all registries are online; must support offline checkpoint caching.
 */

export const REGISTRY_MODULE_STATUS = 'SETUP_ONLY_NOT_STARTED' as const;

export type RegistryModuleStatus = typeof REGISTRY_MODULE_STATUS;

export interface ITrustRegistryClient {
  readonly status: RegistryModuleStatus;
}
