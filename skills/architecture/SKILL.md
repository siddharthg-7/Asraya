---
name: architecture-review
description: Validates adherence to the 4-tier Pramāṇa architecture, package boundaries, and core paradigm (Move the Question, Not the Data).
---

# Architecture Review Skill

## Purpose

Enforces the four-tier architectural model of Pramāṇa, ensures clean separation across monorepo boundaries, and prevents structural erosion or unauthorized architectural changes.

## When to use

- Whenever introducing a new module, service, package, or boundary.
- When reviewing cross-package imports or refactoring dependencies.
- Before approving any pull request or task modifying architectural files.

## Allowed responsibilities

- Verify that code conforms to the four tiers:
  - Tier 1: Identity & Schema Mediation
  - Tier 2: Cryptographic Minimization Engine
  - Tier 3: Non-Custodial Consent & Channel Protocol
  - Tier 4: Ephemeral Transport & Verifier Pipeline
- Enforce the core paradigm: "Move the Question, Not the Data".
- Check that package dependencies in `package.json` and `tsconfig.json` are explicit and acyclic.
- Ensure that domain entities reside in canonical packages rather than being duplicated in apps.

## Forbidden responsibilities

- Inventing new architectural tiers or restructuring the monorepo without an approved ADR.
- Allowing verifier code to bypass Tier 2 or Tier 3 to directly query citizen identity databases.
- Modifying cryptographic priorities (e.g. promoting Groth16 over BBS) without architectural consensus.

## Required checks

1. Does the change respect the four-tier separation?
2. Does the flow move the question to the citizen, rather than uploading raw citizen data to the verifier?
3. Are all cross-package imports sourced from explicit workspace dependencies?
4. Are TypeScript project references synchronized with `package.json` dependencies?
5. Has an ADR been recorded if this change alters a previously established architectural decision?

## Expected outputs

- Architecture compliance checklist with Pass/Fail verdict.
- Dependency graph impact analysis.
- Required corrective actions if boundary violations are detected.

## Security constraints

- Strict isolation of verifier storage: no architectural path may persist raw citizen credentials in Tier 4 verifier databases.
- Registry endpoints must remain read-only trust checkpoints for verifiers and wallets.

## Source-of-truth rules

Follow priority: (1) Pramāṇa Specification, (2) `/docs/decisions` ADRs, (3) `AGENTS.md`, (4) `ARCHITECTURE.md`. If a proposed architecture violates the specification, reject it immediately.
