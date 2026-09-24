/**
 * @fileoverview Proof Abstractions and Proof Tiers
 * Pramāṇa Protocol - Phase 1 Foundation
 *
 * Current Architectural Direction:
 * - BBS Multi-Message Signatures = Primary Proof Tier (Tier A)
 * - Groth16 zk-SNARKs = Fallback Proof Tier (Tier B)
 */

export type ProofTier = 'TIER_A_BBS' | 'TIER_B_GROTH16';

export interface BBSProofPayload {
  readonly tier: 'TIER_A_BBS';
  readonly revealedAttributes: Readonly<Record<string, string | number | boolean>>;
  readonly proofBytes: string; // Base64 encoded BBS selective disclosure proof
  readonly blindedCommitment: string;
}

export interface Groth16ProofPayload {
  readonly tier: 'TIER_B_GROTH16';
  readonly circuitId: string;
  readonly publicSignals: readonly string[];
  readonly proof: {
    readonly pi_a: readonly [string, string, string];
    readonly pi_b: readonly [
      readonly [string, string],
      readonly [string, string],
      readonly [string, string],
    ];
    readonly pi_c: readonly [string, string, string];
    readonly protocol: 'groth16';
  };
}

export interface NullifierRecord {
  readonly contextId: string;
  readonly nullifierHash: string; // H(holder_secret, contextId, epoch)
  readonly epoch: number;
}

export interface ProofEnvelope {
  readonly contractId: string;
  readonly verifierDid: string;
  readonly nonce: string;
  readonly proofTier: ProofTier;
  readonly payload: BBSProofPayload | Groth16ProofPayload;
  readonly nullifier: NullifierRecord;
  readonly holderBindingSignature: string;
  readonly createdAt: string; // ISO 8601 UTC
}
