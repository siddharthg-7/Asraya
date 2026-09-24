---
name: interoperability-review
description: Audits legacy system adapters, canonical attribute normalization, and prevents proprietary schema leakage.
---

# Interoperability Review Skill

## Purpose

Ensures that legacy backend data sources (SQL databases, ISO 20022 camt.053 XML feeds, institutional REST APIs) are strictly isolated via adapters and transformed into Canonical Attribute Definitions.

## When to use

- Developing or updating data adapters in `@pramana/adapters` or `services/adapters`.
- Mapping proprietary enterprise/banking schema fields to canonical credentials.
- Integrating external data sources into issuer pipelines.

## Allowed responsibilities

- Verify that adapters translate raw source records into normalized Canonical Attribute Definitions.
- Ensure that core protocol, wallet, and verifier code has zero knowledge of proprietary column names.
- Validate that parser implementations handle corrupt, malformed, or hostile legacy records safely.
- Ensure test fixtures for legacy formats (e.g. camt.053 XML) are sanitized and synthetic.

## Forbidden responsibilities

- Exposing legacy column names, database internal IDs, or bank-specific field keys outside the adapter boundary.
- Allowing application logic to branch based on backend source formats.
- Treating MVP adapter examples (SQL, ISO 20022) as mandatory universal standards for all use cases.

## Required checks

1. Does the adapter reside strictly in `@pramana/adapters` or `services/adapters`?
2. Does the output conform strictly to a canonical schema in `@pramana/schemas`?
3. Are all database queries parameterized and protected against SQL injection?
4. Are XML parsers configured to prevent XXE (XML External Entity) attacks?
5. Are transformation mappings covered by unit tests with edge-case and empty values?

## Expected outputs

- Attribute mapping specification (Legacy Source Field -> Canonical Attribute).
- Adapter security and injection resistance report.
- Transformation unit test coverage metrics.

## Security constraints

- XML parsers must disable external entity resolution and DTD processing.
- SQL adapters must strictly enforce prepared statements and parameterized inputs.

## Source-of-truth rules

Follow priority: (1) Pramāṇa Specification, (2) Canonical Attribute Definitions in `@pramana/schemas`, (3) Adapter documentation in `docs/architecture/interoperability.md`.
