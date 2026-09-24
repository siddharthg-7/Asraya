# @pramana/shared — Canonical Protocol Contracts & Schemas

> **Status**: LOCKED (Phase 1 Shared Protocol Contract Lock)  
> **Source of Truth**: Pramāṇa Architecture Specification  
> **Hierarchy**: BBS-First with Groth16 Fallback

`@pramana/shared` is the single source of truth for protocol-level contracts, wire formats, boundary validation schemas, and constants shared between the **Frontend (Person 1)** and **Backend (Person 2)**.

---

## 1. Person 1 (Frontend) Integration Guide

### How to Import Shared Contracts

```typescript
import {
  // Protocol Versioning & Constants
  PROTOCOL_NAME,
  PROTOCOL_VERSION,
  ERROR_CODES,
  PramanaError,

  // Domain Contracts
  RequestContract,
  Predicate,
  SinglePredicate,
  PredicateOperator,
  ProofEnvelope,
  VerificationResult,
  VerificationRequest,
  ConsentContract,
  ConsentSummary,
  VerificationReceipt,

  // Runtime Boundary Validators
  validateRequestContract,
  validatePredicate,
  validateSinglePredicate,
  validateProofEnvelope,
  validateVerificationResult,
  validateVerificationReceipt,
} from '@pramana/shared';
```

### Safe for Frontend Consumption

The following contracts and validators are safe and intended for use in the citizen wallet and verifier frontend views:

- `RequestContract`, `validateRequestContract`: Verifier question formulation and wallet contract ingestion.
- `Predicate`, `validatePredicate`: Bounded predicate evaluation (`EQ`, `LT`, `LTE`, `IN<=8`).
- `ConsentContract`, `ConsentSummary`: Non-custodial consent dialog rendering (WHO, WHAT, NOT SHARED).
- `ProofEnvelope`, `validateProofEnvelope`: Wire format for submitting cryptographic zero-knowledge / selective disclosure presentations.
- `VerificationResult`, `validateVerificationResult`: Minimal verifier response (verdict, timestamp, receipt hash; zero raw citizen PII).
- `VerificationReceipt`, `validateVerificationReceipt`: Tamper-evident receipt for citizen history.

### Prohibited Backend Internals (NEVER Import into Frontend)

The frontend MUST NEVER import, replicate, or contain:

- Database interfaces or storage adapters (`backend/src/database/*`).
- Private key providers, verifier private keys, or issuer signing keys (`backend/src/crypto/*`).
- Backend transport listeners or server configuration (`backend/src/config/*`).
- Raw institutional database credentials or legacy connectors (`backend/src/adapters/*`).

---

## 2. Canonical Bounded Predicate Grammar

Pramāṇa enforces a strictly bounded predicate grammar:
$$\text{attr} \quad \{\text{EQ}, \text{LT}, \text{LTE}, \text{IN} \le 8\} \quad \text{constant}$$

Multiple predicates are joined **strictly using logical `AND`**.

### Permitted Operators

| Operator | Type   | Description            | Boundary Invariant                   | Status                   |
| :------- | :----- | :--------------------- | :----------------------------------- | :----------------------- |
| `EQ`     | Scalar | Cryptographic equality | Primitive string, number, or boolean | **LOCKED / IMPLEMENTED** |
| `LT`     | Scalar | Strictly less than     | Finite numeric constant              | **LOCKED / IMPLEMENTED** |
| `LTE`    | Scalar | Less than or equal to  | Finite numeric constant              | **LOCKED / IMPLEMENTED** |
| `IN`     | Set    | Set membership         | Array of 1 to 8 primitive constants  | **LOCKED / IMPLEMENTED** |

### Prohibited / Rejected Expressions

- `NEQ`, `GT`, `GTE`: **REJECTED** at validation boundary per authoritative bounded grammar.
- `OR` / Disjunction: **REJECTED** at validation boundary. Predicates must be joined strictly with `AND`.
- Arbitrary scripts / expressions: **REJECTED** (`expression`, `script`, `eval`).

---

## 3. Contract Catalog

### 1. `RequestContract`

- **Purpose**: Defines the bounded question posed by the verifier to the citizen wallet.
- **Producer**: Verifier backend (`backend/src/services/request.service.ts`).
- **Consumer**: Citizen wallet (`frontend/src/features/consent/`).
- **Required Fields**: `id`, `protocolVersion`, `verifier` (`did`, `name`), `purpose`, `context`, `predicates`, `retention`, `nonce`, `issuedAt`, `expiresAt`.
- **Optional Fields**: `revealRequirements` / `disclose`, `verifierEphemeralKey`, `verifierLicenceProof` / `licence`, `signature`.
- **Validation Rules**: `nonce` >= 32 hex chars; `expiresAt > issuedAt`; disclosures must belong to canonical attributes; predicates must validate against bounded grammar.
- **Security Sensitivity**: Public contract, tamper-evident via verifier signature.
- **Persistence**: Retained temporarily in verifier storage until expiry (max 120s).
- **Status**: **LOCKED / IMPLEMENTED**.

### 2. `Predicate`

- **Purpose**: Mathematical assertion evaluated by the citizen wallet over private attributes.
- **Producer**: Verifier (in `RequestContract`).
- **Consumer**: Citizen wallet & verification pipeline.
- **Required Fields**: `attributeId`, `operator`, `constant`.
- **Validation Rules**: Distinguishes `VALID`, `INVALID OPERATOR`, `INVALID ATTRIBUTE`, `INVALID CONSTANT`, `INVALID STRUCTURE`.
- **Security Sensitivity**: Bounded predicate prevents enumeration attacks and leaks zero raw values.
- **Status**: **LOCKED / IMPLEMENTED**.

### 3. `ConsentContract`

- **Purpose**: Records explicit citizen authorization binding verifier question to template presentation.
- **Producer**: Citizen wallet.
- **Consumer**: Citizen audit history and verifier proof envelope.
- **Required Fields**: `id`, `requestContractId`, `verifierDid`, `purpose`, `predicates`, `context`, `template`, `authorization`, `expiresAt`, `citizenSignature`.
- **Optional Fields**: `summary` (`who`, `what`, `notShared`).
- **Security Sensitivity**: Signed by citizen holder key; non-repudiable consent.
- **Status**: **LOCKED / IMPLEMENTED**.

### 4. `ProofEnvelope`

- **Purpose**: Container for zero-knowledge / selective disclosure proof payload.
- **Producer**: Citizen wallet cryptographic engine.
- **Consumer**: Verifier pipeline (`backend/src/services/verification.service.ts`).
- **Required Fields**: `contractId`, `verifierDid`, `nonce`, `proofTier` (`TIER_A_BBS` or `TIER_B_GROTH16`), `payload`, `nullifier`, `holderBindingSignature`, `createdAt`.
- **Validation Rules**: Strict tier check, single-use nonce matching, holder binding verification.
- **Security Sensitivity**: Contains zero unblinded attributes unless explicitly authorized in disclosures.
- **Status**: **LOCKED (Envelope implemented; Cryptographic verification explicitly throws `NOT_IMPLEMENTED`)**.

### 5. `VerificationResult`

- **Purpose**: Verifier outcome response returned to citizen wallet.
- **Producer**: Verifier pipeline.
- **Consumer**: Citizen wallet UI.
- **Required Fields**: `sessionId`, `contractId`, `verifierDid`, `verdict` (`VERIFIED`, `REJECTED`, `EXPIRED`, `MALFORMED`), `verifiedAt`, `receiptHash`, `nullifierHash`, `signature`.
- **Optional Fields**: `disclosedAttributes` (strictly minimized to requested disclosures).
- **Validation Rules**: Rejects payloads containing prohibited raw citizen PII (`rawCitizenData`, `unblindedAttributes`, `citizenRecord`, etc.).
- **Security Sensitivity**: Minimal audit verdict; zero citizen PII.
- **Status**: **LOCKED / IMPLEMENTED**.

### 6. `VerificationReceipt`

- **Purpose**: Citizen audit receipt confirming proof presentation terms.
- **Producer**: Verifier pipeline upon verdict generation.
- **Consumer**: Citizen wallet audit log and verifier compliance records.
- **Required Fields**: `id`, `contractId`, `verifierDid`, `purpose`, `verdict`, `verifiedAt`, `nullifierHash`, `signature`.
- **Status**: **LOCKED / IMPLEMENTED**.
