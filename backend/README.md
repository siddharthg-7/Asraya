# Pramāṇa Backend Service

The core server-side infrastructure for the Pramāṇa protocol built on Node.js, Fastify, and TypeScript.

## Status

`PHASE 1 FOUNDATION COMPLETE` (Core architecture, contracts, pipeline, and routes established).

## Architecture Highlights

- **Fastify HTTP Pipeline**: Request Contract generation, Verification Pipeline, and Trust Registry.
- **Minimal Verifier Storage**: Strict in-memory abstraction ensuring zero citizen attributes are stored.
- **Protocol Boundary**: Strongly typed contracts adhering to `@pramana/shared`.
- **Anti-Hallucination Guardrails**: Cryptographic verification explicitly throws `NOT_IMPLEMENTED` rather than faking proofs.

## Scripts

```bash
# Typecheck
pnpm run typecheck

# Build
pnpm run build

# Start dev server
pnpm run dev
```
