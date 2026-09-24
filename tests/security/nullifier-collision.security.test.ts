import { describe, it, expect } from 'vitest';
import { InMemoryVerifierStorage } from '../../backend/src/database/in-memory-storage.js';

describe('Security Tests: Context-Scoped Nullifier Double-Claim Defense', () => {
  it('should detect duplicate claim attempts within the same context', async () => {
    const storage = new InMemoryVerifierStorage();
    const contextId = 'campaign:food-subsidy-2026';
    const nullifierHash = 'nullifier_hash_secret_derived_32bytes_value';

    // Verify initial state: not claimed
    const initialCheck = await storage.hasNullifier(contextId, nullifierHash);
    expect(initialCheck).toBe(false);

    // Record first claim
    await storage.recordNullifier(contextId, nullifierHash);

    // Verify subsequent claim check: already claimed (double-claim detected)
    const secondCheck = await storage.hasNullifier(contextId, nullifierHash);
    expect(secondCheck).toBe(true);

    // Verify across a different context: separate scope remains unclaimed
    const differentContextCheck = await storage.hasNullifier(
      'campaign:transport-subsidy-2026',
      nullifierHash,
    );
    expect(differentContextCheck).toBe(false);
  });
});
