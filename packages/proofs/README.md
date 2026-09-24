# @pramana/proofs

Proof orchestration and verification engine for Tier A (BBS) and Tier B (Groth16).

## Status

`NOT STARTED` (Setup Phase Only)

## Proof Tiers

- **Tier A (Default)**: BBS selective disclosure and threshold-bit range proofs.
- **Tier B (Fallback)**: Groth16 zk-SNARK circuits for arbitrary arithmetic predicates.

## Invariant

The architecture explicitly prioritizes Tier A (BBS) for performance, battery efficiency, and zero-setup verification. Groth16 must never be made the default without explicit governance approval.
