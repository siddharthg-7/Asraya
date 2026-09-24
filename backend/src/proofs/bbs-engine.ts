/**
 * @fileoverview Tier A: BBS Multi-Message Proof Engine Abstraction
 * Pramāṇa Protocol - Phase 5 Cryptographic Core
 *
 * Current Architecture: BBS is the primary proof path.
 */

import { BBSProofPayload, ERROR_CODES, PramanaError } from '@pramana/shared';
import { bbsService } from '../crypto/bbs-service.js';

export interface IBBSEngine {
  verifyPresentation(
    payload: BBSProofPayload,
    issuerPublicKey: string,
    nonce: string,
  ): Promise<boolean>;
}

export class BBSEngine implements IBBSEngine {
  async verifyPresentation(
    payload: BBSProofPayload,
    issuerPublicKey: string,
    nonce: string,
  ): Promise<boolean> {
    return bbsService.verifyPresentation(payload, issuerPublicKey, nonce);
  }
}

export class UninitializedBBSEngine implements IBBSEngine {
  async verifyPresentation(
    _payload: BBSProofPayload,
    _issuerPublicKey: string,
    _nonce: string,
  ): Promise<boolean> {
    throw new PramanaError(
      ERROR_CODES.NOT_IMPLEMENTED,
      'Tier A (BBS) cryptographic verification engine is NOT implemented in Phase 1 setup',
    );
  }
}

export const bbsEngine = new BBSEngine();
