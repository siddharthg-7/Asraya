# Pramāṇa Core Domain Model

This document specifies the responsibilities, boundaries, and relationships of the 17 core domain entities of the Pramāṇa protocol.

---

## Entity Relationship Overview

```
                      ┌──────────────────────┐
                      │    Trust Registry    │
                      │  (Trust Checkpoint)  │
                      └──────────┬───────────┘
                                 │ Authorizes & Anchor
             ┌───────────────────┴───────────────────┐
             ▼                                       ▼
    ┌─────────────────┐                     ┌─────────────────┐
    │     Issuer      │                     │    Verifier     │
    └────────┬────────┘                     └────────┬────────┘
             │ Issues                                │ Issues
             ▼                                       ▼
    ┌─────────────────┐                     ┌─────────────────┐
    │   Credential    │                     │ Request Contract│
    │ (Attributes)    │                     │  (Predicates)   │
    └────────┬────────┘                     └────────┬────────┘
             │ Bound to                              │ Solicits
             ▼                                       ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                           Citizen                           │
  │                     (Non-Custodial Wallet)                  │
  │                                                             │
  │  1. Ingests Request Contract                                │
  │  2. Resolves Template & Obtains Explicit Consent            │
  │  3. Computes Cryptographic Proof (BBS / Groth16)            │
  │  4. Derives Context-Scoped Nullifier                        │
  │  5. Emits Verifiable Consent Receipt                        │
  └──────────────────────────────┬──────────────────────────────┘
                                 │ Proof Envelope & Receipt
                                 ▼
                    ┌─────────────────────────┐
                    │    Verifier Pipeline    │
                    │ (Minimal Audit Log Only)│
                    └─────────────────────────┘
```

---

## Detailed Entity Specifications

### 1. Issuer

- **Definition**: An authoritative institution (e.g. government agency, bank, educational institution) registered in the Trust Registry.
- **Responsibilities**:
  - Authenticates citizen eligibility via legacy sources through Adapters.
  - Signs credentials using its registered BBS / cryptographic private signing key.
  - Publishes credential revocation state or accumulator updates to the Registry.
- **Boundaries**: Has no visibility into where, when, or how often a citizen presents proofs to verifiers.

### 2. Verifier

- **Definition**: An organization, service, or individual requesting cryptographic proof that a citizen satisfies specific criteria.
- **Responsibilities**:
  - Issues cryptographically signed Verifier Request Contracts with bounded nonces and purpose codes.
  - Ingests proof envelopes over ephemeral channels.
  - Executes the Tier 4 verification pipeline.
- **Boundaries**: Strictly prohibited from receiving or storing raw citizen attributes.

### 3. Citizen

- **Definition**: The human subject whose claims are attested. Holds sovereign, non-custodial ownership of all credentials.
- **Responsibilities**:
  - Authorizes proof generation through explicit, template-bound consent.
  - Protects device access via local biometric or passcode authentication.
- **Boundaries**: Unlinkable across distinct verifier contexts unless explicitly authorized.

### 4. Wallet

- **Definition**: The non-custodial client software executing locally on the citizen's personal device (mobile/PWA).
- **Responsibilities**:
  - Secures the citizen's private holder keys in local encrypted storage / hardware enclave.
  - Evaluates verifier request contracts against local credentials.
  - Renders consent prompts exclusively from canonical registry templates.
  - Generates zero-knowledge and selective-disclosure proofs locally.
- **Boundaries**: Never transmits private keys or unblinded credentials off the device.

### 5. Attribute Definition

- **Definition**: A standardized semantic specification of a single verifiable data element.
- **Responsibilities**:
  - Defines attribute name, data type (string, integer, date, enum), constraints, and valid ranges.
  - Provides internationalization labels and descriptions.
- **Boundaries**: Owned canonically by `@pramana/schemas`.

### 6. Credential

- **Definition**: A tamper-evident digital object containing a set of attribute claims, issuer signature, expiration, and holder-binding commitment.
- **Responsibilities**:
  - Attests to the validity of citizen attributes.
  - Cryptographically bound to the citizen's holder key to prevent theft.
- **Boundaries**: Stored solely within the citizen's wallet.

### 7. Predicate

- **Definition**: A boolean expression evaluated over one or more attributes without disclosing the attribute values (e.g. `age >= 18`, `balance >= 50000`, `country == "IN"`).
- **Responsibilities**:
  - Formatted using Pramāṇa Canonical Predicate Grammar.
  - Evaluated via BBS bit-commitment (Tier A) or Groth16 arithmetic circuit (Tier B).
- **Boundaries**: Evaluated by the wallet; verifier receives only proof of satisfaction.

### 8. Request Contract

- **Definition**: An immutable, signed agreement issued by a verifier defining the terms of verification.
- **Mandatory Fields**:
  - `verifier_did`: Authenticated identity of the requesting organization.
  - `purpose`: Standardized regulatory purpose code.
  - `predicates`: Array of required assertions.
  - `nonce`: Fresh cryptographic challenge (entropy >= 256 bits).
  - `expiry`: UTC timestamp after which the request is invalid.
  - `context`: Domain/campaign identifier for nullifier derivation.

### 9. Consent

- **Definition**: The explicit, informed, template-bound grant by the citizen authorizing the wallet to compute and return a proof for a specific request contract.
- **Invariants**: Not a generic boolean; must bind all request contract parameters.

### 10. Proof

- **Definition**: The cryptographic payload generated by the wallet establishing predicate validity and holder binding.
- **Types**:
  - **Tier A (BBS)**: Selective disclosure proof with blinded commitments.
  - **Tier B (Groth16)**: zk-SNARK proof with public inputs.

### 11. Nullifier / Pseudonym

- **Definition**: A deterministic cryptographic value derived as $H(\text{holder\_secret}, \text{context\_id}, \text{epoch})$.
- **Responsibilities**:
  - Enables verifiers to detect duplicate claims or double-spending within a single campaign.
  - Mathematically uncorrelated across distinct campaigns to prevent cross-context tracking.

### 12. Registry

- **Definition**: The authoritative directory of institution DIDs, public keys, credential schemas, and purpose authorizations.
- **Responsibilities**:
  - Resolves public keys and schema hashes.
  - Distributes signed state checkpoints.

### 13. Trust Checkpoint

- **Definition**: A signed cryptographic digest (e.g. Merkle root) representing the state of the Trust Registry at a given epoch.
- **Responsibilities**:
  - Enables verifiers to validate credentials and issuers completely offline.

### 14. Adapter

- **Definition**: A modular translation component that connects legacy enterprise data sources to Pramāṇa.
- **Responsibilities**:
  - Extracts legacy records (SQL rows, ISO 20022 XML, JSON payloads).
  - Maps legacy fields to Canonical Attribute Definitions.

### 15. Bridge

- **Definition**: The semantic transformation rule set that converts domain-specific schemas into Pramāṇa canonical schemas without information loss.

### 16. Receipt

- **Definition**: A cryptographically signed token issued upon successful verification.
- **Responsibilities**:
  - Proves to both citizen and verifier that a specific request contract was evaluated with an authentic proof at a verified timestamp.

### 17. Audit Log

- **Definition**: An append-only, privacy-preserving event ledger maintained by the verifier.
- **Contents**: Stores session ID, timestamp, verdict, receipt signature, and nullifier hash. Strictly zero citizen attributes.
