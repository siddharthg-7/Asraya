---
name: protocol-review
description: Enforces protocol canonical definitions, request contract validity, predicate grammar, and serialization formats.
---

# Protocol Review Skill

## Purpose

Guarantees that the Pramāṇa protocol specifications remain unambiguous, canonically defined in `@pramana/protocol`, and strictly observed across all clients, verifiers, and registry services.

## When to use

- Modifying request contracts, predicate grammar, or proof envelope formats.
- Adding or altering protocol error codes, status enums, or serialization logic (CBOR/JSON).
- Verifying cross-component protocol interoperability.

## Allowed responsibilities

- Ensure that `@pramana/protocol` remains the single canonical owner of all protocol types.
- Check that verifier requests strictly bind the required contract fields: `verifier_did`, `purpose`, `predicates`, `nonce`, `expiry`, `context`.
- Validate that protocol error codes are semantic, consistent, and do not leak internal system details.
- Verify deterministic serialization across CBOR and canonical JSON representations.

## Forbidden responsibilities

- Allowing applications (`apps/wallet`, `apps/verifier`) to define their own independent protocol schemas.
- Modifying protocol wire formats without incrementing protocol versions.
- Introducing ambiguous boolean consent fields into request contracts.

## Required checks

1. Is the protocol type defined strictly in `@pramana/protocol`?
2. Are all request fields schema-validated against `@pramana/schemas`?
3. Does the request contract contain an explicit, bounded nonce and expiry timestamp?
4. Are protocol errors handled gracefully without leaking stack traces or unhandled exceptions?
5. Is serialization format deterministic across heterogeneous platforms?

## Expected outputs

- Protocol compatibility matrix and wire-format schema validation report.
- Interoperability test results across serialization engines.
- Protocol changelog diff.

## Security constraints

- Protocol envelopes must protect against replay attacks, forward-tampering, and downgrade attacks.
- Nonce uniqueness must be enforced within the temporal validity window.

## Source-of-truth rules

Follow priority: (1) Pramāṇa Specification, (2) `@pramana/protocol` canonical definitions, (3) `docs/protocol/`. Any divergence is a breaking protocol bug.
