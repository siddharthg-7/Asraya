# Pramāṇa Architecture Specification

## 1. Executive Summary & Paradigm

**Pramāṇa** (Sanskrit for "valid proof" or "means of accurate knowledge") re-engineers digital identity and verification around a single governing principle:

> **MOVE THE QUESTION, NOT THE DATA.**

### Paradigm Comparison

```
Traditional Identity Architecture (Data Harvesting):
Citizen ──────[ Uploads Raw Documents / PII ]──────▶ Verifier ──────▶ Verifier Computes Decision
                                                                       (Stores full citizen data)

Pramāṇa Architecture (Privacy-Preserving Proof):
Verifier ─────[ Bounded Question / Predicate ]─────▶ Citizen Wallet
                                                            │
                                                            ▼ (Local BBS / ZK Computation)
Verifier ◀────[ Privacy-Preserving Proof Envelope ]─┘
   │
   ▼
Minimal Verifier Storage (Audit Receipt & Verdict ONLY — ZERO Raw PII)
```

---

## 2. The Four Architectural Tiers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ TIER 1: IDENTITY & SCHEMA MEDIATION                                         │
│ • Trust Registry Client & Service       • Schema Repository & Versioning    │
│ • Issuer / Verifier DID Resolution      • Authorization & Purpose Binding   │
│ • Cryptographic Trust Checkpoints       • Canonical Attribute Definitions   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ TIER 2: CRYPTOGRAPHIC MINIMIZATION ENGINE                                   │
│ • Tier A: BBS Selective Disclosure      • Context-Scoped Nullifiers         │
│ • Tier B: Groth16 zk-SNARK Fallback     • Randomized Blinding Operations    │
│ • Holder Binding Proofs                 • Threshold-Bit Predicate Checking  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ TIER 3: NON-CUSTODIAL CONSENT & CHANNEL PROTOCOL                            │
│ • Signed Verifier Request Contracts     • Non-Custodial Authorization       │
│ • Template-Bound Consent Rendering      • Ephemeral Nonce & Expiry Binding  │
│ • Verifiable Consent Receipts           • Purpose & Scope Limitation        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ TIER 4: EPHEMERAL TRANSPORT & VERIFIER PIPELINE                             │
│ • Offline QR / Relay Transport          • Proof Envelope Ingestion          │
│ • Nonce Freshness & Anti-Replay Defense • Double-Claim Nullifier Checking   │
│ • Minimal Verifier Storage Engine       • Cryptographic Audit Receipts      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Tier 1: Identity & Schema Mediation

- **Packages**: `@pramana/registry`, `@pramana/schemas`, `apps/registry`
- **Responsibilities**:
  - Resolves Decentralized Identifiers (DIDs) for institutions (issuers and verifiers).
  - Distributes canonically versioned JSON schemas for credentials and request contracts.
  - Enforces authorization policies: checks whether a verifier is authorized to request a particular predicate.
  - Publishes periodically signed Merkle root trust checkpoints, enabling completely offline verification.

### Tier 2: Cryptographic Minimization Engine

- **Packages**: `@pramana/crypto`, `@pramana/proofs`, `circuits/`
- **Responsibilities**:
  - **Tier A (Default)**: BBS Multi-Message Signatures over BLS12-381. Enables selective disclosure of attributes and integer threshold proofs via bit-commitment without revealing the actual values.
  - **Tier B (Fallback)**: Groth16 zero-knowledge SNARK circuits for non-linear, multi-variable arithmetic predicates.
  - **Holder Binding**: Cryptographically links the proof to a holder-controlled key, ensuring credentials cannot be stolen and replayed by third parties.
  - **Context-Scoped Nullifiers**: Generates unlinkable pseudonyms for duplicate detection within a single campaign without enabling global tracking.

### Tier 3: Non-Custodial Consent & Channel Protocol

- **Packages**: `@pramana/consent`, `@pramana/protocol`, `apps/wallet`
- **Responsibilities**:
  - Ingests signed Verifier Request Contracts containing: `verifier_did`, `purpose`, `predicates`, `expiry`, `nonce`, and `context`.
  - Renders consent prompts from trusted canonical templates to prevent phishing or misleading verifier descriptions.
  - Captures explicit citizen authorization and generates signed consent receipts for dispute resolution and compliance.

### Tier 4: Ephemeral Transport & Verifier Pipeline

- **Packages**: `@pramana/transport`, `apps/verifier`
- **Responsibilities**:
  - Facilitates peer-to-peer payload transmission via chunked offline QR codes, Bluetooth Low Energy (BLE), or encrypted HTTPS relays (HPKE).
  - Enforces the verification pipeline: validates freshness window, burns nonces to prevent replay, verifies cryptographic proofs against registry checkpoints, and checks nullifiers for duplicate claims.
  - Employs the **Minimal Verifier-Side Storage Model**: records only audit verdicts and transaction receipts—strictly never raw citizen attributes.

---

## 3. Core Domain Concepts & Responsibilities

The Pramāṇa domain model consists of 17 core entities:

1. **Issuer**: An authenticated legal or organizational entity authorized to certify citizen attributes by signing credentials under a registered schema.
2. **Verifier**: An entity requesting proof that a citizen meets specific criteria (predicates) for a bounded, declared purpose.
3. **Citizen**: The human subject whose claims are certified. The citizen holds ultimate non-custodial sovereignty over their data.
4. **Wallet**: The non-custodial client application executing on the citizen's device. Manages keys, parses requests, and generates cryptographic proofs.
5. **Attribute Definition**: A canonical, strongly-typed specification of an individual claim (e.g. `age`, `residence_state`, `annual_income`).
6. **Credential**: A cryptographically signed collection of attributes issued to a citizen and bound to the citizen's holder key.
7. **Predicate**: A bounded logical assertion about one or more attributes (e.g. `age >= 18`, `monthly_income >= 25000`) evaluated without revealing the underlying value.
8. **Request Contract**: A signed, tamper-evident document issued by a verifier defining the required predicates, purpose code, nonce, expiry, and context.
9. **Consent**: An explicit, informed, template-bound authorization granted by the citizen to evaluate a specific request contract.
10. **Proof**: A zero-knowledge or selective-disclosure cryptographic artifact demonstrating predicate satisfaction and holder binding.
11. **Nullifier / Pseudonym**: A deterministic yet unlinkable cryptographic tag derived from a credential secret and a context identifier to detect double-spending or duplicate claims.
12. **Registry**: The decentralized or federated repository managing issuer/verifier DIDs, public keys, and schema definitions.
13. **Trust Checkpoint**: A cryptographically signed state digest (e.g. Merkle tree root) published by the registry to support air-gapped verification.
14. **Adapter**: A software bridge that ingests proprietary, legacy data sources (SQL tables, bank XML, REST APIs) and normalizes them into Canonical Attribute Definitions.
15. **Bridge**: The semantic mapping layer connecting external domain concepts to Pramāṇa canonical schemas.
16. **Receipt**: A cryptographically signed audit token issued to the citizen and verifier confirming that a specific proof was verified for a designated purpose at a specific timestamp.
17. **Audit Log**: An append-only, privacy-preserving log maintained by the verifier containing verification verdicts, session hashes, and receipts—devoid of citizen attributes.

---

## 4. Minimal Verifier-Side Storage Model

Pramāṇa rejects the false dichotomy between "storing everything" and "storing nothing":

- **False Claim to Avoid**: Do NOT claim "zero storage." Verifiers require auditability, legal compliance, and double-claim protection.
- **The Pramāṇa Standard**: **Minimal Verifier-Side Storage.**

### Permitted Verifier State:

- `session_id`: Unique ephemeral transaction identifier.
- `verifier_did`: Authenticated verifier identity.
- `purpose_code`: The regulatory purpose associated with the request.
- `timestamp`: Verification execution timestamp.
- `nonce`: Ephemeral challenge (held until expiry window elapses).
- `nullifier_hash`: Context-scoped pseudonym for duplicate detection.
- `verdict`: Boolean outcome (`VERIFIED` or `REJECTED`).
- `audit_receipt_signature`: Cryptographic signature of the receipt.

### Strictly Forbidden Verifier State:

- Raw citizen attributes (name, birthdate, address, income, national ID).
- Plaintext credential payloads.
- Blinding factors or citizen secrets.
- Biometric templates or raw image files.

---

## 5. Monorepo Structure & Package Dependencies

```
apps/
  ├── wallet/        ──▶ React / Vite PWA (Non-custodial citizen wallet)
  ├── verifier/      ──▶ Fastify / Node (Verifier pipeline & minimal storage)
  └── registry/      ──▶ Trust registry & schema distribution server

packages/
  ├── shared/        ──▶ Base types, Result monad, common constants
  ├── schemas/       ──▶ Canonical JSON schemas, external input validators
  ├── protocol/      ──▶ Request contracts, predicate grammar, error codes
  ├── crypto/        ──▶ Cryptographic primitives abstraction (BBS, BLS12-381)
  ├── proofs/        ──▶ Proof generation & verification (Tier A BBS / Tier B Groth16)
  ├── registry/      ──▶ Trust registry client & checkpoint validator
  ├── transport/     ──▶ QR offline chunking, anti-replay, HPKE envelopes
  ├── consent/       ──▶ Bounded consent contracts & receipt generator
  ├── adapters/      ──▶ Legacy SQL, ISO 20022 camt.053, and REST adapters
  └── test-fixtures/ ──▶ Standardized synthetic test vectors (DEMO ONLY)

services/
  ├── issuer-mocks/  ──▶ Synthetic credential issuers for local testing
  └── adapters/      ──▶ Microservice hosts for legacy data ingestion

circuits/            ──▶ Circom zk-SNARK circuits for Tier B predicates
```
