/**
 * @fileoverview Receipt Schema and Boundary Validator
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import {
  VerificationReceipt,
  MinimalAuditLogEntry,
  VerificationVerdict,
} from '../types/receipts.js';
import { ERROR_CODES, PramanaError } from '../constants/errors.js';

const VALID_VERDICTS: readonly VerificationVerdict[] = [
  'VERIFIED',
  'REJECTED',
  'EXPIRED',
  'MALFORMED',
];

export function validateVerificationReceipt(input: unknown): VerificationReceipt {
  if (typeof input !== 'object' || input === null) {
    throw new PramanaError(
      ERROR_CODES.INTERNAL_PROTOCOL_ERROR,
      'Receipt must be a non-null object',
    );
  }

  const record = input as Record<string, unknown>;

  if (typeof record['id'] !== 'string' || typeof record['contractId'] !== 'string') {
    throw new PramanaError(
      ERROR_CODES.INTERNAL_PROTOCOL_ERROR,
      'Receipt requires id and contractId',
    );
  }

  const verdict = record['verdict'] as VerificationVerdict;
  if (!VALID_VERDICTS.includes(verdict)) {
    throw new PramanaError(
      ERROR_CODES.INTERNAL_PROTOCOL_ERROR,
      `Invalid verdict: ${String(verdict)}`,
    );
  }

  if (typeof record['nullifierHash'] !== 'string' || typeof record['signature'] !== 'string') {
    throw new PramanaError(
      ERROR_CODES.INTERNAL_PROTOCOL_ERROR,
      'Receipt requires nullifierHash and signature',
    );
  }

  return {
    id: record['id'],
    contractId: record['contractId'],
    verifierDid: String(record['verifierDid']),
    purpose: String(record['purpose']),
    verdict,
    verifiedAt:
      typeof record['verifiedAt'] === 'string' ? record['verifiedAt'] : new Date().toISOString(),
    nullifierHash: record['nullifierHash'],
    signature: record['signature'],
  };
}

export function validateMinimalAuditLogEntry(input: unknown): MinimalAuditLogEntry {
  if (typeof input !== 'object' || input === null) {
    throw new PramanaError(
      ERROR_CODES.INTERNAL_PROTOCOL_ERROR,
      'Audit log entry must be an object',
    );
  }

  const record = input as Record<string, unknown>;

  const verdict = record['verdict'] as VerificationVerdict;
  if (!VALID_VERDICTS.includes(verdict)) {
    throw new PramanaError(
      ERROR_CODES.INTERNAL_PROTOCOL_ERROR,
      `Invalid verdict in audit log: ${String(verdict)}`,
    );
  }

  return {
    sessionId: String(record['sessionId']),
    verifierDid: String(record['verifierDid']),
    purposeCode: String(record['purposeCode']),
    timestamp:
      typeof record['timestamp'] === 'string' ? record['timestamp'] : new Date().toISOString(),
    verdict,
    nullifierHash: String(record['nullifierHash']),
    receiptSignature: String(record['receiptSignature']),
  };
}
