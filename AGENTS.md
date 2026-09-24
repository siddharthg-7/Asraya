# PRAMĀṆA — MASTER AI AGENT OPERATIONAL DIRECTIVE (AGENTS.md)

> **MANDATORY INSTRUCTION FOR ALL AI CODING AGENTS**  
> Every AI agent operating on this repository MUST read, acknowledge, and strictly adhere to this document BEFORE writing, modifying, or deleting any file. Ignorance of these rules is not an acceptable failure mode.

---

## 1. Project Identity & Purpose

- **Project Name**: PRAMĀṆA
- **Protocol Codename**: Pramāṇa (Sanskrit: _Pramāṇa_, meaning "valid proof" or "means of valid knowledge")
- **Core Paradigm**: **MOVE THE QUESTION, NOT THE DATA.**
  - _Traditional Model_: Citizen uploads documents/PII -> Verifier receives data -> Verifier computes decision.
  - _Pramāṇa Model_: Verifier asks a bounded cryptographic question -> Citizen wallet uses trusted claims -> Wallet produces privacy-preserving zero-knowledge / selective-disclosure proof -> Verifier receives ONLY the proof/answer.

---

## 2. Source of Truth & Hierarchy of Authority

When making decisions, resolving ambiguity, or implementing code, AI agents MUST follow this strict priority:

1. **Authoritative Pramāṇa Specification**
2. **Explicit Architecture Decision Records** in `docs/decisions/`
3. **Master Directives** in `AGENTS.md`
4. **Security & Threat Model** in `SECURITY.md` and `THREAT_MODEL.md`
5. **Existing Tested Project Code** (unit, integration, conformance tests)
6. **Official Documentation for Dependencies & RFC Protocols** (IETF CFRG BBS, Circom, W3C DID/VC)
7. **Agent Engineering Judgment**

> [!CAUTION]
> NEVER reverse this order silently. If any conflict arises between requirements or documentation, **STOP IMMEDIATELY**, document the exact conflict, and do NOT make an arbitrary choice.

---

## 3. The 16 Mandatory Anti-Hallucination Rules

These rules are binding on every AI agent:

- **RULE 1**: Never invent a requirement.
- **RULE 2**: Never claim a feature is implemented unless it exists in code and has been verified by tests.
- **RULE 3**: Never claim cryptographic security merely because a cryptographic library is imported.
- **RULE 4**: Never replace a specified protocol with an easier alternative without explicit documented approval and an ADR.
- **RULE 5**: Never use fake cryptographic implementations in production paths.
- **RULE 6**: Mock implementations must be explicitly labeled: `MOCK - DEMO ONLY - NOT PRODUCTION CRYPTO`.
- **RULE 7**: Never silently weaken security requirements to make a demo work.
- **RULE 8**: Never expose secrets, private keys, credentials, test secrets intended to be secret, or sensitive user data in logs or code.
- **RULE 9**: Never log raw citizen attributes in verifier-side code.
- **RULE 10**: Never add unnecessary personal data to the verifier data model.
- **RULE 11**: Do not create global citizen identifiers.
- **RULE 12**: Do not assume that "zero storage" means literally zero storage. Follow the exact storage model defined: **minimal verifier-side storage**.
- **RULE 13**: Do not claim standards compliance unless the implementation has actually been checked against the relevant specification.
- **RULE 14**: Do not claim performance numbers until they have been benchmarked on actual hardware.
- **RULE 15**: Do not claim a cryptographic primitive is secure or production-ready merely because the specification mentions it.
- **RULE 16**: When uncertain, write: `"UNVERIFIED — DO NOT IMPLEMENT UNTIL CONFIRMED"` rather than guessing.

---

## 4. Architectural Boundaries & The Four Tiers

The Pramāṇa architecture is divided into four distinct tiers:

```
┌─────────────────────────────────────────────────────────────┐
│ TIER 1: Identity & Schema Mediation                        │
│ Trust Registry, Institution DIDs, Schemas, Checkpoints     │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ TIER 2: Cryptographic Minimization Engine                  │
│ BBS-First Selective Disclosure, Groth16 Fallback, Nullifiers│
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ TIER 3: Non-Custodial Consent & Channel Protocol           │
│ Bounded Request Contracts, Template Consent, Receipts      │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ TIER 4: Ephemeral Transport & Verifier Pipeline            │
│ QR/Relay Transport, Nonce Replay Defense, Minimal Storage  │
└─────────────────────────────────────────────────────────────┘
```

- **Tier 1 (Packages: `@pramana/registry`, `@pramana/schemas`)**:
  Manages institution identity, trust registry checkpoints, schema definitions, and authorization.
- **Tier 2 (Packages: `@pramana/crypto`, `@pramana/proofs`)**:
  Executes selective disclosure, holder binding, context-scoped nullifiers, and privacy predicates. **BBS-first is mandatory.** Groth16 is fallback only.
- **Tier 3 (Packages: `@pramana/consent`, `@pramana/protocol`)**:
  Enforces signed verifier requests, bounded purpose, nonces, template rendering, and citizen consent receipts.
- **Tier 4 (Packages: `@pramana/transport`, `apps/verifier`)**:
  Handles ephemeral transport (QR/Relay), replay defense, proof verification, decision generation, and minimal verifier audit storage.

---

## 5. Coding & TypeScript Standards

- **Strict TypeScript**: `"strict": true` is enforced across all packages.
- **Prohibited**:
  - `any` or implicit `any`
  - Unsafe type assertions (`as unknown as T`)
  - Duplicated domain types across packages
  - Magic strings for protocol fields, states, or error codes
  - Direct consumption of unvalidated external inputs
- **Validation**: All external data (network payloads, QR codes, disk files) MUST be validated through `@pramana/schemas` at the boundary before passing to core logic.
- **Type Separation**: Untrusted external DTOs must be structurally separated from internal trusted domain types.

---

## 6. Prohibited Shortcuts & Anti-Patterns

1. **No Ad-Hoc Cryptography**: Application code must never import raw curve or pairing primitives directly. All cryptography flows through `@pramana/crypto`.
2. **No Inlined Protocol Definitions**: Apps and services must import all wire types from `@pramana/protocol`.
3. **No Verifier Database Bloat**: The verifier data model must only store the minimal verifiable state required for auditability (session ID, timestamp, verdict, receipt hash). Never store citizen attributes.
4. **No Groth16 Promotion**: Do not replace BBS proofs with Groth16 for standard selective disclosure or bit-range proofs.
5. **No Blind Consent**: Wallets must never render raw HTML/untrusted text supplied by a verifier. Consent must be rendered via canonical registry templates.

---

## 7. Definition of Done (DoD)

A feature or task is NOT complete unless ALL 11 conditions are met:

1. **Code Exists**: Concrete implementation written in the appropriate package.
2. **Types Are Correct**: TypeScript compilation (`pnpm run typecheck` / `tsc -b`) succeeds with zero errors.
3. **Input Validation Exists**: External boundaries validate input using canonical schemas.
4. **Unit Tests Exist**: Deterministic unit tests pass.
5. **Negative Tests Exist**: Malformed, expired, tampered, or fraudulent inputs are tested and rejected.
6. **Security Implications Documented**: Threat analysis performed and documented in code comments and docs.
7. **Architecture Docs Synchronized**: `ARCHITECTURE.md` or package README updated if behavior changed.
8. **No Unsupported Claims**: No claims of compliance, performance, or security without physical benchmarks.
9. **No Secrets Committed**: Clean git status; no API keys, private keys, or `.env` files committed.
10. **CI Commands Pass**: `pnpm run typecheck`, `pnpm run lint`, and `pnpm test` all exit with code 0.
11. **Specification Traceability**: Matches authoritative specification, or deviations are captured in an approved ADR.

---

## 8. Escalation & Conflict Resolution Rules

If an agent encounters:

- An underspecified edge case: Mark as `"UNKNOWN / TBD"` in documentation and prompt the user for clarification.
- A conflicting requirement: Stop immediately, highlight the exact conflicting documents/lines, and request human architectural direction.
- A proposed shortcut: Reject the shortcut unless formalized as an ADR with explicit trade-off justification.
