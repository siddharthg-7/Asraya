/**
 * @fileoverview Phase 5 Circuit Setup Script
 * Generates programmatic R1CS constraints, Powers of Tau, proving key, and verification key
 * for the BN128 numeric predicate circuit (earnings LTE threshold).
 */

import { setupPredicateCircuit } from '../backend/src/crypto/groth16-setup.js';

async function main(): Promise<void> {
  console.log('--- Pramāṇa Circuit Setup ---');
  const force = process.argv.includes('--force');
  try {
    const result = await setupPredicateCircuit({ force });
    if (result.generated) {
      console.log('[SUCCESS] Generated circuit artifacts:');
      console.log(`  - R1CS: ${result.r1csPath}`);
      console.log(`  - Proving Key: ${result.zkeyPath}`);
      console.log(`  - Verification Key: ${result.vkeyPath}`);
    } else {
      console.log('[READY] Circuit artifacts already exist and are valid:');
      console.log(`  - Proving Key: ${result.zkeyPath}`);
      console.log(`  - Verification Key: ${result.vkeyPath}`);
    }
    process.exit(0);
  } catch (error) {
    console.error('[FAILURE] Error generating circuit artifacts:', error);
    process.exit(1);
  }
}

void main();
