/**
 * @fileoverview Mock Issuer Integration (DEMO ONLY)
 * Pramāṇa Protocol - Phase 1 Foundation
 *
 * NOTICE:
 * MOCK - DEMO ONLY - NOT PRODUCTION CRYPTO
 * Exists solely for local development and integration tests.
 */

import { VerifiableCredential } from '@pramana/shared';
import { IIssuerService } from '../domain/issuer.js';

export class MockIssuerService implements IIssuerService {
  constructor(
    public readonly did: string = 'did:pramana:issuer:mock-gov',
    public readonly legalName: string = 'Mock Civil Registration Department',
  ) {}

  async issueCredential(
    schemaId: string,
    holderPublicKeyHash: string,
    claims: Record<string, string | number | boolean>,
  ): Promise<VerifiableCredential> {
    return {
      metadata: {
        id: `urn:uuid:mock-cred-${Date.now()}`,
        schemaId,
        issuedAt: new Date().toISOString(),
      },
      issuer: {
        did: this.did,
        name: this.legalName,
        registryCheckpoint: 'mock_checkpoint_v1',
      },
      holderBinding: {
        holderPublicKeyHash,
        algorithm: 'BLS12-381-G1',
      },
      claims,
      signature: 'MOCK_DEMO_ONLY_NOT_PRODUCTION_CRYPTO_SIGNATURE',
    };
  }
}

export const mockIssuer = new MockIssuerService();
