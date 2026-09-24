# Pramāṇa Interoperability & Legacy System Isolation

This document outlines the architectural strategy for integrating legacy data systems into Pramāṇa without contaminating core protocol boundaries with proprietary or non-standard formats.

---

## 1. Architectural Strategy: The Isolation Pipeline

Legacy enterprise systems (core banking platforms, government relational databases, enterprise ERPs) use proprietary schemas, idiosyncratic column names, and vendor-specific data representations.

Pramāṇa enforces strict isolation through a dedicated three-stage pipeline:

```
┌────────────────────────────────────────────────────────┐
│ 1. LEGACY DATA SOURCE                                  │
│ (Raw SQL Rows, ISO 20022 XML, Proprietary JSON APIs)   │
└───────────────────────────┬────────────────────────────┘
                            │ Raw proprietary records
                            ▼
┌────────────────────────────────────────────────────────┐
│ 2. ADAPTER LAYER (@pramana/adapters)                  │
│ • Validates input structure                            │
│ • Sanitizes data types and formats                     │
│ • Maps fields to Canonical Attribute Definitions       │
└───────────────────────────┬────────────────────────────┘
                            │ Canonical Attributes
                            ▼
┌────────────────────────────────────────────────────────┐
│ 3. CANONICAL ATTRIBUTE DEFINITION (@pramana/schemas)   │
│ Normalized, strongly typed, domain-agnostic attributes │
└───────────────────────────┬────────────────────────────┘
                            │ Certified Schema Payload
                            ▼
┌────────────────────────────────────────────────────────┐
│ 4. CREDENTIAL & PROOF LAYER (@pramana/crypto, proofs)  │
│ BBS Multi-Message Signatures & Cryptographic Proofs    │
└────────────────────────────────────────────────────────┘
```

### Architectural Invariant

**Application logic, wallet code, and verification pipelines MUST NEVER depend directly on:**

- Cryptic database column names (e.g. `USR_DOB_DT_V2`, `CUST_ACNT_BAL_AMT`)
- Proprietary bank-specific fields
- Vendor-specific XML schemas or wire protocols

---

## 2. MVP Reference Adapters

The Pramāṇa specification defines three reference adapter implementations for demonstration and MVP testing. These represent concrete integration examples, **not universal standards** for all future enterprise deployments:

### 1. Legacy SQL Database Adapter

- **Input**: Relational database result sets (PostgreSQL, MySQL, SQLite, Oracle).
- **Function**: Executes parameterized queries, normalizes integer and date types, handles null values, and maps table columns to canonical schema keys.
- **Example Mapping**:
  - Source: `SELECT dob_epoch, state_cd, is_active FROM citizen_tbl WHERE id = ?`
  - Canonical Output: `{ birthdate: "2000-01-15", residence_state: "KA", status: "ACTIVE" }`

### 2. ISO 20022 camt.053 Financial XML Adapter

- **Input**: ISO 20022 `camt.053.001.08` Bank-to-Customer Statement XML messages.
- **Function**: Parses financial XML trees safely (with XXE protection), extracts closing balances, accounts, and currencies, and normalizes them into Pramāṇa canonical financial attributes.
- **Example Mapping**:
  - Source XPath: `/Document/BkToCstmrStmt/Stmt/Bal/Amt`
  - Canonical Output: `{ account_balance: 154200.50, currency: "INR" }`

### 3. Institutional REST / JSON Adapter

- **Input**: JSON payloads returned from institutional HTTP endpoints.
- **Function**: Schema-validates external JSON, decrypts transport payloads if required, and transforms nested objects into flat, canonical attribute dictionaries.

---

## 3. Developing New Adapters

All future adapters must implement the canonical `ILegacyAdapter` interface defined in `@pramana/adapters`:

1. Reside exclusively within `packages/adapters/` or `services/adapters/`.
2. Accept untrusted input and validate it before transformation.
3. Emit strictly validated payloads conforming to schemas in `@pramana/schemas`.
4. Include negative unit tests covering malformed records, null values, and type mismatch errors.
