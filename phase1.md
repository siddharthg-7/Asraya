You are working as PERSON 2 on the Pramāṇa project.

ROLE:
Backend + Protocol + Cryptography + Proof Systems Engineer.

IMPORTANT:
You are NOT responsible for the frontend.

SOURCE OF TRUTH:
The authoritative project specification is the current Pramāṇa architecture/specification document provided in this project.

Do not use the older Anumati architecture as the source of truth.

The current Pramāṇa architecture is:

BBS-FIRST
Groth16 is the fallback for arbitrary numeric predicates.

CORE PRINCIPLE:

"Don't share the data. Share the proof."

The verifier should receive only the minimum information/proof required to answer a bounded request, not the underlying citizen records.

YOUR CURRENT TASK:

Set up the backend engineering foundation only.

DO NOT implement the complete application yet.

DO NOT implement:

- real BBS cryptography
- real Groth16 circuits
- production cryptography
- complete transport
- complete issuer system
- complete verifier
- UI
- document upload system
- generic CRUD APIs

First establish a clean backend architecture that can later support those components.

PROJECT STRUCTURE:

backend/
├── src/
│ ├── config/
│ ├── routes/
│ ├── controllers/
│ ├── services/
│ ├── domain/
│ ├── protocol/
│ ├── crypto/
│ ├── proofs/
│ ├── registry/
│ ├── issuers/
│ ├── adapters/
│ ├── transport/
│ ├── middleware/
│ ├── validation/
│ ├── database/
│ ├── utils/
│ └── server.ts
├── tests/
└── package.json

shared/
├── types/
├── schemas/
├── constants/
└── package.json

circuits/
├── src/
├── build/
└── README.md

REQUIREMENTS:

1. Create the backend package.
2. Configure TypeScript.
3. Configure Fastify.
4. Configure linting/formatting if the repository already uses them.
5. Configure testing.
6. Create environment configuration.
7. Create a health-check endpoint.
8. Create clean module boundaries.
9. Create placeholder interfaces where appropriate.
10. Create README documentation.
11. Make sure backend can start successfully.
12. Make sure backend tests can run.
13. Make sure frontend and backend can later consume shared contracts.

SECURITY RULE:

Do not place private keys, secrets, cryptographic material, or citizen data in source code.

Do not create fake security claims.

If something is not implemented, clearly mark it as NOT IMPLEMENTED rather than pretending it works.

DO NOT add unnecessary libraries.

Before installing a dependency, explain why it is needed.

At the end provide:

1. Files created
2. Files modified
3. Dependencies added
4. Commands to run
5. Architecture decisions
6. Things intentionally NOT implemented
7. Known TODOs
8. How Person 1 can consume the backend later

Then STOP.

Do not continue into Phase 1.
