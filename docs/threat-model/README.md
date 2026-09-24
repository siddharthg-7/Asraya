# Pramāṇa Threat Model Reference

This directory serves as the detailed threat analysis repository for the Pramāṇa protocol.

## Master Threat Model

The primary threat analysis, covering all 14 major threats, adversarial assumptions, and explicit mitigations, is documented in the root threat model:

- [THREAT_MODEL.md](file:///c:/project-self-1/pramana/THREAT_MODEL.md)

## Key Threat Categories

1. **Identity & Authentication Forgery**: Threats 1, 2, 8, 11 (Forged issuers, forged verifiers, stolen credentials, compromised registries).
2. **Replay, Forwarding, & Physical Attacks**: Threats 4, 5, 6, 7 (Replay, message forwarding, QR substitution, double claims).
3. **Surveillance & Privacy Erosion**: Threats 3, 10, 12 (Unauthorized attribute demands, schema manipulation, issuer/verifier correlation).
4. **Integration & Adapter Vulnerabilities**: Threats 13, 14 (Malicious adapters, semantic translation errors).

## Threat Review Runbook

All PRs modifying cryptographic code, transport protocols, verifier storage, or wallet key handling must execute the [Security Review Skill](file:///c:/project-self-1/pramana/skills/security/SKILL.md) and verify defenses against these 14 threat vectors.
