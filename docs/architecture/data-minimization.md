# Data Minimization & The Minimal Verifier-Side Storage Model

## 1. Principles of Data Minimization

The Pramāṇa protocol mandates data minimization at every layer of the architecture. Traditional systems capture maximum information "just in case." Pramāṇa enforces the opposite:

> **If the verifier does not strictly require an attribute to satisfy the immediate verification question, that attribute MUST NEVER be transmitted, processed, or persisted.**

---

## 2. Rejecting the "Zero Storage" Myth

In privacy engineering, marketing materials frequently claim "zero storage." Pramāṇa explicitly rejects this terminology as misleading and unworkable:

- **Why "Zero Storage" is Infeasible in the Real World**:
  - **Legal & Regulatory Compliance**: Regulated verifiers (banks, government agencies, age-restricted businesses) must be able to prove to auditors and courts that an applicant was verified before a service or benefit was granted.
  - **Replay Attack Defense**: A verifier must temporarily record used nonces or request identifiers; otherwise, an adversary can replay the same proof envelope indefinitely.
  - **Double-Claim / Double-Spend Protection**: In welfare distributions, voting, or one-time promotional grants, a verifier must track whether a credential has already been redeemed within a given epoch.

- **The Pramāṇa Standard**: **Minimal Verifier-Side Storage**.
  Verifiers record only the mathematical evidence that a valid verification event occurred, accompanied by unlinkable anti-replay artifacts, while storing ZERO citizen Personally Identifiable Information (PII).

---

## 3. The Verifier Data Model Specification

Before proposing or implementing any field in a verifier database, developers and AI agents must ask:

> **"Does the verifier absolutely need this value to prove compliance or prevent fraud?"**  
> If the answer is not an unequivocal yes: **DO NOT STORE IT.**

### Permitted Fields in Verifier Storage

| Field Name          | Type             | Purpose                                               | Privacy Impact                                      |
| :------------------ | :--------------- | :---------------------------------------------------- | :-------------------------------------------------- |
| `session_id`        | UUIDv4           | Unique identifier for the ephemeral transaction       | Non-identifying random token                        |
| `verifier_did`      | DID String       | Authenticated identity of the verifier endpoint       | Public institutional identifier                     |
| `purpose_code`      | String           | Regulatory purpose code declared in the contract      | Public policy tag (e.g. `PURPOSE_AGE_VERIFICATION`) |
| `timestamp`         | UTC ISO8601      | Time at which the proof was verified                  | Standard event timestamp                            |
| `verdict`           | Enum             | Result: `VERIFIED` or `REJECTED`                      | Single boolean/enum outcome                         |
| `nullifier_hash`    | Hex String (32B) | Context-scoped nullifier for duplicate detection      | Unlinkable outside this specific campaign           |
| `nonce`             | Hex String (32B) | Ephemeral challenge (retained only until TTL expires) | Ephemeral, purged on schedule                       |
| `receipt_signature` | Base64 String    | Cryptographic signature of the verification receipt   | Non-repudiable audit artifact                       |

### Strictly Prohibited Fields in Verifier Storage

- **Citizen Name, Full Legal Name, Aliases**
- **Date of Birth, Age Integer, Birth Year**
- **National Identification Numbers, Social Security Numbers, Passport Numbers**
- **Residential Address, Postal Code, GPS Coordinates**
- **Financial Balances, Account Numbers, Salary Integers**
- **Biometric Templates, Raw Facial Photographs, Fingerprint Hashes**
- **Full Credential Envelopes or Unblinded Attribute Signatures**

---

## 4. Verification Pipeline Audit Receipts

Upon successful verification, the verifier pipeline generates an **Audit Receipt** that binds:
$$ \text{Receipt} = \text{Sign}_{\text{verifier}}(\text{session\_id} \parallel \text{purpose\_code} \parallel \text{timestamp} \parallel \text{verdict} \parallel \text{nullifier\_hash}) $$

This receipt proves to regulatory authorities that the verifier verified eligibility according to law, without ever holding a single piece of the citizen's personal data.
