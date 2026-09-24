/**
 * @fileoverview Service Boundary: @pramana/issuer-mocks
 *
 * Status: SETUP ONLY (Implementation NOT STARTED)
 *
 * Future Responsibilities:
 * - Local demonstration issuer endpoints
 * - Synthetic credential issuance for tests
 *
 * CRITICAL RULE NOTICE:
 * - Mark all components as MOCK / DEMO ONLY / NOT PRODUCTION CRYPTO
 * - NEVER deploy into production environments or paths.
 *
 * Prohibitions during setup phase:
 * - DO NOT create mock issuers.
 * - DO NOT build APIs.
 */

export const ISSUER_MOCKS_STATUS = 'SETUP_ONLY_NOT_STARTED' as const;

export type IssuerMocksStatus = typeof ISSUER_MOCKS_STATUS;
