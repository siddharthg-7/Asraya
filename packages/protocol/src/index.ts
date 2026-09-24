/**
 * @fileoverview Module Boundary: @pramana/protocol
 *
 * Status: SETUP ONLY (Implementation NOT STARTED)
 *
 * Responsibilities:
 * - Canonical protocol versions (e.g., Pramāṇa v1.0)
 * - Request contract definitions
 * - Predicate grammar
 * - Protocol identifiers, nonce specifications, and hashes
 * - Serialization definitions (CBOR/JSON)
 * - Canonical protocol error taxonomy
 * - Verification result structures
 *
 * Prohibitions:
 * - Application code must not independently redefine protocol structures.
 * - No cryptographic execution (delegated to @pramana/crypto).
 */

export const PROTOCOL_VERSION = '1.0.0-draft' as const;
export const PROTOCOL_MODULE_STATUS = 'SETUP_ONLY_NOT_STARTED' as const;

export type ProtocolModuleStatus = typeof PROTOCOL_MODULE_STATUS;

/**
 * High-level verification outcome
 */
export type VerificationOutcome = 'VERIFIED' | 'REJECTED' | 'EXPIRED' | 'MALFORMED';
