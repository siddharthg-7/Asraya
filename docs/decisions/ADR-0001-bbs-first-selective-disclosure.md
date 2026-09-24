# ADR-0001: BBS-First Selective Disclosure with Groth16 Fallback

## Status

ACCEPTED

## Context

Privacy-preserving verification requires the ability to prove possession of certified credentials and evaluate predicates (such as age or income thresholds) without revealing all underlying attributes or plain values. Multiple cryptographic paradigms exist, including multi-message signature schemes (BBS+), anonymous credentials (Idemix), and general-purpose zero-knowledge SNARKs (Groth16, PLONK, Halo2).

## Problem

General-purpose zk-SNARKs (e.g. Groth16) require per-circuit trusted setup ceremonies, large proving keys, substantial client CPU/battery consumption on mobile devices (often 1–5 seconds per proof), and significant engineering complexity. Conversely, naive selective disclosure without SNARKs often struggles with complex multi-variable non-linear predicates.

## Options Considered

1. **Groth16 Everywhere**: Implement all proofs and disclosures via Circom zk-SNARK circuits.
   - _Cons_: Poor mobile performance, heavy battery drain, complex trusted setups.
2. **BBS-Only**: Restrict the protocol strictly to BBS multi-message signatures.
   - _Cons_: Cannot handle complex arbitrary arithmetic formulas or multi-credential non-linear constraints.
3. **BBS-First with Groth16 Fallback (Two-Tier Model)**: Use BBS as the primary default tier (Tier A) for standard selective disclosure and bit-decomposed range proofs. Use Groth16 as a secondary fallback (Tier B) strictly when predicates require complex non-linear arithmetic.
   - _Pros_: Sub-100ms proof generation on smartphones, zero per-predicate trusted setup for common flows, while preserving extensibility for complex logic.

## Decision

Adopt **BBS-First as the primary proof tier (Tier A)** with **Groth16 as the secondary fallback tier (Tier B)**.

Future AI agents are explicitly prohibited from reversing this decision or making Groth16 the default proving engine without formal project review and approval.

## Consequences

- **Positive**: Blazing fast mobile wallet UX (~20ms proof times for standard verification), battery-friendly operation, no circuit setup required for 90%+ of verification use cases.
- **Negative / Trade-offs**: Architecture must maintain two proof pipelines (`@pramana/proofs` must support both BBS and SNARK verifiers), requiring disciplined module separation.

## Source / Reference

- Authoritative Pramāṇa Specification, Tier 2 Minimization Engine.
- IETF CFRG BBS Signature Suite Draft (`draft-irtf-cfrg-bbs-signatures`).
