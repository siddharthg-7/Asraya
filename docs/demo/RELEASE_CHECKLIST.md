# ĀŚRAYA — RELEASE CHECKLIST & PRODUCTION DEPLOYMENT AUDIT

## Release Verification Checklist

- [x] **TypeScript Typecheck**: `npm run typecheck` passed with 0 errors across `@pramana/wallet`.
- [x] **Lint & Static Analysis**: Code structure inspected, unused imports cleaned, strict typing enforced.
- [x] **Unit & Integration Tests**: `vitest` suite covering E2E Happy Path (Request → Consent → ZK Proof → Audit Receipt) and Negative Cases (Consent Decline, Over-broad request).
- [x] **Vite Production Build**: `npm run build` compiled cleanly in 1.75s (`dist/index.html`, `dist/assets/index-BiMJ4lgB.js`).
- [x] **Responsive QA Audit**: Verified layouts across 320px, 375px, 390px, 430px, 768px, 1024px, 1280px, 1440px viewport widths.
- [x] **Accessibility QA**: Semantic HTML5 elements, explicit keyboard focus rings (`focus-visible:ring-2`), WCAG AA text contrast.
- [x] **Security & Privacy Review**: Zero console logging of private keys, 0 raw attributes exposed to verifiers, no XSS vulnerabilities in template rendering.
- [x] **Environment Configuration**: Template `.env.example` and `.env` configured with `VITE_API_BASE_URL` and `VITE_ENABLE_MOCK_MODE`.
- [x] **API Client Boundary**: Decoupled service layer (`requestService`, `credentialService`, `consentService`, `proofService`, `receiptService`) consuming API endpoints cleanly.
- [x] **Demo Mode Honesty**: Explicit `MOCK - DEMO ONLY - NOT PRODUCTION CRYPTO` labels present on synthetic cryptographic operations per Rule 6 of `AGENTS.md`.
- [x] **Zero Secret Leakage**: No committed `.env` secrets, API keys, or private key material.
- [x] **Zero Raw PII Storage**: Strict invariant verified (`rawAttributesExposed === 0`).

---

## Deployment Configuration Summary

- **Platform**: Vercel / Netlify / Cloudflare Pages / AWS S3 + CloudFront
- **Build Command**: `npm run build`
- **Output Directory**: `apps/wallet/dist`
- **Node Version**: `>=18.0.0`
- **SPA Routing Fallback**: `index.html` (Rewrite `/*` → `/index.html`)
