/**
 * @fileoverview Groth16 Numeric Predicate Circuit Setup Engine
 * Pramāṇa Protocol - Phase 5 Cryptographic Core
 *
 * Programmatically constructs the BN128 R1CS constraint system and Powers-of-Tau
 * proving key for the numeric inequality predicate:
 *   earnings <= threshold
 * with cryptographic binding to the verifier's request nonce.
 */

import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

export interface CircuitSetupOptions {
  readonly targetDir?: string;
  readonly force?: boolean;
}

export interface CircuitSetupResult {
  readonly r1csPath: string;
  readonly zkeyPath: string;
  readonly vkeyPath: string;
  readonly generated: boolean;
}

export async function setupPredicateCircuit(
  options: CircuitSetupOptions = {},
): Promise<CircuitSetupResult> {
  const candidates = [
    options.targetDir,
    path.resolve(process.cwd(), 'circuits/build'),
    path.resolve(process.cwd(), '../circuits/build'),
  ].filter((p): p is string => Boolean(p));

  let buildDir = candidates.find((dir) => fs.existsSync(dir));
  if (!buildDir) {
    buildDir = candidates[0]!;
    fs.mkdirSync(buildDir, { recursive: true });
  }

  const r1csPath = path.join(buildDir, 'predicate.r1cs');
  const zkeyPath = path.join(buildDir, 'predicate.zkey');
  const vkeyPath = path.join(buildDir, 'predicate.vkey.json');

  if (
    !options.force &&
    fs.existsSync(r1csPath) &&
    fs.existsSync(zkeyPath) &&
    fs.existsSync(vkeyPath)
  ) {
    return { r1csPath, zkeyPath, vkeyPath, generated: false };
  }

  const snarkjs = await import('snarkjs');
  let r1csfile: any;
  try {
    const contextPath =
      typeof import.meta.url === 'string' && import.meta.url.startsWith('file:')
        ? new URL(import.meta.url).pathname
        : path.resolve('package.json');
    const req = createRequire(contextPath);
    r1csfile = req('r1csfile');
  } catch {
    const req = createRequire(path.resolve(process.cwd(), 'backend/package.json'));
    r1csfile = req('r1csfile');
  }

  const curve = await (snarkjs as any).curves.getCurveFromName('bn128');
  const prime: bigint = curve.Fr.p;
  const F = curve.Fr;

  const ptau0Path = path.join(buildDir, `temp_pot_0_${Date.now()}.ptau`);
  const ptauFinalPath = path.join(buildDir, `temp_pot_final_${Date.now()}.ptau`);

  try {
    const nVars = 70;
    const nPubInputs = 2; // [threshold, nonce]
    const nOutputs = 0;
    const nPrvInputs = 1; // earnings

    const constraints: any[] = [];
    // C0: 1 * (threshold - earnings) = diff
    constraints.push([{ [0]: F.e(1n) }, { [1]: F.e(1n), [3]: F.e(prime - 1n) }, { [4]: F.e(1n) }]);
    // C1..C64: bit_i * (1 - bit_i) = 0
    for (let i = 0; i < 64; i++) {
      constraints.push([{ [5 + i]: F.e(1n) }, { [0]: F.e(1n), [5 + i]: F.e(prime - 1n) }, {}]);
    }
    // C65: 1 * sum(2^i * bit_i) = diff
    const sumB: Record<number, any> = {};
    let p2 = 1n;
    for (let i = 0; i < 64; i++) {
      sumB[5 + i] = F.e(p2);
      p2 = (p2 * 2n) % prime;
    }
    constraints.push([{ [0]: F.e(1n) }, sumB, { [4]: F.e(1n) }]);
    // C66: nonce * nonce = nonceSquare
    constraints.push([{ [2]: F.e(1n) }, { [2]: F.e(1n) }, { [69]: F.e(1n) }]);

    const cir = {
      prime,
      curve,
      F,
      n8: 32,
      nVars,
      nOutputs,
      nPubInputs,
      nPrvInputs,
      nLabels: nVars,
      nConstraints: constraints.length,
      constraints,
      map: Array.from({ length: nVars }, (_, i) => i),
    };

    await r1csfile.writeR1cs(r1csPath, cir);
    await (snarkjs as any).powersOfTau.newAccumulator(curve, 7, ptau0Path);
    await (snarkjs as any).powersOfTau.preparePhase2(ptau0Path, ptauFinalPath);
    await (snarkjs as any).zKey.newZKey(r1csPath, ptauFinalPath, zkeyPath);
    const vkey = await (snarkjs as any).zKey.exportVerificationKey(zkeyPath);
    fs.writeFileSync(vkeyPath, JSON.stringify(vkey, null, 2), 'utf8');

    return { r1csPath, zkeyPath, vkeyPath, generated: true };
  } finally {
    if (fs.existsSync(ptau0Path)) {
      try {
        fs.unlinkSync(ptau0Path);
      } catch {
        // Ignore cleanup errors
      }
    }
    if (fs.existsSync(ptauFinalPath)) {
      try {
        fs.unlinkSync(ptauFinalPath);
      } catch {
        // Ignore cleanup errors
      }
    }
    await curve.terminate();
  }
}
