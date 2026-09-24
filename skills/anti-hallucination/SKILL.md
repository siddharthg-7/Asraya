---
name: anti-hallucination-review
description: Enforces the 16 mandatory Anti-Hallucination Rules, preventing invented requirements, false claims, and mock crypto in production.
---

# Anti-Hallucination Review Skill

## Purpose

Enforces the 16 Anti-Hallucination Rules across all AI agent interactions and commits, strictly forbidding invented features, ungrounded claims, unverified cryptographic capabilities, or premature declarations of completion.

## When to use

- Mandated for EVERY pull request, task completion, and architectural review.
- Before committing code or submitting final agent responses to users.
- When evaluating whether a feature meets the Definition of Done.

## Allowed responsibilities

- Audit agent actions, commit messages, and documentation against the 16 Anti-Hallucination Rules.
- Verify that features claimed to be complete have passing tests, verified types, and actual implementations.
- Ensure all mock implementations are labeled `MOCK — DEMO ONLY — NOT PRODUCTION CRYPTO`.
- Flag any ungrounded assumptions or invented protocol fields for immediate removal.

## Forbidden responsibilities

- Waiving any of the 16 Anti-Hallucination Rules for speed or convenience.
- Allowing agents to report that an unimplemented component "works" or "is ready".
- Fabricating benchmark figures or claims of standards compliance.

## Required checks

1. Has any requirement been invented that is absent from the authoritative specification? (RULE 1).
2. Are all claimed features present and verified in code? (RULE 2).
3. Is cryptographic security claimed merely because an algorithm is imported? (RULE 3).
4. Has any protocol requirement been replaced with a shortcut without approval? (RULE 4).
5. Are any fake/mock cryptographic implementations in production paths? (RULE 5 & RULE 6).
6. Were any security requirements weakened to make a demo work? (RULE 7).
7. Are any secrets, private keys, or credentials exposed in code or logs? (RULE 8).
8. Are raw citizen attributes logged or persisted in verifier code? (RULE 9 & RULE 10).
9. Have global citizen identifiers been introduced? (Must be NO — RULE 11).
10. Is the storage model accurately described as "minimal verifier-side storage" rather than false "zero storage"? (RULE 12).
11. Are standards compliance or performance claims verified and benchmarked? (RULE 13 & RULE 14).
12. Is unconfirmed behavior explicitly marked "UNVERIFIED — DO NOT IMPLEMENT UNTIL CONFIRMED"? (RULE 16).

## Expected outputs

- Anti-Hallucination compliance certificate with 16-point checklist verification.
- Itemized list of flagged ungrounded claims with required remediations.

## Security constraints

- Strict zero-tolerance for fabricated cryptography, fake proofs, or ungrounded security promises.

## Source-of-truth rules

Follow priority: (1) Pramāṇa Specification, (2) `AGENTS.md` Anti-Hallucination Rules, (3) `PROJECT_STATUS.md`. Never guess when uncertain.
