# PRAMĀṆA — PHASE 5
# CRYPTOGRAPHIC CORE + PROOF SYSTEM
# PERSON 2 — BACKEND / PROTOCOL / CRYPTO ENGINEER

You are continuing the PRAMĀṆA project.

============================================================
CURRENT PROJECT STATUS
============================================================

COMPLETED:

PHASE 0 — Backend Foundation
PHASE 1 — Shared Protocol Contract Lock
PHASE 2 — Trust Registry & Institutional Trust Layer
PHASE 3 — Issuers + Schema Mediation
PHASE 4 — Request → Policy → Consent

All previous phases are merged into main.

Phase 4 established:

Request
    ↓
Validation
    ↓
Trust Registry
    ↓
Policy Authorization
    ↓
Consent Information
    ↓
Citizen Consent

Phase 3 established:

SQL / CAMT.053 / REST
    ↓
Adapters
    ↓
Canonical Attributes
    ↓
Minimal Claim Set

Phase 4 established:

WHO
WHAT
NOT SHARED
    ↓
Citizen Consent

============================================================
I AM PERSON 2
============================================================

My responsibilities:

- Backend
- Protocol
- Trust Registry
- Issuer
- Schema mediation
- Cryptographic integration
- BBS
- Groth16
- Proof systems
- Verifier cryptographic logic

Person 1 owns the frontend.

Do NOT redesign Person 1's frontend.

Only expose stable contracts/APIs that Person 1 can consume.

============================================================
PHASE 5 OBJECTIVE
============================================================

Convert the current:

CANONICAL ATTRIBUTES
        ↓
MOCK / UNSIGNED CLAIM
        ↓
CONSENT

architecture into a real cryptographic credential
and proof system.

The target architecture is:

CANONICAL ATTRIBUTES
        ↓
MINIMAL CLAIM SET
        ↓
BBS CREDENTIAL
        ↓
CITIZEN WALLET
        ↓
BBS SELECTIVE DISCLOSURE
        +
GROTH16 PREDICATE PROOF
        ↓
PROOF ENVELOPE
        ↓
VERIFIER CRYPTOGRAPHIC VERIFICATION

This phase combines:

1. Cryptographic foundation
2. BBS credential issuance
3. Wallet credential abstraction
4. BBS selective disclosure
5. Verifier-specific pseudonym
6. Groth16/Circom predicate proofs
7. Proof envelope integration
8. Issuer verification
9. Cryptographic negative tests

============================================================
SOURCE OF TRUTH
============================================================

Use ONLY:

1. Current PRAMĀṆA Architecture Specification
2. AGENTS.md
3. ARCHITECTURE.md
4. Existing Phase 1 shared contracts
5. Existing Phase 2 Trust Registry
6. Existing Phase 3 Schema Mediation
7. Existing Phase 4 Request → Policy → Consent
8. Existing source code
9. Existing tests
10. Existing dependency strategy

DO NOT use the old Anumati architecture.

DO NOT silently merge old architecture concepts.

DO NOT invent cryptographic protocol behavior.

If the specification, existing contracts, or available cryptographic
library do not support a required operation:

STOP at that point.

Document:

- what is missing
- why it is required
- what is currently supported
- what remains TBD

Do NOT implement unsafe cryptography as a substitute.

============================================================
CRITICAL CRYPTOGRAPHIC RULE
============================================================

DO NOT IMPLEMENT CRYPTOGRAPHY FROM SCRATCH.

Do not implement:

- BBS signature mathematics manually
- elliptic curve arithmetic manually
- pairing operations manually
- Groth16 proving mathematics manually
- custom zero-knowledge proof algorithms
- custom signature algorithms

Use established, audited/maintained libraries compatible with
the project's approved architecture and dependency strategy.

Before adding a cryptographic dependency:

1. Inspect package.json.
2. Inspect existing crypto abstractions.
3. Inspect existing dependency strategy.
4. Check whether a suitable dependency already exists.
5. Prefer a maintained implementation.
6. Document the exact library and version.
7. Document what cryptographic primitive it provides.

Do NOT blindly install random crypto packages.

============================================================
PHASE BOUNDARY
============================================================

THIS PHASE IMPLEMENTS:

- BBS credential issuance
- BBS verification
- selective disclosure
- wallet credential abstraction
- verifier-specific pseudonym
- Groth16/Circom predicate proof
- proof envelope integration
- cryptographic verification
- crypto security tests

THIS PHASE DOES NOT IMPLEMENT:

- QR
- BLE
- Noise
- HPKE
- OHTTP
- final transport layer
- production distributed replay cache
- final verifier database
- full frontend redesign
- final demo UI

Those belong to PHASE 6.

============================================================
STEP 1 — INSPECT BEFORE MODIFYING
============================================================

Inspect:

backend/src/crypto/
backend/src/proofs/
backend/src/issuers/
backend/src/services/
backend/src/registry/
backend/src/adapters/

shared/src/types/
shared/src/schemas/
shared/src/constants/

circuits/
tests/

Inspect existing:

- ProofEnvelope
- MinimalClaimSet
- RequestContract
- ConsentInformation
- IssuerKey
- AttributeDefinition
- VerifierLicence
- TrustCheckpoint
- existing crypto interfaces
- existing proof abstractions

Do NOT create duplicate contracts.

============================================================
STEP 2 — CRYPTOGRAPHIC ARCHITECTURE
============================================================

Create a clean abstraction boundary.

Conceptually:

                    CRYPTO SERVICE
                         │
          ┌──────────────┴──────────────┐
          │                             │
       BBS SERVICE                 GROTH16 SERVICE
          │                             │
          ↓                             ↓
    Credential                    Predicate Proof
    issuance                      generation
    presentation                  verification
    verification                  verification

The rest of the backend must not depend directly on
low-level cryptographic implementation details.

Use interfaces where appropriate.

Example conceptual boundaries:

BbsCredentialService
BbsPresentationService
PredicateProofService

Use existing naming conventions if equivalent abstractions already exist.

============================================================
STEP 3 — BBS IMPLEMENTATION RESEARCH
============================================================

Before coding BBS:

1. Inspect the currently available BBS library.
2. Verify supported operations.
3. Verify supported curve/suite.
4. Verify whether it supports:
   - signing
   - signature verification
   - selective disclosure
   - presentation generation
   - presentation verification
   - pseudonym-related functionality if required
5. Record limitations.

Create:

docs/architecture/cryptography.md

Include:

- selected BBS library
- version
- supported primitives
- supported curve/suite
- API mapping
- limitations
- security assumptions

Do not claim features the library does not actually provide.

============================================================
STEP 4 — BBS ISSUER KEY MATERIAL
============================================================

Implement issuer BBS key abstraction.

Requirements:

- private key must remain issuer-side
- public key may be published through the Trust Registry
- private key must NEVER enter registry records
- private key must NEVER be returned through an API
- private key must NEVER be logged
- synthetic/demo key material only

For development:

use generated local test/demo keys.

Do NOT use real production keys.

Do NOT commit private key material to git.

Use environment/configuration or test fixtures as appropriate.

============================================================
STEP 5 — BBS CREDENTIAL MODEL
============================================================

Replace the Phase 3 mock/unsigned representation with a real
cryptographic credential abstraction.

Current Phase 3 behavior:

isMockUnsigned: true

Phase 5 should introduce a real cryptographic credential.

The credential must be based on the existing MinimalClaimSet.

Do NOT create a second independent claim schema.

Conceptual:

MinimalClaimSet
       ↓
BBS Credential
       ↓
Wallet

Credential must contain:

- issuer identity/reference
- schema
- authorized claims
- BBS signature
- credential metadata required by current architecture

Only include necessary attributes.

============================================================
STEP 6 — MINIMAL CLAIM ENFORCEMENT
============================================================

Before BBS signing:

verify that the claim set contains ONLY authorized claims.

Example request:

disclose:
district

predicate:
trailing_12m_earnings LTE 300000

The credential/presentation flow must NOT accidentally include:

- bank account
- transactions
- address
- vehicle registration
- unrelated institutional fields

Do not trust the caller.

Revalidate claims before signing where necessary.

============================================================
STEP 7 — BBS SIGNING
============================================================

Implement:

Canonical Claims
      ↓
Issuer BBS Sign
      ↓
Signed Credential

The issuer must:

1. Verify issuer authorization.
2. Verify credential schema.
3. Verify canonical attributes.
4. Verify minimal claim set.
5. Sign with issuer private key.
6. Return the credential abstraction.

Never return the issuer private key.

Never expose source data.

Never create a fake signature.

============================================================
STEP 8 — WALLET CREDENTIAL STORAGE
============================================================

Implement the backend/protocol abstraction required by the
citizen wallet.

The MVP wallet may use local/in-memory development storage.

It must support:

- store credential
- retrieve credential
- identify issuer
- identify schema
- identify available claims
- select credential for a request

Do NOT build a production mobile secure enclave.

Do NOT claim production-grade device security.

Document this limitation.

============================================================
STEP 9 — REQUEST → CREDENTIAL MATCHING
============================================================

Given:

RequestContract
+
Consent approved
+
Stored credential

determine whether the wallet has the necessary claims.

Example:

REQUEST:

commercial_permit_status
trailing_12m_earnings <= 300000
district

Credential:

commercial_permit_status
trailing_12m_earnings
district

Result:

MATCH

If a required claim is unavailable:

fail clearly.

Do NOT ask the user for unrelated information.

============================================================
STEP 10 — BBS SELECTIVE DISCLOSURE
============================================================

Implement real selective disclosure.

Example credential:

{
    permit_status,
    earnings,
    district,
    unnecessary_attribute
}

Request:

disclose:

district

Presentation must disclose only:

district

The verifier must NOT receive:

earnings
unnecessary_attribute

unless explicitly required by the request.

============================================================
STEP 11 — PREDICATE-ONLY ATTRIBUTE
============================================================

For attributes used only in predicates:

Example:

trailing_12m_earnings LTE 300000

the actual value MUST NOT be disclosed through the BBS
presentation merely because it is required for proof generation.

The architecture should support:

BBS:

district
permit_status

Groth16:

earnings <= 300000

Verifier learns:

earnings condition = TRUE

but does NOT learn:

earnings = 180000

============================================================
STEP 12 — VERIFIER-SPECIFIC PSEUDONYM
============================================================

Implement the architecture's per-verifier pseudonym concept.

Do NOT create:

globalCitizenId

Do NOT use:

phone number
email
national ID
account number

as the verifier pseudonym.

Conceptual:

Citizen
    │
    ├── Verifier A → nym_A
    │
    └── Verifier B → nym_B

The same citizen should not automatically expose the same
global identifier to every verifier.

Use the BBS implementation's supported mechanism where
available.

If the selected BBS library does NOT support the required
nym mechanism:

DO NOT invent one.

Document the limitation and implement the safest supported
architecture-compatible abstraction.

============================================================
STEP 13 — GROTH16 / CIRCOM
============================================================

Implement the numeric predicate proof system.

Use:

- Circom
- circomlib where appropriate
- snarkjs
- the existing project dependency strategy

Do NOT implement Groth16 mathematics manually.

============================================================
STEP 14 — CIRCUIT SCOPE
============================================================

Do NOT create a general-purpose scripting language.

The current predicate grammar is bounded.

Existing operators:

EQ
LT
LTE
IN

Compound:

AND

Prioritize the numeric predicates required by the current
Pramāṇa scenario.

Primary demonstration:

trailing_12m_earnings LTE 300000

The circuit should prove the condition without revealing
the private earnings value.

============================================================
STEP 15 — PRIVATE / PUBLIC CIRCUIT INPUTS
============================================================

Clearly define:

PRIVATE INPUT:

actual earnings

PUBLIC INPUT:

threshold / authorized predicate context

The verifier must receive only the public inputs required
to verify the proof.

Do NOT accidentally serialize the private witness into:

- proof envelope
- logs
- API response
- test snapshots
- frontend payloads

============================================================
STEP 16 — GROTH16 TRUST SETUP
============================================================

Implement only what is required for the MVP.

Clearly document:

- circuit
- R1CS
- WASM witness generation
- proving key
- verification key
- proof
- public signals

If a ceremony/setup limitation exists:

document it explicitly.

Do not claim a production trusted setup.

For the hackathon MVP, use a clearly documented development
setup if permitted by the architecture.

============================================================
STEP 17 — GROTH16 PROOF FLOW
============================================================

Implement:

private earnings
       +
public threshold
       ↓
witness
       ↓
Groth16 prover
       ↓
proof
       ↓
verifier
       ↓
TRUE / FALSE

Example:

private:
180000

public:
300000

result:

VALID

The verifier must NOT receive 180000.

============================================================
STEP 18 — INVALID PREDICATE TEST
============================================================

Test:

private:
350000

public:
300000

Expected:

proof verification failure / predicate false.

Do not treat an invalid business result as a cryptographic
success.

============================================================
STEP 19 — PROOF ENVELOPE
============================================================

Integrate both cryptographic systems with the existing:

ProofEnvelope

Do NOT create:

BbsEnvelope
Groth16Envelope
CustomProofPacket

unless the existing architecture explicitly requires separate
structures.

Prefer extending the existing abstraction.

The proof envelope must clearly identify:

- protocol version
- credential/presentation context
- issuer
- schema
- verifier/request binding
- BBS presentation
- predicate proof
- required metadata

Do not include private witness data.

============================================================
STEP 20 — REQUEST BINDING
============================================================

The presentation/proof must be bound to the specific request.

Use the existing:

requestId
nonce
purpose
verifier

architecture.

A presentation created for:

Verifier A

must not silently validate as a presentation for:

Verifier B

if the protocol requires verifier binding.

Do not invent a second request identifier.

============================================================
STEP 21 — ISSUER VERIFICATION
============================================================

Verifier must verify:

1. issuer exists
2. issuer is trusted
3. issuer key is registered
4. credential signature is valid
5. credential schema is valid
6. credential is structurally valid
7. requested claims are authorized
8. BBS presentation is valid

Do not trust issuer identity supplied only inside an
unverified payload.

Resolve trust through the registry.

============================================================
STEP 22 — CRYPTOGRAPHIC VERIFIER SERVICE
============================================================

Create a clean service boundary.

Conceptual:

verifyPresentation()

should return structured results such as:

BBS:

VALID / INVALID

Groth16:

VALID / INVALID

Issuer:

TRUSTED / UNTRUSTED

Request binding:

VALID / INVALID

Do not mix cryptographic verification with the final
business decision.

============================================================
STEP 23 — BUSINESS DECISION SEPARATION
============================================================

Maintain this separation:

POLICY AUTHORIZATION
        ≠
CITIZEN CONSENT
        ≠
CRYPTOGRAPHIC VALIDITY
        ≠
BUSINESS ELIGIBILITY

Example:

Policy:
AUTHORIZED

Consent:
APPROVED

BBS:
VALID

Groth16:
VALID

Then later Phase 6 can make the final verifier decision.

Do NOT collapse these states into one boolean.

============================================================
STEP 24 — SECURITY
============================================================

Mandatory security controls:

1. No private keys in source code.
2. No private keys in registry.
3. No private keys in logs.
4. No citizen PII in crypto logs.
5. No raw CAMT data in proof payload.
6. No raw SQL data in proof payload.
7. No raw municipal records in proof payload.
8. No private Groth16 witness in API responses.
9. No fake BBS signatures.
10. No fake Groth16 proofs.
11. Verify issuer keys through registry.
12. Verify credential schema.
13. Verify request binding.
14. Verify verifier binding.
15. Enforce selective disclosure.
16. Prevent unauthorized claim inclusion.
17. Prevent malformed proof envelopes.
18. Reject modified credentials.
19. Reject modified presentations.
20. Reject invalid proofs.

============================================================
STEP 25 — NEGATIVE SECURITY TESTS
============================================================

Create tests for:

BBS:

- modified credential
- modified signature
- invalid issuer
- wrong issuer key
- wrong schema
- missing claim
- unauthorized disclosure
- malformed presentation
- modified presentation

Groth16:

- invalid proof
- modified proof
- modified public input
- wrong threshold
- invalid witness
- malformed proof
- wrong verification key

Binding:

- wrong request ID
- wrong nonce
- wrong verifier
- wrong purpose

Privacy:

- earnings not disclosed
- bank account not disclosed
- transaction history not disclosed
- source schema not disclosed
- private witness not disclosed

============================================================
STEP 26 — INTEGRATION TEST
============================================================

Create one complete cryptographic test using the existing
synthetic subsidy scenario.

Use synthetic Bob:

permit:
ACTIVE

earnings:
180000

district:
authorized district

Request:

commercial permit
+
earnings LTE 300000
+
district

Flow:

Synthetic sources
       ↓
Phase 3 adapters
       ↓
Canonical attributes
       ↓
Minimal Claim Set
       ↓
BBS credential
       ↓
Wallet
       ↓
Phase 4 consent
       ↓
BBS presentation
       +
Groth16 earnings proof
       ↓
Cryptographic verifier
       ↓
VALID

Verify that:

- district can be disclosed
- permit status can be disclosed if requested
- exact earnings are NOT disclosed
- bank information is NOT disclosed
- raw source data is NOT disclosed
- proof verifies successfully

============================================================
STEP 27 — NEGATIVE INTEGRATION TESTS
============================================================

Test:

Scenario 1:
earnings = 350000
threshold = 300000
→ proof fails / condition false

Scenario 2:
tampered BBS credential
→ rejected

Scenario 3:
tampered Groth16 proof
→ rejected

Scenario 4:
wrong verifier
→ rejected

Scenario 5:
wrong request nonce
→ rejected

Scenario 6:
unauthorized attribute disclosure
→ rejected

Scenario 7:
missing credential claim
→ rejected

============================================================
STEP 28 — PERFORMANCE
============================================================

Measure, do not invent:

- BBS signing time
- BBS presentation generation time
- BBS verification time
- Groth16 witness generation time
- Groth16 proving time
- Groth16 verification time
- payload sizes

Do NOT optimize prematurely.

Record results in:

docs/architecture/cryptography.md

This is a hackathon MVP.

Prefer correctness and reproducibility over premature
micro-optimization.

============================================================
STEP 29 — DOCUMENTATION
============================================================

Create/update:

docs/architecture/cryptography.md

Document:

1. Cryptographic architecture
2. BBS implementation
3. BBS library/version
4. Issuer keys
5. Credential structure
6. Selective disclosure
7. Verifier pseudonym
8. Groth16 architecture
9. Circom circuits
10. Private/public inputs
11. Trusted setup limitations
12. Proof envelope
13. Request binding
14. Security assumptions
15. Performance measurements
16. Known limitations
17. Future production hardening

Clearly label every item:

IMPLEMENTED
MOCK
NOT IMPLEMENTED
TBD

============================================================
STEP 30 — UPDATE EXISTING DOCUMENTATION
============================================================

Update:

ARCHITECTURE.md
SECURITY.md
THREAT_MODEL.md
PROJECT_STATUS.md

Only update sections actually affected by Phase 5.

Do not rewrite historical Phase 1/2/3/4 documentation.

Do not modify phase documentation merely for formatting.

============================================================
STEP 31 — PERSON 1 INTEGRATION
============================================================

Person 1 should receive stable interfaces for:

- credential availability
- presentation creation request
- presentation result
- proof envelope
- cryptographic verification result

Person 1 should NOT import:

- BBS library internals
- Circom internals
- snarkjs internals
- issuer private keys
- crypto implementation details

Frontend should consume protocol-level contracts only.

============================================================
STEP 32 — DO NOT IMPLEMENT PHASE 6
============================================================

STOP before implementing:

- QR
- BLE
- HPKE
- Noise
- OHTTP
- final transport
- distributed replay cache
- final verifier DB
- Wire Inspector final UI
- final demo UI
- offline transport
- final security demonstration

These belong to PHASE 6.

============================================================
ANTI-HALLUCINATION RULE
============================================================

For every cryptographic feature ask:

"Does the current PRAMĀṆA specification explicitly require this?"

If YES:

implement using a suitable established primitive/library.

If NO:

do not invent it.

For every library ask:

"Does this library actually provide this operation?"

If YES:

use it.

If NO:

do not fake the operation.

Document the limitation.

NEVER implement a cryptographic placeholder that looks like
real security.

============================================================
VALIDATION
============================================================

Run all existing tests:

pnpm test

pnpm run typecheck

pnpm run format:check

pnpm run lint

pnpm run build

Then:

pnpm --filter @pramana/shared build

pnpm --filter @pramana/backend build

pnpm --filter @pramana/frontend build

Also run all circuit/proof-specific tests.

ALL previous Phase 1–4 tests MUST continue passing.

No regression is acceptable.

============================================================
GIT
============================================================

Start from a clean main.

Create:

feature/crypto-proof-core

Do NOT work directly on main.

Do NOT rewrite Phase 1–4 commits.

Do NOT commit automatically.

Before finishing:

git status
git diff --stat
git log -n 5 --oneline

Verify no private keys or secret material are tracked.

Search the repository for:

PRIVATE KEY
PRIVATE_KEY
SECRET
MNEMONIC
SEED

and inspect any results.

============================================================
FINAL REPORT
============================================================

Return exactly:

# PHASE 5 STATUS REPORT

## 1. Cryptographic architecture

## 2. BBS library selected

## 3. BBS implementation status

## 4. Issuer key management

## 5. BBS credential model

## 6. Minimal claim enforcement

## 7. Wallet credential abstraction

## 8. BBS selective disclosure

## 9. Verifier-specific pseudonym

## 10. Groth16/Circom implementation

## 11. Circuit scope

## 12. Private/public inputs

## 13. Trusted setup

## 14. Proof Envelope integration

## 15. Request binding

## 16. Issuer verification

## 17. Cryptographic verifier

## 18. Security controls

## 19. Negative security tests

## 20. End-to-end cryptographic test

## 21. Performance measurements

## 22. Documentation

## 23. Person 1 integration instructions

## 24. Specification gaps/TBD

## 25. Things intentionally NOT implemented

## 26. Test results

## 27. Git status

## 28. Files changed

## 29. Dependencies added/changed

## 30. Cryptographic limitations

============================================================
FINAL STOP CONDITION
============================================================

STOP after Phase 5.

DO NOT start Phase 6.

Do not implement transport.

Do not implement QR.

Do not implement Noise.

Do not implement HPKE.

Do not implement final demo UI.

Do not commit automatically.

The expected Phase 5 milestone is:

CANONICAL ATTRIBUTES
        ↓
MINIMAL CLAIM SET
        ↓
REAL BBS CREDENTIAL
        ↓
WALLET
        ↓
SELECTIVE DISCLOSURE
        +
GROTH16 PREDICATE PROOF
        ↓
PROOF ENVELOPE
        ↓
CRYPTOGRAPHIC VERIFICATION

The final demonstration target is:

BBS:
"Here is the authorized district/permit claim."

Groth16:
"The hidden earnings value satisfies
the authorized threshold."

Verifier:
"Both proofs are cryptographically valid."

The verifier must NOT learn the hidden earnings value.