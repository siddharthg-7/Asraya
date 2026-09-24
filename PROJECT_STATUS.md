# Pramāṇa Project Status

## Current Phase: INITIAL SETUP

This document tracks the verified status of all modules, applications, and cryptographic subsystems in the Pramāṇa monorepo. Per **Anti-Hallucination Rule 2**, no component may be marked complete or in-progress unless verified by concrete code and tests.

---

## Status Matrix

| Component                          | Package / Directory                     | Status          | Notes                                                    |
| :--------------------------------- | :-------------------------------------- | :-------------- | :------------------------------------------------------- |
| **Monorepo Structure**             | `/`, `packages/`, `apps/`, `services/`  | **INITIALIZED** | Workspaces configured with strict TypeScript and pnpm.   |
| **Architecture Documentation**     | `ARCHITECTURE.md`, `docs/architecture/` | **DOCUMENTED**  | 4-tier model and domain entities fully specified.        |
| **Security & Threat Model**        | `SECURITY.md`, `THREAT_MODEL.md`        | **DOCUMENTED**  | 14 threats, assets, and invariants codified.             |
| **AI Agent Skills & Directives**   | `AGENTS.md`, `skills/`                  | **ACTIVE**      | 11 AI skills and 16 anti-hallucination rules enforced.   |
| **Testing Infrastructure**         | `vitest.config.ts`, `tests/`            | **INITIALIZED** | 4 test quadrants operational with passing harnesses.     |
| **CI/CD Pipeline**                 | `.github/workflows/ci.yml`              | **INITIALIZED** | Automated verification of types, lint, tests, and build. |
| **Shared Primitives**              | `packages/shared`                       | **NOT STARTED** | Module boundary only.                                    |
| **Schema Validation**              | `packages/schemas`                      | **NOT STARTED** | Module boundary only.                                    |
| **Protocol Definitions**           | `packages/protocol`                     | **NOT STARTED** | Module boundary only.                                    |
| **Cryptography Layer**             | `packages/crypto`                       | **NOT STARTED** | Primitives not implemented.                              |
| **Proof Orchestration**            | `packages/proofs`                       | **NOT STARTED** | BBS & Groth16 engines not implemented.                   |
| **Trust Registry Client**          | `packages/registry`                     | **NOT STARTED** | Client logic not implemented.                            |
| **Transport & Anti-Replay**        | `packages/transport`                    | **NOT STARTED** | Transport channels not implemented.                      |
| **Consent Engine**                 | `packages/consent`                      | **NOT STARTED** | Contract logic not implemented.                          |
| **Legacy Adapters**                | `packages/adapters`                     | **NOT STARTED** | Data source adapters not implemented.                    |
| **Test Fixtures**                  | `packages/test-fixtures`                | **NOT STARTED** | Synthetic test vectors not implemented.                  |
| **Zero-Knowledge Circuits**        | `circuits/`                             | **NOT STARTED** | Circom circuits not compiled/written.                    |
| **Citizen Wallet App**             | `apps/wallet`                           | **NOT STARTED** | UI & wallet services not started.                        |
| **Verifier App & Pipeline**        | `apps/verifier`                         | **NOT STARTED** | Pipeline & Fastify routes not started.                   |
| **Registry Service App**           | `apps/registry`                         | **NOT STARTED** | Registry endpoints not started.                          |
| **Mock Issuer Service**            | `services/issuer-mocks`                 | **NOT STARTED** | Mock issuers not started.                                |
| **Adapter Microservices**          | `services/adapters`                     | **NOT STARTED** | Adapter services not started.                            |
| **End-to-End Integration Testing** | `tests/integration/`                    | **NOT STARTED** | Full protocol flows not tested.                          |

---

## Known TBD / Unknown Items

1. **Target Mobile Secure Enclave API**: Specific WebCrypto vs. hardware Keystore bindings for the PWA wallet remain TBD based on target mobile OS browsers.
2. **Offline Checkpoint Synchronization Mechanism**: Periodic Merkle root publishing cadence and transport format (DNS TXT, static CDN, or QR embedding) TBD.
3. **Groth16 Fallback Trusted Setup Coordinator**: Ceremony infrastructure and Powers of Tau source for Tier B circuits TBD.

---

## Verification Statement

> As of this setup phase, NO application business logic, NO cryptographic keys or algorithms, and NO mock issuers have been implemented. The repository contains strictly architectural blueprints, validation harnesses, AI skills, and typed package boundaries.
