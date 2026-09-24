import { describe, it, expect } from 'vitest';
import {
  PROTOCOL_NAME,
  PROTOCOL_VERSION,
  DEFAULT_PROOF_TIER,
  FALLBACK_PROOF_TIER,
  CANONICAL_ATTRIBUTES,
  MAX_NONCE_AGE_SECONDS,
} from '../../shared/src/index.js';

describe('Conformance Tests: Pramāṇa Protocol Specification Adherence', () => {
  it('should confirm protocol naming adheres to authoritative specification', () => {
    expect(PROTOCOL_NAME).toBe('Pramāṇa');
  });

  it('should confirm protocol version follows Phase 1 draft specification', () => {
    expect(PROTOCOL_VERSION).toBe('0.1.0');
  });

  it('should enforce BBS-first as Tier A and Groth16 as Tier B fallback', () => {
    expect(DEFAULT_PROOF_TIER).toBe('BBS');
    expect(FALLBACK_PROOF_TIER).toBe('GROTH16');
  });

  it('should define canonical civil, financial, and transport attributes', () => {
    expect(CANONICAL_ATTRIBUTES.AGE).toBe('urn:pramana:attr:civil:age');
    expect(CANONICAL_ATTRIBUTES.ACCOUNT_BALANCE).toBe('urn:pramana:attr:fin:account_balance');
    expect(CANONICAL_ATTRIBUTES.LICENSE_CATEGORY).toBe('urn:pramana:attr:trans:license_category');
  });

  it('should enforce maximum nonce validity window of 120 seconds', () => {
    expect(MAX_NONCE_AGE_SECONDS).toBe(120);
  });
});
