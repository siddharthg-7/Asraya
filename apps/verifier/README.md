# @pramana/verifier

Verifier Application & Verification Pipeline (Fastify / TypeScript).

## Status

`NOT STARTED` (Setup Phase Only)

## Verification Pipeline (Tier 4)

1. Generate signed Verifier Request Contract with fresh nonce.
2. Ingest proof envelope over ephemeral transport (QR / relay).
3. Validate nonce (anti-replay) and timestamp window.
4. Verify cryptographic proof (Tier A BBS / Tier B Groth16) against registry trust checkpoint.
5. Check context-scoped nullifier for duplicate/double-spend attacks.
6. Commit minimal audit record (verdict, timestamp, signed receipt) — NEVER raw citizen data.
