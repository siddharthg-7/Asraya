/**
 * @fileoverview Verifier Domain Model
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import { RequestContract, ProofEnvelope, VerificationReceipt } from '@pramana/shared';

export interface IVerifierPipeline {
  /**
   * Constructs and signs a fresh Verifier Request Contract
   */
  createRequest(
    purpose: string,
    predicates: RequestContract['predicates'],
    context: string,
  ): Promise<RequestContract>;

  /**
   * Executes Tier 4 verification pipeline: nonce check, proof verify, nullifier check, audit log
   */
  verifyProof(envelope: ProofEnvelope): Promise<VerificationReceipt>;
}
