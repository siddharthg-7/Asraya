/**
 * @fileoverview Frontend API Client
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import {
  RequestContract,
  ProofEnvelope,
  VerificationReceipt,
  TrustCheckpoint,
} from '@pramana/shared';

const BACKEND_URL = 'http://localhost:3001';

export class PramanaApiClient {
  constructor(private readonly baseUrl: string = BACKEND_URL) {}

  async getHealth(): Promise<{ status: string; version: string; phase: string }> {
    const res = await fetch(`${this.baseUrl}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return res.json() as Promise<{ status: string; version: string; phase: string }>;
  }

  async createRequest(payload: {
    verifierDid: string;
    verifierName: string;
    purpose: string;
    context: string;
    predicates: RequestContract['predicates'];
  }): Promise<RequestContract> {
    const res = await fetch(`${this.baseUrl}/api/v1/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Create request failed: ${res.statusText}`);
    return res.json() as Promise<RequestContract>;
  }

  async submitVerification(envelope: ProofEnvelope): Promise<VerificationReceipt> {
    const res = await fetch(`${this.baseUrl}/api/v1/verifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(envelope),
    });
    if (!res.ok) throw new Error(`Verification submission failed: ${res.statusText}`);
    return res.json() as Promise<VerificationReceipt>;
  }

  async getTrustCheckpoint(): Promise<TrustCheckpoint> {
    const res = await fetch(`${this.baseUrl}/api/v1/registry/checkpoint`);
    if (!res.ok) throw new Error(`Fetch checkpoint failed: ${res.statusText}`);
    return res.json() as Promise<TrustCheckpoint>;
  }
}

export const apiClient = new PramanaApiClient();
