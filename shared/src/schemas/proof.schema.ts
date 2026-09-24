/**
 * @fileoverview Proof Envelope Schema and Boundary Validator
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import { ProofEnvelope, ProofTier } from '../types/proofs.js';
import { ERROR_CODES, PramanaError } from '../constants/errors.js';

const VALID_PROOF_TIERS: readonly ProofTier[] = ['TIER_A_BBS', 'TIER_B_GROTH16'];

export function validateProofEnvelope(input: unknown): ProofEnvelope {
  if (typeof input !== 'object' || input === null) {
    throw new PramanaError(
      ERROR_CODES.PROOF_NOT_SUPPORTED,
      'Proof envelope must be a non-null object',
    );
  }

  const record = input as Record<string, unknown>;

  if (typeof record['contractId'] !== 'string' || record['contractId'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.PROOF_NOT_SUPPORTED,
      'Proof envelope contractId is required',
    );
  }

  if (typeof record['verifierDid'] !== 'string' || !record['verifierDid'].startsWith('did:')) {
    throw new PramanaError(
      ERROR_CODES.PROOF_NOT_SUPPORTED,
      'Proof envelope verifierDid must be a valid DID',
    );
  }

  if (typeof record['nonce'] !== 'string' || record['nonce'].length < 32) {
    throw new PramanaError(
      ERROR_CODES.PROOF_NOT_SUPPORTED,
      'Proof envelope nonce must be at least 32 characters',
    );
  }

  const proofTier = record['proofTier'] as ProofTier;
  if (!VALID_PROOF_TIERS.includes(proofTier)) {
    throw new PramanaError(
      ERROR_CODES.PROOF_NOT_SUPPORTED,
      `Unsupported proof tier: ${String(proofTier)}`,
    );
  }

  if (typeof record['nullifier'] !== 'object' || record['nullifier'] === null) {
    throw new PramanaError(
      ERROR_CODES.PROOF_NOT_SUPPORTED,
      'Proof envelope must contain a valid nullifier record',
    );
  }
  const nullifier = record['nullifier'] as Record<string, unknown>;
  if (
    typeof nullifier['contextId'] !== 'string' ||
    typeof nullifier['nullifierHash'] !== 'string'
  ) {
    throw new PramanaError(
      ERROR_CODES.PROOF_NOT_SUPPORTED,
      'Nullifier must contain contextId and nullifierHash',
    );
  }

  if (typeof record['payload'] !== 'object' || record['payload'] === null) {
    throw new PramanaError(
      ERROR_CODES.PROOF_NOT_SUPPORTED,
      'Proof envelope payload must be an object',
    );
  }

  if (typeof record['holderBindingSignature'] !== 'string') {
    throw new PramanaError(
      ERROR_CODES.PROOF_NOT_SUPPORTED,
      'Proof envelope requires holderBindingSignature',
    );
  }

  return {
    contractId: record['contractId'],
    verifierDid: record['verifierDid'],
    nonce: record['nonce'],
    proofTier,
    payload: record['payload'] as ProofEnvelope['payload'],
    nullifier: {
      contextId: String(nullifier['contextId']),
      nullifierHash: String(nullifier['nullifierHash']),
      epoch: Number(nullifier['epoch'] ?? 0),
    },
    holderBindingSignature: record['holderBindingSignature'],
    createdAt:
      typeof record['createdAt'] === 'string' ? record['createdAt'] : new Date().toISOString(),
  };
}
