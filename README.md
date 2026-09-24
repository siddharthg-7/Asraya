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

> **PHASE: PHASE 1 COMPLETED (FULL-STACK FOUNDATION)**  
> _Notice: Full-stack architectural foundation, boundary schemas, request contracts, backend Fastify skeleton, React PWA views, and testing infrastructure are operational. Cryptographic primitives and Groth16 circuits strictly remain unverified / unimplemented (throwing explicit `NOT_IMPLEMENTED` errors; zero fake crypto)._

- **Architecture**: Documented & codified across 4 tiers.
- **Repository Structure**: Unified monorepo (`frontend/`, `backend/`, `shared/`, `circuits/`, `mock-data/`, `docs/`, `skills/`, `tests/`).
- **Testing & CI**: 25 automated tests passing across 4 quadrants; full CI pipeline active.
- **AI Agent Directives**: 16 Anti-Hallucination rules and 11 specialized agent skills operational.
- **Shared Primitives & Schemas**: Ready (`@pramana/shared`).
- **Backend Service Skeleton**: Ready (`@pramana/backend`).
- **Frontend PWA Skeleton**: Ready (`@pramana/frontend`).
- **Cryptography Implementation**: Unverified / Not Started (Phase 2).
- **ZK Circuits**: Directory initialized; compilation pipeline not started (Phase 3).

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
├── frontend/             # React + Vite + TypeScript PWA (citizen wallet & verifier portal)
├── backend/              # Fastify TypeScript service (verification pipeline, registry, storage)
├── shared/               # Pure TypeScript domain types, Zod schemas, constants, error catalog
├── circuits/             # Circom zero-knowledge circuit definitions & build artifacts
├── mock-data/            # Synthetic credentials, bank statements, and registry fixtures
├── docs/                 # Architecture, security, protocol, and ADR specifications
├── skills/               # Reusable AI Agent operational directives and skills
├── tests/                # Unit, integration, security, and conformance test suites
├── scripts/              # Setup verification and developer utility scripts
└── .github/              # Continuous integration workflows
```

---

## 6. How Development Will Proceed

Development adheres strictly to the **Anti-Hallucination Rules** and the **Definition of Done** in [AGENTS.md](file:///c:/project-self-1/pramana/AGENTS.md):

1. **Phase 1 (Complete)**: Full-Stack Project Setup, Engineering Rules, Architecture Documentation, Unified Workspace, 25 Unit/Security/Conformance Tests.
2. **Phase 2 (Next)**: Cryptography Implementation (`@pramana/crypto` BBS+ selective disclosure, BLS12-381 key derivation, blind signatures).
3. **Phase 3**: Zero-Knowledge Circuit Compilation & Groth16 Fallback Pipeline (`circuits/`, snarkjs proof generation/verification).
4. **Phase 4**: Trust Registry Client, Revocation Accumulators, and Live Adapter Bridges.
5. **Phase 5**: Full Non-Custodial Mobile PWA Wallet & Interactive Verifier Flow with Ephemeral QR Transport.
6. **Phase 6**: Security Audits, Conformance Benchmarking, and Hackathon Demonstration Showcase.

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
