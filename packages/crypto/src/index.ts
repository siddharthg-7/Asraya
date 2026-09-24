/**
 * @fileoverview Module Boundary: @pramana/crypto
 *
 * Status: SETUP ONLY (Implementation NOT STARTED)
 *
 * Responsibilities:
 * - Cryptographic primitives abstraction (Signatures, Hashing, Key Encapsulation, BBS)
 * - Separation between abstract crypto interface and underlying curve/library implementations
 * - Holder binding and context-scoped nullifier abstractions
 *
 * Execution Hierarchy:
 * Application -> Protocol Service -> Crypto Abstraction -> Specific Implementation
 *
 * Requirements for Future Implementation:
 * - Document threat assumptions
 * - Input/output specifications
 * - NIST/RFC test vectors
 * - Negative and fault-injection tests
 * - Clear dependency and version tracking
 *
 * Prohibitions:
 * - DO NOT use mock implementations in production paths.
 * - DO NOT scatter ad-hoc crypto calls across application code.
 * - DO NOT implement cryptography during setup.
 */

export const CRYPTO_MODULE_STATUS = 'SETUP_ONLY_NOT_STARTED' as const;

export type CryptoModuleStatus = typeof CRYPTO_MODULE_STATUS;

/**
 * Placeholder abstract crypto interface contract
 */
export interface ICryptoEngine {
  readonly status: CryptoModuleStatus;
}
