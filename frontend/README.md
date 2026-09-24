# Pramāṇa Frontend Application

The user-facing web application for the Pramāṇa protocol built on React, Vite, and TypeScript.

## Status

`PHASE 1 FOUNDATION COMPLETE` (Clean architecture established with component/feature/page boundaries).

## Architecture Highlights

- **Citizen Wallet**: Non-custodial local key management interface.
- **Template-Bound Consent**: Renders consent prompts from canonical registry templates to prevent phishing.
- **Verifier Portal**: Formulates bounded request contracts.
- **Explicit Protocol Boundaries**: Consumes typed contracts from `@pramana/shared` and communicates with backend via `apiClient`.

## Scripts

```bash
# Typecheck
pnpm run typecheck

# Build for production
pnpm run build

# Start dev server
pnpm run dev
```
