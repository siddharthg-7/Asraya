# ADR-0002: "Move the Question, Not the Data" Verification Paradigm

## Status

ACCEPTED

## Context

Traditional enterprise and governmental verification workflows rely on data ingestion: citizens upload copies of physical identity documents, bank statements, or utility bills. The verifier’s servers ingest, parse, OCR, and store this sensitive Personally Identifiable Information (PII) to evaluate simple boolean questions (e.g., "Is applicant over 18?", "Does applicant reside in Province X?").

## Problem

Data ingestion turns every verifier into a high-value surveillance honeypot and creates catastrophic liability under GDPR, DPDP, and global privacy regulations. When a verifier database is breached, full citizen identities are leaked. Furthermore, verifiers ingest vast quantities of extraneous data that they never needed to know.

## Options Considered

1. **Traditional Data Extraction**: Upload PDF/images, OCR on server, compute verdict.
   - _Cons_: Total privacy violation, massive breach liability, storage overhead.
2. **Centralized Identity Hub**: Intermediary server that queries government databases and returns a boolean.
   - _Cons_: Single point of failure, centralized surveillance tracking, honeypot risk.
3. **Pramāṇa Paradigm ("Move the Question, Not the Data")**: Verifier transmits a cryptographically signed question (predicate) to the citizen's sovereign wallet. The wallet evaluates the question locally against certified credentials and returns ONLY a mathematical proof of the answer.
   - _Pros_: Verifier never sees, receives, or stores raw citizen attributes. Complete data minimization.

## Decision

Adopt **"Move the Question, Not the Data"** as the foundational architectural paradigm for the entire Pramāṇa protocol.

## Consequences

- **Positive**: Eliminates citizen PII from verifier databases, removes honeypots, fulfills strict regulatory data minimization requirements.
- **Negative / Trade-offs**: Verification logic is distributed to client devices, requiring robust holder binding, anti-replay, and tamper-resistant cryptographic proof systems.

## Source / Reference

- Authoritative Pramāṇa Specification, Core Architectural Principle.
