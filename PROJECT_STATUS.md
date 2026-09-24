# Pramāṇa Project Status

## Current Phase: PHASE 5 COMPLETED (CRYPTOGRAPHIC CORE + PROOF SYSTEM)

This document tracks the verified status of all modules, applications, and cryptographic subsystems in the Pramāṇa repository. Per **Anti-Hallucination Rule 2**, no component may be marked complete or in-progress unless verified by concrete code and tests.

---

## Status Matrix

| Component                        | Directory / Package                     | Status            | Notes                                                                            |
| :------------------------------- | :-------------------------------------- | :---------------- | :------------------------------------------------------------------------------- |
| **Workspace Architecture**       | `/`, `frontend/`, `backend/`, `shared/` | **PHASE 5 READY** | Unified monorepo with strict TypeScript, pnpm workspaces, and ESLint.            |
| **Shared Contracts & Schemas**   | `shared/` (`@pramana/shared`)           | **PHASE 5 READY** | Extended with `TIER_HYBRID_BBS_GROTH16`, composite payloads, credential schemas. |
| **Backend Service Skeleton**     | `backend/` (`@pramana/backend`)         | **PHASE 5 READY** | Fastify routes, controllers, services, adapters, in-memory storage.              |
| **Frontend PWA Skeleton**        | `frontend/` (`@pramana/frontend`)       | **PHASE 4 READY** | React + Vite + TypeScript PWA, dark glassmorphism, wallet & verifier views.      |
| **ZK Circuit Directory**         | `circuits/`                             | **PHASE 5 READY** | Circom 2.0 comparator circuit (`numeric_predicate.circom`), R1CS & zKey setup.   |
| **Synthetic Institutional Data** | `backend/src/fixtures/`                 | **PHASE 5 READY** | Synthetic citizen records (Alice, Bob, Carol, Dave) for testing.                 |
| **AI Agent Skills & Directives** | `AGENTS.md`, `skills/`                  | **ACTIVE**        | 11 AI skills and 16 anti-hallucination rules enforced.                           |
| **Testing Infrastructure**       | `vitest.config.ts`, `tests/`            | **OPERATIONAL**   | 184 passing tests across unit, integration, security, and conformance.           |
| **CI/CD Pipeline**               | `.github/workflows/ci.yml`              | **ACTIVE**        | Automated verification of types, lint, tests, format, and build.                 |
| **BBS+ Cryptography**            | `backend/src/crypto/`                   | **PHASE 5 READY** | `@mattrglobal/bbs-signatures` (BLS12-381 G2), real credentials, selective disc.  |
| **Groth16 Fallback Proofs**      | `backend/src/crypto/`, `proofs/`        | **PHASE 5 READY** | SnarkJS BN128 prover and verifier, wtns generator, nonce challenge binding.      |
| **Citizen Wallet Service**       | `backend/src/services/wallet.service`   | **PHASE 5 READY** | In-memory wallet storage, request matching, pseudonyms, composite envelope.      |
| **Cryptographic Verifier**       | `backend/src/services/cryptographic-..` | **PHASE 5 READY** | Multi-check structured verifier (issuer, BBS, Groth16, binding, freshness).      |
| **Production Adapters / DBs**    | `backend/src/adapters/`                 | **PHASE 3 READY** | Legacy SQL, ISO 20022 XML, Municipal REST adapters with canonical bridges.       |
| **Request / Policy / Consent**   | `backend/src/services/`                 | **PHASE 4 READY** | Request contracts, licence policy checks, canonical consent rendering.           |

---

## Known TBD / Unknown Items

1. **Production Hardware Security Modules (HSM)**: Issuer private key signing in production should be backed by Cloud KMS / PKCS#11 rather than in-memory dev keys.
2. **Multi-Party Computation (MPC) Ceremony**: The Groth16 proving/verification keys currently use a local development trusted setup; production requires a formal ceremony.
3. **Phase 6 Ephemeral Transport**: QR chunking, BLE, HPKE encryption, and wire inspectors belong to Phase 6.

---

## Verification Statement

> As of Phase 5 completion, the dual-tier cryptographic core (BBS+ over BLS12-381 G2 and Groth16 zk-SNARK numeric inequality predicates over BN128), citizen wallet presentation generation, unlinkable verifier pseudonyms, context nullifiers, and structured cryptographic verification pipeline are fully operational with 184 deterministic unit, integration, security, and conformance tests passing. Zero fake signatures, zero dummy proofs, and zero secrets are committed to the repository.
