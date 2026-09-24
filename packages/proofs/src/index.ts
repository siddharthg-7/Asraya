/**
 * @fileoverview Module Boundary: @pramana/proofs
 *
 * Status: SETUP ONLY (Implementation NOT STARTED)
 *
 * Responsibilities:
 * - Proof orchestration engine
 * - Tier A: BBS selective disclosure and threshold-bit proof generation/verification
 * - Tier B: Groth16 circuit-based predicate proof generation/verification (fallback)
 * - Holder-binding proof generation
 * - Context-scoped nullifier / pseudonym generation
 *
 * Architectural Mandate:
 * - BBS-first is the primary paradigm.
 * - Groth16 is the fallback tier for complex non-BBS predicates.
 * - DO NOT reverse this priority without explicit documented approval.
 */

export const PROOFS_MODULE_STATUS = 'SETUP_ONLY_NOT_STARTED' as const;

export type ProofsModuleStatus = typeof PROOFS_MODULE_STATUS;

export type ProofTier = 'TIER_A_BBS' | 'TIER_B_GROTH16';
