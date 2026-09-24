# Pramāṇa Verifier Request Contract Specification

## 1. Overview

The **Verifier Request Contract** is a signed, cryptographically bound message issued by a Verifier to a Citizen Wallet. It defines the exact boundaries, purpose, and conditions under which a proof may be generated.

---

## 2. Canonical Data Structure

All request contracts must conform to the `@pramana/schemas` definition and contain the following mandatory fields:

```json
{
  "$schema": "https://pramana.org/schemas/v1/request-contract.json",
  "version": "1.0.0-draft",
  "contract_id": "urn:uuid:f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "verifier_did": "did:pramana:verifier:fintech-corp-01",
  "purpose_code": "PURPOSE_LENDING_CREDIT_CHECK",
  "purpose_description": "Verify applicant meets minimum age and annual income thresholds for retail credit evaluation.",
  "predicates": [
    {
      "schema_id": "urn:pramana:schema:citizen:identity:v1",
      "attribute": "age",
      "operator": "LTE",
      "value": 65
    },
    {
      "schema_id": "urn:pramana:schema:financial:tax:v1",
      "attribute": "annual_gross_income",
      "operator": "LTE",
      "value": 500000
    }
  ],
  "disclosures": [],
  "context": "urn:pramana:context:campaign:loan-app-2026-q3",
  "nonce": "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
  "issued_at": "2026-09-24T12:00:00Z",
  "expires_at": "2026-09-24T12:02:00Z",
  "signature": {
    "type": "Ed25519Signature2020",
    "verification_method": "did:pramana:verifier:fintech-corp-01#key-1",
    "signature_value": "..."
  }
}
```

---

## 3. Field Definitions & Invariants

1. **`contract_id`**: A globally unique UUID identifying this verification session.
2. **`verifier_did`**: The Decentralized Identifier of the verifier, resolvable in the Trust Registry.
3. **`purpose_code`**: Standardized regulatory code registered in Tier 1. The wallet uses this code to map to verified, trusted localized consent templates.
4. **`predicates`**: An array of assertions evaluated via Zero-Knowledge / BBS proofs. Supported operators per the authoritative bounded grammar $\text{attr} \ \{\text{EQ}, \text{LT}, \text{LTE}, \text{IN}\le 8\} \ \text{constant}$:
   - `EQ`: Cryptographic equality (hashed/blinded)
   - `LT`: Less than
   - `LTE`: Less than or equal to
   - `IN`: Membership in an allowed set (maximum 8 items)
   - _(Note: `GT`, `GTE`, and `NEQ` are rejected per bounded grammar)_
5. **`disclosures`**: Specific attributes requested for plain selective disclosure (must be explicitly approved and minimized).

6. **`context`**: Scoped domain identifier used to generate the Context-Scoped Nullifier.
7. **`nonce`**: Cryptographically secure random 256-bit challenge. Valid for a single presentation within the expiry window.
8. **`expires_at`**: Strict expiration timestamp. Maximum validity window is 120 seconds.
9. **`signature`**: Cryptographic signature of the verifier proving provenance.

---

## 4. Wallet Ingestion & Verification Sequence

When a wallet receives a request contract (via QR code or relay channel):

1. **Schema Check**: Validates the JSON schema structure.
2. **Timestamp Check**: Rejects if `expires_at < current_time` or `issued_at > current_time + skew_tolerance`.
3. **Signature Verification**: Resolves `verifier_did` in the Trust Registry and validates the signature.
4. **Purpose Authorization**: Checks whether `verifier_did` is authorized in the registry to request the specified `purpose_code` and predicates.
5. **Template Resolution**: Resolves canonical localized consent template.
6. **Prompt Citizen**: Renders the bounded prompt to the citizen.
