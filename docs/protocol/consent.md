# Pramāṇa Bounded Consent Protocol & Verifiable Receipts

## 1. The Bounded Consent Paradigm

Consent within Pramāṇa is fundamentally distinct from the checkbox paradigm of traditional web applications.

> **Consent is an immutable, bounded, cryptographic contract—never a generic boolean.**

---

## 2. The 10 Essential Bindings of Consent

Every consent transaction executed by the Pramāṇa wallet MUST bind all ten of the following parameters:

1. **Who is Asking**: The authenticated, verified identity (`verifier_did`) of the requesting party.
2. **Why**: The specific, immutable regulatory purpose (`purpose_code`).
3. **What is Being Evaluated**: The exact mathematical predicates (e.g. `age >= 18`).
4. **Permitted Disclosures**: Any specific attributes explicitly approved for selective disclosure.
5. **Context & Scope**: The campaign or transaction scope (`context_id`), preventing cross-service correlation.
6. **Temporal Expiration**: The precise timestamp (`expires_at`) when the grant expires.
7. **Replay Nonce**: The one-time cryptographic challenge (`nonce`) preventing replay.
8. **Retention Constraints**: Legal and contractual retention boundaries (e.g. `RETENTION_IMMEDIATE_DISCARD`).
9. **Template Semantics**: The cryptographic hash of the canonical template (`template_hash`) used to render the prompt.
10. **Citizen Signature**: The digital signature of the citizen's holder key sealing the consent receipt.

---

## 3. Template-Driven Consent Rendering

To protect citizens against phishing, dark patterns, and deceptive prompts, wallets are **strictly forbidden** from rendering arbitrary HTML, markdown, or unstructured strings supplied directly by the verifier.

### Consent Rendering Sequence

1. Verifier submits `purpose_code: "PURPOSE_AGE_VERIFICATION"` and predicate `age >= 18`.
2. Wallet queries the local cache / Trust Registry for the registered template corresponding to `PURPOSE_AGE_VERIFICATION` in the citizen's preferred locale (e.g. `en-US`, `hi-IN`).
3. The trusted template defines the standardized user-facing prompt:
   > _"{{verifier_name}} is requesting to verify that you are at least 18 years old for the purpose of age-restricted entry. Your date of birth, name, and address will NOT be shared."_
4. The wallet interpolates only verified, authenticated fields into the template.
5. Citizen reviews the unambiguous, standardized dialog and provides biometric/passcode authorization.

---

## 4. Verifiable Consent Receipts

Upon authorization, the wallet issues a **Verifiable Consent Receipt**:

```json
{
  "$schema": "https://pramana.org/schemas/v1/consent-receipt.json",
  "receipt_id": "urn:uuid:8b7a6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d",
  "contract_id": "urn:uuid:f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "verifier_did": "did:pramana:verifier:fintech-corp-01",
  "holder_binding_fingerprint": "c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2",
  "purpose_code": "PURPOSE_LENDING_CREDIT_CHECK",
  "template_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "timestamp": "2026-09-24T12:00:15Z",
  "signature": {
    "type": "HolderBindingSignature2020",
    "signature_value": "..."
  }
}
```

Both the citizen wallet and the verifier retain a copy of this receipt. It provides irrefutable evidence of the citizen's affirmative consent for dispute resolution, regulatory compliance, and audit defense.
