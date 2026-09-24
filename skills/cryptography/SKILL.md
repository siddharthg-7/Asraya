---
name: cryptography-review
description: Verifies cryptographic primitives, BBS signature suites, BLS12-381 curves, test vectors, and abstraction boundaries.
---

# Cryptography Review Skill

## Purpose

Ensures that all cryptographic operations are executed through canonical abstractions in `@pramana/crypto`, adhere strictly to the specification (BBS-first), and meet rigorous verification standards.

## When to use

- Introducing, modifying, or reviewing cryptographic algorithms, signature generation, or verification logic.
- Adding dependencies related to curves, hashes, key encapsulation, or zero-knowledge primitives.
- Validating cryptographic test vectors and negative test suites.

## Allowed responsibilities

- Verify that cryptographic logic resides exclusively within `@pramana/crypto` or `@pramana/proofs`.
- Validate that BBS signature implementation matches the IETF CFRG BBS Signature Suite.
- Check that curve operations use audited libraries (`@noble/curves`, `@noble/hashes`).
- Validate standard test vectors against RFC/NIST specifications.

## Forbidden responsibilities

- Rolling custom cryptographic primitives or unvetted curve implementations.
- Introducing mock crypto into production runtime pathways.
- Claiming cryptographic security merely because a library is imported.

## Required checks

1. Does the code invoke crypto through the canonical abstraction layer rather than ad-hoc inline imports?
2. Are BBS signatures prioritized as Tier A over SNARKs?
3. Does every cryptographic function have associated positive test vectors and negative fault tests?
4. Are blinding factors, private keys, and holder secrets wiped or securely handled?
5. Are all mocks labeled with `MOCK - DEMO ONLY - NOT PRODUCTION CRYPTO`?

## Expected outputs

- Cryptographic verification matrix covering primitives, curves, and test vector match rates.
- Negative test verification log (invalid signatures, malformed keys, tampered proofs).
- Dependency audit for cryptographic libraries.

## Security constraints

- Constant-time operations where secret material is handled.
- Strict isolation of holder private keys within wallet secure enclaves or non-extractable storage.

## Source-of-truth rules

Follow priority: (1) Pramāṇa Specification, (2) IETF CFRG BBS Drafts, (3) `@pramana/crypto/README.md`. Never replace a specified algorithm with an unvetted alternative.
