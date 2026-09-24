# PRAMĀṆA

> **Pramāṇa** (Sanskrit: _Pramāṇa_, meaning "valid proof" or "means of accurate knowledge") is a privacy-preserving digital verification protocol designed to eliminate the wholesale collection, transmission, and storage of citizen Personally Identifiable Information (PII).

---

## 1. The Core Problem

Modern digital verification workflows suffer from a fundamental architectural flaw: **Data Ingestion**.

To prove eligibility, verify age, establish income, or confirm residency, citizens are forced to upload raw documents (national IDs, tax returns, bank statements, utility bills). Verifiers ingest, process, OCR, and indefinitely store these documents.

This model results in:

- **Massive Surveillance Honeypots**: Millions of citizen records concentrated in commercial and governmental databases vulnerable to catastrophic breaches.
- **Rampant Over-Disclosure**: Proving that an individual is over 18 years old leaks their exact date of birth, legal name, residential address, and national ID number.
- **Regulatory Non-Compliance**: Chronic exposure to liabilities under GDPR, DPDP, CCPA, and global privacy mandates.

---

## 2. The Core Paradigm: Move the Question, Not the Data

Pramāṇa inverts the traditional model:

```
TRADITIONAL HARVESTING MODEL:
Citizen ──────────[ Uploads Raw PII / Documents ]──────────▶ Verifier
                                                              │
                                                              ▼
                                                    Stores full citizen data

PRAMĀṆA PRIVACY-PRESERVING MODEL:
Verifier ─────────[ Bounded Cryptographic Question ]───────▶ Citizen Wallet
                                                              │
                                                              ▼ (Local Evaluation)
Verifier ◀────────[ Privacy-Preserving Zero-Knowledge Proof ]─┘
   │
   ▼
Minimal Verifier Storage (Verdict & Audit Receipt ONLY — ZERO Raw PII)
```

1. The **Verifier** poses a signed, bounded question (e.g. `age >= 18` or `state == 'KA'`).
2. The **Citizen's Non-Custodial Wallet** evaluates the question locally against certified cryptographic credentials.
3. The wallet generates a mathematical **Proof** (Tier A BBS selective disclosure or Tier B Groth16 zero-knowledge proof).
4. The verifier receives **only the verified answer**, never the citizen's underlying attributes.

---

## 3. Current Project Status

> **PHASE: INITIAL SETUP & ARCHITECTURAL FOUNDATION**  
> _Notice: Application implementation has NOT started. No live wallet, verifier UI, API server, or cryptographic keys are active in this repository._

- **Architecture**: Documented & codified across 4 tiers.
- **Monorepo**: Initialized with pnpm workspaces and strict TypeScript project references.
- **Testing & CI**: Testing quadrants and CI workflows active.
- **AI Agent Directives**: 16 Anti-Hallucination rules and 11 specialized agent skills operational.
- **Application Code**: **NOT STARTED**.
- **Cryptography Implementation**: **NOT STARTED**.
- **Circuits**: **NOT STARTED**.

For detailed component-by-component status, see [PROJECT_STATUS.md](file:///c:/project-self-1/pramana/PROJECT_STATUS.md).

---

## 4. Architecture Overview

Pramāṇa is structured into four distinct architectural tiers:

```
┌─────────────────────────────────────────────────────────────┐
│ TIER 1: Identity & Schema Mediation                        │
│ Trust registry, schema definitions, authorisations, DIDs    │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ TIER 2: Cryptographic Minimization Engine                  │
│ BBS-first selective disclosure, Groth16 fallback, nullifiers│
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ TIER 3: Non-Custodial Consent & Channel Protocol           │
│ Bounded request contracts, template consent, signed receipts│
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ TIER 4: Ephemeral Transport & Verifier Pipeline            │
│ QR/offline channels, replay protection, minimal storage     │
└─────────────────────────────────────────────────────────────┘
```

For full architectural blueprints, see [ARCHITECTURE.md](file:///c:/project-self-1/pramana/ARCHITECTURE.md).

---

## 5. Repository Organization

```
pramana/
├── apps/                 # Application entrypoints
│   ├── wallet/           # Citizen PWA wallet (React / Vite)
│   ├── verifier/         # Verifier pipeline service (Fastify)
│   └── registry/         # Trust registry & schema repository
├── services/             # Background & integration services
│   ├── issuer-mocks/     # Synthetic issuers for testing (DEMO ONLY)
│   └── adapters/         # Microservice hosts for legacy data extraction
├── packages/             # Core TypeScript libraries & modules
│   ├── shared/           # Common utilities, constants, Result monad
│   ├── schemas/          # Canonical schemas and boundary validators
│   ├── protocol/         # Wire types, request contracts, error codes
│   ├── crypto/           # Cryptographic primitives (BBS, BLS12-381)
│   ├── proofs/           # Proof orchestration (Tier A BBS / Tier B Groth16)
│   ├── registry/         # Trust registry client & checkpoint checker
│   ├── transport/        # Ephemeral QR, relay transport, anti-replay
│   ├── consent/          # Bounded consent contracts & receipt generator
│   ├── adapters/         # Legacy data adapters (SQL, ISO 20022, REST)
│   └── test-fixtures/    # Standard synthetic test vectors (DEMO ONLY)
├── circuits/             # Circom zero-knowledge circuit definitions
├── docs/                 # Architecture, security, protocol, and ADR docs
├── skills/               # Reusable AI Agent operational skills
├── tests/                # Unit, integration, security, conformance tests
└── .github/              # Continuous integration workflows
```

---

## 6. How Development Will Proceed

Development adheres strictly to the **Anti-Hallucination Rules** and the **Definition of Done** in [AGENTS.md](file:///c:/project-self-1/pramana/AGENTS.md):

1. **Phase 1 (Complete)**: Project Setup, Engineering Rules, Architecture Documentation, CI Harness.
2. **Phase 2 (Next)**: Core Packages Implementation (`@pramana/shared`, `@pramana/schemas`, `@pramana/protocol`).
3. **Phase 3**: Cryptographic Layer & Proof Orchestration (`@pramana/crypto`, `@pramana/proofs`, `circuits/`).
4. **Phase 4**: Registry & Adapter Layer (`@pramana/registry`, `@pramana/adapters`).
5. **Phase 5**: Application Pipelines (`apps/verifier`, `apps/wallet`, `apps/registry`).
6. **Phase 6**: Conformance Testing, Security Audits, and End-to-End MVP Demonstration.

---

## 7. Developer Quickstart

```bash
# Clone the repository
git clone <repo-url>
cd pramana

# Install workspace dependencies
pnpm install

# Typecheck all packages
pnpm run typecheck

# Lint workspace
pnpm run lint

# Run foundational test suites
pnpm test
```
