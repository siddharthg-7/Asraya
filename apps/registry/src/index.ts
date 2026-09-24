/**
 * @fileoverview Application Boundary: @pramana/registry-app
 *
 * Status: SETUP ONLY (Application Implementation NOT STARTED)
 *
 * Tier 1 Future Responsibilities:
 * - Host and distribute canonical schema definitions
 * - Manage institutional DID registration, authorization policies, and public keys
 * - Publish periodically signed trust checkpoints for offline verifiers
 *
 * Prohibitions during setup phase:
 * - DO NOT build the registry application.
 * - DO NOT build APIs.
 */

export const REGISTRY_APP_STATUS = 'SETUP_ONLY_NOT_STARTED' as const;

export type RegistryAppStatus = typeof REGISTRY_APP_STATUS;
