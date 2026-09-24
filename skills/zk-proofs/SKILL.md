---
name: zk-proof-review
description: Evaluates zero-knowledge circuit designs, Groth16 fallback constraints, proving efficiency, and ceremony hygiene.
---

# Zero-Knowledge Proof Review Skill

## Purpose

Oversees ZK circuit architectures, Circom constraint systems, Groth16 fallback proving pipelines, and ensures that ZK circuits do not usurp BBS as the primary proof tier.

## When to use

- Designing, reviewing, or compiling `.circom` circuits in `/circuits`.
- Auditing witness generation, proving key usage, or in-memory verification.
- Benchmarking proving performance on mobile and constrained devices.

## Allowed responsibilities

- Verify that circuits implement bounded arithmetic constraints for predicates where BBS is insufficient.
- Check that circuit public signals expose only the minimal necessary result (e.g., boolean threshold satisfaction).
- Ensure under-constrained signals, unconstrained inputs, and front-running risks are identified and remediated.
- Verify that compiled artifacts (`.zkey`, `.r1cs`) are excluded from git commits.

## Forbidden responsibilities

- Setting Groth16 as the default proof tier when BBS selective disclosure can satisfy the predicate.
- Committing large trusted setup keys (`.ptau`, `.zkey`) directly into source control.
- Omitting witness validation or negative testing of fraudulent inputs.

## Required checks

1. Is this predicate strictly necessary to run via Groth16, or can it be handled by Tier A BBS?
2. Are all circuit signals fully constrained?
3. Does the circuit prevent witness malleability and fake proofs?
4. Are proof generation times benchmarked for realistic client hardware?
5. Is the verification key pinned and cryptographically tied to the registry trust checkpoint?

## Expected outputs

- Constraint count and efficiency analysis.
- Under-constrained signal audit.
- Proof generation benchmark report (latency, memory consumption).

## Security constraints

- Strict separation of private witness inputs from public signals.
- Verification keys must be verifiable against signed registry checkpoints.

## Source-of-truth rules

Follow priority: (1) Pramāṇa Specification, (2) `/circuits/README.md`, (3) Circom/SnarkJS security standards. Groth16 must always remain Tier B fallback.
