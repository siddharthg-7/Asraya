---
name: frontend-review
description: Evaluates client wallet application, template-driven consent rendering, non-custodial key safety, and UX clarity.
---

# Frontend Review Skill

## Purpose

Ensures that the citizen wallet frontend (`apps/wallet`) operates strictly non-custodially, renders consent prompts solely from canonical templates, provides clear privacy guarantees, and safeguards private keys.

## When to use

- Designing, implementing, or reviewing code in `apps/wallet`.
- Reviewing consent prompt UI components and QR scanning workflows.
- Auditing local storage, IndexedDB, or Secure Enclave key handling on the frontend.

## Allowed responsibilities

- Ensure that consent prompts display who is asking, what is asked, why, and validity bounds.
- Verify that consent descriptions are generated from trusted registry templates rather than unvalidated verifier text.
- Audit local key storage for non-custodial compliance (e.g. WebCrypto, subtle crypto, IndexedDB encryption).
- Validate responsive, accessible UI components and progressive web app (PWA) offline capabilities.

## Forbidden responsibilities

- Transmitting citizen private keys or raw unblinded credentials to any external server.
- Allowing arbitrary verifier-supplied HTML/text to be rendered as an unverified consent prompt.
- Implementing silent proof generation without citizen authorization.

## Required checks

1. Does the wallet render consent from trusted registry templates?
2. Are private keys generated client-side and never exported or backed up unencrypted?
3. Does the wallet verify the verifier's identity against the trust registry before prompting the citizen?
4. Are proof generation steps responsive and non-blocking for the UI thread?
5. Does the application operate reliably in offline/air-gapped QR mode?

## Expected outputs

- Frontend security and key containment audit report.
- Consent UX template rendering verification.
- Offline and PWA capability evaluation.

## Security constraints

- No citizen credentials or private keys may ever be logged, sent over analytics, or persisted in unencrypted storage.
- Strict CSP (Content Security Policy) prohibiting unauthorized script execution.

## Source-of-truth rules

Follow priority: (1) Pramāṇa Specification, (2) `docs/protocol/consent.md`, (3) `apps/wallet/README.md`.
