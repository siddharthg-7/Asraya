# Pramāṇa Cryptography Standards & Implementation Mandates

## 1. Cryptographic Architecture & Hierarchy

All cryptographic operations within the Pramāṇa monorepo must strictly adhere to the following four-stage execution hierarchy:

```
Application (@pramana/wallet, @pramana/verifier)
       │
       ▼
Protocol Service (@pramana/consent, @pramana/transport)
       │
       ▼
Crypto Abstraction Layer (@pramana/crypto, @pramana/proofs)
       │
       ▼
Specific Cryptographic Implementations (@noble/curves, BBS, Circom/SnarkJS)
```

**Architectural Invariant**: Application and UI code must NEVER directly import low-level curve mathematics, hashing libraries, or key generators. All cryptography flows strictly through `@pramana/crypto`.

---

## 2. The Two Proof Tiers

### Tier A (Default): BBS Multi-Message Signatures

- **Curve**: BLS12-381 pairing-friendly elliptic curve.
- **Specification**: IETF CFRG BBS Signature Suite (`draft-irtf-cfrg-bbs-signatures`).
- **Features**:
  - Selective disclosure of arbitrary message subsets from a signed tuple $(m_1, m_2, \dots, m_n)$.
  - Proof of possession via zero-knowledge proof of the BBS signature.
  - Integer range proofs through decomposed bit-commitment vectors.
  - Holder binding achieved by embedding a secret holder key as one of the certified messages.

### Tier B (Fallback): Groth16 zk-SNARKs

- **Curve**: BN254 / BLS12-381.
- **Proof System**: Groth16 pairing-based SNARK compiled via Circom.
- **Usage Policy**: Strictly reserved for non-linear, multi-variable arithmetic predicates (e.g. polynomial financial formulas) that cannot be expressed as BBS bit-commitments.
- **Warning**: Groth16 must NEVER become the default or primary proof mechanism.

---

## 3. Mandatory Requirements for Cryptographic Primitives

Every cryptographic module, primitive, and operation introduced into `@pramana/crypto` or `@pramana/proofs` MUST satisfy all six criteria before being merged into the codebase:

1. **Threat Assumptions**: Documented adversarial model (e.g., EUF-CMA security, discrete logarithm hardness, side-channel attack models).
2. **Input / Output Specification**: Fully typed parameters, clear byte layouts, endianness specifications, and validation rules.
3. **Test Vectors**: Official NIST, RFC, or IETF standard test vectors verifying positive matching to the bit level.
4. **Negative & Edge-Case Tests**: Exhaustive negative test suites testing invalid signatures, corrupted proofs, mutated blinding factors, out-of-order messages, and tampered public keys.
5. **Deterministic Failure Behavior**: Primitives must fail cleanly by returning a typed `Result.error` or throwing a categorized `CryptoError`. Never leak raw memory, null pointers, or undefined states.
6. **Dependency & Version Record**: Pinned dependencies to audited, constant-time implementations (`@noble/curves`, `@noble/hashes`).

---

## 4. Anti-Hallucination Cryptographic Rules

- **RULE 3**: Never claim cryptographic security merely because a cryptographic library is imported.
- **RULE 5**: Never use fake cryptographic implementations in production paths.
- **RULE 6**: Mock implementations must be clearly marked: `MOCK - DEMO ONLY - NOT PRODUCTION CRYPTO`.
- **RULE 7**: Never silently weaken security requirements to make a demo work.
- **RULE 15**: Do not claim a cryptographic primitive is secure or production-ready merely because the specification mentions it.
