/**
 * @fileoverview Service Boundary: @pramana/service-adapters
 *
 * Status: SETUP ONLY (Implementation NOT STARTED)
 *
 * Future Responsibilities:
 * - Host standalone microservice endpoints wrapping @pramana/adapters
 * - Ingest legacy SQL feeds, ISO 20022 camt.053 XML files, or REST endpoints
 * - Produce normalized, canonical schema-compliant payloads for issuers
 *
 * Prohibitions during setup phase:
 * - DO NOT build APIs or adapters.
 */

export const SERVICE_ADAPTERS_STATUS = 'SETUP_ONLY_NOT_STARTED' as const;

export type ServiceAdaptersStatus = typeof SERVICE_ADAPTERS_STATUS;
