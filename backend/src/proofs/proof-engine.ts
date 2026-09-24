/**
 * @fileoverview Unified Proof Orchestration Engine
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import { ProofEnvelope, ERROR_CODES, PramanaError } from '@pramana/shared';
import { IBBSEngine, UninitializedBBSEngine } from './bbs-engine.js';
import { IGroth16Engine, UninitializedGroth16Engine } from './groth16-engine.js';

export interface IProofOrchestrator {
  verify(envelope: ProofEnvelope, issuerKey: string): Promise<boolean>;
}

export class ProofOrchestrator implements IProofOrchestrator {
  constructor(
    private readonly bbsEngine: IBBSEngine = new UninitializedBBSEngine(),
    private readonly groth16Engine: IGroth16Engine = new UninitializedGroth16Engine(),
  ) {}

  async verify(envelope: ProofEnvelope, issuerKey: string): Promise<boolean> {
    if (envelope.proofTier === 'TIER_A_BBS') {
      if (envelope.payload.tier !== 'TIER_A_BBS') {
        throw new PramanaError(ERROR_CODES.PROOF_NOT_SUPPORTED, 'Proof tier mismatch in payload');
      }
      return this.bbsEngine.verifyPresentation(envelope.payload, issuerKey, envelope.nonce);
    }

    if (envelope.proofTier === 'TIER_B_GROTH16') {
      if (envelope.payload.tier !== 'TIER_B_GROTH16') {
        throw new PramanaError(ERROR_CODES.PROOF_NOT_SUPPORTED, 'Proof tier mismatch in payload');
      }
      return this.groth16Engine.verifyCircuitProof(envelope.payload, {});
    }

    throw new PramanaError(
      ERROR_CODES.PROOF_NOT_SUPPORTED,
      `Unsupported proof tier: ${String(envelope.proofTier)}`,
    );
  }
}

export const proofOrchestrator = new ProofOrchestrator();
