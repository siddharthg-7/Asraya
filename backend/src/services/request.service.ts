/**
 * @fileoverview Request Generation Service
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import { RequestContract, Predicate } from '@pramana/shared';
import { ContractBuilder } from '../protocol/contract-builder.js';
import { verifierStorage } from '../database/in-memory-storage.js';

export class RequestService {
  async createRequest(
    verifierDid: string,
    verifierName: string,
    purpose: string,
    context: string,
    predicates: readonly Predicate[],
  ): Promise<RequestContract> {
    const contract = ContractBuilder.build({
      verifierDid,
      verifierName,
      purpose,
      context,
      predicates,
    });

    // Register active nonce in minimal verifier storage
    await verifierStorage.registerNonce(contract.nonce, contract.expiresAt);

    return contract;
  }
}

export const requestService = new RequestService();
