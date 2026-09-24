/**
 * @fileoverview Tier B: Groth16 zk-SNARK Fallback Proof Service
 * Pramāṇa Protocol - Phase 5 Cryptographic Core
 *
 * Implements Groth16 zero-knowledge proving and verification for bounded
 * numeric predicates (e.g. trailing_12m_earnings LTE 300000) over BN128 / BN254.
 *
 * Anti-Hallucination & Privacy Invariants:
 * - Uses audited snarkjs (Groth16 over BN128).
 * - The private witness (earnings) NEVER leaves the prover function.
 * - Private witness is NEVER written to logs, proof envelopes, or verification payloads.
 * - Public signals strictly consist of: [threshold, nonceBinding].
 * - When earnings > threshold, proof generation FAILS deterministically.
 */

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import * as binFileUtils from '@iden3/binfileutils';
import { Groth16ProofPayload, ERROR_CODES, PramanaError } from '@pramana/shared';
import { setupPredicateCircuit } from './groth16-setup.js';

export interface PredicateProofInput {
  readonly earnings: number;
  readonly threshold: number;
  readonly nonce: string;
}

export interface IPredicateProofService {
  generatePredicateProof(input: PredicateProofInput): Promise<Groth16ProofPayload>;
  verifyPredicateProof(
    payload: Groth16ProofPayload,
    verificationKey: Record<string, unknown>,
    expectedThreshold: number | string,
    expectedNonce: string,
  ): Promise<boolean>;
  getVerificationKey(): Promise<Record<string, unknown>>;
  deriveNonceScalar(nonce: string): bigint;
}

export class Groth16Service implements IPredicateProofService {
  private cachedVKey: Record<string, unknown> | null = null;
  private readonly BN128_PRIME =
    21888242871839275222246405745257275088548364400416034343698204186575808495617n;

  private getArtifactsPaths(): { zkeyPath: string; vkeyPath: string } {
    const candidates = [
      path.resolve(process.cwd(), 'circuits/build'),
      path.resolve(process.cwd(), '../circuits/build'),
    ];

    let buildDir = candidates.find((dir) => fs.existsSync(dir));
    if (!buildDir) {
      buildDir = candidates[0]!;
      fs.mkdirSync(buildDir, { recursive: true });
    }

    return {
      zkeyPath: path.join(buildDir, 'predicate.zkey'),
      vkeyPath: path.join(buildDir, 'predicate.vkey.json'),
    };
  }

  /**
   * Hashes a request nonce string into a BN128 scalar field element for request binding.
   */
  deriveNonceScalar(nonce: string): bigint {
    const hashHex = createHash('sha256').update(nonce).digest('hex');
    return (BigInt(`0x${hashHex}`) % (this.BN128_PRIME - 1n)) + 1n;
  }

  /**
   * Writes calculated witness vector to a binary wtns file for snarkjs prover.
   */
  private async writeWitnessFile(filePath: string, witness: readonly bigint[]): Promise<void> {
    const fdWtns = await (binFileUtils as any).createBinFile(filePath, 'wtns', 2, 2);
    const n8 = 32;

    // Section 1: Header
    await (binFileUtils as any).startWriteSection(fdWtns, 1);
    await fdWtns.writeULE32(n8);
    await (binFileUtils as any).writeBigInt(fdWtns, this.BN128_PRIME, n8);
    await fdWtns.writeULE32(witness.length);
    await (binFileUtils as any).endWriteSection(fdWtns);

    // Section 2: Witness values
    await (binFileUtils as any).startWriteSection(fdWtns, 2);
    for (let i = 0; i < witness.length; i++) {
      await (binFileUtils as any).writeBigInt(fdWtns, witness[i]!, n8);
    }
    await (binFileUtils as any).endWriteSection(fdWtns, 2);
    await fdWtns.close();
  }

  /**
   * Retrieves the pre-generated verification key for the numeric predicate circuit.
   */
  async getVerificationKey(): Promise<Record<string, unknown>> {
    if (this.cachedVKey) {
      return this.cachedVKey;
    }

    const { vkeyPath } = this.getArtifactsPaths();
    if (!fs.existsSync(vkeyPath)) {
      await setupPredicateCircuit();
    }
    if (!fs.existsSync(vkeyPath)) {
      throw new PramanaError(
        ERROR_CODES.PROOF_VERIFICATION_FAILED,
        `Circuit verification key not found at ${vkeyPath}. Ensure circuit setup has been executed.`,
      );
    }

    const content = fs.readFileSync(vkeyPath, 'utf8');
    this.cachedVKey = JSON.parse(content) as Record<string, unknown>;
    return this.cachedVKey;
  }

  /**
   * Generates a zero-knowledge Groth16 predicate proof that private earnings <= public threshold.
   * STRICT PRIVACY: The private earnings attribute is NOT returned or exposed anywhere.
   */
  async generatePredicateProof(input: PredicateProofInput): Promise<Groth16ProofPayload> {
    const { earnings, threshold, nonce } = input;

    // 1. Strict mathematical predicate check
    if (earnings > threshold) {
      throw new PramanaError(
        ERROR_CODES.INVALID_PREDICATE,
        `Numeric predicate condition failed: value exceeds authorized threshold ${threshold}`,
      );
    }

    if (earnings < 0) {
      throw new PramanaError(
        ERROR_CODES.INVALID_PREDICATE,
        'Numeric predicate condition failed: negative values not supported in unsigned 64-bit domain',
      );
    }

    const { zkeyPath } = this.getArtifactsPaths();
    if (!fs.existsSync(zkeyPath)) {
      await setupPredicateCircuit();
    }
    if (!fs.existsSync(zkeyPath)) {
      throw new PramanaError(
        ERROR_CODES.PROOF_VERIFICATION_FAILED,
        `Circuit proving key not found at ${zkeyPath}`,
      );
    }

    const snarkjs = await import('snarkjs');
    const nonceScalar = this.deriveNonceScalar(nonce);
    const diff = BigInt(threshold) - BigInt(earnings);

    // Total variables in R1CS = 70
    // 0: 1 (constant)
    // 1: threshold (pub)
    // 2: nonce (pub)
    // 3: earnings (prv)
    // 4: diff
    // 5..68: bits 0..63
    // 69: nonceSquare
    const nVars = 70;
    const witness = new Array<bigint>(nVars);
    witness[0] = 1n;
    witness[1] = BigInt(threshold);
    witness[2] = nonceScalar;
    witness[3] = BigInt(earnings);
    witness[4] = diff;
    for (let i = 0; i < 64; i++) {
      witness[5 + i] = (diff >> BigInt(i)) & 1n;
    }
    witness[69] = (nonceScalar * nonceScalar) % this.BN128_PRIME;

    // Temporary witness file on disk for snarkjs prover
    const tempWtnsPath = path.resolve(
      path.dirname(zkeyPath),
      `temp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.wtns`,
    );

    try {
      await this.writeWitnessFile(tempWtnsPath, witness);

      const { proof, publicSignals } = (await snarkjs.groth16.prove(zkeyPath, tempWtnsPath)) as {
        proof: {
          pi_a: string[];
          pi_b: string[][];
          pi_c: string[];
          protocol: string;
        };
        publicSignals: string[];
      };

      return {
        tier: 'TIER_B_GROTH16',
        circuitId: 'urn:pramana:circuit:earnings-lte:v1',
        publicSignals,
        proof: {
          pi_a: [proof.pi_a[0]!, proof.pi_a[1]!, proof.pi_a[2]!],
          pi_b: [
            [proof.pi_b[0]![0]!, proof.pi_b[0]![1]!],
            [proof.pi_b[1]![0]!, proof.pi_b[1]![1]!],
            [proof.pi_b[2]![0]!, proof.pi_b[2]![1]!],
          ],
          pi_c: [proof.pi_c[0]!, proof.pi_c[1]!, proof.pi_c[2]!],
          protocol: 'groth16',
        },
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new PramanaError(
        ERROR_CODES.PROOF_VERIFICATION_FAILED,
        `Groth16 proving failed: ${msg}`,
      );
    } finally {
      if (fs.existsSync(tempWtnsPath)) {
        try {
          fs.unlinkSync(tempWtnsPath);
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  }

  /**
   * Verifies a Groth16 predicate proof against the verification key and expected public parameters.
   */
  async verifyPredicateProof(
    payload: Groth16ProofPayload,
    verificationKey: Record<string, unknown>,
    expectedThreshold: number | string,
    expectedNonce: string,
  ): Promise<boolean> {
    try {
      const snarkjs = await import('snarkjs');

      // 1. Verify cryptographic Groth16 pairing equation
      const isValid = (await snarkjs.groth16.verify(
        verificationKey,
        payload.publicSignals as string[],
        payload.proof,
      )) as boolean;

      if (!isValid) {
        return false;
      }

      // 2. Validate that public signals match expected threshold and request nonce
      const thresholdSignal = payload.publicSignals[0];
      const nonceSignal = payload.publicSignals[1];

      if (thresholdSignal !== String(expectedThreshold)) {
        return false;
      }

      const expectedNonceScalar = this.deriveNonceScalar(expectedNonce).toString();
      if (nonceSignal !== expectedNonceScalar) {
        return false;
      }

      return true;
    } catch (_err: unknown) {
      return false;
    }
  }
}

export const groth16Service = new Groth16Service();
