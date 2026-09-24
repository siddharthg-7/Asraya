# @pramana/registry

Trust registry client, schema repository mediation, and cryptographic trust checkpoint verification.

## Status

`NOT STARTED` (Setup Phase Only)

## Key Responsibilities

- Resolve issuer/verifier DID documents and public keys.
- Check authorisations: Is Issuer X authorized to issue Schema Y? Is Verifier Z authorized to request Predicate W?
- Verify signed registry root checkpoints to support offline verification.
