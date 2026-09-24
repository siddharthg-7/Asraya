# Pramāṇa Zero-Knowledge Circuits

This directory is reserved for Zero-Knowledge circuits and trusted setup artifacts.

## Status

`NOT STARTED` (Setup Phase Only — DO NOT WRITE CIRCUITS IN THIS PHASE)

## Proof Architecture & Proof Tiers

The Pramāṇa specification defines two distinct proof tiers:

### Tier A (Default): BBS Selective Disclosure & Threshold-Bit Range Proofs

- **Primary Mechanism**: Pairing-based BBS+ / BBS signatures over BLS12-381.
- **Attributes & Predicates**: Direct selective disclosure of claims and integer threshold/range evaluation via pre-computed decomposed bit-commitments.
- **Advantages**:
  - Extremely fast proof generation (~10–30ms on mobile devices).
  - No per-predicate trusted setup.
  - Native holder binding through cryptographic blinding.
  - Context-scoped pseudonyms and nullifiers derived without heavy SNARKs.

### Tier B (Fallback): Groth16 zk-SNARK Circuits

- **Fallback Mechanism**: Arithmetic circuits compiled with Circom and verified using SnarkJS / Groth16.
- **Use Case**: Complex multi-variable arithmetic, arbitrary inequalities, non-linear algebraic predicates, or multi-credential constraint systems where BBS bit-decomposition is insufficient or too large.
- **Circuit Compilation Pipeline**:
  ```
  .circom source files
        ↓ (circom compiler)
  .r1cs (Rank-1 Constraint System) + .wasm (witness generator)
        ↓ (Powers of Tau + Groth16 Ceremony)
  .zkey (Proving and Verification Keys)
        ↓
  Verifier Contract / In-Memory Proof Engine
  ```

## Invariants & Guardrails

1. **Tier A is the Default**: Groth16 is strictly a secondary fallback for predicates that BBS cannot express. Future agents MUST NOT make Groth16 the primary or sole proof mechanism.
2. **Setup Isolation**: Do NOT commit `.zkey`, `.ptau`, `.r1cs`, or witness files to git repository. They are compiled build outputs.
3. **No Mocks in Production**: Any simulated or dummy circuit outputs used for integration testing must be explicitly labeled as `MOCK - DEMO ONLY - NOT PRODUCTION CRYPTO`.
