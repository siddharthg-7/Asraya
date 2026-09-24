---
name: documentation-review
description: Ensures accuracy, synchronization between code and docs, ADR compliance, and anti-hallucination standards.
---

# Documentation Review Skill

## Purpose

Maintains the integrity, accuracy, and truthfulness of all repository documentation, ensuring that docs reflect actual implementation status rather than aspirational or hallucinated claims.

## When to use

- Modifying `README.md`, `ARCHITECTURE.md`, `SECURITY.md`, `THREAT_MODEL.md`, or package READMEs.
- Writing or reviewing Architecture Decision Records (ADRs) in `docs/decisions/`.
- Synchronizing `PROJECT_STATUS.md` with milestone completions.

## Allowed responsibilities

- Verify that documentation claims match what actually exists and is tested in code.
- Ensure that ADRs follow the standard format: Context, Problem, Options Considered, Decision, Consequences, Status.
- Check that architectural diagrams accurately represent component boundaries and data flows.
- Ensure that unknown or unspecified details are explicitly marked as "UNKNOWN / TBD".

## Forbidden responsibilities

- Claiming that a prototype, library, or feature is complete when it is only partially implemented or stubbed.
- Documenting performance figures or latency benchmarks that have not been physically measured.
- Deleting or altering historical ADRs without creating a superseding ADR.

## Required checks

1. Does the documentation state the exact current phase and status accurately?
2. Are all claims of security, standards compliance, or feature support verified against actual code?
3. Are all architectural changes accompanied by an ADR?
4. Are missing or unconfirmed details marked as "UNVERIFIED — DO NOT IMPLEMENT UNTIL CONFIRMED"?
5. Are markdown links and cross-references valid and functional?

## Expected outputs

- Documentation audit report verifying factual consistency with repository code.
- ADR review checklist.
- Identified documentation drift or outdated statements.

## Security constraints

- Documentation must never publish real production secrets, API tokens, or private keys in examples or guides.

## Source-of-truth rules

Follow priority: (1) Pramāṇa Specification, (2) `docs/decisions/` ADRs, (3) `PROJECT_STATUS.md`, (4) `ARCHITECTURE.md`.
