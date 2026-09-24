/**
 * @fileoverview Tier B: Groth16 zk-SNARK Fallback Proof Engine Abstraction
 * Pramāṇa Protocol - Phase 5 Cryptographic Core
 *
 * Current Architecture: Groth16 is the secondary fallback for complex non-linear arithmetic.
 */

import { Groth16ProofPayload, ERROR_CODES, PramanaError } from '@pramana/shared';
import { groth16Service } from '../crypto/groth16-service.js';

export interface IGroth16Engine {
  verifyCircuitProof(
    payload: Groth16ProofPayload,
    verificationKey?: Record<string, unknown>,
  ): Promise<boolean>;
}

export class Groth16Engine implements IGroth16Engine {
  async verifyCircuitProof(
    payload: Groth16ProofPayload,
    verificationKey?: Record<string, unknown>,
  ): Promise<boolean> {
    try {
      const vKey =
        verificationKey && Object.keys(verificationKey).length > 0
          ? verificationKey
          : await groth16Service.getVerificationKey();

      const snarkjs = await import('snarkjs');
      return (await snarkjs.groth16.verify(
        vKey,
        payload.publicSignals as string[],
        payload.proof,
      )) as boolean;
    } catch {
      return false;
    }
  }
}

export class UninitializedGroth16Engine implements IGroth16Engine {
  async verifyCircuitProof(
    _payload: Groth16ProofPayload,
    _verificationKey?: Record<string, unknown>,
  ): Promise<boolean> {
    throw new PramanaError(
      ERROR_CODES.NOT_IMPLEMENTED,
      'Tier B (Groth16) circuit verification engine is NOT implemented in Phase 1 setup',
    );
  }
}

export const groth16Engine = new Groth16Engine();
