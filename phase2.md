# PRAMĀṆA — PHASE 3
# ISSUERS + SCHEMA MEDIATION
# PERSON 2 — BACKEND / PROTOCOL ENGINEER

You are continuing the Pramāṇa project.

COMPLETED:

PHASE 0 — Backend Foundation
PHASE 1 — Shared Protocol Contract Lock
PHASE 2 — Trust Registry & Institution Trust Layer

I am PERSON 2.

My responsibilities:
- Backend
- Protocol
- Issuer integration
- Schema mediation
- Adapters
- Cryptography later
- Proof systems later
- Verifier pipeline later

Person 1 owns the frontend.

============================================================
SOURCE OF TRUTH
============================================================

Use only:

1. Current Pramāṇa Architecture Specification
2. AGENTS.md
3. Existing protocol documentation
4. Existing Phase 1 shared contracts
5. Existing Phase 2 trust registry

Do NOT use the old Anumati architecture.

Do NOT invent unsupported protocol behavior.

Do NOT implement cryptography in this phase.

============================================================
PHASE 3 OBJECTIVE
============================================================

Implement the SOURCE → ADAPTER → CANONICAL ATTRIBUTE
schema-mediation layer.

The purpose is to prove that heterogeneous institutional
data can be translated into the canonical attribute model
without exposing source-specific schemas to the verifier.

The architecture is:

SOURCE DATA
    ↓
SOURCE ADAPTER
    ↓
CANONICAL ATTRIBUTE
    ↓
ISSUER CLAIM SERVICE
    ↓
MINIMAL CLAIM SET

============================================================
CRITICAL PRIVACY RULE
============================================================

The verifier must NOT need to understand:

- SQL column names
- CAMT.053 XML paths
- REST response fields
- institutional database schemas

The verifier works only with canonical attributes.

Example:

BAD:

transport_permits.status

GOOD:

urn:pramana:attr:permit:status

BAD:

BkToCstmrStmt.Stmt.Bal.Amt

GOOD:

urn:pramana:attr:fin:trailing_12m_earnings

The source-specific mapping remains inside the adapter layer.

============================================================
DO NOT IMPLEMENT YET
============================================================

Do NOT implement:

- BBS+
- BLS12-381
- Groth16
- Circom circuits
- wallet private keys
- QR transport
- Noise
- HPKE
- production institutional connections
- production bank APIs
- production SQL databases
- real citizen data

Use synthetic fixtures only.

============================================================
STEP 1 — INSPECT EXISTING IMPLEMENTATION
============================================================

Before modifying code inspect:

backend/src/adapters/
backend/src/issuers/
backend/src/registry/
shared/src/types/
shared/src/schemas/
mock-data/

Also inspect the Phase 2 registry records for:

Bridge
AdapterManifest
AttributeDef
IssuerKey

Do not create duplicate interfaces if existing ones are usable.

Document any mismatch before modifying it.

============================================================
STEP 2 — SOURCE INTERFACES
============================================================

Create or refine source interfaces for the three source types
described by the Pramāṇa scenario:

1. Legacy transport SQL
2. Bank ISO 20022 CAMT.053
3. Municipal REST

These are MOCK/SYNTHETIC sources.

The source interface should represent the source system,
not the canonical protocol.

Do not expose source-specific records to the verifier.

============================================================
STEP 3 — SYNTHETIC FIXTURES
============================================================

Create synthetic fixtures representing the scenario.

Use fictional citizen identifiers.

Do NOT use real personal information.

The main demo subject can be represented by a synthetic ID.

Create enough fixture data to test:

1. valid commercial permit
2. invalid/inactive commercial permit
3. earnings below threshold
4. earnings above threshold
5. valid domicile/district
6. different district

Do not add unnecessary personal attributes.

============================================================
STEP 4 — TRANSPORT SQL ADAPTER
============================================================

Implement the legacy transport source adapter.

Source:

synthetic relational/SQL-like record

Target canonical attributes:

commercial permit status
and any other transport attribute explicitly required by
the current scenario/specification.

The adapter must:

- validate input
- resolve the correct bridge
- transform source data
- output canonical attributes
- reject malformed records

Do NOT expose raw SQL records outside the adapter boundary.

TEST:

valid record
invalid status
missing status
unknown source field
invalid bridge
canonical output

============================================================
STEP 5 — CAMT.053 ADAPTER
============================================================

Implement the synthetic ISO 20022 CAMT.053 adapter.

Use the existing Phase 2 bridge metadata.

The Phase 2 registry contains a mapping for:

bridge:bank:camt053-to-trailing12m

with:

BkToCstmrStmt.Stmt.Bal.Amt
→
urn:pramana:attr:fin:trailing_12m_earnings

and the documented transformation rule.

Implement ONLY the transformation supported by the
current architecture.

Do not invent a complete banking statement parser if the
current MVP does not require it.

If a real XML parser is needed by the current implementation,
use the project's approved dependency strategy.

Otherwise keep the source fixture representation minimal.

TEST:

valid synthetic statement
invalid statement
missing amount
invalid numeric value
transformation result
threshold-related values

IMPORTANT:

The adapter may calculate/derive the canonical value.

But do not expose the raw bank statement to the verifier.

============================================================
STEP 6 — MUNICIPAL REST ADAPTER
============================================================

Implement a synthetic REST source adapter.

The source represents municipal information needed by the
current scenario.

Convert the source response into canonical attributes.

Validate:

- HTTP/source response shape
- required fields
- canonical mapping
- invalid/missing values

Do not connect to an actual municipal service.

============================================================
STEP 7 — ADAPTER REGISTRY RESOLUTION
============================================================

Adapters must NOT hard-code arbitrary mappings when the
registry already defines the mapping.

Use:

AdapterManifest
+
BridgeDefinition

to resolve the appropriate transformation metadata.

Conceptual flow:

attribute requested
        ↓
registry
        ↓
adapter manifest
        ↓
bridge
        ↓
source adapter
        ↓
canonical attribute

If the required registry entry does not exist:

FAIL.

Do not silently create a mapping.

============================================================
STEP 8 — CANONICAL ATTRIBUTE OUTPUT
============================================================

The adapter output must use the Phase 1/2 canonical attribute
contracts.

Do not create a new parallel canonical attribute system.

Every output attribute must:

- have a registered canonical identifier
- have a validated value
- be traceable to the adapter/bridge internally
- avoid unnecessary citizen information

Example conceptual output:

{
  attributeId:
    "urn:pramana:attr:fin:trailing_12m_earnings",

  value:
    <synthetic numeric value>
}

The exact shape MUST follow the existing shared contracts.

Do not invent another representation if one already exists.

============================================================
STEP 9 — ISSUER SERVICE
============================================================

Implement a mock issuer service.

The issuer's responsibility is:

source/canonical attributes
        ↓
minimal claim set
        ↓
credential issuance abstraction

IMPORTANT:

Real BBS signing is NOT implemented in Phase 3.

Therefore:

DO NOT create fake BBS signatures.

DO NOT return a value pretending to be cryptographically
signed.

Create an issuer abstraction that can later connect to
the BBS implementation.

For now the issuer may produce a clearly marked
UNSIGNED / MOCK claim representation where the existing
architecture permits it.

It must never be confused with a valid cryptographic
credential.

============================================================
STEP 10 — MINIMAL CLAIM SET
============================================================

The issuer should produce only attributes necessary for
the verifier request.

Do not issue every source field.

Example:

If the verifier asks:

commercial_permit_status
LT/LTE earnings condition
district

do not return:

bank account number
transaction history
full address
phone number
full source record

The source may contain more information than the claim set.

The issuer output must be minimized.

============================================================
STEP 11 — SOURCE / CANONICAL SEPARATION
============================================================

Add tests proving:

source schema ≠ canonical schema.

The verifier-facing layer must never receive:

SQL field names
CAMT.053 paths
REST source fields

It should only receive canonical attributes/claims.

============================================================
STEP 12 — ERROR MODEL
============================================================

Use the existing Pramāṇa error model.

Do not invent arbitrary error formats.

Differentiate where appropriate:

SOURCE_INVALID
SOURCE_MISSING_FIELD
ADAPTER_NOT_FOUND
BRIDGE_NOT_FOUND
ATTRIBUTE_NOT_SUPPORTED
TRANSFORMATION_FAILED
ISSUER_NOT_FOUND
CLAIM_GENERATION_FAILED

If an error code does not already exist:

inspect the existing error architecture first.

Add only what is justified.

============================================================
STEP 13 — SECURITY
============================================================

Security requirements:

1. Synthetic data only.
2. No production credentials.
3. No private keys.
4. No citizen PII.
5. No raw source data in verifier logs.
6. No raw source records returned by verifier APIs.
7. Validate all adapter input.
8. Validate canonical output.
9. Do not trust source fields blindly.
10. Do not silently coerce malformed values.

Do not claim cryptographic protection yet.

============================================================
STEP 14 — TESTING
============================================================

Create comprehensive tests.

Minimum categories:

SOURCE TESTS
- valid transport source
- invalid transport source
- valid CAMT fixture
- invalid CAMT fixture
- valid municipal response
- invalid municipal response

ADAPTER TESTS
- correct mapping
- missing source field
- malformed source field
- invalid bridge
- unsupported attribute
- transformation failure

CANONICAL TESTS
- valid canonical output
- unknown canonical attribute
- invalid value type

ISSUER TESTS
- valid minimal claim set
- unnecessary source attributes excluded
- unknown issuer
- missing canonical attribute
- mock/unsigned credential clearly identified

PRIVACY TESTS
- raw source record not returned
- bank statement not returned
- source-specific fields not exposed to verifier
- unnecessary attributes excluded

INTEGRATION TESTS
transport source
→ adapter
→ canonical attribute

bank source
→ adapter
→ canonical earnings

municipal source
→ adapter
→ canonical attribute

============================================================
STEP 15 — REQUEST INTEGRATION
============================================================

Do NOT yet implement full proof verification.

However, ensure that a validated RequestContract can identify
which canonical attributes are needed.

Conceptual flow:

RequestContract
      ↓
canonical attributes
      ↓
registry
      ↓
adapter
      ↓
source
      ↓
canonical values
      ↓
minimal claim set

The actual proof/presentation layer comes later.

============================================================
STEP 16 — DOCUMENTATION
============================================================

Create:

docs/architecture/schema-mediation.md

Document:

1. Source systems
2. Source interfaces
3. Adapter architecture
4. Bridge resolution
5. Canonical attributes
6. Transformation rules
7. Issuer boundary
8. Data minimization
9. Synthetic fixture policy
10. Security assumptions
11. Current limitations
12. Future cryptographic integration

Clearly mark:

IMPLEMENTED
MOCK
NOT IMPLEMENTED
TBD

============================================================
PERSON 1 INTEGRATION
============================================================

Do not require Person 1 to understand adapter internals.

Person 1 only consumes:

- RequestContract
- ConsentSummary
- ProofEnvelope
- VerificationRequest
- VerificationResult
- Receipt
- registry metadata where required

Person 1 must NOT import:

SQL adapter
CAMT parser
REST adapter
issuer implementation
database implementation

============================================================
ANTI-HALLUCINATION RULE
============================================================

Do not implement features merely because they are common in
identity systems.

For every transformation ask:

"Is this mapping explicitly defined by the Pramāṇa specification
or existing Phase 2 registry metadata?"

If YES:
implement.

If NO:
mark TBD.

Do not invent institutional APIs.

Do not connect to real government/bank systems.

============================================================
VALIDATION
============================================================

Run:

pnpm test

pnpm run typecheck

pnpm run format:check

pnpm run build

pnpm --filter @pramana/frontend build

pnpm --filter @pramana/backend build

pnpm --filter @pramana/shared build

All existing Phase 1 and Phase 2 tests must continue passing.

============================================================
GIT
============================================================

Use:

feature/schema-mediation

Do NOT commit directly to main.

Do NOT rewrite Phase 1 or Phase 2 history.

Do NOT modify unrelated frontend code.

At the end show:

git status
git diff --stat

Do not commit automatically.

============================================================
FINAL REPORT
============================================================

Return:

# PHASE 3 STATUS REPORT

1. Source interfaces
2. Synthetic fixtures
3. Transport SQL adapter
4. CAMT.053 adapter
5. Municipal REST adapter
6. Bridge resolution
7. Adapter manifest resolution
8. Canonical attribute output
9. Mock issuer service
10. Minimal claim set
11. Error handling
12. Security controls
13. Tests
14. Test results
15. Documentation
16. Person 1 integration instructions
17. Specification gaps/TBD
18. Things intentionally NOT implemented
19. Git status
20. Files changed

IMPORTANT:

Do NOT start Phase 4.

STOP after Phase 3.