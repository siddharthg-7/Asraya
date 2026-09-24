/**
 * @fileoverview Request Contract Schema and Boundary Validator
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import { RequestContract, DataRetentionPolicy } from '../types/request-contract.js';
import { validatePredicate } from './predicate.schema.js';
import { ERROR_CODES, PramanaError } from '../constants/errors.js';
import { PROTOCOL_VERSION } from '../constants/protocol-version.js';

const VALID_RETENTION_POLICIES: readonly DataRetentionPolicy[] = [
  'NO_RETENTION_VERIFY_ONLY',
  'AUDIT_RECEIPT_ONLY_ZERO_PII',
  'TRANSIENT_SESSION_ONLY',
];

export function validateRequestContract(input: unknown): RequestContract {
  if (typeof input !== 'object' || input === null) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REQUEST,
      'RequestContract must be a non-null object',
    );
  }

  const record = input as Record<string, unknown>;

  if (typeof record['id'] !== 'string' || record['id'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_REQUEST,
      'RequestContract id must be a non-empty string',
    );
  }

  if (record['protocolVersion'] !== PROTOCOL_VERSION) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REQUEST,
      `Unsupported protocol version: ${String(record['protocolVersion'])}, expected: ${PROTOCOL_VERSION}`,
    );
  }

  if (typeof record['verifier'] !== 'object' || record['verifier'] === null) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REQUEST,
      'RequestContract verifier must be an object',
    );
  }

  const verifier = record['verifier'] as Record<string, unknown>;
  if (typeof verifier['did'] !== 'string' || !verifier['did'].startsWith('did:')) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REQUEST,
      "Verifier did must be a valid DID string (e.g. 'did:pramana:...')",
    );
  }
  if (typeof verifier['name'] !== 'string' || verifier['name'].trim() === '') {
    throw new PramanaError(ERROR_CODES.INVALID_REQUEST, 'Verifier name must be a non-empty string');
  }

  if (typeof record['purpose'] !== 'string' || record['purpose'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_REQUEST,
      'RequestContract purpose must be a non-empty string',
    );
  }

  if (typeof record['context'] !== 'string' || record['context'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_REQUEST,
      'RequestContract context must be a non-empty string',
    );
  }

  if (!Array.isArray(record['predicates']) || record['predicates'].length === 0) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REQUEST,
      'RequestContract predicates must be a non-empty array',
    );
  }

  const predicates = record['predicates'].map((p) => validatePredicate(p));

  if (!Array.isArray(record['revealRequirements'])) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REQUEST,
      'RequestContract revealRequirements must be an array',
    );
  }

  const retention = record['retention'] as DataRetentionPolicy;
  if (!VALID_RETENTION_POLICIES.includes(retention)) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REQUEST,
      `Invalid retention policy: ${String(retention)}`,
    );
  }

  if (typeof record['nonce'] !== 'string' || record['nonce'].length < 32) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REQUEST,
      'RequestContract nonce must be at least 32 characters of hex entropy',
    );
  }

  const issuedAt = Date.parse(String(record['issuedAt']));
  const expiresAt = Date.parse(String(record['expiresAt']));

  if (Number.isNaN(issuedAt) || Number.isNaN(expiresAt)) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REQUEST,
      'issuedAt and expiresAt must be valid ISO 8601 timestamps',
    );
  }

  if (expiresAt <= issuedAt) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REQUEST,
      'expiresAt must be chronologically after issuedAt',
    );
  }

  return {
    id: record['id'],
    protocolVersion: PROTOCOL_VERSION,
    verifier: {
      did: verifier['did'],
      name: verifier['name'],
      registryEndpoint:
        typeof verifier['registryEndpoint'] === 'string' ? verifier['registryEndpoint'] : undefined,
    },
    purpose: record['purpose'],
    context: record['context'],
    predicates,
    revealRequirements: record['revealRequirements'] as readonly string[],
    retention,
    nonce: record['nonce'],
    issuedAt: new Date(issuedAt).toISOString(),
    expiresAt: new Date(expiresAt).toISOString(),
    verifierEphemeralKey:
      typeof record['verifierEphemeralKey'] === 'string'
        ? record['verifierEphemeralKey']
        : undefined,
    signature: typeof record['signature'] === 'string' ? record['signature'] : undefined,
  };
}
