/**
 * @fileoverview Unified Proof Orchestration Engine
 * Pramāṇa Protocol - Phase 5 Cryptographic Core
 */

import { ProofEnvelope, ERROR_CODES, PramanaError } from '@pramana/shared';
import { IBBSEngine, bbsEngine } from './bbs-engine.js';
import { IGroth16Engine, groth16Engine } from './groth16-engine.js';

export interface IProofOrchestrator {
  verify(envelope: ProofEnvelope, issuerKey: string): Promise<boolean>;
}

export class ProofOrchestrator implements IProofOrchestrator {
  constructor(
    private readonly bbsEngineInstance: IBBSEngine = bbsEngine,
    private readonly groth16EngineInstance: IGroth16Engine = groth16Engine,
  ) {}

  async verify(envelope: ProofEnvelope, issuerKey: string): Promise<boolean> {
    if (envelope.proofTier === 'TIER_A_BBS') {
      if (envelope.payload.tier !== 'TIER_A_BBS') {
        throw new PramanaError(ERROR_CODES.PROOF_NOT_SUPPORTED, 'Proof tier mismatch in payload');
      }
      return this.bbsEngineInstance.verifyPresentation(envelope.payload, issuerKey, envelope.nonce);
    }

    if (envelope.proofTier === 'TIER_B_GROTH16') {
      if (envelope.payload.tier !== 'TIER_B_GROTH16') {
        throw new PramanaError(ERROR_CODES.PROOF_NOT_SUPPORTED, 'Proof tier mismatch in payload');
      }
      return this.groth16EngineInstance.verifyCircuitProof(envelope.payload);
    }

    if (envelope.proofTier === 'TIER_HYBRID_BBS_GROTH16') {
      if (envelope.payload.tier !== 'TIER_HYBRID_BBS_GROTH16') {
        throw new PramanaError(ERROR_CODES.PROOF_NOT_SUPPORTED, 'Proof tier mismatch in payload');
      }
      const bbsValid = await this.bbsEngineInstance.verifyPresentation(
        envelope.payload.bbs,
        issuerKey,
        envelope.nonce,
      );
      if (!bbsValid) return false;

      const groth16Valid = await this.groth16EngineInstance.verifyCircuitProof(
        envelope.payload.groth16,
      );
      return groth16Valid;
    }

    throw new PramanaError(
      ERROR_CODES.PROOF_NOT_SUPPORTED,
      `Unsupported proof tier: ${String(envelope.proofTier)}`,
    );
  }
}

export const proofOrchestrator = new ProofOrchestrator();
