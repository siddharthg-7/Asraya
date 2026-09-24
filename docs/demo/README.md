# Pramāṇa MVP Demo Architecture & Requirements

## Status

`NOT STARTED` (Setup Phase Only — DO NOT BUILD UI OR MOCKS IN THIS PHASE)

## Purpose of the Future MVP Demo

The objective of the future Pramāṇa MVP demonstration is to physically prove the core paradigm:

> **MOVE THE QUESTION, NOT THE DATA.**

The demonstration will show a real end-to-end verification flow without transmitting or storing raw citizen attributes.

---

## Target Demonstration Scenarios

### Scenario 1: Age-Restricted Access (Offline QR Code)

- **Verifier Question**: Is citizen age >= 18?
- **Citizen Credential**: Government identity credential containing full legal name, date of birth, address, and national ID.
- **Protocol Flow**:
  1. Verifier displays dynamic QR code encoding a signed Verifier Request Contract with fresh nonce.
  2. Citizen opens PWA wallet, scans QR code.
  3. Wallet verifies verifier identity against Trust Registry checkpoint.
  4. Wallet displays template-bound consent prompt: _"Verify age >= 18 for venue entry. Your name, birthdate, and address will NOT be shared."_
  5. Citizen authorizes via biometric/passcode.
  6. Wallet computes Tier A BBS selective disclosure proof with blinded attributes.
  7. Wallet renders dynamic response QR code.
  8. Verifier scans response QR, verifies proof math, burns nonce, checks nullifier, and logs audit receipt.
  9. Verifier screen displays green checkmark: **VERIFIED (AGE >= 18)**. Zero personal data appears on verifier screen or storage.

### Scenario 2: Financial Threshold Proof (Income Verification)

- **Verifier Question**: Is monthly gross income >= 50,000 INR?
- **Citizen Credential**: Bank statement credential issued via ISO 20022 camt.053 adapter.
- **Protocol Flow**:
  - Wallet proves threshold satisfaction via BBS bit-commitment or Groth16 circuit fallback without revealing exact salary or account number.

---

## MVP Guardrails & Rules

1. **No Fake Crypto in Demo**: The demo must execute real mathematical proof generation and verification.
2. **Clear Mock Labeling**: Synthetic test data must be explicitly labeled `MOCK - DEMO ONLY - NOT PRODUCTION CRYPTO`.
3. **Verified Storage Audit**: The demo must demonstrate inspecting the verifier database to prove that ZERO citizen attributes were persisted.
