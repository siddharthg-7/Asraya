/**
 * @fileoverview Backend Request Validation Services
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import {
  validateRequestContract,
  validateProofEnvelope,
  RequestContract,
  ProofEnvelope,
} from '@pramana/shared';

export class RequestValidator {
  static validateContract(input: unknown): RequestContract {
    return validateRequestContract(input);
  }

  static validateProof(input: unknown): ProofEnvelope {
    return validateProofEnvelope(input);
  }
}
