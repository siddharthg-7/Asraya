/**
 * @fileoverview Cryptographic Interfaces and Abstraction Boundaries
 * Pramāṇa Protocol - Phase 1 Foundation
 *
 * Anti-Hallucination Invariant:
 * Real cryptographic primitives are NOT implemented in Phase 1.
 * Methods explicitly throw NOT_IMPLEMENTED / UNVERIFIED_FEATURE errors rather than faking verification.
 */

import { ERROR_CODES, PramanaError } from '@pramana/shared';

export interface KeyPair {
  readonly publicKey: string;
  readonly privateKeyRef?: string;
  readonly keyType: 'BLS12-381-G2' | 'ED25519';
}

export interface ICryptoService {
  hash(data: Uint8Array): Promise<string>;
  sign(data: Uint8Array, privateKeyRef: string): Promise<string>;
  verifySignature(data: Uint8Array, signature: string, publicKey: string): Promise<boolean>;
  generateBlindingFactor(): Promise<string>;
}

export class UnverifiedCryptoService implements ICryptoService {
  async hash(_data: Uint8Array): Promise<string> {
    throw new PramanaError(
      ERROR_CODES.NOT_IMPLEMENTED,
      'Cryptographic hashing engine uninitialized for Phase 1',
    );
  }

  async sign(_data: Uint8Array, _privateKeyRef: string): Promise<string> {
    throw new PramanaError(
      ERROR_CODES.NOT_IMPLEMENTED,
      'Cryptographic signing engine uninitialized for Phase 1',
    );
  }

  async verifySignature(
    _data: Uint8Array,
    _signature: string,
    _publicKey: string,
  ): Promise<boolean> {
    throw new PramanaError(
      ERROR_CODES.PROOF_VERIFICATION_FAILED,
      'Cryptographic signature verification uninitialized for Phase 1 (Mocks forbidden in production path)',
    );
  }

  async generateBlindingFactor(): Promise<string> {
    throw new PramanaError(
      ERROR_CODES.NOT_IMPLEMENTED,
      'Cryptographic blinding engine uninitialized for Phase 1',
    );
  }
}
