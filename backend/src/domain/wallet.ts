/**
 * @fileoverview Wallet Domain Model
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import {
  RequestContract,
  ConsentContract,
  ProofEnvelope,
  VerifiableCredential,
} from '@pramana/shared';

export interface IWalletService {
  /**
   * Evaluates whether local wallet credentials can satisfy the request predicates
   */
  canSatisfyRequest(request: RequestContract): Promise<boolean>;

  /**
   * Generates a template-bound consent contract for citizen authorization
   */
  prepareConsent(request: RequestContract): Promise<ConsentContract>;

  /**
   * Generates a privacy-preserving proof envelope after explicit consent
   */
  generateProof(
    consent: ConsentContract,
    credentials: readonly VerifiableCredential[],
  ): Promise<ProofEnvelope>;
}
