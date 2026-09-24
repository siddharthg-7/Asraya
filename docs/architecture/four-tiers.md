# Pramāṇa Four-Tier Architectural Model

This document details the responsibilities, package mappings, interfaces, and operational flow across the four tiers of the Pramāṇa architecture.

---

## Architecture Flow Diagram

```
+-----------------------------------------------------------------------------+
|                                   TIER 1                                    |
|                         IDENTITY & SCHEMA MEDIATION                         |
|                                                                             |
|   +-----------------------+     +-----------------------+                   |
|   |    Trust Registry     |     |   Schema Repository   |                   |
|   |  - Institution DIDs   |     |  - Versioned Schemas  |                   |
|   |  - Trust Checkpoints  |     |  - Predicate Grammar  |                   |
|   +-----------+-----------+     +-----------+-----------+                   |
+---------------|-----------------------------|-------------------------------+
                | Identity Resolution         | Schema Validation
                v                             v
+-----------------------------------------------------------------------------+
|                                   TIER 3                                    |
|                  NON-CUSTODIAL CONSENT & CHANNEL PROTOCOL                   |
|                                                                             |
|   +---------------------------------------------------------------------+   |
|   |  Signed Verifier Request Contract                                   |   |
|   |  [verifier_did, purpose, predicates, expiry, nonce, context]        |   |
|   +----------------------------------+----------------------------------+   |
|                                      |                                      |
|                                      v                                      |
|   +---------------------------------------------------------------------+   |
|   |  Citizen Non-Custodial Wallet                                       |   |
|   |  - Resolves trusted localized template                              |   |
|   |  - Captures biometric/local citizen authorization                   |   |
|   |  - Emits non-repudiable signed Consent Receipt                      |   |
|   +----------------------------------+----------------------------------+   |
+--------------------------------------|--------------------------------------+
                                       | Invokes Proof Generation
                                       v
+-----------------------------------------------------------------------------+
|                                   TIER 2                                    |
|                      CRYPTOGRAPHIC MINIMIZATION ENGINE                      |
|                                                                             |
|   +---------------------------------------------------------------------+   |
|   |  Tier A: BBS Multi-Message Signatures (BLS12-381) - PRIMARY         |   |
|   |  - Selective disclosure of revealed attributes                      |   |
|   |  - Decomposed bit-commitment range proofs                           |   |
|   |  - Holder binding & blinding factors                                |   |
|   |  - Context-scoped nullifier derivation                              |   |
|   +----------------------------------+----------------------------------+   |
|                                      | Fallback (if non-linear arithmetic)  |
|                                      v                                      |
|   +---------------------------------------------------------------------+   |
|   |  Tier B: Groth16 zk-SNARK Circuits (Circom) - FALLBACK ONLY         |   |
|   +----------------------------------+----------------------------------+   |
+--------------------------------------|--------------------------------------+
                                       | Proof Envelope
                                       v
+-----------------------------------------------------------------------------+
|                                   TIER 4                                    |
|                    EPHEMERAL TRANSPORT & VERIFIER PIPELINE                  |
|                                                                             |
|   +---------------------------------------------------------------------+   |
|   |  Ephemeral Transport: Offline QR / BLE / Encrypted Relay            |   |
|   +----------------------------------+----------------------------------+   |
|                                      |                                      |
|                                      v                                      |
|   +---------------------------------------------------------------------+   |
|   |  Verifier Pipeline Stages:                                          |   |
|   |  1. Temporal Window & Nonce Replay Check                            |   |
|   |  2. Cryptographic Proof Verification against Trust Checkpoint        |   |
|   |  3. Context-Scoped Nullifier Collision Check (Double-Claim)          |   |
|   |  4. Minimal Storage Commit: Audit Receipt ONLY (ZERO PII)           |   |
|   +---------------------------------------------------------------------+   |
+-----------------------------------------------------------------------------+
```

---

## Tier Specifications

### Tier 1: Identity & Schema Mediation

- **Packages**: `@pramana/registry`, `@pramana/schemas`, `apps/registry`
- **Core Functionality**:
  - Establishes decentralized trust anchors for both issuing authorities and verifying organizations.
  - Maintains the canonical repository of Attribute Definitions and credential schemas.
  - Validates semantic constraints on credential issuance and verifier requests.
  - Signs and broadcasts periodic **Trust Checkpoints** (Merkle roots) to enable completely disconnected, offline verifiers to validate signatures.

### Tier 2: Cryptographic Minimization Engine

- **Packages**: `@pramana/crypto`, `@pramana/proofs`, `circuits/`
- **Core Functionality**:
  - **Tier A (Default)**: BBS+ / BBS signatures over BLS12-381. Provides zero-knowledge selective disclosure and threshold-bit evaluation with zero per-predicate trusted setup and sub-30ms latency.
  - **Tier B (Fallback)**: Groth16 zk-SNARK circuits compiled with Circom. Activated strictly for non-linear, multi-variable arithmetic predicates that cannot be expressed as BBS bit-commitments.
  - **Holder Binding**: Binds cryptographic presentations to the citizen’s hardware-backed private key.
  - **Nullifiers**: Computes $H(\text{secret}, \text{context}, \text{epoch})$ to prevent duplicate claims without linking the citizen across distinct verifiers.

### Tier 3: Non-Custodial Consent & Channel Protocol

- **Packages**: `@pramana/consent`, `@pramana/protocol`, `apps/wallet`
- **Core Functionality**:
  - Formulates and validates **Verifier Request Contracts**.
  - Binds requests to explicit regulatory purpose codes, preventing mission-creep.
  - Renders human-readable consent dialogs strictly from canonical registry templates to defeat phishing.
  - Obtains affirmative citizen consent and generates verifiable, signed Consent Receipts.

### Tier 4: Ephemeral Transport & Verifier Pipeline

- **Packages**: `@pramana/transport`, `apps/verifier`
- **Core Functionality**:
  - Manages short-lived transport sessions via dynamic offline QR codes, Bluetooth proximity, or HPKE-encrypted relays.
  - Executes the multi-stage verifier pipeline:
    1. Checks nonce freshness and burns the nonce to prevent replay attacks.
    2. Validates proof mathematics against the issuer public key anchored in the trust checkpoint.
    3. Verifies context-scoped nullifier uniqueness to defeat double-spending.
    4. Records the minimal audit event (session ID, timestamp, verdict, receipt signature).
