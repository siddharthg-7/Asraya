/**
 * @fileoverview Module Boundary: @pramana/test-fixtures
 *
 * Status: SETUP ONLY (Implementation NOT STARTED)
 *
 * CRITICAL RULE NOTICE:
 * All fixtures in this package are strictly:
 * - MOCK
 * - DEMO ONLY
 * - NOT PRODUCTION CRYPTO
 *
 * NEVER import test fixtures into production bundles or runtime paths.
 */

export const FIXTURES_MODULE_STATUS = 'SETUP_ONLY_NOT_STARTED' as const;

export type FixturesModuleStatus = typeof FIXTURES_MODULE_STATUS;

export const FIXTURE_NOTICE = 'MOCK - DEMO ONLY - NOT PRODUCTION CRYPTO' as const;
