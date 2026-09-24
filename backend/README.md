# Pramāṇa Backend Service & Protocol Engine

> **Engineering Domain**: Person 2 — Backend + Protocol + Cryptography + Proof Systems  
> **Core Paradigm**: "Don't share the data. Share the proof." (Move the question, not the data)  
> **Cryptographic Priority**: **BBS-FIRST** (selective disclosure); **Groth16** fallback for arbitrary numeric predicates.

---

## 1. Role & Architectural Responsibilities

The backend service is the server-side infrastructure for the Pramāṇa protocol. It is responsible for:

- Orchestrating signed **Request Contracts** with verifier purpose, nonces, and bounded predicates.
- Enforcing **Minimal Verifier-Side Storage** (storing session state, audit timestamps, and verdict hashes only — **zero raw citizen PII**).
- Maintaining **Anti-Replay Defense** (single-use nonces) and **Nullifier Scoping** (preventing multi-credential linkage).
- Providing **Trust Registry & Schema Mediation** for institutional issuers and verifiers.
- Ingesting and converting legacy institutional data via **Data Adapters** (SQL, ISO 20022 XML, REST).
- Providing strictly typed, cryptographically honest interfaces for future BBS and Groth16 engines.

---

## 2. Directory Layout & Module Boundaries

```
backend/
├── src/
│   ├── config/          # Environment configuration (AppConfig, ports, host, log level)
│   ├── routes/          # Fastify route declarations (/health, /api/v1/...)
│   ├── controllers/     # Request/response translation and HTTP status mapping
│   ├── services/        # Protocol orchestration (RequestService, VerificationService, RegistryService)
│   ├── domain/          # Core entities (Citizen, Issuer, Verifier, Wallet)
│   ├── protocol/        # Protocol logic (ContractBuilder, PredicateEvaluator)
│   ├── crypto/          # Cryptographic interfaces & unverified guardrails (CryptoService, KeyProvider)
│   ├── proofs/          # Proof orchestration (ProofEngine, BbsEngine, Groth16Engine)
│   ├── registry/        # Trust registry implementation (TrustRegistry)
│   ├── issuers/         # Mock issuer engines for synthetic testing
│   ├── adapters/        # Legacy data source adapters (SQL, ISO 20022 XML, REST)
│   ├── transport/       # Transport interfaces (QR, relay, ephemeral channels)
│   ├── middleware/      # Error handler (RFC 7807 problem details) & rate limiting
│   ├── validation/      # Zod schema input validation boundaries
│   ├── database/        # Storage interfaces & InMemoryVerifierStorage (zero PII storage)
│   ├── utils/           # Structured logger with PII redaction, cryptographic nonce generator
│   └── server.ts        # Fastify application bootstrap and entry point
├── tests/
│   └── server.test.ts   # Integration route tests using Fastify inject
├── package.json
└── README.md
```

---

## 3. API Endpoints for Frontend (Person 1)

All endpoints consume and produce JSON conforming strictly to `@pramana/shared` contracts.

### `GET /health`

- **Purpose**: Liveness probe, uptime, and protocol version check.
- **Response**:
  ```json
  {
    "status": "healthy",
    "protocol": "Pramāṇa",
    "version": "0.1.0",
    "timestamp": 1727184000000
  }
  ```

### `POST /api/v1/requests`

- **Purpose**: Verifier generates a bounded Request Contract with a cryptographically fresh single-use nonce.
- **Request Body**:
  ```json
  {
    "verifierId": "did:pramana:verifier:bank-01",
    "verifierName": "Apex Credit Bank",
    "purpose": "Verify income and residency for credit eligibility",
    "claims": ["income", "domicile"],
    "predicates": [
      { "attribute": "income", "operator": "GTE", "value": 50000 },
      { "attribute": "domicile", "operator": "EQ", "value": "KA" }
    ],
    "context": "loan-application-xyz"
  }
  ```
- **Response**: Complete signed `RequestContract` object with `nonce`, `validFrom`, `validUntil`.

### `POST /api/v1/verifications`

- **Purpose**: Verifier receives and validates proof envelope submitted by citizen wallet.
- **Response (Phase 1)**: Returns explicit `NOT_IMPLEMENTED` (`PRAMANA_0014`) error because cryptographic verification is strictly not faked.

### `GET /api/v1/registry/issuers/:id`

- **Purpose**: Resolves an issuer's DID and public keys from the Trust Registry.

---

## 4. How Person 1 (Frontend Engineer) Consumes the Backend

1. **Import Shared Types & Schemas**:
   ```typescript
   import { RequestContract, ProofEnvelope, PROTOCOL_VERSION } from '@pramana/shared';
   ```
2. **Formulate Verifier Requests**:
   The frontend calls `POST /api/v1/requests` to create standardized, bounded request contracts.
3. **Present Consent to Citizen**:
   The frontend renders the contract using canonical template rendering (HTML-escaped, preventing XSS).
4. **Submit Proof to Verifier**:
   The frontend sends the resulting proof envelope to `POST /api/v1/verifications`.
5. **Display Audit Receipt**:
   The frontend displays the minimal receipt hash and timestamp returned by the backend.

---

## 5. Security & Anti-Hallucination Guardrails

- **Zero Fake Cryptography**: All cryptographic verification methods explicitly throw `PramanaError` with `ERROR_CODES.NOT_IMPLEMENTED`. There are no `return true` or dummy proof strings in production paths.
- **Anti-Replay Mechanism**: Nonces are recorded on issuance and burned on verification. Replayed nonces trigger `NONCE_REPLAY_DETECTED` (`PRAMANA_0006`).
- **Nullifier Isolation**: Scoped nullifiers (`H(holder_secret || context_domain)`) prevent citizen linkage across different verifiers.
- **Minimal Verifier Storage**: `InMemoryVerifierStorage` stores only `sessionId`, `requestId`, `timestamp`, `verdict`, and `receiptHash`. Storing raw citizen PII is impossible by design.

---

## 6. Developer Commands

```bash
# Typecheck
pnpm run typecheck

# Run backend unit & integration tests
pnpm test

# Start development server with live reload (Port 3001)
pnpm run dev

# Build production bundle
pnpm run build

# Start production server
pnpm run start
```
