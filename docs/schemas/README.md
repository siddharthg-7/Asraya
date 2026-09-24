# Pramāṇa Schema Validation Architecture

## 1. Schema-First Boundary Validation

Pramāṇa enforces a strict **Schema-First Boundary Validation** architecture. All data crossing network, disk, or inter-process boundaries must be validated by canonical schemas defined in `@pramana/schemas`.

### Boundary Principle

Untrusted external data (JSON, CBOR, QR strings) must NEVER be cast directly into internal domain models. It must pass through schema validation, which strips unauthorized fields, validates data types, and yields strongly-typed, validated internal domain objects.

---

## 2. The Five Canonical Schema Boundaries

Pramāṇa defines five essential schema boundaries:

### 1. Verifier Request Contract Validation

- **Schema ID**: `urn:pramana:schema:request-contract:v1`
- **Validation Rules**:
  - Mandatory presence of `verifier_did`, `purpose_code`, `predicates`, `nonce`, `expiry`.
  - Expiry must be within $[T_{\text{now}} - 5s, T_{\text{now}} + 120s]$.
  - Nonce must be at least 256 bits (32 bytes) of hexadecimal entropy.
  - Predicate operators must belong to canonical grammar (`GTE`, `LTE`, `GT`, `LT`, `EQ`, `IN`).

### 2. Registry Record & Checkpoint Validation

- **Schema ID**: `urn:pramana:schema:registry-record:v1`
- **Validation Rules**:
  - Institution DID document format compliance.
  - Public key encodings (BLS12-381 G2 public keys for BBS issuers).
  - Authorized purpose list and permitted predicate definitions.
  - Signed Merkle root structure and cryptographic signatures.

### 3. Credential Format Validation

- **Schema ID**: `urn:pramana:schema:credential:v1`
- **Validation Rules**:
  - Cryptographic signature envelope validity.
  - Presence of holder binding commitment.
  - Attribute key-value conformity against registered Attribute Definitions.
  - Expiration date and issuance timestamp consistency.

### 4. Proof Envelope Validation

- **Schema ID**: `urn:pramana:schema:proof-envelope:v1`
- **Validation Rules**:
  - Proof tier identifier (`TIER_A_BBS` or `TIER_B_GROTH16`).
  - Cryptographic proof payload byte size bounds (preventing buffer exhaustion attacks).
  - Context-scoped nullifier format.
  - Nonce match against active verifier session.

### 5. Consent & Audit Receipt Validation

- **Schema ID**: `urn:pramana:schema:consent-receipt:v1`
- **Validation Rules**:
  - Strict binding to parent `contract_id`.
  - Verified signature of the citizen wallet holder key or verifier key.
  - Strict prohibition of raw citizen attributes in the receipt data structure.

---

## 3. Single Canonical Source of Truth

Schemas are maintained strictly within `packages/schemas`. Applications (`apps/wallet`, `apps/verifier`) and services must NEVER duplicate schema definitions or maintain independent DTO variants.
