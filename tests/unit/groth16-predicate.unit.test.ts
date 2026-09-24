/**
 * @fileoverview Unit Tests: Groth16 zk-SNARK Predicate Engine
 * Pramāṇa Protocol - Phase 5 Cryptographic Core
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { groth16Service } from '../../backend/src/crypto/groth16-service.js';
import { groth16Engine } from '../../backend/src/proofs/groth16-engine.js';
import { ERROR_CODES, PramanaError } from '../../shared/src/index.js';

describe('Groth16 zk-SNARK Numeric Predicate Engine Tests', () => {
  let vKey: Record<string, unknown>;
  const nonce = 'request-nonce-01234567890123456789012345678901';

  beforeAll(async () => {
    vKey = await groth16Service.getVerificationKey();
  });

  it('should generate valid Groth16 proof when earnings satisfy threshold (180000 <= 300000)', async () => {
    const payload = await groth16Service.generatePredicateProof({
      earnings: 180000,
      threshold: 300000,
      nonce,
    });

    expect(payload.tier).toBe('TIER_B_GROTH16');
    expect(payload.circuitId).toBe('urn:pramana:circuit:earnings-lte:v1');
    expect(payload.proof.protocol).toBe('groth16');
    expect(payload.publicSignals).toHaveLength(2);
    expect(payload.publicSignals[0]).toBe('300000');

    // PRIVACY VERIFICATION: Private earnings (180000) must NEVER be in public signals or payload
    const serialized = JSON.stringify(payload);
    expect(serialized).not.toContain('180000');

    // Cryptographic verification
    const isValid = await groth16Service.verifyPredicateProof(payload, vKey, 300000, nonce);
    expect(isValid).toBe(true);

    // Direct engine verification
    const engineValid = await groth16Engine.verifyCircuitProof(payload, vKey);
    expect(engineValid).toBe(true);
  });

  it('should fail proof generation if earnings exceed threshold (350000 > 300000)', async () => {
    await expect(
      groth16Service.generatePredicateProof({
        earnings: 350000,
        threshold: 300000,
        nonce,
      }),
    ).rejects.toThrow('Numeric predicate condition failed: value exceeds authorized threshold');
  });

  it('should reject negative earnings value', async () => {
    await expect(
      groth16Service.generatePredicateProof({
        earnings: -5000,
        threshold: 300000,
        nonce,
      }),
    ).rejects.toThrow('negative values not supported');
  });

  it('should reject verification if public threshold is tampered by prover', async () => {
    const payload = await groth16Service.generatePredicateProof({
      earnings: 180000,
      threshold: 300000,
      nonce,
    });

    // Prover tries to claim threshold was 500000
    const tamperedPayload = {
      ...payload,
      publicSignals: ['500000', payload.publicSignals[1]!],
    };

    const isValid = await groth16Service.verifyPredicateProof(tamperedPayload, vKey, 300000, nonce);
    expect(isValid).toBe(false);
  });

  it('should reject verification if challenge nonce does not match request', async () => {
    const payload = await groth16Service.generatePredicateProof({
      earnings: 180000,
      threshold: 300000,
      nonce: 'original-request-nonce-12345678901234567890',
    });

    const isValid = await groth16Service.verifyPredicateProof(
      payload,
      vKey,
      300000,
      'different-verifier-nonce-12345678901234567890',
    );
    expect(isValid).toBe(false);
  });

  it('should reject verification if proof coordinates are tampered', async () => {
    const payload = await groth16Service.generatePredicateProof({
      earnings: 180000,
      threshold: 300000,
      nonce,
    });

    // Alter pi_a coordinate
    const tamperedPayload = {
      ...payload,
      proof: {
        ...payload.proof,
        pi_a: [
          '99999999999999999999999999999999999999999999',
          payload.proof.pi_a[1],
          payload.proof.pi_a[2],
        ] as [string, string, string],
      },
    };

    const isValid = await groth16Service.verifyPredicateProof(tamperedPayload, vKey, 300000, nonce);
    expect(isValid).toBe(false);
  });

  it('should verify edge case when earnings equal threshold exactly (300000 == 300000)', async () => {
    const payload = await groth16Service.generatePredicateProof({
      earnings: 300000,
      threshold: 300000,
      nonce,
    });

    const isValid = await groth16Service.verifyPredicateProof(payload, vKey, 300000, nonce);
    expect(isValid).toBe(true);
  });
});
