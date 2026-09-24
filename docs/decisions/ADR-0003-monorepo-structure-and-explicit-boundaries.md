# ADR-0003: Monorepo Structure & Explicit Package Boundaries

## Status

ACCEPTED

## Context

The Pramāṇa protocol encompasses client applications (wallet), server services (verifier, registry), integration services (legacy adapters), shared cryptographic libraries, protocol specifications, schemas, and zero-knowledge circuits. Maintaining separate repositories would create immense synchronization friction, version skew, and schema drift.

## Problem

In a monorepo, developers and AI agents frequently create circular dependencies, leak internal types across packages, or scatter cryptographic operations ad-hoc across frontend and backend code.

## Options Considered

1. **Multi-Repo**: Independent repositories for wallet, verifier, crypto, protocol.
   - _Cons_: Severe synchronization overhead, high barrier to protocol updates, broken PR workflows.
2. **Loosely Typed Monorepo**: Single repository without strict boundaries or package references.
   - _Cons_: Unchecked dependencies, leaky abstractions, cyclic imports.
3. **Pnpm Monorepo with Explicit Workspaces & Strict TypeScript Project References**: A disciplined monorepo using pnpm workspaces, strict TypeScript project references (`tsconfig.base.json`), and explicit package boundaries.
   - _Pros_: Unified versioning, atomic commits, fast incremental builds, compile-time enforcement of package boundaries.

## Decision

Adopt a **pnpm monorepo structure** with strict TypeScript project references (`composite: true`, `strict: true`). All packages must declare explicit dependencies in `package.json` and project references in `tsconfig.json`.

Cryptographic logic is strictly isolated in `@pramana/crypto` and `@pramana/proofs`. Applications (`apps/wallet`, `apps/verifier`) are forbidden from implementing direct ad-hoc cryptographic operations.

## Consequences

- **Positive**: Strict compile-time boundary enforcement, deterministic builds, zero dependency drift.
- **Negative / Trade-offs**: Requires disciplined maintenance of `tsconfig.json` project references across all packages.

## Source / Reference

- Authoritative Pramāṇa Specification, Required Project Structure.
