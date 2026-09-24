/**
 * @fileoverview Module Boundary: @pramana/schemas
 *
 * Status: SETUP ONLY (Implementation NOT STARTED)
 *
 * Responsibilities:
 * - Canonical schema definitions
 * - Untrusted external input validation (Request, Registry, Credential, Proof, Receipt)
 * - Separation of untrusted DTOs from validated domain representations
 *
 * Prohibitions:
 * - Do NOT duplicate schemas between wallet and verifier.
 * - Do NOT implement mock data or parsing logic during setup.
 */

export const SCHEMAS_MODULE_STATUS = 'SETUP_ONLY_NOT_STARTED' as const;

export type SchemasModuleStatus = typeof SCHEMAS_MODULE_STATUS;

/**
 * Placeholder Schema Type Identifier
 */
export type SchemaIdentifier = `urn:pramana:schema:${string}`;
