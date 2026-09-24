# @pramana/crypto

Cryptographic abstraction layer and primitives boundary for the Pramāṇa protocol.

## Status

`NOT STARTED` (Setup Phase Only)

## Architecture Hierarchy

```
Application
    ↓
Protocol Service
    ↓
Crypto Abstraction (@pramana/crypto)
    ↓
Specific Cryptographic Implementation (@noble/curves, BBS, HPKE)
```

## Mandatory Implementation Requirements

1. Cryptographic choices must strictly align with the authoritative specification (BBS-first).
2. Every operation must document threat assumptions and have explicit test vectors.
3. Negative and edge-case tests are mandatory.
4. Mocks must NEVER enter production execution paths.
