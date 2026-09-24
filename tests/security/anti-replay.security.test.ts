import { describe, it, expect } from 'vitest';
import { InMemoryVerifierStorage } from '../../backend/src/database/in-memory-storage.js';

describe('Security Tests: Anti-Replay Nonce Defense', () => {
  it('should successfully register a fresh nonce and prevent duplicate registration', async () => {
    const storage = new InMemoryVerifierStorage();
    const nonce = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    const expiresAt = new Date(Date.now() + 60000).toISOString();

    const registeredFirst = await storage.registerNonce(nonce, expiresAt);
    expect(registeredFirst).toBe(true);

    const registeredSecond = await storage.registerNonce(nonce, expiresAt);
    expect(registeredSecond).toBe(false);
  });

  it('should burn an active nonce and prevent replay reuse', async () => {
    const storage = new InMemoryVerifierStorage();
    const nonce = '11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff';
    const expiresAt = new Date(Date.now() + 60000).toISOString();

    await storage.registerNonce(nonce, expiresAt);

    // First presentation: burns successfully
    const firstBurn = await storage.burnNonce(nonce);
    expect(firstBurn).toBe(true);

    // Second presentation (replay attack): fails immediately
    const secondBurn = await storage.burnNonce(nonce);
    expect(secondBurn).toBe(false);
  });
});
