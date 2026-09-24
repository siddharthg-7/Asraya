# Pramāṇa Trust Registry & Institution Trust Layer (Tier 1)

> **Phase 2 Technical Architecture & Protocol Specification**  
> **Status:** IMPLEMENTED (In-Memory Reference Implementation)  
> **Owner:** Person 2 (Backend / Protocol / Trust Infrastructure)  
> **Authority:** Pramāṇa Architecture Specification, AGENTS.md, ADR-0004

---

## 1. Registry Purpose

The Pramāṇa Trust Registry serves as the canonical Tier 1 directory for ecosystem trust anchors, regulatory licenses, verifiable schema definitions, adapter declarations, and non-custodial consent templates.

Its core operational responsibilities are:

- Answering **"Who is trusted?"** (Public keys and signing endpoints for credential issuers).
- Answering **"Which verifiers are licensed?"** (Regulatory purpose boundaries and permitted predicates).
- Answering **"What attributes exist?"** (Semantic definitions of canonical data elements).
- Answering **"Which bridges and adapters exist?"** (Transformation metadata for legacy databases).
- Answering **"Which consent template applies?"** (Structured WHO, WHAT, NOT SHARED prompt bundles).

```
┌─────────────────────────────────────────────────────────────┐
│                 Pramāṇa Trust Registry                      │
│                                                             │
│  [Issuer Keys]      [Verifier Licences]    [Attribute Defs] │
│  [Bridge Mappings]  [Adapter Manifests]    [Templates]      │
└──────────────────────────────┬──────────────────────────────┘
                               │ State Checkpoint (Merkle Root)
             ┌─────────────────┴─────────────────┐
             ▼                                   ▼
   Citizen Wallet (Client)              Verifier Service
   - Resolves consent templates         - Verifies verifier licence
   - Resolves issuer public keys        - Resolves canonical attributes
   - Offline checkpoint audit           - Validates bounded requests
```

---

## 2. Invariant: The Registry MUST NOT Contain Citizen Data

In accordance with Rule 8, 9, 10, and 12 in `AGENTS.md` and `data-minimization.md`:

> [!CAUTION]
> The Trust Registry is strictly prohibited from storing or processing citizen data, personal records, identity claims, transaction amounts, or raw documents.
>
> **ATTRIBUTE DEFINITION $\neq$ CITIZEN ATTRIBUTE VALUE**
>
> - Defining `urn:pramana:attr:fin:annual_income` (metadata: "Annual Gross Income in INR") is **PERMITTED**.
> - Persisting `income: 75000` or `fullName: "Jane Doe"` is **FORBIDDEN** and rejected by boundary schemas.

The registry rejects any record containing private key material (`privateKey`, `d`, `secretKey`, PEM blocks) or citizen PII keys (`income`, `bankStatement`, `aadhaar`, `pan`, `phoneNumber`, `address`, `fullName`, `passport`, `salary`, `ssn`).

---

## 3. Registry Record Types

The Trust Registry defines six foundational record types and state checkpoints:

### 1. `IssuerKey` (IMPLEMENTED)

- **Purpose**: Authenticates institutional issuers and publishes public keys used for signing credentials.
- **Fields**:
  - `did`: Unique decentralized identifier (e.g. `did:pramana:issuer:gov-civil-dept`).
  - `legalName`: Registered institutional legal entity name.
  - `authorizedSchemas`: Array of schema URNs this issuer is authorized to attest.
  - `publicKeys`:
    - `bbsG2PublicKey`: BLS12-381 G2 public key point (Hex/Base64).
    - `keyId` (optional): Key identifier.
    - `revocationEndpoint` (optional): HTTP endpoint for accumulator/revocation status.
  - `validUntil` (optional): Expiration date (ISO 8601 UTC).
  - `status`: `'ACTIVE' | 'SUSPENDED' | 'REVOKED'`.
  - `active`: Boolean flag indicating current signing validity.
- **Security Rule**: Private signing keys must never be submitted or stored.

### 2. `VerifierLicence` (IMPLEMENTED)

- **Purpose**: Authorizes verifiers to query citizens under specific regulatory purposes.
- **Fields**:
  - `did`: Unique verifier identifier (e.g. `did:pramana:verifier:venue-access-01`).
  - `legalName`: Registered legal name of verifier organization.
  - `permittedPurposes`: Array of authorized purpose codes (e.g. `['PURPOSE_AGE_VERIFICATION']`).
  - `permittedPredicates`: Array of canonical attribute URNs this verifier may query.
  - `permittedAttributes` (optional): Selective disclosure attributes allowed.
  - `maxRetentionPolicy`: Permitted retention limit (e.g. `AUDIT_RECEIPT_ONLY_ZERO_PII`).
  - `validUntil`: Expiration date (ISO 8601 UTC).
  - `status`: `'ACTIVE' | 'SUSPENDED' | 'REVOKED'`.

### 3. `AttributeDef` (IMPLEMENTED)

- **Purpose**: Canonical attribute registry standardizing semantic verifiable fields across the ecosystem.
- **Fields**:
  - `id`: Canonical URN (e.g. `urn:pramana:attr:fin:trailing_12m_earnings`).
  - `name`: Human-readable identifier (e.g. `trailing_12m_earnings`).
  - `category`: `'civil' | 'financial' | 'transport' | 'educational' | 'custom'`.
  - `dataType`: `'string' | 'number' | 'boolean' | 'date'`.
  - `description`: Formal semantic description of the attribute.
  - `schemaId`: Reference to parent schema URN.
  - `allowedValues` (optional): Constrained enumeration array.
  - `unit` (optional): Measurement or currency unit (e.g. `INR`, `years`).
  - `version` (optional): Semantic version string (`1.0.0`).

### 4. `Bridge` (IMPLEMENTED)

- **Purpose**: Metadata describing the deterministic mapping between legacy enterprise source fields and canonical attributes.
- **Fields**:
  - `bridgeId`: Unique bridge identifier (e.g. `bridge:bank:camt053-to-trailing12m`).
  - `name` (optional): Descriptive label.
  - `sourceSystem`: Legacy system descriptor (e.g. `CORE_BANKING_ISO20022`).
  - `sourceField`: Legacy path or XML element (e.g. `BkToCstmrStmt.Stmt.Bal.Amt`).
  - `canonicalAttributeId`: Target canonical attribute URN (`urn:pramana:attr:fin:trailing_12m_earnings`).
  - `transformRule`: Deterministic transformation descriptor (`AGGREGATE_SUM_CREDITS_365D`).
  - `version` (optional): Version identifier.
- **Security Rule**: Bridge definitions contain only field names and rules—never real citizen data values.

### 5. `AdapterManifest` (IMPLEMENTED)

- **Purpose**: Metadata describing an adapter service capable of translating legacy records into canonical attributes.
- **Fields**:
  - `adapterId`: Unique identifier (e.g. `adapter:banking:iso20022-camt053`).
  - `name` (optional): Descriptive name.
  - `sourceFormat`: `'SQL_RELATIONAL' | 'ISO20022_CAMT053' | 'REST_JSON' | string`.
  - `targetSchemaId`: Output schema URN.
  - `supportedAttributes`: Array of canonical attribute URNs provided.
  - `version`: Version string.
  - `status`: `'ACTIVE' | 'EXPERIMENTAL' | 'DEPRECATED'`.

### 6. `TemplateBundle` (IMPLEMENTED)

- **Purpose**: Structured consent template metadata ensuring citizens receive authentic prompts rendered from canonical registry data.
- **Fields**:
  - `templateId`: Unique template identifier (e.g. `tmpl:consent:age-verify-v1`).
  - `purposeCode`: Target regulatory purpose (e.g. `PURPOSE_AGE_VERIFICATION`).
  - `locale`: BCP 47 language tag (e.g. `en-US`).
  - `templateText`: Prompt template text with parameter bindings.
  - `parameterBindings`: Variable names interpolated by wallet (e.g. `['verifier_name']`).
  - `version`: Template version.
  - `who`: Structured verifier metadata (`{ role, legalEntity }`).
  - `what`: Requested claims (`{ requestedAttributes, predicates }`).
  - `notShared`: Explicit array of sensitive data points NOT revealed to the verifier.

### 7. `TrustCheckpoint` (IMPLEMENTED / VERIFICATION DEFERRED)

- **Purpose**: Merkle root digest of registry state published at regular epochs for offline cryptographic verification.
- **Fields**:
  - `epoch`: Monotonically increasing non-negative integer.
  - `merkleRoot`: 32+ character hex digest representing registry state.
  - `publishedAt`: ISO 8601 UTC timestamp.
  - `signature`: Root checkpoint authority signature.
  - `checkpointAuthority`: DID of root registry authority (`did:pramana:authority:root`).
- **Cryptographic Verification**: Marked `NOT IMPLEMENTED` (deferred to Phase 5). Does NOT fake signatures.

---

## 4. End-to-End Validation Gate Flow

When a verifier attempts to create or evaluate a RequestContract, the backend routes the request through the Trust Registry validation gate:

```
Verifier Request Payload
          │
          ▼
1. Verifier Licence Lookup
   - Does verifier DID exist in registry?
   - Is licence status ACTIVE?
   - Is licence unexpired (validUntil > now)?
   - Is the requested purpose in permittedPurposes?
          │ [Failed -> 403 LICENCE_INVALID]
          ▼
2. Canonical Attribute Lookup
   - For every predicate: Is attributeId registered?
   - For every disclosure: Is attributeId registered?
   - Is attribute permitted by verifier licence?
          │ [Failed -> 400 ATTRIBUTE_NOT_SUPPORTED / 403 LICENCE_INVALID]
          ▼
3. Predicate Bounded Grammar Validation
   - Operator in {EQ, LT, LTE, IN<=8}?
   - Constant matches data type?
   - No OR disjunctions or code injection?
          │ [Failed -> 400 INVALID_PREDICATE]
          ▼
4. Contract Formulated & Nonce Registered
   - Emits signed RequestContract (HTTP 201)
```

---

## 5. Trust Registry HTTP API

All endpoints are versioned under `/api/v1/registry`:

| Method | Endpoint                                  | Description                                                                       |
| :----- | :---------------------------------------- | :-------------------------------------------------------------------------------- |
| `GET`  | `/api/v1/registry/checkpoint`             | Returns the latest state checkpoint (epoch, Merkle root, timestamp).              |
| `POST` | `/api/v1/registry/checkpoint/verify`      | Returns HTTP 501 (`NOT_IMPLEMENTED`) until cryptographic verification in Phase 5. |
| `GET`  | `/api/v1/registry/issuers/:did`           | Resolves public key and schema authorizations for an issuer.                      |
| `GET`  | `/api/v1/registry/verifiers/:did`         | Resolves licence, status, permitted purposes, and attributes for a verifier.      |
| `GET`  | `/api/v1/registry/attributes`             | Lists all canonical attributes (optional filter: `?category=civil`).              |
| `GET`  | `/api/v1/registry/attributes/:id`         | Resolves definition for a specific canonical attribute URN or alias.              |
| `GET`  | `/api/v1/registry/bridges/:id`            | Resolves bridge metadata mapping legacy fields to canonical attributes.           |
| `GET`  | `/api/v1/registry/adapters/:id`           | Resolves adapter manifest for legacy enterprise connectors.                       |
| `GET`  | `/api/v1/registry/templates/:purposeCode` | Resolves consent template bundle (optional: `?locale=en-US`).                     |
| `POST` | `/api/v1/registry/validate-request`       | Validates a RequestContract against licence and registered attributes.            |

---

## 6. Person 1 (Frontend) Integration Guide

Person 1 can consume registry metadata directly via `@pramana/shared` types and HTTP endpoints:

### Safe Imports from `@pramana/shared`

```typescript
import {
  IssuerKey,
  VerifierLicence,
  AttributeDefinition,
  AttributeCategory,
  BridgeDefinition,
  AdapterManifest,
  TemplateBundle,
  TrustCheckpoint,
  CANONICAL_ATTRIBUTES,
  validateTemplateBundle,
} from '@pramana/shared';
```

### Fetching Consent Templates for Consent UI

```typescript
// Fetch trusted template for citizen consent prompt
async function fetchConsentTemplate(
  purposeCode: string,
  locale: string = 'en-US',
): Promise<TemplateBundle> {
  const response = await fetch(
    `/api/v1/registry/templates/${encodeURIComponent(purposeCode)}?locale=${locale}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to load consent template for ${purposeCode}`);
  }
  const data = await response.json();
  return validateTemplateBundle(data);
}
```

### Inspecting Verifier Licences in Wire Inspector

```typescript
async function fetchVerifierLicence(verifierDid: string): Promise<VerifierLicence> {
  const response = await fetch(`/api/v1/registry/verifiers/${encodeURIComponent(verifierDid)}`);
  if (!response.ok) {
    throw new Error(`Verifier licence not found for ${verifierDid}`);
  }
  return response.json();
}
```

---

## 7. Current Implementation Status & TBD Items

| Component                         | Status                  | Details                                                                                    |
| :-------------------------------- | :---------------------- | :----------------------------------------------------------------------------------------- |
| In-Memory Registry Engine         | **IMPLEMENTED**         | Deterministic in-memory storage with comprehensive seed data.                              |
| IssuerKey Lookup & Validation     | **IMPLEMENTED**         | Resolves public keys; rejects private key material.                                        |
| VerifierLicence Lookup & Gates    | **IMPLEMENTED**         | Rejects expired, suspended, or unpermitted requests.                                       |
| AttributeDef Registry             | **IMPLEMENTED**         | Full canonical dictionary (`age`, `trailing_12m_earnings`, `commercial_permit_status`).    |
| Bridge & Adapter Metadata         | **IMPLEMENTED**         | Field-mapping rules and format declarations.                                               |
| TemplateBundle Lookup             | **IMPLEMENTED**         | Consent metadata with structured WHO, WHAT, NOT SHARED.                                    |
| Checkpoint Generation             | **IMPLEMENTED**         | Epoch counter and Merkle root calculation.                                                 |
| Checkpoint Signature Verification | **NOT IMPLEMENTED**     | Deferred to Phase 5 (Cryptography Integration). Throws `NOT_IMPLEMENTED`.                  |
| Decentralized DID Method          | **TBD / NOT SPECIFIED** | MVP uses standard identifier strings (`did:pramana:...`). Complex DID resolution deferred. |
| Persistent DB Storage             | **TBD / NOT SPECIFIED** | Kept in-memory behind `ITrustRegistry` interface for MVP simplicity.                       |
