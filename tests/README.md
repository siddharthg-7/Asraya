# Pramāṇa Testing Infrastructure & Standards

This directory contains test suites across four foundational testing quadrants for the Pramāṇa protocol and monorepo workspace.

## Testing Quadrants

1. **Unit Tests (`tests/unit/` or `<package>/src/**/*.test.ts`)**
   - Scope: Individual functions, parsers, schema validators, serializer logic, and cryptographic wrapper abstractions.
   - Requirement: 100% deterministic, no network calls, fast execution (< 2 seconds total).
   - Naming Convention: `*.unit.test.ts` or `*.test.ts`.

2. **Integration Tests (`tests/integration/`)**
   - Scope: Multi-package flows (e.g., Request Contract -> Consent -> Proof Orchestration -> Verification Pipeline).
   - Mocking: Uses synthetic fixtures from `@pramana/test-fixtures` clearly marked `MOCK — DEMO ONLY`.
   - Naming Convention: `*.integration.test.ts`.

3. **Security Tests (`tests/security/`)**
   - Scope: Vulnerability checks, replay attack simulations, expired nonce rejections, malicious attribute injection, forged signature detection, nullifier collisions, and sensitive attribute leakage in logs.
   - Naming Convention: `*.security.test.ts`.

4. **Protocol / Conformance Tests (`tests/conformance/`)**
   - Scope: Compliance with the authoritative Pramāṇa specification and standard RFCs (BBS signatures, CBOR serialization, HPKE envelope standards).
   - Naming Convention: `*.conformance.test.ts`.

## Execution Commands

```bash
# Run all tests
pnpm test

# Run specific quadrants
pnpm run test:unit
pnpm run test:integration
pnpm run test:security
pnpm run test:conformance
```

## Coverage & Quality Gates

Before any PR or feature is merged:

1. All unit, integration, security, and conformance tests must pass with zero failures.
2. Every external interface must include negative/malformed input tests.
3. Every cryptographic operation must include RFC test vectors and invalid signature/proof rejection tests.
4. No test may introduce live secrets or external network dependencies.
