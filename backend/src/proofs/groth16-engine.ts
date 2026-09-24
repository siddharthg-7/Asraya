/**
 * @fileoverview Tier B: Groth16 zk-SNARK Fallback Proof Engine Abstraction
 * Pramāṇa Protocol - Phase 1 Foundation
 *
 * Current Architecture: Groth16 is the secondary fallback for complex non-linear arithmetic.
 */

import { Groth16ProofPayload, ERROR_CODES, PramanaError } from '@pramana/shared';

export interface IGroth16Engine {
  verifyCircuitProof(
    payload: Groth16ProofPayload,
    verificationKey: Record<string, unknown>,
  ): Promise<boolean>;
}

export class UninitializedGroth16Engine implements IGroth16Engine {
  async verifyCircuitProof(
    _payload: Groth16ProofPayload,
    _verificationKey: Record<string, unknown>,
  ): Promise<boolean> {
    throw new PramanaError(
      ERROR_CODES.NOT_IMPLEMENTED,
      'Tier B (Groth16) circuit verification engine is NOT implemented in Phase 1 setup',
    );
  }
}
