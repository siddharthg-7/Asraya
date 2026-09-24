/**
 * @fileoverview Credential Schema and Boundary Validator
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import { VerifiableCredential } from '../types/credentials.js';
import { ERROR_CODES, PramanaError } from '../constants/errors.js';

export function validateCredential(input: unknown): VerifiableCredential {
  if (typeof input !== 'object' || input === null) {
    throw new PramanaError(ERROR_CODES.CREDENTIAL_INVALID, 'Credential must be a non-null object');
  }

  const record = input as Record<string, unknown>;

  if (typeof record['metadata'] !== 'object' || record['metadata'] === null) {
    throw new PramanaError(ERROR_CODES.CREDENTIAL_INVALID, 'Credential metadata must be an object');
  }
  const metadata = record['metadata'] as Record<string, unknown>;
  if (typeof metadata['id'] !== 'string' || typeof metadata['schemaId'] !== 'string') {
    throw new PramanaError(
      ERROR_CODES.CREDENTIAL_INVALID,
      'Credential metadata must include id and schemaId',
    );
  }

  if (typeof record['issuer'] !== 'object' || record['issuer'] === null) {
    throw new PramanaError(ERROR_CODES.CREDENTIAL_INVALID, 'Credential issuer must be an object');
  }
  const issuer = record['issuer'] as Record<string, unknown>;
  if (typeof issuer['did'] !== 'string' || !issuer['did'].startsWith('did:')) {
    throw new PramanaError(
      ERROR_CODES.CREDENTIAL_INVALID,
      'Credential issuer did must be a valid DID',
    );
  }

  if (typeof record['holderBinding'] !== 'object' || record['holderBinding'] === null) {
    throw new PramanaError(
      ERROR_CODES.CREDENTIAL_INVALID,
      'Credential must include holderBinding commitment',
    );
  }
  const binding = record['holderBinding'] as Record<string, unknown>;
  if (typeof binding['holderPublicKeyHash'] !== 'string') {
    throw new PramanaError(
      ERROR_CODES.CREDENTIAL_INVALID,
      'holderBinding must contain holderPublicKeyHash',
    );
  }

  if (typeof record['claims'] !== 'object' || record['claims'] === null) {
    throw new PramanaError(
      ERROR_CODES.CREDENTIAL_INVALID,
      'Credential claims must be a non-null object',
    );
  }

  if (typeof record['signature'] !== 'string' || record['signature'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.CREDENTIAL_INVALID,
      'Credential must include a non-empty cryptographic signature',
    );
  }

  return {
    metadata: {
      id: String(metadata['id']),
      schemaId: String(metadata['schemaId']),
      issuedAt: String(metadata['issuedAt'] ?? new Date().toISOString()),
      expiresAt: typeof metadata['expiresAt'] === 'string' ? metadata['expiresAt'] : undefined,
    },
    issuer: {
      did: String(issuer['did']),
      name: String(issuer['name'] ?? 'Unknown Issuer'),
      registryCheckpoint: String(issuer['registryCheckpoint'] ?? 'default'),
    },
    holderBinding: {
      holderPublicKeyHash: String(binding['holderPublicKeyHash']),
      algorithm: binding['algorithm'] === 'ED25519' ? 'ED25519' : 'BLS12-381-G1',
    },
    claims: record['claims'] as Readonly<Record<string, string | number | boolean>>,
    signature: record['signature'] as string,
  };
}

export function validateMinimalClaimSet(
  input: unknown,
): import('../types/credentials.js').MinimalClaimSet {
  if (typeof input !== 'object' || input === null) {
    throw new PramanaError(
      ERROR_CODES.CLAIM_GENERATION_FAILED,
      'MinimalClaimSet must be a non-null object',
    );
  }

  const rec = input as Record<string, unknown>;

  if (typeof rec['schemaId'] !== 'string' || rec['schemaId'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.CLAIM_GENERATION_FAILED,
      'MinimalClaimSet schemaId must be a non-empty string',
    );
  }

  if (typeof rec['issuerDid'] !== 'string' || !rec['issuerDid'].startsWith('did:')) {
    throw new PramanaError(
      ERROR_CODES.CLAIM_GENERATION_FAILED,
      'MinimalClaimSet issuerDid must be a valid DID',
    );
  }

  if (typeof rec['subjectId'] !== 'string' || rec['subjectId'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.CLAIM_GENERATION_FAILED,
      'MinimalClaimSet subjectId must be a non-empty string',
    );
  }

  if (typeof rec['claims'] !== 'object' || rec['claims'] === null || Array.isArray(rec['claims'])) {
    throw new PramanaError(
      ERROR_CODES.CLAIM_GENERATION_FAILED,
      'MinimalClaimSet claims must be an object',
    );
  }

  if (rec['isMockUnsigned'] !== true) {
    throw new PramanaError(
      ERROR_CODES.CLAIM_GENERATION_FAILED,
      'MinimalClaimSet must have isMockUnsigned: true in Phase 3',
    );
  }

  return {
    schemaId: rec['schemaId'] as string,
    issuerDid: rec['issuerDid'] as string,
    subjectId: rec['subjectId'] as string,
    claims: rec['claims'] as Readonly<Record<string, string | number | boolean>>,
    issuedAt: typeof rec['issuedAt'] === 'string' ? rec['issuedAt'] : new Date().toISOString(),
    isMockUnsigned: true,
  };
}
