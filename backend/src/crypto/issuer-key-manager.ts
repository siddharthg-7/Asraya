/**
 * @fileoverview Issuer Key Management & BLS12-381 G2 Key Provider
 * Pramāṇa Protocol - Phase 5 Cryptographic Core
 *
 * Security Invariants (Rules 4, 8 & AGENTS.md):
 * - Issuer private keys MUST remain strictly issuer-side in memory.
 * - Private keys MUST NEVER enter Trust Registry records.
 * - Private keys MUST NEVER be exposed in public API responses or logs.
 * - Public keys are published to the Trust Registry as Base64-encoded BLS12-381 G2 points.
 */

import { createHash } from 'node:crypto';
import { generateBls12381G2KeyPair, Bls12381G2KeyPair } from '@mattrglobal/bbs-signatures';
import { trustRegistry } from '../registry/trust-registry.js';

export interface IIssuerKeyManager {
  getKeyPair(issuerDid: string): Promise<Bls12381G2KeyPair>;
  getPublicKeyBase64(issuerDid: string): Promise<string>;
  initializeIssuerKeys(): Promise<void>;
}

export class IssuerKeyManager implements IIssuerKeyManager {
  // Private in-memory store for issuer key material (DEV/TEST ONLY)
  private readonly issuerKeyPairs = new Map<string, Bls12381G2KeyPair>();
  private initialized = false;

  /**
   * Derives a deterministic BLS12-381 G2 keypair for local development/testing.
   * In production, this would interface with an HSM/KMS.
   */
  private async deriveDevKeyPair(issuerDid: string): Promise<Bls12381G2KeyPair> {
    const seed = createHash('sha256').update(`pramana:issuer:bbs-dev-seed:${issuerDid}`).digest();
    return generateBls12381G2KeyPair(new Uint8Array(seed));
  }

  /**
   * Initializes key pairs for standard demo issuers and updates their public keys in Trust Registry.
   */
  async initializeIssuerKeys(): Promise<void> {
    if (this.initialized) return;

    const demoIssuers = [
      'did:pramana:issuer:gov-civil-dept',
      'did:pramana:issuer:bank-reg-authority',
      'did:pramana:issuer:transport-dept',
    ];

    for (const did of demoIssuers) {
      const keyPair = await this.deriveDevKeyPair(did);
      this.issuerKeyPairs.set(did, keyPair);

      // Update public key in Trust Registry
      const existing = await trustRegistry.getIssuer(did);
      if (existing) {
        const pubKeyBase64 = Buffer.from(keyPair.publicKey).toString('base64');
        await trustRegistry.registerIssuer({
          ...existing,
          publicKeys: {
            ...existing.publicKeys,
            bbsG2PublicKey: pubKeyBase64,
          },
        });
      }
    }

    this.initialized = true;
  }

  /**
   * Retrieves an issuer's private key pair. Strictly restricted to issuer-side signing flows.
   */
  async getKeyPair(issuerDid: string): Promise<Bls12381G2KeyPair> {
    if (!this.initialized) {
      await this.initializeIssuerKeys();
    }

    let keyPair = this.issuerKeyPairs.get(issuerDid);
    if (!keyPair) {
      // For dynamically registered issuers in tests, derive or generate a keypair
      keyPair = await this.deriveDevKeyPair(issuerDid);
      this.issuerKeyPairs.set(issuerDid, keyPair);
    }

    return keyPair;
  }

  /**
   * Returns Base64-encoded public key for an issuer.
   */
  async getPublicKeyBase64(issuerDid: string): Promise<string> {
    const keyPair = await this.getKeyPair(issuerDid);
    return Buffer.from(keyPair.publicKey).toString('base64');
  }

  /**
   * Register a custom keypair for testing (e.g. negative tests with wrong keys).
   */
  setKeyPairForTesting(issuerDid: string, keyPair: Bls12381G2KeyPair): void {
    this.issuerKeyPairs.set(issuerDid, keyPair);
  }
}

export const issuerKeyManager = new IssuerKeyManager();
