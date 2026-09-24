# PRAMĀṆA — PHASE 1

# SHARED PROTOCOL CONTRACT LOCK

# PERSON 2 — BACKEND / PROTOCOL / CRYPTO

You are continuing the Pramāṇa project after the Backend Foundation phase.

I am PERSON 2.

My responsibilities:

- Backend
- Protocol
- Trust Registry
- Issuers
- Adapters
- Cryptographic integration
- Proof systems
- Verifier pipeline

Person 1 owns:

- React frontend
- Citizen wallet UI
- Consent UI
- QR UI
- Verification UI
- Wire Inspector UI

============================================================
IMPORTANT: THIS IS NOT A GREENFIELD PHASE
============================================================

The previous foundation phase has ALREADY created:

- shared package
- RequestContract
- ProofEnvelope
- protocol versioning
- Zod validation
- backend request route
- backend verification route
- registry route
- protocol builder
- predicate evaluator
- crypto interfaces
- proof interfaces
- verifier storage interface
- nonce/replay infrastructure

DO NOT recreate these from scratch.

First inspect the existing implementation.

Your task is to AUDIT, CORRECT, COMPLETE, and LOCK the shared protocol contracts.

============================================================
SOURCE OF TRUTH
============================================================

Use the current Pramāṇa Architecture Specification as the authoritative source.

Do NOT use the older Anumati architecture.

Do NOT silently merge concepts from Anumati into Pramāṇa.

If the current specification does not define something:

DO NOT INVENT IT.

Mark it:

TBD / NOT SPECIFIED

============================================================
CORE ARCHITECTURE
============================================================

Pramāṇa follows:

"Don't share the data. Share the proof."

The system moves the question to where data lives and returns only the minimum proof/answer required by the verifier.

Cryptographic hierarchy:

BBS-FIRST
↓
Groth16 fallback for arbitrary numeric predicates

Do not change this architecture.

============================================================
FIRST TASK — INSPECT BEFORE MODIFYING
============================================================

Before writing code, inspect:

shared/
backend/src/protocol/
backend/src/validation/
backend/src/domain/
backend/src/proofs/
backend/src/crypto/
backend/tests/

Also inspect:

AGENTS.md
docs/architecture/
ARCHITECTURE.md
PROJECT_STATUS.md
DECISIONS.md

Create a short internal assessment of:

1. Existing shared contracts
2. Existing backend-only contracts
3. Existing duplicated contracts
4. Specification mismatches
5. Unsupported fields
6. Fields that were invented
7. Validation gaps
8. Contracts Person 1 needs
9. Contracts that should NOT be exposed to frontend

DO NOT immediately modify code.

============================================================
CRITICAL PREDICATE RULE
============================================================

The current Pramāṇa specification defines the bounded predicate grammar as:

attr {lt,lte,eq,in≤8} constant

Predicates are joined using AND.

Therefore the shared protocol MUST NOT expose unsupported operators such as:

NEQ
GT
GTE

unless the current authoritative Pramāṇa specification explicitly supports them.

The existing implementation contains:

EQ
NEQ
GT
GTE
LT
LTE
IN

AUDIT THIS.

If NEQ, GT, and GTE are not supported by the current specification:

REMOVE them from the protocol-level predicate contract.

Do not merely hide them from the UI.

Backend validation must reject them.

Tests must prove they are rejected.

============================================================
SHARED CONTRACTS TO AUDIT
============================================================

Audit and formalize the following concepts ONLY where supported by the specification:

1. Protocol version
2. RequestContract
3. Predicate
4. Disclosure request
5. Verifier identity
6. Verifier licence reference
7. Purpose
8. Context
9. Nonce
10. Expiry
11. Registry references
12. Consent information
13. ProofEnvelope
14. Verification request
15. Verification result
16. Receipt
17. Structured protocol errors

Do not create additional protocol concepts merely because they are convenient.

============================================================
REQUEST CONTRACT
============================================================

Verify that RequestContract correctly represents the bounded verifier request.

It must support the concepts specified by Pramāṇa:

- verifier
- licence
- purpose
- context
- predicates
- disclose
- nonce
- expiry

Do not add arbitrary fields.

Do not allow unrestricted query languages.

Do not allow arbitrary JavaScript expressions.

Do not allow arbitrary boolean expression trees.

Do not allow OR unless explicitly supported by the specification.

============================================================
PREDICATE VALIDATION
============================================================

The validator must distinguish:

VALID
INVALID OPERATOR
INVALID ATTRIBUTE
INVALID CONSTANT
INVALID STRUCTURE

For IN:

respect the specification's maximum set size of 8.

Reject larger sets.

Predicates must be joined using AND.

Create tests for:

VALID:
eq
lt
lte
in with 1 item
in with 8 items

INVALID:
neq
gt
gte
in with more than 8 items
malformed predicate
unknown attribute
missing constant
missing attribute
unsupported expression
OR expression

============================================================
DISCLOSURE CONTRACT
============================================================

Audit how disclosure is represented.

The verifier must request only registry-defined canonical attributes.

The frontend must be able to use the contract to explain:

WHAT is requested.

Do not put source-specific database fields into the frontend contract.

Example:

GOOD:

trailing12MonthEarnings

BAD:

bank_statement.transaction[17].amount

The source-specific mapping belongs behind the adapter boundary.

============================================================
CONSENT CONTRACT
============================================================

The backend should provide the structured information required by the frontend consent experience.

The frontend owns presentation.

The backend owns protocol data and policy validation.

The contract should support the conceptual consent information:

WHO
WHAT
NOT SHARED

Do not build UI in this phase.

============================================================
PROOF ENVELOPE
============================================================

Audit ProofEnvelope.

It must be treated as a protocol envelope, NOT as proof of security by itself.

Do not claim that a placeholder proof is cryptographically valid.

The current BBS and Groth16 implementations are explicitly NOT IMPLEMENTED.

Preserve this behavior.

Do not replace NOT_IMPLEMENTED with:

return true

Do not create fake cryptographic proofs.

============================================================
VERIFICATION RESULT
============================================================

Audit the verification result contract.

It must return only the minimum result required by the verifier.

Do not return raw citizen attributes unnecessarily.

Do not return:

income value
bank statement
permit document
domicile record

unless explicitly required by the authoritative specification.

============================================================
RECEIPT
============================================================

Audit the receipt structure against the current specification.

Do not add unnecessary personally identifying information.

The verifier-side persistence must remain minimal.

The existing foundation states that verifier storage contains:

sessionId
requestId
timestamp
verdict
receiptHash

Verify this against the authoritative specification before locking it.

If there is a discrepancy, document it instead of silently choosing.

============================================================
FRONTEND/BACKEND CONTRACT BOUNDARY
============================================================

Person 1 must be able to import shared contracts.

The architecture must become:

                 shared/
                    │
          ┌─────────┴─────────┐
          ↓                   ↓
      FRONTEND             BACKEND
      Person 1             Person 2

Frontend must NOT duplicate:

RequestContract
Predicate
ProofEnvelope
VerificationResult
Receipt

Backend must NOT define frontend-specific copies.

If duplicate types exist:

remove duplication and make shared the canonical source.

============================================================
SECURITY BOUNDARY
============================================================

Shared contracts must NEVER contain:

- private keys
- secret key material
- database credentials
- server secrets
- raw institutional credentials
- unnecessary citizen records

Do not put cryptographic secrets in shared/.

============================================================
TYPE SAFETY
============================================================

Use strict TypeScript.

Runtime validation must exist at trust boundaries.

Compile-time types alone are NOT sufficient.

Zod may be used because the foundation already uses it.

Do not introduce another validation framework unless there is a documented reason.

============================================================
TESTING
============================================================

Create or update tests for every corrected contract.

Minimum tests:

1. Valid RequestContract
2. Missing verifier
3. Missing purpose
4. Missing nonce
5. Invalid expiry
6. Unknown attribute
7. Unsupported predicate operator
8. Invalid IN predicate
9. IN with exactly 8 values
10. IN with 9 values
11. OR rejection
12. Malformed disclosure
13. Invalid ProofEnvelope
14. Invalid verification result
15. Contract serialization/deserialization
16. Frontend import compatibility

Also ensure existing tests continue to pass.

============================================================
DO NOT IMPLEMENT YET
============================================================

This phase MUST NOT implement:

- real BBS
- real Groth16
- Circom circuits
- issuer signing
- credential issuance
- wallet cryptography
- Noise
- HPKE
- QR transport implementation
- persistent production database
- institutional database connections

Those belong to later phases.

============================================================
DOCUMENTATION
============================================================

Update:

shared/README.md

and, if appropriate:

docs/protocol/

Document:

1. Contract name
2. Purpose
3. Producer
4. Consumer
5. Required fields
6. Optional fields
7. Validation rules
8. Security sensitivity
9. Persistence rules
10. Current implementation status

Clearly mark:

IMPLEMENTED
NOT IMPLEMENTED
TBD

Do not claim protocol guarantees that have not been implemented.

============================================================
PERSON 1 INTEGRATION NOTE
============================================================

Create/update documentation explaining to Person 1:

How to import shared contracts.

Example:

import {
RequestContract,
Predicate,
ProofEnvelope,
VerificationResult
} from "@pramana/shared";

Document which contracts are safe for frontend use.

Document which backend internals must never be imported into frontend.

============================================================
ANTI-HALLUCINATION RULE
============================================================

At every point ask:

"Is this explicitly supported by the current Pramāṇa specification?"

If YES:
implement/document it.

If NO:
do not invent it.

If uncertain:
mark TBD and stop that part.

Do not use generic SSI/ZKP terminology to silently add features.

============================================================
FINAL VALIDATION
============================================================

Before finishing:

1. Run typecheck.
2. Run all tests.
3. Run backend tests.
4. Run shared package tests.
5. Run build.
6. Confirm frontend can resolve @pramana/shared.
7. Search for duplicate protocol type definitions.
8. Search for unsupported predicate operators.
9. Confirm no cryptographic placeholder returns success.
10. Confirm no private keys/secrets were introduced.

============================================================
GIT SAFETY
============================================================

Do not modify unrelated frontend functionality.

Do not modify Person 1's work unless absolutely required for shared-contract integration.

Do not change project architecture without documenting an ADR.

Do not delete working functionality without explaining why.

============================================================
FINAL REPORT
============================================================

At the end report:

PHASE 1 STATUS

1. Contracts audited
2. Contracts created
3. Contracts modified
4. Specification mismatches found
5. Predicate changes
6. Validation rules
7. Tests added/modified
8. Files changed
9. Dependencies changed
10. Person 1 integration instructions
11. Remaining TODOs
12. Anything intentionally NOT implemented

Most importantly:

Clearly list anything you found in the existing Phase 0 implementation that did NOT match the Pramāṇa specification.

Then STOP.

DO NOT START PHASE 2.
