# Pramāṇa Request Policy & Non-Custodial Consent (Tier 3 Boundary)

> **Phase 4 Technical Architecture & Protocol Specification**  
> **Status:** IMPLEMENTED (Backend Request Validation, Policy Engine, Template Resolution, Consent Information Generation, and Nonce-Bound Consent States)  
> **Owner:** Person 2 (Backend / Protocol / Trust Infrastructure)  
> **Authority:** Pramāṇa Architecture Specification, `AGENTS.md`, ADR-0004, ADR-0005

---

## Executive Summary

Phase 4 establishes the **REQUEST $\to$ POLICY $\to$ CONSENT** layer of the Pramāṇa protocol.

Its primary responsibility is to ensure that a verifier cannot freely demand arbitrary data or invent self-asserted permissions. Every verifier `RequestContract` is strictly mediated by the **Trust Registry** (verifier licensing, permitted purposes, permitted attributes, permitted predicates, bounded operators, and retention policies). Once policy authorization passes, the protocol generates structured, verifiable **Consent Information** answering **WHO**, **WHAT**, and **NOT SHARED**.

Crucially, the protocol enforces that **`POLICY AUTHORIZED` IS NOT `CITIZEN CONSENTED`**: citizen consent status is initialized strictly as `PENDING` and must be explicitly recorded before any subsequent credential presentation or proof generation.

```
                           PHASE 1
                       RequestContract
                              │
                              ▼
                           PHASE 2
                        Trust Registry
                     (Licences / Schemas)
                              │
                              ▼
                           PHASE 3
                  Schema Mediation / Issuers
                              │
                              ▼
                           PHASE 4
                  Request → Policy → Consent
                              │
                              ▼
                    ┌──────────────────┐
                    │ WHO              │ (Registry Legal Name)
                    │ WHAT             │ (Disclosed vs Predicate-Only)
                    │ NOT SHARED       │ (Certified Private Attributes)
                    └──────────────────┘
                              │
                              ▼
                 [Citizen Consent = PENDING]
                              │
                              ▼ (Explicit Wallet Approval)
                 [Citizen Consent = APPROVED]
                              │
                    (Future Phases 5-7)
                 [Cryptographic Proof Gen]
```

---

## 1. Request Validation

The request validation pipeline validates untrusted external inputs at the runtime schema boundary before passing them to core protocol services.

### Validation Rules

- **Protocol Version**: Must match `PROTOCOL_VERSION` (currently `0.1.0`). Unsupported versions are rejected with `INVALID_REQUEST`.
- **Verifier Identity**: Must contain a non-empty `did` string with prefix `did:` and non-empty display claim.
- **Purpose**: Must be a non-empty standardized string identifier (e.g., `fuel_subsidy_eligibility`, `PURPOSE_AGE_VERIFICATION`).
- **Context**: Must be a non-empty string used for context-scoped nullifier domain separation.
- **Predicates**: Must contain a non-empty array of valid predicates. Empty predicate arrays are rejected with `INVALID_REQUEST`.
- **Disclosures**: Disclosed attributes (`revealRequirements` / `disclose`) must be an array of known canonical attributes.
- **Nonce**: Must contain at least 32 characters of high-entropy hexadecimal string (256-bit entropy).
- **Timestamps & Expiry**: `issuedAt` and `expiresAt` must be valid ISO 8601 UTC strings where `expiresAt > issuedAt`. Requests whose expiration timestamp has elapsed at evaluation time are rejected immediately with `EXPIRED_REQUEST`.

_Status: IMPLEMENTED_

---

## 2. Trust Registry Authorization

The `PolicyService` evaluates the structurally validated `RequestContract` directly against the authoritative in-memory `TrustRegistry`:

1. **Existence**: Verifier DID is looked up in the Trust Registry. If not found, rejected with `LICENCE_INVALID`.
2. **Operational Status**: Verifier licence status must be `ACTIVE`. Licences marked `SUSPENDED` or `REVOKED` are rejected with `VERIFIER_NOT_AUTHORIZED`.
3. **Temporal Validity**: Current timestamp must be chronologically before licence `validUntil`. Expired licences are rejected with `LICENCE_INVALID`.

_Status: IMPLEMENTED_

---

## 3. Purpose Binding

The verifier does not have unilateral authority to define verification purposes. The Trust Registry defines the exact set of permitted purposes for each licensed verifier:

- The request `purpose` must be contained within `licence.permittedPurposes`.
- If an unlicensed purpose is requested, the request is rejected with `PURPOSE_NOT_AUTHORIZED`.
- Verifier permissions cannot be inferred from verifier display names or unverified claims.

_Status: IMPLEMENTED_

---

## 4. Attribute Authorization

The request cannot ask for arbitrary or unregistered attributes:

- Every requested attribute in `disclosures` / `revealRequirements` must be registered in the Trust Registry as an `AttributeDefinition`.
- Every disclosed attribute must be listed in `licence.permittedAttributes`.
- Unregistered attributes are rejected with `ATTRIBUTE_NOT_SUPPORTED`.
- Unauthorized attributes for the verifier are rejected with `ATTRIBUTE_NOT_AUTHORIZED`.

_Status: IMPLEMENTED_

---

## 5. Predicate Authorization

Predicates are evaluated for grammar conformity and institutional licensing:

### Supported Bounded Operators

- Scalar equality: `EQ`
- Bounded comparisons: `LT`, `LTE`
- Bounded set membership: `IN` (strictly bounded to $\le 8$ elements per `MAX_PREDICATE_IN_SET_SIZE`)
- Compound predicates: `AND` (`COMPOUND_AND`)

### Strictly Prohibited Operators

- Unbounded / inverted operators: `GT`, `GTE`, `NEQ` (rejected with `INVALID_PREDICATE`)
- Disjunctions: `OR` (`COMPOUND_OR`) (rejected with `INVALID_PREDICATE`)
- Arbitrary script expressions: (rejected with `INVALID_PREDICATE`)

### Attribute and Value Checks

- Predicate attribute must be registered in the Trust Registry.
- Predicate attribute must be authorized in `licence.permittedPredicates`.
- Constant values must match attribute data types (`number`, `string`, `date`) and conform to `allowedValues` enum constraints where applicable.

_Status: IMPLEMENTED_

---

## 6. Data Minimization & Retention Controls

Pramāṇa enforces structural data minimization:

1. **Anti-Source Injection**: Requests attempting to inject raw source schema fields (e.g. `citizens.records.date_of_birth`, `BkToCstmrStmt.Stmt.Bal.Amt`) in place of canonical attributes are rejected with `DATA_MINIMIZATION_VIOLATION`.
2. **Retention Policy Strictness**: Requests specify a `DataRetentionPolicy`:
   - `NO_RETENTION_VERIFY_ONLY` (Level 1 - Most Strict)
   - `AUDIT_RECEIPT_ONLY_ZERO_PII` (Level 2)
   - `TRANSIENT_SESSION_ONLY` (Level 3 - Least Strict)
     Requests specifying a retention policy that exceeds the licence's `maxRetentionPolicy` are rejected with `DATA_MINIMIZATION_VIOLATION`.
3. **Over-Asking Rejection**: Verifiers requesting attributes or retention outside their authorized scope cannot proceed.

_Status: IMPLEMENTED_

---

## 7. Template Resolution

Consent representations are rendered deterministically using canonical `TemplateBundle` records from the Trust Registry:

- Template lookup key: `${purposeCode}:${locale}` with fallback to `${purposeCode}:en-US`.
- If no registered template exists for the requested purpose, the operation fails explicitly with `CONSENT_TEMPLATE_NOT_FOUND`.
- The backend never silently synthesizes a prompt or falls back to unrelated templates.
- A cryptographic SHA-256 digest of the canonical template text is computed and bound to `TemplateBinding.templateHash`.

_Status: IMPLEMENTED_

---

## 8. Consent Information (WHO / WHAT / NOT SHARED)

The `ConsentService` produces a standardized `ConsentInformation` contract designed for consumption by citizen wallets:

### WHO (Authoritative Identity)

- `verifierDid`: DID from the Trust Registry.
- `verifierName`: **Authoritative legal name from the Trust Registry licence** (e.g., `Municipal Fuel Subsidy Authority`). The verifier's self-asserted request display name is strictly disregarded.
- `role` / `legalEntity`: Metadata from the registry template.

### WHAT (Granular Transparency)

- `purpose`: Standardized purpose code and description.
- `disclosedAttributes`: Full metadata (`attributeId`, `name`, `description`, `category`) of data that will be transmitted in plain text.
- `predicates`: Human-readable representations of zero-knowledge conditions (e.g., `trailing_12m_earnings must be less than or equal to 300000`, `commercial_permit_status must equal "ACTIVE"`). Raw attribute values are **NEVER** exposed.

### NOT SHARED (Certified Private Data)

- Declares attributes that remain strictly private (e.g., bank account numbers, individual transaction records, exact salary/earnings amounts, home address).
- Established directly from template definitions and source minimization rules.

_Status: IMPLEMENTED_

---

## 9. Consent State Lifecycle

Consent state follows a strict, unambiguous finite state machine:

```
    [Request Evaluated & Policy Authorized]
                       │
                       ▼
                 ┌───────────┐
                 │  PENDING  │
                 └─────┬─────┘
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
   ┌───────────┐               ┌──────────┐
   │ APPROVED  │               │ REJECTED │
   └───────────┘               └──────────┘
```

- When `ConsentInformation` is generated, `citizenConsentStatus` is always `PENDING`.
- Policy approval does **NOT** imply citizen consent.
- Transitions to `APPROVED` or `REJECTED` occur only upon receiving an explicit citizen wallet decision.

_Status: IMPLEMENTED_

---

## 10. Request & Nonce Binding

Consent decisions are cryptographically and structurally bound to the originating request:

- The decision record references `requestId` and `requestNonce`.
- Consent cannot be transferred to a different request, reused across sessions, or applied to a different nonce.
- The backend transient store indexes decisions by `${requestId}:${requestNonce}`.

_Status: IMPLEMENTED_

---

## 11. Expiry Handling

- `RequestContract.expiresAt` is checked both at structural validation and policy evaluation.
- Stale or expired requests cannot be authorized.
- The backend does not automatically extend expiry or refresh authorizations.

_Status: IMPLEMENTED_

---

## 12. Security Boundaries & Threat Mitigation

| Threat Vector                    | Mitigation Strategy                                                                           | Status      |
| -------------------------------- | --------------------------------------------------------------------------------------------- | ----------- |
| **Verifier Spoofing**            | WHO section resolves legal entity from Trust Registry, ignoring client-provided name.         | IMPLEMENTED |
| **Over-Asking / Function Creep** | Purpose, attribute, and predicate permissions enforced against registry licence.              | IMPLEMENTED |
| **Raw PII Exfiltration**         | Separate disclosed attributes from predicate conditions; prohibit raw source field names.     | IMPLEMENTED |
| **Unbounded Predicates**         | Operators restricted to `EQ`, `LT`, `LTE`, `IN<=8`, `AND`. `GT`, `GTE`, `NEQ`, `OR` rejected. | IMPLEMENTED |
| **Replay Attacks**               | 256-bit fresh nonce enforced; consent decision bound to request nonce.                        | IMPLEMENTED |
| **Silent Consent Manufacture**   | Citizen consent initialized as `PENDING`; never auto-granted by backend policy.               | IMPLEMENTED |

---

## 13. Person 1 Integration Contract

Person 1 (Frontend Engineer) consumes clean shared types and HTTP endpoints without importing internal registry or database logic:

### Consumed Artifacts & Types

- `RequestContract` (from `@pramana/shared`)
- `ConsentInformation` (from `@pramana/shared`)
- `CitizenDecisionRecord` (from `@pramana/shared`)
- `PolicyEvaluationResult` (from `@pramana/shared`)

### API Endpoints

1. `POST /api/v1/requests/validate`: Verify request syntax before rendering.
2. `POST /api/v1/requests/policy`: Verify policy authorization against Trust Registry.
3. `POST /api/v1/consent/prepare`: Generate structured `ConsentInformation` (WHO, WHAT, NOT SHARED).
4. `POST /api/v1/consent/decision`: Submit citizen approval (`APPROVED`) or refusal (`REJECTED`).
5. `GET /api/v1/consent/decision/:requestId/:nonce`: Query current consent status.

_Status: IMPLEMENTED_

---

## 14. Current Limitations

- **Transient In-Memory Decision Store**: Consent decisions are held in-memory for active sessions rather than persistent zero-PII audit tables.
- **Holder Signature Placeholder**: Citizen signatures sealing consent decisions are optional placeholders until Phase 5.
- **Local Transports**: HTTP-based request dispatching only; QR transport, BLE, and Noise handshake deferred to Phase 7.

_Status: DOCUMENTED_

---

## 15. Future Cryptographic Integration (Phase 5-7 Roadmap)

| Protocol Capability                   | Phase   | Status          |
| ------------------------------------- | ------- | --------------- |
| **BBS+ Selective Disclosure Proofs**  | Phase 6 | NOT IMPLEMENTED |
| **Groth16 Zero-Knowledge Predicates** | Phase 7 | NOT IMPLEMENTED |
| **BLS12-381 Key Management**          | Phase 5 | NOT IMPLEMENTED |
| **Holder Consent Signature Sealing**  | Phase 5 | NOT IMPLEMENTED |
| **Noise Protocol / HPKE Transport**   | Phase 7 | NOT IMPLEMENTED |
| **Ephemeral Relay Transport**         | Phase 7 | NOT IMPLEMENTED |
