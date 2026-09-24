/**
 * @fileoverview Nonce Generation & Anti-Replay Utilities
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import crypto from 'node:crypto';
import { MAX_NONCE_AGE_SECONDS } from '@pramana/shared';

export function generateNonce(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function isTimestampValid(
  timestampIso: string,
  maxAgeSeconds: number = MAX_NONCE_AGE_SECONDS,
): boolean {
  const timestamp = Date.parse(timestampIso);
  if (Number.isNaN(timestamp)) {
    return false;
  }
  const now = Date.now();
  const ageMs = now - timestamp;
  const maxAgeMs = maxAgeSeconds * 1000;
  // Reject future timestamps past 5s clock skew, and timestamps older than maxAgeMs
  return ageMs >= -5000 && ageMs <= maxAgeMs;
}
