---
name: backend-review
description: Audits Fastify verifier and registry services, minimal storage compliance, pipeline efficiency, and audit logging.
---

# Backend Review Skill

## Purpose

Guarantees that verifier and registry backend services (`apps/verifier`, `apps/registry`) enforce minimal verifier-side storage, resist replay and collision attacks, and strictly prevent citizen attribute retention.

## When to use

- Developing, modifying, or reviewing backend routes, verifier pipelines, or database schemas.
- Configuring server middleware, telemetry, audit logs, or error handlers.
- Benchmarking backend proof verification latency and concurrent request throughput.

## Allowed responsibilities

- Verify that the verifier pipeline strictly enforces the Tier 4 sequence: Request -> Ingest -> Nonce Check -> Proof Verify -> Nullifier Check -> Verdict -> Audit Receipt.
- Audit database schemas to confirm that ONLY minimal verifier-side state is persisted (e.g., session ID, verdict, timestamp, audit hash).
- Ensure that audit logs record verification decisions without storing raw citizen data.
- Verify Fastify route validation schemas and rate-limiting middleware.

## Forbidden responsibilities

- Adding citizen attribute columns (name, birthdate, balance, etc.) to verifier database models.
- Logging raw proof inputs, unblinded attributes, or citizen personal identifiable information (PII).
- Permitting re-use of nonces or skipping nullifier duplicate checks.

## Required checks

1. Does the verifier database schema persist ONLY minimal required state?
2. Are raw citizen attributes strictly excluded from all database tables, caches, and logs?
3. Is nonce freshness verified against the ephemeral window?
4. Are audit receipts cryptographically signed and non-repudiable?
5. Are Fastify endpoints defended against DoS and malformed payload injection?

## Expected outputs

- Verifier data model storage audit report confirming zero extraneous PII.
- Nonce and replay defense verification checklist.
- Backend pipeline latency and throughput benchmarks.

## Security constraints

- Strict data minimization: "Move the Question, Not the Data".
- Verifier databases must never become honeypots of citizen identities.

## Source-of-truth rules

Follow priority: (1) Pramāṇa Specification, (2) `docs/architecture/data-minimization.md`, (3) `apps/verifier/README.md`.
