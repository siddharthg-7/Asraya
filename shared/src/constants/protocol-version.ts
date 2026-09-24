/**
 * @fileoverview Protocol Versioning Constants
 * Pramāṇa Protocol - Phase 1 Foundation
 */

export const PROTOCOL_NAME = 'Pramāṇa' as const;
export const PROTOCOL_VERSION = '0.1.0' as const;
export const PROTOCOL_CODENAME = 'Pramāṇa' as const;

export const DEFAULT_PROOF_TIER = 'BBS' as const;
export const FALLBACK_PROOF_TIER = 'GROTH16' as const;

export const MAX_NONCE_AGE_SECONDS = 120 as const;
export const MAX_PREDICATE_IN_SET_SIZE = 8 as const;
