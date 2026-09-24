/**
 * @fileoverview Module Boundary: @pramana/shared
 *
 * Status: SETUP ONLY (Implementation NOT STARTED)
 *
 * Responsibilities:
 * - Shared core types and primitives
 * - Protocol version constants
 * - Base error definitions
 * - Common sanitization/validation types
 *
 * Prohibitions:
 * - No cryptographic logic (owned by @pramana/crypto)
 * - No business logic or application UI
 */

export const SHARED_MODULE_STATUS = 'SETUP_ONLY_NOT_STARTED' as const;

export type SharedModuleStatus = typeof SHARED_MODULE_STATUS;

/**
 * Base protocol result type separating successes and errors explicitly
 */
export type Result<T, E = Error> =
  { readonly success: true; readonly data: T } | { readonly success: false; readonly error: E };
