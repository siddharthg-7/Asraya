# Contributing to Pramāṇa

Thank you for contributing to Pramāṇa. This project enforces rigorous engineering standards, strict cryptographic boundaries, and anti-hallucination rules.

---

## 1. Golden Rules for Contributors

1. **Read AGENTS.md First**: Every contributor (human or AI agent) must read and comply with [AGENTS.md](file:///c:/project-self-1/pramana/AGENTS.md).
2. **Move the Question, Not the Data**: Never design or implement a flow where citizen PII is transmitted to or stored by the verifier when a mathematical proof can answer the question.
3. **Strict TypeScript**: Do not use `any`, implicit any, or unsafe type casts. Enforce `"strict": true`.
4. **No Secrets in Git**: Never commit `.env` files, private keys, seed phrases, or test secrets.
5. **No Fake Crypto in Production**: Mock cryptographic modules are strictly confined to `@pramana/test-fixtures` or `services/issuer-mocks` and must be clearly labeled `MOCK - DEMO ONLY - NOT PRODUCTION CRYPTO`.

---

## 2. Definition of Done (DoD)

Before any Pull Request is submitted or merged, verify that all 11 conditions are met:

- [ ] **1. Code Exists**: Implementation is fully written in the appropriate package.
- [ ] **2. Types Are Correct**: `pnpm run typecheck` (`tsc -b`) exits with code 0.
- [ ] **3. Input Validation Exists**: External boundaries validate input against schemas.
- [ ] **4. Unit Tests Exist**: Deterministic unit tests pass.
- [ ] **5. Negative Tests Exist**: Malformed, expired, or invalid inputs are rejected.
- [ ] **6. Security Documented**: Threat analysis performed and documented.
- [ ] **7. Architecture Docs Updated**: Relevant docs in `/docs` updated.
- [ ] **8. No Unsupported Claims**: No claims of compliance or benchmarks without physical proof.
- [ ] **9. No Secrets Committed**: Git status is clean of private keys and credentials.
- [ ] **10. CI Passes**: `pnpm run typecheck`, `pnpm run lint`, and `pnpm test` succeed.
- [ ] **11. Specification Traceability**: Matches Pramāṇa specification or an approved ADR.

---

## 3. Local Development Commands

```bash
# Install workspace dependencies
pnpm install

# Typecheck workspace with project references
pnpm run typecheck

# Lint workspace files
pnpm run lint

# Check code formatting
pnpm run format:check

# Run test suites
pnpm test

# Run specific test quadrant
pnpm run test:unit
pnpm run test:integration
pnpm run test:security
pnpm run test:conformance
```

---

## 4. Git Commit & Branching Hygiene

- Branch naming: `feat/<feature-name>`, `fix/<bug-name>`, `docs/<doc-name>`, `sec/<security-update>`.
- Commit messages: Use Conventional Commits (`feat(crypto): add bbs signature wrapper`, `fix(transport): correct nonce expiry calculation`).
- Never force push to `main`.
