# Pramāṇa Threat Model & Attack Vector Analysis

This document specifies the adversarial model, trust assumptions, protected assets, and explicit mitigations for the 14 major threats identified in the Pramāṇa specification.

---

## 1. Adversary Model & Assumptions

- **Adversary Capabilities**: Attackers may intercept public network traffic, present malicious QR codes, deploy rogue verifiers or issuers, manipulate legacy database records, or attempt replay and correlation attacks.
- **Trust Assumptions**:
  - The cryptographic hardness of the discrete logarithm problem on BLS12-381 and pairing-based cryptography holds.
  - The Citizen’s client device possesses an isolated runtime (Secure Enclave, WebCrypto, or local memory sandbox) capable of performing local blinding and proof generation without external memory scraping.
  - The Trust Registry Merkle root is distributed via an authentic channel or pinned checkpoint.

---

## 2. Analysis of the 14 Major Threats & Mitigations

### 1. Forged Issuer Attack

- **Threat**: An adversary generates fraudulent credentials claiming to represent a legitimate issuing authority (e.g. government, bank, university).
- **Mitigation**: Every credential is cryptographically signed using an issuer key registered in the Tier 1 Trust Registry. Wallets and verifiers validate issuer signatures against signed registry checkpoints before proof acceptance.

### 2. Forged Verifier Attack

- **Threat**: A rogue entity poses as a legitimate verifier to extract citizen proofs or trick the wallet into issuing authorization receipts.
- **Mitigation**: All Verifier Request Contracts must be signed by the verifier’s registered DID and verified against registry authorizations before the wallet prompts the citizen for consent.

### 3. Malicious Verifier Requesting Unauthorized Attributes

- **Threat**: An authorized verifier attempts to request claims beyond its sanctioned regulatory purpose (e.g. an alcohol retailer demanding a full national ID and home address instead of an age-over-18 predicate).
- **Mitigation**: The Trust Registry enforces Purpose Limitation. Wallets cross-reference requested predicates against the verifier’s registered schema permissions. Unauthorized requests are blocked at Tier 3 before presentation.

### 4. Replay Attack

- **Threat**: An attacker intercepts a valid proof envelope in transit and replays it to a verifier to gain unauthorized access or benefits.
- **Mitigation**: Tier 4 Verifier Pipeline mandates cryptographically random, short-lived nonces (default: 60s window) bound to the verifier's identity. Nonces are recorded in an in-memory cache and burned upon first presentation.

### 5. Forwarding Attack

- **Threat**: An eavesdropper or intermediate party captures a proof intended for Verifier A and forwards it to Verifier B.
- **Mitigation**: Proofs are cryptographically audience-bound to the specific `verifier_did` and encrypted to the verifier's ephemeral public key using HPKE (Hybrid Public Key Encryption). Verifier B cannot decrypt or verify the audience-mismatched proof.

### 6. QR Code Substitution Attack

- **Threat**: In an offline or physical setting, an attacker replaces a legitimate verifier's QR code with a malicious QR code pointing to a rogue endpoint.
- **Mitigation**: Wallets decode the request contract from the QR code and verify its digital signature against the Trust Registry. The wallet displays the authenticated name and verified trust status of the requesting institution, alerting the citizen to unverified parties.

### 7. Double Claim Attack

- **Threat**: A citizen presents the same credential multiple times to claim a single-use subsidy, ration, or vote.
- **Mitigation**: The wallet generates a **Context-Scoped Nullifier** (derived from the citizen's credential secret, the campaign/program identifier, and the epoch). The verifier pipeline records nullifiers for the duration of the event; duplicate nullifiers are rejected without revealing the citizen's identity.

### 8. Credential Theft

- **Threat**: An attacker steals stored credential files from the user’s file system or cloud backup.
- **Mitigation**: Credentials cannot be used without the holder-binding private key. Holder binding requires the prover to sign or blind proofs using a private key residing in non-exportable hardware storage. Possessing the credential data alone is mathematically insufficient to forge a valid proof.

### 9. Compromised Device

- **Threat**: Malware on the citizen’s smartphone attempts to harvest credentials or generate unauthorized proofs in the background.
- **Mitigation**: Biometric / local authorization is required for every proof generation. Proofs are computed locally in short-lived memory; keys are managed via OS-level secure keystore APIs.

### 10. Schema Manipulation Attack

- **Threat**: An attacker alters the schema definition or predicate grammar to alter the semantic meaning of an evaluation (e.g. reversing `>=` to `<=`).
- **Mitigation**: Schemas are content-addressed and cryptographically hashed (`schema_hash`). Any change to a schema changes its hash and invalidates corresponding credential types and registry entries.

### 11. Registry Compromise

- **Threat**: An attacker compromises the trust registry server and attempts to inject rogue issuers or alter public keys.
- **Mitigation**: Registry updates require multi-signature threshold approvals. The registry state is published as signed Merkle checkpoints. Clients and verifiers verify the Merkle root and reject unanchored key updates.

### 12. Issuer/Verifier Correlation Attack

- **Threat**: An issuer and verifier collude to track a citizen across multiple transactions using static identifiers or unique metadata.
- **Mitigation**: BBS signatures produce randomized, unlinkable zero-knowledge proof presentations. The wallet blinds the signature with fresh randomness on every presentation. Different verifications of the same credential produce mathematically uncorrelated outputs.

### 13. Malicious Adapter Attack

- **Threat**: An adapter component manipulates backend database records or injects false claims during the legacy extraction process.
- **Mitigation**: Adapters run in isolated service boundaries (`services/adapters`). All extracted claims must be validated against `@pramana/schemas` before passing to the issuer. Issuers maintain cryptographic audit trails of ingested legacy batches.

### 14. Incorrect Semantic Bridge

- **Threat**: Discrepancies between legacy data fields (e.g. ISO 20022 balance fields vs. database integers) lead to erroneous predicate evaluations.
- **Mitigation**: Canonical Attribute Definitions enforce strict semantic type invariants (units, currency codes, date formats). The adapter layer includes exhaustive transformation tests and rejection of ambiguous data types.
