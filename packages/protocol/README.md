# @pramana/protocol

The canonical protocol definition package for the Pramāṇa protocol.

## Status

`NOT STARTED` (Setup Phase Only)

## Key Responsibilities

- Protocol version identifiers
- Verifier Request Contract specification
- Predicate grammar definition
- Verification result enums and payloads
- Canonical protocol error codes
- Serialization formats (CBOR, JSON)

## Boundary Rules

- This package is the SINGLE SOURCE OF TRUTH for protocol data structures.
- Applications (wallet, verifier) MUST import protocol types from here and NEVER redefine them.
