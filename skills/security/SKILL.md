---
name: security-review
description: Evaluates security posture, asset protection, threat model adherence, secret containment, and privacy enforcement.
---

# Security Review Skill

## Purpose

Ensures that all modifications comply with the Pramāṇa Threat Model, maintain zero leakage of citizen credentials, prevent cryptographic downgrade attacks, and enforce non-retention invariants.

## When to use

- Reviewing any code handling keys, credentials, proofs, tokens, or network endpoints.
- Validating logging configurations, error handlers, and audit receipts.
- Before committing any changes touching authentication, authorization, or transport encryption.

## Allowed responsibilities

- Audit codebase for credential leakage, hardcoded keys, or sensitive data in log outputs.
- Verify adherence to the 14 major threat defenses in `THREAT_MODEL.md`.
- Inspect input validation boundaries for untrusted external payloads.
- Enforce replay protection, nonce uniqueness, and expiry verification.

## Forbidden responsibilities

- Approving temporary test secrets or bypass flags for production builds.
- Downgrading security checks to make tests pass.
- Allowing raw citizen attributes to be stored in verifier-side databases or transmitted unencrypted.

## Required checks

1. Are secrets, private keys, or passwords committed to git or exposed in log outputs? (Must be strictly NO).
2. Does verifier code log raw citizen attributes or decrypted credentials? (Must be strictly NO).
3. Is nonce freshness verified within the replay window?
4. Are all external network inputs schema-validated before processing?
5. Are mock components prevented from being executed in production paths?

## Expected outputs

- Security assessment report listing identified vulnerabilities and severity ratings.
- Line-by-line taint analysis for sensitive credential variables.
- Remediation steps for any identified security violation.

## Security constraints

- Zero tolerance for hardcoded private keys or production credentials.
- All network channels must enforce transport encryption and HPKE end-to-end encapsulation where specified.

## Source-of-truth rules

Follow priority: (1) `SECURITY.md`, (2) `THREAT_MODEL.md`, (3) Authoritative Pramāṇa Specification. In case of conflict, enforce the more restrictive security posture.
