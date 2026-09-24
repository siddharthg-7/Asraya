# Pramāṇa Project Status

## Current Phase: PHASE 1 COMPLETED (FULL-STACK FOUNDATION)

This document tracks the verified status of all modules, applications, and cryptographic subsystems in the Pramāṇa repository. Per **Anti-Hallucination Rule 2**, no component may be marked complete or in-progress unless verified by concrete code and tests.

---

## Status Matrix

| Component                        | Directory / Package                     | Status            | Notes                                                                         |
| :------------------------------- | :-------------------------------------- | :---------------- | :---------------------------------------------------------------------------- |
| **Workspace Architecture**       | `/`, `frontend/`, `backend/`, `shared/` | **PHASE 1 READY** | Unified monorepo with strict TypeScript, pnpm workspaces, and ESLint.         |
| **Shared Contracts & Schemas**   | `shared/` (`@pramana/shared`)           | **PHASE 1 READY** | Domain types, constants, Result monad, and boundary schemas (Zod).            |
| **Backend Service Skeleton**     | `backend/` (`@pramana/backend`)         | **PHASE 1 READY** | Fastify routes, controllers, services, adapters, in-memory storage.           |
| **Frontend PWA Skeleton**        | `frontend/` (`@pramana/frontend`)       | **PHASE 1 READY** | React + Vite + TypeScript PWA, dark glassmorphism, wallet & verifier views.   |
| **ZK Circuit Directory**         | `circuits/`                             | **INITIALIZED**   | Directory layout and compile/setup guardrails documented.                     |
| **Mock Issuer & Citizen Data**   | `mock-data/`                            | **INITIALIZED**   | Synthetic test data with `MOCK - DEMO ONLY - NOT PRODUCTION DATA` labels.     |
| **AI Agent Skills & Directives** | `AGENTS.md`, `skills/`                  | **ACTIVE**        | 11 AI skills and 16 anti-hallucination rules enforced.                        |
| **Testing Infrastructure**       | `vitest.config.ts`, `tests/`            | **OPERATIONAL**   | 25 passing tests across unit, integration, security, and conformance.         |
| **CI/CD Pipeline**               | `.github/workflows/ci.yml`              | **ACTIVE**        | Automated verification of types, lint, tests, format, and build.              |
| **BBS+ Cryptography**            | `backend/src/crypto/`                   | **NOT STARTED**   | Cryptographic engine unverified; throws `NOT_IMPLEMENTED` (zero fake crypto). |
| **Groth16 Fallback Proofs**      | `backend/src/proofs/`                   | **NOT STARTED**   | Circuit and proof verifier unverified; throws `NOT_IMPLEMENTED`.              |
| **Production Adapters / DBs**    | `backend/src/adapters/`                 | **STUB / MOCK**   | Legacy SQL, ISO 20022 XML, Municipal REST adapters use sample/mock feeds.     |
| **Full Production Wallet**       | `frontend/src/`                         | **FOUNDATION**    | Key generation, proof generation, secure enclave storage planned Phase 2+.    |
| **Full Verifier Dashboard**      | `frontend/src/`                         | **FOUNDATION**    | Interactive QR verification flow and relay subscription planned Phase 2+.     |

---

## Known TBD / Unknown Items

1. **Target Mobile Secure Enclave API**: Specific WebCrypto vs. hardware Keystore bindings for the PWA wallet remain TBD based on target mobile OS browsers.
2. **Offline Checkpoint Synchronization Mechanism**: Periodic Merkle root publishing cadence and transport format (DNS TXT, static CDN, or QR embedding) TBD.
3. **Groth16 Fallback Trusted Setup Coordinator**: Ceremony infrastructure and Powers of Tau source for Tier B circuits TBD.
4. **BBS Implementation Bindings**: Selection and benchmark validation of CFRG BBS-compliant pairing library (@mattrglobal/node-bbs-signatures vs. noble-curves).

---

## Verification Statement

> As of Phase 1 completion, the structural foundation, boundary validation schemas, request contracts, minimal verifier storage architecture, React frontend views, Fastify backend routes, and 25 unit/integration/security/conformance tests are fully operational and passing. Cryptographic primitives and Groth16 circuits strictly remain unverified / unimplemented with no fake bypasses or mock secrets.
