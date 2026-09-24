/**
 * @fileoverview Application Boundary: @pramana/verifier
 *
 * Status: SETUP ONLY (Application Implementation NOT STARTED)
 *
 * Tier 4 Pipeline Future Responsibilities:
 * - Verifier Request Contract generation and signing
 * - Nonce generation and replay defense
 * - Ephemeral transport endpoint (QR scanning / HTTP webhook)
 * - Cryptographic proof envelope verification
 * - Context-scoped nullifier / duplicate detection
 * - Minimal verifier-side storage (NEVER store raw citizen data)
 * - Audit receipt issuance
 *
 * Prohibitions during setup phase:
 * - DO NOT build the verifier.
 * - DO NOT build APIs.
 * - DO NOT log raw citizen attributes.
 */

export const VERIFIER_APP_STATUS = 'SETUP_ONLY_NOT_STARTED' as const;

export type VerifierAppStatus = typeof VERIFIER_APP_STATUS;
