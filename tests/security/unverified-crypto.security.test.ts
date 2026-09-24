import { describe, it, expect } from 'vitest';
import { UnverifiedCryptoService } from '../../backend/src/crypto/crypto-interface.js';
import { UninitializedBBSEngine } from '../../backend/src/proofs/bbs-engine.js';
import { UninitializedGroth16Engine } from '../../backend/src/proofs/groth16-engine.js';
import { ERROR_CODES } from '../../shared/src/index.js';

describe('Security Tests: Anti-Hallucination Guardrails on Cryptography', () => {
  it('should reject crypto signing with explicit NOT_IMPLEMENTED rather than returning mock signatures', async () => {
    const cryptoService = new UnverifiedCryptoService();
    try {
      await cryptoService.sign(new Uint8Array([1, 2, 3]), 'key');
      expect.fail('Should have thrown NOT_IMPLEMENTED error');
    } catch (err: any) {
      expect(err.code).toBe(ERROR_CODES.NOT_IMPLEMENTED);
      expect(err.message).toContain('uninitialized for Phase 1');
    }
  });

  it('should reject BBS presentation verification with explicit NOT_IMPLEMENTED rather than returning true', async () => {
    const bbs = new UninitializedBBSEngine();
    const payload = {
      tier: 'TIER_A_BBS' as const,
      revealedAttributes: {},
      proofBytes: '...',
      blindedCommitment: '...',
    };
    try {
      await bbs.verifyPresentation(payload, 'pubkey', 'nonce');
      expect.fail('Should have thrown NOT_IMPLEMENTED error');
    } catch (err: any) {
      expect(err.code).toBe(ERROR_CODES.NOT_IMPLEMENTED);
      expect(err.message).toContain('NOT implemented in Phase 1 setup');
    }
  });

  it('should reject Groth16 circuit verification with explicit NOT_IMPLEMENTED rather than returning true', async () => {
    const groth16 = new UninitializedGroth16Engine();
    const payload = {
      tier: 'TIER_B_GROTH16' as const,
      circuitId: 'circuit-1',
      publicSignals: ['1'],
      proof: {
        pi_a: ['1', '2', '3'] as const,
        pi_b: [
          ['1', '2'],
          ['3', '4'],
          ['5', '6'],
        ] as const,
        pi_c: ['1', '2', '3'] as const,
        protocol: 'groth16' as const,
      },
    };
    try {
      await groth16.verifyCircuitProof(payload, {});
      expect.fail('Should have thrown NOT_IMPLEMENTED error');
    } catch (err: any) {
      expect(err.code).toBe(ERROR_CODES.NOT_IMPLEMENTED);
      expect(err.message).toContain('NOT implemented in Phase 1 setup');
    }
  });
});
