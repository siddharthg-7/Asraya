# ADR-0004: Minimal Verifier-Side Storage Model

## Status

ACCEPTED

## Context

Privacy advocacy often uses the marketing slogan "zero storage". However, real-world verifiers (financial institutions, government agencies, regulated enterprises) are legally required to maintain audit records of compliance decisions, prevent replay attacks, and detect duplicate claims.

## Problem

Claiming "zero storage" leads to false security promises and unworkable implementations where systems either secretly store data anyway or fail basic regulatory compliance and double-spend protection.

## Options Considered

1. **Full Storage (Status Quo)**: Retain copy of all user data and credentials.
   - _Cons_: Total violation of privacy and data minimization.
2. **Literal "Zero Storage"**: Retain absolutely nothing; erase server memory after verification.
   - _Cons_: Cannot prove compliance to regulators, cannot detect duplicate claims, cannot defend against replay attacks.
3. **Minimal Verifier-Side Storage Model**: Explicitly define and restrict verifier storage strictly to non-identifying audit artifacts (session ID, timestamp, verdict boolean, receipt hash, context-scoped nullifier).
   - _Pros_: Compliant with regulatory auditability, enforces double-claim protection, eliminates citizen attribute honeypots.

## Decision

Adopt the **Minimal Verifier-Side Storage Model**. The terminology "zero storage" is deprecated and prohibited in architectural specifications in favor of "minimal verifier-side storage".

### Storage Invariant

Verifiers are permitted to persist:

- `session_id`
- `timestamp`
- `purpose_code`
- `verdict` (`VERIFIED` / `REJECTED`)
- `nullifier_hash`
- `receipt_signature`

Verifiers are strictly forbidden from persisting:

- Raw citizen attributes (name, national ID, income, address)
- Plaintext credentials or decrypted proof inputs

## Consequences

- **Positive**: Honest, verifiable security posture that satisfies enterprise compliance while completely safeguarding citizen PII.
- **Negative / Trade-offs**: Nullifier storage must be indexed and garbage-collected according to defined campaign retention policies.

## Source / Reference

- Authoritative Pramāṇa Specification, Data Minimization Rule (Section 17).
