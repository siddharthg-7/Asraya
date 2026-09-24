# Pramāṇa Schema Mediation & Data Minimization (Tier 1 & Tier 2 Boundary)

> **Phase 3 Technical Architecture & Protocol Specification**  
> **Status:** IMPLEMENTED (Reference Source Adapters & Mock Issuer Claim Service)  
> **Owner:** Person 2 (Backend / Protocol / Trust Infrastructure)  
> **Authority:** Pramāṇa Architecture Specification, AGENTS.md, ADR-0004, ADR-0006

---

## Executive Summary

Phase 3 implements the **SOURCE $\to$ ADAPTER $\to$ CANONICAL ATTRIBUTE $\to$ ISSUER CLAIM SERVICE $\to$ MINIMAL CLAIM SET** mediation pipeline.

Its primary purpose is to prove **data interoperability**: heterogeneous institutional data systems (legacy transport relational SQL, banking ISO 20022 CAMT.053 statements, and municipal civil REST services) speak a single canonical attribute language without exposing source-specific schemas, SQL columns, XML paths, or REST payload structures to the verifier.

```
Institutional Source Systems
┌──────────────────────────┐    ┌──────────────────────────┐    ┌──────────────────────────┐
│ Legacy Transport SQL     │    │ Core Bank ISO 20022      │    │ Municipal Civil Registry │
│ (RTO_PERMITS_SQL)        │    │ (BkToCstmrStmt XML)      │    │ (REST/JSON Payload)      │
└────────────┬─────────────┘    └────────────┬─────────────┘    └────────────┬─────────────┘
             │                               │                               │
             ▼                               ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────┐    ┌──────────────────────────┐
│ TransportSqlAdapter      │    │ Camt053BankAdapter       │    │ MunicipalRestAdapter     │
│ (adapter:transport:      │    │ (adapter:banking:        │    │ (adapter:civil:          │
│  rto-sql)                │    │  iso20022-camt053)       │    │  rest-json)              │
└────────────┬─────────────┘    └────────────┬─────────────┘    └────────────┬─────────────┘
             │                               │                               │
             └───────────────────────┬───────────────────────────────────────┘
                                     ▼
                    Canonical Attributes / Values
                    (e.g., urn:pramana:attr:permit:status)
                                     │
                                     ▼
                        Mock Issuer Claim Service
                        (did:pramana:issuer:*)
                                     │
                                     ▼
                             Minimal Claim Set
                        (isMockUnsigned: true)
                                     │
                                     ▼
                        Verifier Policy Engine
                        (Zero Source Schema Knowledge)
```

---

## 1. Source Systems

The Phase 3 reference architecture models three distinct institutional source archetypes:

| Source System                           | Domain                | Representation                  | Underlying Protocol / Format                 |
| --------------------------------------- | --------------------- | ------------------------------- | -------------------------------------------- |
| `RTO_PERMITS_SQL`                       | Transport Licensing   | Relational Table Row            | SQL / Relational Table (`transport_permits`) |
| `CORE_BANKING_ISO20022`                 | Financial Institution | XML Statement Document / Object | ISO 20022 CAMT.053 (`BkToCstmrStmt`)         |
| `CIVIL_DATABASE_SQL` / `MUNICIPAL_REST` | Civil Registration    | REST API JSON Payload           | HTTP / JSON Civil Registration Payload       |

_Status: MOCK (In-Memory Synthetic Source Simulation)_

---

## 2. Source Interfaces

Each source system is represented by a TypeScript interface that faithfully mirrors the native format of that system rather than the Pramāṇa canonical protocol:

### 2.1 `TransportSqlPermitRow` (IMPLEMENTED)

```typescript
export interface TransportSqlPermitRow {
  readonly PERMIT_ID: string;
  readonly HOLDER_SYNTH_ID: string;
  readonly STATUS_CD: 'ACTV' | 'EXPR' | 'SUSP' | 'PEND';
  readonly CLASS_CD: 'COMM_HEAVY' | 'COMM_LIGHT' | 'PVT_LMV';
  readonly ISSUE_DT: string;
  readonly EXPIRY_DT: string;
  readonly DISTRICT_NAME: string;
  readonly STATE_CODE: string;
  readonly RAW_VEHICLE_REG_NO?: string; // Sensitive source field (Stripped)
  readonly INSPECTION_OFFICER_ID?: string; // Internal audit field (Stripped)
}
```

### 2.2 `Camt053StatementSource` (IMPLEMENTED)

```typescript
export interface Camt053StatementSource {
  readonly statementId: string;
  readonly holderSynthId: string;
  readonly accountIban: string; // Sensitive source field (Stripped)
  readonly closingBalanceAmount: number;
  readonly currency: string;
  readonly creditDebitIndicator: 'CRDT' | 'DBIT';
  readonly trailing12mCreditSum: number;
  readonly rawTransactionsCount?: number; // Internal bank field (Stripped)
  readonly branchRoutingCode?: string; // Internal bank field (Stripped)
  readonly statementXml?: string; // Optional raw ISO 20022 XML string
}
```

### 2.3 `MunicipalRestCitizenPayload` (IMPLEMENTED)

```typescript
export interface MunicipalRestCitizenPayload {
  readonly registration_id: string;
  readonly citizen_synth_id: string;
  readonly date_of_birth: string; // 'YYYY-MM-DD'
  readonly state_code: string;
  readonly district_name: string;
  readonly nationality_code: string;
  readonly residential_address?: string; // Sensitive source field (Stripped)
  readonly municipal_ward_id?: number; // Internal municipal field (Stripped)
  readonly active_status: boolean;
}
```

---

## 3. Adapter Architecture

All adapters implement the generic `ISourceAdapter<TInput>` interface:

```typescript
export interface ISourceAdapter<TInput = unknown> {
  readonly adapterId: string;
  readonly sourceFormat: string;
  readonly targetSchemaId: string;
  readonly supportedAttributes: readonly string[];
  adapt(sourceRecord: TInput): Promise<CanonicalAttributeValue[]>;
  adaptToClaims(sourceRecord: TInput): Promise<Record<string, string | number | boolean>>;
}
```

### 3.1 `TransportSqlAdapter` (IMPLEMENTED)

- **ID:** `adapter:transport:rto-sql`
- **Bridge:** `bridge:rto:sql-to-permit`
- **Target Schema:** `urn:pramana:schema:trans:permit:v1`
- **Supported Attributes:**
  - `urn:pramana:attr:permit:status`
  - `urn:pramana:attr:trans:license_category`
  - `urn:pramana:attr:civil:district`
  - `urn:pramana:attr:civil:domicile_state`

### 3.2 `Camt053BankAdapter` (IMPLEMENTED)

- **ID:** `adapter:banking:iso20022-camt053`
- **Bridge:** `bridge:bank:camt053-to-trailing12m`
- **Target Schema:** `urn:pramana:schema:fin:earnings:v1`
- **Supported Attributes:**
  - `urn:pramana:attr:fin:trailing_12m_earnings`
  - `urn:pramana:attr:fin:account_balance`
  - `urn:pramana:attr:fin:currency`

### 3.3 `MunicipalRestAdapter` (IMPLEMENTED)

- **ID:** `adapter:civil:rest-json`
- **Bridge:** `bridge:civil:sql-to-age`
- **Target Schema:** `urn:pramana:schema:civil:identity:v1`
- **Supported Attributes:**
  - `urn:pramana:attr:civil:age`
  - `urn:pramana:attr:civil:birthdate`
  - `urn:pramana:attr:civil:domicile_state`
  - `urn:pramana:attr:civil:district`
  - `urn:pramana:attr:civil:citizenship`

---

## 4. Bridge Resolution

Adapters do not invent mappings out-of-band; transformation routing is grounded dynamically via the Tier 1 **Trust Registry**:

```
Requested Attribute URN
          │
          ▼
Trust Registry: getAttributeDefinition(attributeId)
          │
          ▼
Trust Registry: getAdaptersForAttribute(canonicalId)
          │
          ▼
Trust Registry: getBridgesForAttribute(canonicalId)
          │
          ▼
AdapterResolver: resolveForAttribute(attributeId, preferredAdapterId?)
          │
          ▼
Adapter.adapt(sourceRecord)
```

If an attribute has no registered `AdapterManifest` or `BridgeDefinition` in the Trust Registry, resolution halts with `ATTRIBUTE_NOT_SUPPORTED`, `ADAPTER_NOT_FOUND`, or `BRIDGE_NOT_FOUND`.

---

## 5. Canonical Attributes

All mediated outputs use the canonical URN grammar established in Phase 1 and locked in `@pramana/shared`:

- `urn:pramana:attr:permit:status` (Values: `'ACTIVE'`, `'EXPIRED'`, `'SUSPENDED'`, `'PENDING'`)
- `urn:pramana:attr:trans:license_category` (Values: `'COMMERCIAL'`, `'PRIVATE'`, `'HEAVY'`)
- `urn:pramana:attr:fin:trailing_12m_earnings` (Number, INR)
- `urn:pramana:attr:fin:account_balance` (Number, net positive/negative)
- `urn:pramana:attr:fin:currency` (ISO 4217, e.g. `'INR'`)
- `urn:pramana:attr:civil:age` (Integer years)
- `urn:pramana:attr:civil:birthdate` (`YYYY-MM-DD`)
- `urn:pramana:attr:civil:domicile_state` (e.g. `'KA'`, `'MH'`)
- `urn:pramana:attr:civil:district` (e.g. `'Bangalore Urban'`)
- `urn:pramana:attr:civil:citizenship` (ISO 3166-1 alpha-3, e.g. `'IND'`)

---

## 6. Transformation Rules

1. **`MAP_PERMIT_ENUM`**: Maps legacy transport codes:
   - `ACTV` $\to$ `ACTIVE`
   - `EXPR` $\to$ `EXPIRED`
   - `SUSP` $\to$ `SUSPENDED`
   - `PEND` $\to$ `PENDING`
2. **`MAP_LICENSE_CATEGORY`**:
   - `COMM_LIGHT` $\to$ `COMMERCIAL`
   - `COMM_HEAVY` $\to$ `HEAVY`
   - Other $\to$ `PRIVATE`
3. **`AGGREGATE_SUM_CREDITS_365D`**: Sum of 365-day credit transactions mapped directly to `trailing_12m_earnings`.
4. **`NET_BALANCE_INDICATOR`**: Signed arithmetic: `CRDT` $\to +balance$, `DBIT` $\to -balance$.
5. **`COMPUTE_AGE_FROM_DATE`**: Deterministic solar year calculation from `date_of_birth` relative to the current timestamp.

---

## 7. Issuer Boundary & Mock Issuer Service

The `MockIssuerService` mediates between source adapters and verifier-facing claim sets:

```
sources + requestedAttributeIds
          │
          ▼
trustRegistry.getIssuer(issuerDid) [Validates authorization & status]
          │
          ▼
Iterate requested canonical attributes only
          │
          ▼
AdapterResolver delegates to domain adapter
          │
          ▼
MinimalClaimSet {
  schemaId,
  issuerDid,
  subjectId,
  claims: { ...only requested attributes... },
  issuedAt,
  isMockUnsigned: true
}
```

_Status: MOCK (Zero cryptographic signatures produced)_

---

## 8. Data Minimization Invariants

In compliance with Rule 8, 9, 10 in `AGENTS.md`:

1. **Zero Database Schema Exposure:** Verifiers never receive or process SQL table names, column names (`STATUS_CD`, `PERMIT_ID`), XML element paths (`BkToCstmrStmt.Stmt.Bal.Amt`), or REST property names.
2. **Zero Extraneous Attribute Exposure:**
   - Raw vehicle registration numbers (`RAW_VEHICLE_REG_NO`) are stripped.
   - Internal inspection officer IDs (`INSPECTION_OFFICER_ID`) are stripped.
   - Bank IBANs (`accountIban`) and routing codes (`branchRoutingCode`) are stripped.
   - Residential street addresses (`residential_address`) and municipal ward IDs (`municipal_ward_id`) are stripped.
3. **Bounded Claim Sets:** If a verifier asks for `COMMERCIAL_PERMIT_STATUS`, the resulting claim set contains _only_ `COMMERCIAL_PERMIT_STATUS`, even if the source record contains 10 other attributes.

---

## 9. Synthetic Fixture Policy

Strict adherence to anti-hallucination rules:

- **Zero Real Citizen Data:** Only fictional synthetic profiles are used:
  - `SYNTHETIC_ALICE`: Fully qualified applicant (Active commercial permit, 480k earnings, KA domicile).
  - `SYNTHETIC_BOB`: Low-earning applicant (Active commercial permit, 180k earnings).
  - `SYNTHETIC_CAROL`: Expired permit applicant (Expired commercial permit, 550k earnings).
  - `SYNTHETIC_DAVE`: Out-of-state applicant (Active heavy permit, MH domicile).
- Fictional citizen IDs prefixed with `synth:citizen:*`.
- Fictional bank accounts prefixed with `IN00MOCK*`.

---

## 10. Security Assumptions & Threat Mitigations

| Threat                             | Mitigation                                                                                                                                   |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Malformed source payloads          | Boundary schema validation rejects unparsable dates, negative credit sums, or missing fields with `SOURCE_INVALID` / `SOURCE_MISSING_FIELD`. |
| Over-issuance                      | Claim sets are built strictly from `requestedAttributeIds` using set minimization.                                                           |
| Inactive / revoked issuer issuance | `MockIssuerService` validates `issuer.active` and `status === 'ACTIVE'` before mediating.                                                    |
| Unregistered attribute injection   | `AdapterResolver` rejects unknown attribute IDs with `ATTRIBUTE_NOT_SUPPORTED`.                                                              |
| Replay & dual-package hazard       | Clean `@pramana/shared` contract boundaries and 64-character hex nonce entropy checks.                                                       |

---

## 11. Current Limitations & Specification Mismatches

1. **Zero Cryptography:** Claims are plain JavaScript objects tagged with `isMockUnsigned: true`. They provide zero mathematical unforgeability.
2. **In-Memory Fixtures:** Sources are loaded from in-memory test fixtures; no live network sockets or database connections are opened.
3. **No Dynamic XML Engine:** XML CAMT.053 parsing uses regex tokenization suited for demo fixtures rather than a full DOM/SAX validator.
4. **Bridge Specification Mismatch (Municipal REST vs. SQL Bridge):** In Phase 2, the Trust Registry seeded `bridge:civil:sql-to-age` with `sourceSystem: 'CIVIL_DATABASE_SQL'`. In Phase 3, the scenario defines a Municipal REST source (`MunicipalRestAdapter`). To avoid silently inventing unapproved registry entities or mutating Phase 2 records, the adapter reuses `bridge:civil:sql-to-age` as the canonical Phase 2 bridge mapping for age calculation. A dedicated `bridge:civil:rest-to-age` or polymorphic bridge definition should be formalized in a future ADR prior to production.

---

## 12. Future Cryptographic Integration (Phase 5 & 6)

In Phase 5 and Phase 6, the mediation layer will connect directly to cryptographic signing engines:

```
MinimalClaimSet (Canonical Claims)
          │
          ▼
Phase 5/6: BBS+ Multi-Message Signer (BLS12-381 G2)
          │
          ▼
Verifiable Credential with Cryptographic Proof
          │
          ▼
Phase 4: Non-Custodial Holder Wallet (Selective Disclosure Proof)
```

The canonical attribute dictionary and minimal claim interface designed in Phase 3 remain unchanged when cryptographic signing is introduced.
