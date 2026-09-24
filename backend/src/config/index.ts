/**
 * @fileoverview Backend Configuration Module
 * Pramāṇa Protocol - Phase 1 Foundation
 */

export interface AppConfig {
  readonly env: 'development' | 'test' | 'production';
  readonly host: string;
  readonly port: number;
  readonly logLevel: string;
  readonly registryUrl: string;
  readonly nonceTtlSeconds: number;
}

export const config: AppConfig = {
  env: (process.env['NODE_ENV'] as AppConfig['env']) || 'development',
  host: process.env['HOST'] || '0.0.0.0',
  port: Number(process.env['PORT'] || 3001),
  logLevel: process.env['LOG_LEVEL'] || 'info',
  registryUrl: process.env['REGISTRY_URL'] || 'http://localhost:3002/api/v1',
  nonceTtlSeconds: Number(process.env['NONCE_TTL_SECONDS'] || 120),
};
