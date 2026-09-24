You are the lead software architect and senior full-stack engineer for the PRAMĀṆA project.

Your job in this phase is to establish a clean, production-quality, hackathon-ready full-stack foundation for PRAMĀṆA.

IMPORTANT:
This is NOT a normal CRUD website.

PRAMĀṆA is a privacy-preserving, consent-based data exchange protocol where a verifier asks trusted data sources for a specific fact/predicate and the citizen receives/provides a privacy-preserving proof rather than sharing the underlying document or full personal record.

The current architecture is BBS-FIRST with Groth16 as a fallback.

==================================================

1. SOURCE OF TRUTH
   \==================================================

The provided PRAMĀṆA architecture specification is the primary source of truth.

Do NOT invent requirements.

Do NOT silently change the architecture.

Do NOT replace the protocol with a normal document-upload / document-verification system.

Do NOT claim that a cryptographic feature exists unless it is actually implemented and tested.

If something is unclear or missing from the specification:

    UNVERIFIED — DO NOT IMPLEMENT UNTIL CONFIRMED

If you need to make an engineering assumption:

1. Document the assumption.
2. Put it in DECISIONS.md.
3. Clearly mark it as an implementation decision rather than a protocol requirement.

Current architectural direction:

    BBS-FIRST
    Groth16 FALLBACK

The earlier "Anumati" architecture must NOT be silently merged with or substituted for the current PRAMĀṆA architecture.

================================================== 2. PRIMARY GOAL OF THIS PHASE
==================================================

This phase is ONLY about:

- project structure
- frontend/backend separation
- shared contracts
- domain foundations
- development configuration
- AI-agent instructions
- documentation
- validation
- testing foundation
- security foundation

DO NOT build the complete application yet.

DO NOT build the complete UI.

DO NOT implement real BBS cryptography yet.

DO NOT implement Groth16 circuits yet.

DO NOT implement production issuer integrations yet.

DO NOT build the complete verifier.

DO NOT build the complete citizen wallet.

We are establishing a strong foundation first.

================================================== 3. REQUIRED PROJECT STRUCTURE
==================================================

Use a simple and understandable full-stack architecture.

DO NOT use the previously proposed deeply fragmented:

    apps/
    packages/
    services/

architecture.

Instead use:

pramana/
│
├── frontend/
│ ├── public/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── features/
│ │ │ ├── wallet/
│ │ │ ├── consent/
│ │ │ ├── verification/
│ │ │ └── receipts/
│ │ ├── hooks/
│ │ ├── services/
│ │ ├── lib/
│ │ ├── types/
│ │ ├── assets/
│ │ ├── App.tsx
│ │ └── main.tsx
│ ├── package.json
│ └── README.md
│
├── backend/
│ ├── src/
│ │ ├── config/
│ │ ├── routes/
│ │ ├── controllers/
│ │ ├── services/
│ │ ├── domain/
│ │ ├── protocol/
│ │ ├── crypto/
│ │ ├── proofs/
│ │ ├── registry/
│ │ ├── issuers/
│ │ ├── adapters/
│ │ ├── transport/
│ │ ├── middleware/
│ │ ├── validation/
│ │ ├── database/
│ │ ├── utils/
│ │ └── server.ts
│ ├── tests/
│ ├── package.json
│ └── README.md
│
├── shared/
│ ├── types/
│ ├── schemas/
│ ├── constants/
│ └── package.json
│
├── circuits/
│ ├── src/
│ ├── build/
│ └── README.md
│
├── mock-data/
│ ├── transport/
│ ├── bank/
│ └── civil-registry/
│
├── docs/
│ ├── architecture/
│ ├── protocol/
│ ├── schemas/
│ ├── security/
│ ├── threat-model/
│ ├── decisions/
│ └── demo/
│
├── skills/
│ ├── architecture/
│ ├── protocol/
│ ├── cryptography/
│ ├── zk-proofs/
│ ├── security/
│ ├── interoperability/
│ ├── frontend/
│ ├── backend/
│ ├── testing/
│ └── documentation/
│
├── tests/
│ ├── unit/
│ ├── integration/
│ ├── security/
│ └── conformance/
│
├── scripts/
│
├── .github/
│ └── workflows/
│
├── AGENTS.md
├── README.md
├── ARCHITECTURE.md
├── SECURITY.md
├── THREAT_MODEL.md
├── PROJECT_STATUS.md
├── DECISIONS.md
├── CONTRIBUTING.md
├── .env.example
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json

================================================== 4. FRONTEND ARCHITECTURE
==================================================

The frontend is the user-facing web application.

Technology direction:

- React
- Vite
- TypeScript

The frontend will eventually contain:

1. Citizen Wallet
2. Consent UI
3. Proof-generation flow
4. QR/offline interaction
5. Verification result
6. Receipt/history
7. Verifier dashboard
8. Wire Inspector for demonstration
9. Registry/log visualization where appropriate

However, DO NOT implement all of these now.

For this phase only establish:

frontend/
components/
pages/
features/
hooks/
services/
lib/
types/

Create appropriate architectural boundaries.

Frontend must NOT contain:

- database logic
- issuer secrets
- private backend keys
- server-only cryptographic secrets
- direct database access
- fake cryptographic verification

Frontend communicates with backend through explicit contracts.

================================================== 5. BACKEND ARCHITECTURE
==================================================

The backend is the core server-side infrastructure.

Technology direction:

- Node.js
- TypeScript
- Fastify

Keep backend modules clearly separated.

backend/src/

    config/
        Environment configuration

    routes/
        HTTP route definitions

    controllers/
        Request/response orchestration

    services/
        Application-level business services

    domain/
        Core domain models and logic

    protocol/
        PRAMĀṆA protocol contracts and processing

    crypto/
        Cryptographic interfaces and future implementations

    proofs/
        BBS/Groth16 proof abstractions

    registry/
        Trust/schema registry functionality

    issuers/
        Mock issuer integrations

    adapters/
        Legacy/modern source adapters

    transport/
        QR/HPKE/transport abstractions

    middleware/
        HTTP middleware

    validation/
        Input and protocol validation

    database/
        Persistence abstraction

    utils/
        Small reusable utilities

    server.ts
        Application entry point

IMPORTANT:

Do not turn the backend into a generic:

    users/
    documents/
    upload/
    verify-document/

system.

The backend must reflect the PRAMĀṆA protocol.

================================================== 6. SHARED PACKAGE
==================================================

The frontend and backend must share canonical contracts through:

shared/

This prevents frontend/backend contract drift.

Shared code should eventually contain:

shared/
├── types/
│ ├── attributes.ts
│ ├── predicates.ts
│ ├── request-contract.ts
│ ├── credentials.ts
│ ├── proofs.ts
│ ├── consent.ts
│ ├── receipts.ts
│ └── registry.ts
│
├── schemas/
│ ├── request-contract.schema.ts
│ ├── predicate.schema.ts
│ ├── credential.schema.ts
│ ├── proof.schema.ts
│ └── receipt.schema.ts
│
└── constants/
├── protocol-version.ts
└── errors.ts

Shared types must represent the protocol, not UI-specific assumptions.

================================================== 7. CORE DOMAIN CONCEPTS
==================================================

Establish canonical models/interfaces for:

- Citizen
- Wallet
- Issuer
- Verifier
- AttributeDefinition
- Credential
- Predicate
- RequestContract
- Consent
- Proof
- Nullifier
- Receipt
- RegistryRecord
- TrustCheckpoint
- AdapterManifest
- BridgeDefinition
- VerifierLicence
- IssuerRecord
- TemplateBundle

Do NOT implement more concepts simply because they seem useful.

================================================== 8. PREDICATE MODEL
==================================================

PRAMĀṆA uses a bounded predicate grammar.

Represent predicates conceptually as:

    attr {lt, lte, eq, in≤8} constant

Multiple predicates are joined using:

    AND

Do NOT introduce arbitrary user-defined executable expressions.

Do NOT create a general-purpose expression language.

Examples:

    income < 300000

    domicile == "HYDERABAD"

    category IN ["A", "B"]

These are conceptual examples.

The implementation must follow the actual protocol specification.

================================================== 9. REQUEST CONTRACT
==================================================

Create a strongly typed RequestContract abstraction.

It should conceptually support:

- verifier
- purpose
- context
- predicates
- reveal requirements
- retention
- nonce
- expiry
- verifier ephemeral key
- verifier licence proof

Do not invent additional mandatory fields.

The RequestContract must eventually become the central object connecting:

    Verifier
        ↓
    Registry
        ↓
    Citizen Wallet
        ↓
    Issuers
        ↓
    Proof
        ↓
    Verification

================================================== 10. CONSENT MODEL
==================================================

Consent must be treated as a first-class protocol concept.

The architecture must support consent being bound to:

- request
- verifier
- purpose
- predicates
- context
- presentation/template
- citizen authorization
- timestamp

Do not implement a meaningless:

    "I agree"

checkbox and call that protocol consent.

The eventual UX must allow a citizen to understand what is being requested.

================================================== 11. CRYPTOGRAPHY BOUNDARY
==================================================

Create interfaces/abstractions for:

- hashing
- signatures
- key handling
- BBS credentials
- BBS presentations
- Groth16 proofs
- verification

But DO NOT fake implementations.

NEVER write code such as:

    return true

for cryptographic verification.

NEVER create:

    fakeProof = "valid-proof"

and treat it as a real proof.

If cryptographic libraries are not yet selected or verified:

    throw/return an explicit NOT_IMPLEMENTED / UNVERIFIED state

rather than pretending the feature works.

Current architecture:

    BBS = primary path
    Groth16 = fallback

Do not reverse this order.

================================================== 12. REGISTRY FOUNDATION
==================================================

Establish models/interfaces for:

- AttributeDefinition
- IssuerRecord
- VerifierLicence
- AdapterManifest
- BridgeDefinition
- TemplateBundle
- TrustCheckpoint

The registry must NOT become a citizen database.

Do not store citizen personal data in the registry.

================================================== 13. INTEROPERABILITY FOUNDATION
==================================================

The architecture must support adapters for different source systems.

Examples from the specification include:

- legacy SQL transport data
- ISO 20022 bank data
- municipal REST data

Adapters should map source-specific fields into canonical PRAMĀṆA attributes.

Conceptually:

    Source System
         ↓
      Adapter
         ↓
    Canonical Attribute
         ↓
      Protocol
         ↓
    Predicate / Proof

Do not hard-code the entire system to one database schema.

================================================== 14. DATABASE RULE
==================================================

Do not introduce a large database schema during this phase.

The protocol explicitly emphasizes minimal verifier-side storage and registry separation from citizen data.

Create database interfaces/abstractions where needed.

Do not invent production persistence requirements.

Use synthetic/mock data only.

================================================== 15. TRANSPORT FOUNDATION
==================================================

Create interfaces for future:

- online transport
- QR/offline transport
- HPKE
- Noise
- optional OHTTP

Do NOT pretend these are implemented.

Create clear interfaces and TODO/TBD documentation where implementation has not started.

================================================== 16. SERIALIZATION
==================================================

Create serialization boundaries.

The eventual protocol uses deterministic CBOR/canonical encoding.

Do not replace protocol serialization with arbitrary JSON everywhere.

During foundation work:

- define serialization interfaces
- define versioning
- define validation boundaries

Only implement actual CBOR behavior when the required library/specification has been verified.

================================================== 17. VERSIONING
==================================================

Introduce explicit protocol versioning.

Example:

    PRAMĀṆA protocol v0.x

Do not silently change protocol contracts.

Breaking changes must be documented in:

    DECISIONS.md

and:

    PROJECT_STATUS.md

================================================== 18. ERROR HANDLING
==================================================

Create structured errors.

Examples:

    INVALID_REQUEST
    INVALID_PREDICATE
    INVALID_CONSENT
    REGISTRY_LOOKUP_FAILED
    LICENCE_INVALID
    ATTRIBUTE_NOT_SUPPORTED
    PROOF_NOT_SUPPORTED
    PROOF_VERIFICATION_FAILED
    CREDENTIAL_INVALID
    EXPIRED_REQUEST
    REPLAY_DETECTED
    NOT_IMPLEMENTED
    UNVERIFIED_FEATURE

Do not expose sensitive internal information to users.

================================================== 19. TESTING FOUNDATION
==================================================

Set up:

- unit testing
- integration testing
- security testing
- protocol conformance testing

Create synthetic fixtures for:

- attributes
- predicates
- requests
- credentials
- registry records
- receipts

Tests must verify contracts and invariants.

Do not create fake tests that merely assert:

    expect(true).toBe(true)

================================================== 20. SECURITY FOUNDATION
==================================================

Review the project for:

- secret handling
- input validation
- replay attacks
- credential misuse
- nullifier misuse
- request expiry
- verifier licence validation
- consent binding
- data minimization
- logging of sensitive data
- accidental PII persistence

Never commit secrets.

Create:

    .env.example

but never put real secrets in it.

================================================== 21. AI AGENT SAFETY
==================================================

Create/update:

    AGENTS.md

This file must instruct future AI coding agents:

1. Read the PRAMĀṆA specification first.
2. Read ARCHITECTURE.md.
3. Read PROJECT_STATUS.md.
4. Read DECISIONS.md.
5. Never invent protocol requirements.
6. Never fake cryptographic functionality.
7. Never silently change architecture.
8. Never claim an unimplemented feature works.
9. Never introduce unnecessary dependencies.
10. Never store citizen data unless explicitly required.
11. Prefer small, testable changes.
12. Update documentation when architecture changes.
13. Mark uncertain features as UNVERIFIED.
14. Run tests before claiming completion.
15. Never delete working functionality without explicit approval.

================================================== 22. SKILLS
==================================================

Create project-specific AI skills/instructions for:

skills/
├── architecture/
├── protocol/
├── cryptography/
├── zk-proofs/
├── security/
├── interoperability/
├── frontend/
├── backend/
├── testing/
└── documentation/

Each skill should contain practical rules for an AI coding agent.

Example:

skills/cryptography/

    Rules for:
    - never inventing cryptographic behavior
    - library verification
    - key handling
    - signature validation
    - proof verification
    - security assumptions

skills/frontend/

    Rules for:
    - protocol-driven UI
    - accessibility
    - consent UX
    - no fake verification states
    - no sensitive data leakage

skills/backend/

    Rules for:
    - API contracts
    - validation
    - security
    - domain separation
    - error handling
    - logging

================================================== 23. DOCUMENTATION
==================================================

Create/update:

README.md

ARCHITECTURE.md

SECURITY.md

THREAT_MODEL.md

PROJECT_STATUS.md

DECISIONS.md

CONTRIBUTING.md

Also create documentation under:

docs/

The documentation must clearly distinguish:

    IMPLEMENTED
    PARTIALLY IMPLEMENTED
    PLANNED
    UNVERIFIED
    NOT IMPLEMENTED

Never describe planned functionality as implemented.

================================================== 24. ROOT DEVELOPMENT EXPERIENCE
==================================================

The project should be easy for a developer to run.

The intended development workflow should eventually be:

    pnpm install

    pnpm dev

with frontend and backend starting through the root workspace.

Also provide separate commands conceptually for:

    frontend development
    backend development
    tests
    lint
    typecheck
    build

Do not over-engineer the tooling.

================================================== 25. DEPENDENCY RULE
==================================================

Before adding a dependency:

1. Determine why it is needed.
2. Check whether an existing dependency can perform the task.
3. Check whether the dependency is compatible with the project.
4. Document security-sensitive dependencies.
5. Do not add libraries merely because they are popular.

For cryptography and ZK libraries, dependency selection must be explicitly reviewed.

================================================== 26. GIT / REPOSITORY HYGIENE
==================================================

Create/update:

.gitignore

Do not commit:

- node_modules
- .env
- private keys
- generated secrets
- build artifacts
- personal data
- real citizen records

Use only synthetic data for the hackathon prototype.

================================================== 27. PHASE BOUNDARY
==================================================

THIS PHASE MUST NOT IMPLEMENT:

- complete wallet
- complete verifier dashboard
- real BBS issuance
- real BBS presentation
- real Groth16 circuit
- production issuer integration
- real government database integration
- production registry
- complete HPKE transport
- complete Noise transport
- production authentication system
- production deployment

Those will happen in later phases.

================================================== 28. EXPECTED RESULT
==================================================

At the end of this phase, the repository must have:

✓ Clean frontend/backend separation

✓ React + Vite frontend foundation

✓ Node.js + Fastify backend foundation

✓ Shared protocol types

✓ Domain models

✓ RequestContract model

✓ Predicate model

✓ Consent model

✓ Registry model foundation

✓ Credential abstraction

✓ Proof abstraction

✓ Receipt abstraction

✓ Crypto abstraction

✓ Adapter abstraction

✓ Transport abstraction

✓ Validation foundation

✓ Testing foundation

✓ Security foundation

✓ Documentation

✓ AI-agent instructions

✓ Skills

✓ Environment configuration

✓ Git hygiene

✓ Clear TODO/TBD boundaries

================================================== 29. VALIDATION
==================================================

Before finishing:

Run, where applicable:

    install
    typecheck
    lint
    tests
    build

Fix structural errors.

Do NOT hide errors.

Do NOT weaken TypeScript settings just to make the project compile.

Do NOT remove tests to make CI pass.

Do NOT replace failing cryptographic logic with placeholders that appear successful.

================================================== 30. FINAL REPORT
==================================================

When finished, provide a concise report containing:

1. Files/folders created
2. Frontend architecture
3. Backend architecture
4. Shared contracts created
5. Security foundations
6. Testing foundations
7. Skills created
8. Documentation created
9. Dependencies added
10. Commands that were successfully tested
11. Known limitations
12. UNVERIFIED/TBD items

Then STOP.

Do not continue automatically into implementation of the next phase.

==================================================
FINAL PRINCIPLE
==================================================

PRAMĀṆA must remain:

    protocol-first
    privacy-first
    consent-driven
    interoperable
    cryptographically honest
    modular
    testable
    understandable

The codebase should be simple enough for a student hackathon team to understand while preserving the core architecture required by PRAMĀṆA.

DO NOT over-engineer.

DO NOT simplify away the important privacy/protocol architecture.

DO NOT hallucinate functionality.

BUILD THE FOUNDATION ONLY.
THEN STOP.
