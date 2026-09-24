/**
 * @fileoverview Redaction-Aware Logger Utility
 * Pramāṇa Protocol - Phase 1 Foundation
 *
 * Invariant: Never log raw citizen attributes or decrypted credentials.
 */

export interface ILogger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: unknown, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
}

const REDACTED_KEYS = new Set([
  'password',
  'secret',
  'privatekey',
  'citizenname',
  'birthdate',
  'income',
  'balance',
  'address',
  'nationalid',
  'ssn',
]);

function sanitizeContext(context?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!context) return undefined;
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    if (REDACTED_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED_CITIZEN_DATA]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeContext(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export class AppLogger implements ILogger {
  constructor(private readonly prefix: string = 'Pramāṇa') {}

  info(message: string, context?: Record<string, unknown>): void {
    console.log(`[INFO] [${this.prefix}] ${message}`, sanitizeContext(context) ?? '');
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(`[WARN] [${this.prefix}] ${message}`, sanitizeContext(context) ?? '');
  }

  error(message: string, error?: unknown, context?: Record<string, unknown>): void {
    console.error(
      `[ERROR] [${this.prefix}] ${message}`,
      error ?? '',
      sanitizeContext(context) ?? '',
    );
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (process.env['NODE_ENV'] !== 'production') {
      console.debug(`[DEBUG] [${this.prefix}] ${message}`, sanitizeContext(context) ?? '');
    }
  }
}

export const logger = new AppLogger();
