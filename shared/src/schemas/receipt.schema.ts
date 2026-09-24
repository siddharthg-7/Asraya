/**
 * @fileoverview Receipt Schema and Boundary Validator
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import {
  VerificationReceipt,
  MinimalAuditLogEntry,
  VerificationVerdict,
  VerificationResult,
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

export function validateVerificationResult(input: unknown): VerificationResult {
  if (typeof input !== 'object' || input === null) {
    throw new PramanaError(
      ERROR_CODES.INTERNAL_PROTOCOL_ERROR,
      'VerificationResult must be a non-null object',
    );
  }

  const record = input as Record<string, unknown>;

  if (typeof record['sessionId'] !== 'string' || record['sessionId'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INTERNAL_PROTOCOL_ERROR,
      'VerificationResult requires a non-empty sessionId',
    );
  }

  if (typeof record['contractId'] !== 'string' || record['contractId'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INTERNAL_PROTOCOL_ERROR,
      'VerificationResult requires a non-empty contractId',
    );
  }

  if (typeof record['verifierDid'] !== 'string' || !record['verifierDid'].startsWith('did:')) {
    throw new PramanaError(
      ERROR_CODES.INTERNAL_PROTOCOL_ERROR,
      'VerificationResult requires a valid verifierDid',
    );
  }

  const verdict = record['verdict'] as VerificationVerdict;
  if (!VALID_VERDICTS.includes(verdict)) {
    throw new PramanaError(
      ERROR_CODES.INTERNAL_PROTOCOL_ERROR,
      `Invalid verification result verdict: ${String(verdict)}`,
    );
  }

  if (typeof record['receiptHash'] !== 'string' || record['receiptHash'].length < 32) {
    throw new PramanaError(
      ERROR_CODES.INTERNAL_PROTOCOL_ERROR,
      'VerificationResult requires a valid receiptHash (SHA-256 digest)',
    );
  }

  if (typeof record['nullifierHash'] !== 'string' || record['nullifierHash'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INTERNAL_PROTOCOL_ERROR,
      'VerificationResult requires a non-empty nullifierHash',
    );
  }

  if (typeof record['signature'] !== 'string' || record['signature'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INTERNAL_PROTOCOL_ERROR,
      'VerificationResult requires a non-empty verifier signature',
    );
  }

  // Guard against accidental raw citizen PII leakage in verification result
  const rawPiiKeys = ['rawCitizenData', 'unblindedAttributes', 'citizenRecord', 'ssn', 'aadhaar'];
  for (const piiKey of rawPiiKeys) {
    if (piiKey in record) {
      throw new PramanaError(
        ERROR_CODES.INTERNAL_PROTOCOL_ERROR,
        `VerificationResult violates data minimization: prohibited field '${piiKey}' detected`,
      );
    }
  }

  return {
    sessionId: record['sessionId'],
    contractId: record['contractId'],
    verifierDid: record['verifierDid'],
    verdict,
    verifiedAt:
      typeof record['verifiedAt'] === 'string' ? record['verifiedAt'] : new Date().toISOString(),
    receiptHash: record['receiptHash'],
    nullifierHash: record['nullifierHash'],
    disclosedAttributes:
      typeof record['disclosedAttributes'] === 'object' && record['disclosedAttributes'] !== null
        ? (record['disclosedAttributes'] as Readonly<Record<string, string | number | boolean>>)
        : undefined,
    signature: record['signature'],
  };
}
