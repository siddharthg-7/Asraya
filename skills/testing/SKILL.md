---
name: testing-review
description: Evaluates test suite coverage, deterministic behavior, test vector adherence, and negative security testing.
---

# Testing Review Skill

## Purpose

Ensures comprehensive, deterministic, and rigorous testing across all packages, enforcing the presence of negative test vectors, cryptographic boundary checks, and CI conformance.

## When to use

- Reviewing test implementations across `tests/unit`, `tests/integration`, `tests/security`, and `tests/conformance`.
- Checking test coverage metrics before code integration.
- Investigating flaky, non-deterministic, or slow test suites.

## Allowed responsibilities

- Verify that every new feature, validator, or parser is accompanied by thorough unit and integration tests.
- Ensure that negative tests exist for every external boundary (malformed envelopes, expired nonces, invalid signatures).
- Check that test fixtures are sourced from `@pramana/test-fixtures` and clearly labeled as mock/demo.
- Validate that all tests run deterministically without external internet access.

## Forbidden responsibilities

- Introducing tests that rely on external network endpoints or live cloud services.
- Marking failing tests as skipped or disabled without an open issue and ADR justification.
- Writing tests with hardcoded real private keys or production secrets.

## Required checks

1. Do unit tests execute deterministically in under 5 seconds?
2. Are error conditions and edge cases tested with negative vectors?
3. Does every cryptographic operation have a corresponding invalid-signature rejection test?
4. Are test suites organized by the four quadrants (unit, integration, security, conformance)?
5. Do all tests pass locally via `pnpm test`?

## Expected outputs

- Test execution summary and pass/fail matrix across all four quadrants.
- Negative test coverage checklist.
- Determinism and performance report.

## Security constraints

- Test suites must never log sensitive values or attempt real network exfiltration.
- Test keys must never be reused in production deployments.

## Source-of-truth rules

Follow priority: (1) `tests/README.md`, (2) `CONTRIBUTING.md`, (3) Definition of Done in `AGENTS.md`.
