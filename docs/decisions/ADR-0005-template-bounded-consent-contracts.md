# ADR-0005: Template-Bounded Non-Custodial Consent Contracts

## Status

ACCEPTED

## Context

In most digital consent architectures, "consent" is reduced to a generic boolean checkbox ("I agree to the Terms of Service"). Alternatively, verifiers provide arbitrary text or HTML prompts that a wallet renders to the user.

## Problem

Generic checkboxes provide no legal or cryptographic boundary. Unvalidated verifier text enables phishing, spoofing, and dark patterns where a verifier describes one action while cryptographically requesting sensitive claims.

## Options Considered

1. **Generic Boolean Consent**: Simple true/false acknowledgement.
   - _Cons_: Legally fragile, cryptographically unbound, subject to coercion.
2. **Verifier-Supplied Freeform Text**: Wallet renders text string supplied in verifier request.
   - _Cons_: High phishing vulnerability; malicious verifiers can mislead citizens.
3. **Template-Bounded Cryptographic Consent Contract**: The request contract contains machine-readable parameters (`verifier_did`, `purpose`, `predicates`, `expiry`, `nonce`). The wallet resolves canonical localized templates from the Trust Registry and renders the prompt using verified parameters.

## Decision

Adopt **Template-Bounded Consent Contracts** implemented in `@pramana/consent`.

### Architectural Invariants:

1. Consent is a **bounded cryptographic contract**, binding:
   - Who is asking (`verifier_did`)
   - Why (`purpose`)
   - What is being requested (`predicates`, `attributes`)
   - Context & domain scope
   - Expiry timestamp & nonce
   - Permitted retention constraints
2. Wallets render prompts **strictly from canonical registry templates**, never from arbitrary verifier text.
3. Upon citizen authorization, the wallet issues a signed **Consent Receipt** capturing the exact agreed contract.

## Consequences

- **Positive**: Eliminates phishing and deceptive UI prompts, ensures non-repudiation and auditable proof of consent.
- **Negative / Trade-offs**: Schema registry must maintain canonical localization templates for standard purpose codes.

## Source / Reference

- Authoritative Pramāṇa Specification, Consent Rule (Section 16).
