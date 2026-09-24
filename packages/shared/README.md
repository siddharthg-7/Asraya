# @pramana/shared

Shared foundational utilities, constants, and common TypeScript interfaces across all packages.

## Status

`NOT STARTED` (Setup Phase Only)

## Module Boundary Rules

- **Allowed**: Protocol-wide constants, branded primitive types, monadic `Result` types, immutable utility types.
- **Forbidden**: Domain logic, state management, cryptography implementations, external untyped libraries.
