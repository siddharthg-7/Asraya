# PRAMĀṆA Cryptographic Architecture & Proof System (Phase 5)

> **Document Status**: Active Technical Specification  
> **Phase**: Phase 5 — Cryptographic Core + Proof System  
> **Audience**: Protocol, Cryptography, Backend Engineers & Independent Auditors  
> **Core Paradigm**: **MOVE THE QUESTION, NOT THE DATA.**

---

## 1. Cryptographic Architecture `[IMPLEMENTED]`

Pramāṇa employs a dual-tier cryptographic proof pipeline prioritizing pairing-based selective disclosure credentials as the primary mechanism, backed by arithmetic zero-knowledge SNARK circuits for arbitrary bounded numeric predicates:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRAMĀṆA PROOF PIPELINE                          │
├────────────────────────────────────────────────────────────────────────┤
│ TIER A (Primary — Default):                                            │
│ BBS+ Signatures over BLS12-381 G2 Curve                                │
│ ├── Multi-message signing of canonical minimal claims                 │
│ ├── Selective disclosure presentations (reveals ONLY requested keys)   │
│ ├── Blinding of predicate-only attributes (hidden from verifier)       │
│ └── Native holder binding commitment                                   │
├────────────────────────────────────────────────────────────────────────┤
│ TIER B (Fallback — Predicates):                                        │
│ Groth16 zk-SNARKs over BN128 / BN254 Curve                             │
│ ├── Numeric inequality evaluation (trailing_12m_earnings LTE 300,000)  │
│ ├── Zero knowledge of exact value (verifier learns ONLY predicate=TRUE)│
│ └── Request nonce scalar binding (anti-replay, anti-forwarding)        │
├────────────────────────────────────────────────────────────────────────┤
│ UNLINKABILITY LAYER:                                                   │
│ Context Nullifiers & Per-Verifier Pseudonyms (HMAC-SHA256)             │
│ ├── Verifier A receives nym_A; Verifier B receives nym_B               │
│ └── Campaign nullifier prevents double-claiming without global IDs     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. BBS Implementation `[IMPLEMENTED]`

- **Selected Engine**: WebAssembly-compiled Pairing Cryptography Engine implementing the BBS+ multi-message signature scheme.
- **Curve & Group**: BLS12-381 pairing-friendly elliptic curve. Public keys reside in group $\mathbb{G}_2$; signature components and message generators reside in $\mathbb{G}_1$.
- **Message Encoding**: Each canonical attribute in the `MinimalClaimSet` is serialized deterministically using `canonicalJsonStringify({ [attributeId]: value })` and hashed via SHA-256 to a 32-byte message scalar field element.

---

## 3. BBS Library & Version `[IMPLEMENTED]`

- **Library**: `@mattrglobal/bbs-signatures`
- **Version**: `2.0.0`
- **WASM Acceleration**: Pre-compiled binary WASM module for deterministic, cross-platform pairing operations on Node.js and modern browsers.
- **Primitives**:
  - `generateBls12381G2KeyPair(seed)`: Derives deterministic 32-byte private key and 96-byte $\mathbb{G}_2$ public key.
  - `blsSign({ keyPair, messages })`: Signs $n$-ary messages into a compact 112-byte BBS+ signature.
  - `blsCreateProof({ publicKey, signature, messages, nonce, revealed })`: Generates zero-knowledge selective disclosure proof disclosing index subset $R \subset \{1..n\}$ while blinding $\{1..n\} \setminus R$.
  - `blsVerifyProof({ publicKey, proof, messages, nonce })`: Verifies selective disclosure proof against original issuer public key and session challenge nonce.

---

## 4. Issuer Keys `[IMPLEMENTED — DEMO KEY MANAGEMENT]`

- **Status**: `[IMPLEMENTED]` for deterministic local test/demo key generation; `[NOT IMPLEMENTED]` for production hardware security module (HSM/KMS).
- **Private Key Isolation**: Issuer private keys reside strictly in issuer memory (`IssuerKeyManager`) and are never written to disk, never stored in the Trust Registry, and never exposed over APIs or logs.
- **Public Key Registration**: Public keys are exported as Base64-encoded 96-byte compressed $\mathbb{G}_2$ points and registered in the `TrustRegistry` under `IssuerRecord.publicKeys.bbsG2PublicKey`.
- **Zero Secrets Tracked**: No static private keys or mnemonic seeds are committed to version control.

---

## 5. Credential Structure `[IMPLEMENTED]`

Cryptographic credentials implement the canonical `VerifiableCredential` abstraction:

```typescript
export interface VerifiableCredential {
  readonly metadata: {
    readonly id: string;
    readonly schemaId: string;
    readonly issuedAt: string;
  };
  readonly issuer: {
    readonly did: string;
    readonly name: string;
    readonly registryCheckpoint: string;
  };
  readonly holderBinding: {
    readonly holderPublicKeyHash: string;
    readonly algorithm: 'BLS12-381-G1';
  };
  readonly claims: Readonly<Record<string, string | number | boolean>>;
  readonly signature: string; // Base64-encoded BBS+ BLS12-381 G2 signature
}
```

---

## 6. Selective Disclosure `[IMPLEMENTED]`

- The citizen wallet selectively discloses **only** the attributes explicitly authorized in the verifier's `RequestContract` and confirmed in the citizen's `ConsentInformation`.
- Any attribute present in the credential but not requested (or marked predicate-only) is blinded during `blsCreateProof`.
- The verifier validates the proof mathematically without receiving the blinded message contents.

---

## 7. Verifier Pseudonym & Unlinkability `[IMPLEMENTED]`

- **Design**: Eliminates global citizen tracking identifiers (Rule 11).
- **Classification**: **Verifier-scoped pseudonym derived from a holder secret using HMAC-SHA256.**
- **Cryptographic Grounding**: This is an application-level verifier-scoped pseudonym construction designed to guarantee unlinkability across independent verifiers for the hackathon MVP. It is **NOT** a native BBS cryptographic primitive.
- **Pseudonym Derivation**:
  $$\text{nym}_{\text{verifier}} = \text{HMAC-SHA256}(\text{holderSecret}, \text{"pramana:nym:"} \parallel \text{verifierDid} \parallel \text{contextId})$$
- **Unlinkability Property**: Verifier A sees $\text{nym}_A$, Verifier B sees $\text{nym}_B$. Neither verifier can correlate presentations to the same citizen without possessing the citizen's private holder secret.
- **Context-Scoped Nullifiers**:
  $$\text{nullifier} = \text{HMAC-SHA256}(\text{holderSecret}, \text{"pramana:nullifier:"} \parallel \text{contextId} \parallel \text{epoch})$$
  Enables sybil defense and single-claim enforcement per subsidy campaign without revealing citizen identity.

---

## 8. Groth16 Architecture `[IMPLEMENTED]`

- **Status**: Tier B Numeric Predicate Prover & Verifier.
- **Library**: `snarkjs@0.7.6` and `@iden3/binfileutils`.
- **Curve**: BN128 / BN254 pairing-friendly elliptic curve ($\mathbb{F}_r$ prime: $21888242871839275222246405745257275088548364400416034343698204186575808495617$).
- **Proof Structure**: 3 group elements: $\pi_A \in \mathbb{G}_1$, $\pi_B \in \mathbb{G}_2$, $\pi_C \in \mathbb{G}_1$.
- **Pairing Check**:
  $$e(\pi_A, \pi_B) = e(\alpha, \beta) \cdot e\left(\sum_{i=0}^l x_i \gamma_i, \delta\right) \cdot e(\pi_C, \delta)$$

---

## 9. Circom Circuits `[IMPLEMENTED]`

- **Circuit File**: `circuits/src/numeric_predicate.circom`
- **Compiler Target**: Circom 2.0+ compatible R1CS constraint system.
- **Constraints**: 67 R1CS constraints.
- **Template Logic**:
  1. $1 \times (\text{threshold} - \text{earnings}) = \text{diff}$
  2. Binary range check decomposing $\text{diff}$ into 64 bits: $\forall i \in [0, 63], b_i(1 - b_i) = 0$
  3. Bit reconstruction check: $1 \times \sum_{i=0}^{63} 2^i b_i = \text{diff}$
  4. Nonce binding constraint: $\text{nonce} \times \text{nonce} = \text{nonceSquare}$

---

## 10. Private & Public Inputs `[IMPLEMENTED]`

| Signal Name | Visibility  | Description                                | Leakage Defense                                |
| ----------- | ----------- | ------------------------------------------ | ---------------------------------------------- |
| `earnings`  | **PRIVATE** | Exact financial earnings integer           | Never leaves prover; not serialized in payload |
| `threshold` | **PUBLIC**  | Permitted regulatory threshold ($300,000$) | Checked against `RequestContract.predicates`   |
| `nonce`     | **PUBLIC**  | SHA-256 scalar of session challenge nonce  | Binds proof to session; prevents replay        |

---

## 11. Trusted Setup Limitations `[IMPLEMENTED — MVP DEMO SETUP ONLY]`

- **Status**: `[IMPLEMENTED — MVP PROTOTYPE ONLY]`.
- **Authoritative Qualification**: **Development trusted setup used for MVP; production deployment requires a formal MPC ceremony.**
- **Guardrail**: **Do not call this production-ready ZK infrastructure.**
- **Ceremony**: Generated using SnarkJS local Powers of Tau (capacity $2^7 = 128$ constraints) and Phase 2 Groth16 circuit-specific ceremony.
- **Production Requirement**: Production deployment requires a multi-party computation (MPC) ceremony with attested parameter generation and toxic waste destruction.

---

## 12. Proof Envelope Integration `[IMPLEMENTED]`

Both cryptographic systems integrate seamlessly into the standard `ProofEnvelope`:

```typescript
export interface ProofEnvelope {
  readonly contractId: string;
  readonly verifierDid: string;
  readonly nonce: string;
  readonly proofTier: 'TIER_A_BBS' | 'TIER_B_GROTH16' | 'TIER_HYBRID_BBS_GROTH16';
  readonly payload: BBSProofPayload | Groth16ProofPayload | CompositeProofPayload;
  readonly nullifier: NullifierRecord;
  readonly holderBindingSignature: string;
  readonly createdAt: string;
  readonly issuerDid?: string;
  readonly schemaId?: string;
  readonly protocolVersion?: string;
}
```

---

## 13. Request Binding `[IMPLEMENTED]`

Every presentation and proof is cryptographically and logically bound to:

1. `contractId`: Matching the licensed Verifier's bounded contract.
2. `verifierDid`: Preventing forwarding to unauthorized verifiers (audience restriction).
3. `nonce`: Fresh 256-bit challenge scalar hashed directly into the BBS presentation and Groth16 public inputs.
4. `createdAt`: Freshness window enforced ($\le 300\text{s}$).

---

## 14. Security Assumptions `[IMPLEMENTED]`

1. **Computational Hardness**: Relies on the Discrete Logarithm and $q$-Strong Diffie-Hellman assumptions over BLS12-381, and the Knowledge of Exponent assumption over BN128.
2. **Deterministic Adaptation**: Assumes Phase 3 adapters deterministically transform legacy sources into canonical attributes.
3. **Issuer Trust Anchoring**: Verifier trusts only issuers registered as `ACTIVE` with valid BLS12-381 public keys in the `TrustRegistry`.

---

## 15. Performance Measurements `[IMPLEMENTED — BENCHMARKED ON ACTUAL HARDWARE]`

_Measured on Windows x64 Node.js runtime:_

| Operation                             | Scheme / Primitive       | Benchmark Execution Time | Output Size              |
| ------------------------------------- | ------------------------ | ------------------------ | ------------------------ |
| **Credential Signing**                | BBS+ over BLS12-381 G2   | **24.10 ms**             | 769 bytes                |
| **Selective Disclosure Generation**   | BBS+ Presentation Prover | **127.23 ms**            | 797 bytes                |
| **Selective Disclosure Verification** | BBS+ Pairing Verifier    | **86.50 ms**             | —                        |
| **zk-SNARK Witness + Prover**         | Groth16 over BN128       | **1,147.72 ms** (1.15s)  | 900 bytes                |
| **zk-SNARK Proof Verification**       | Groth16 Pairing Verifier | **28.59 ms**             | —                        |
| **Composite Proof Payload**           | Hybrid BBS + Groth16     | —                        | **1,716 bytes (1.7 KB)** |

---

## 16. Known Limitations `[DOCUMENTED]`

1. **In-Memory Wallet**: Wallet storage is in-memory for testing; mobile hardware secure enclave integration is out of scope for Phase 5.
2. **Local Trusted Setup**: Groth16 proving and verification keys were generated in a local development setup without an MPC ceremony.
3. **WASM Overhead**: Groth16 prover currently executes via JavaScript/WASM math; native Rust/C++ provers achieve $\sim 20\text{ms}$.

---

## 17. Future Production Hardening `[TBD]`

- Hardware security module (HSM) signing endpoints for institutional issuers.
- Multi-party computation (MPC) ceremony for production Groth16 predicate circuits.
- Native mobile prover integration via React Native TurboModules or Rust FFI.
- Threshold bit-commitment range proofs inside BBS to avoid SNARK prover overhead for simple inequalities.
