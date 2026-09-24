/**
 * @fileoverview Tier A: BBS Multi-Message Proof Engine Abstraction
 * Pramāṇa Protocol - Phase 1 Foundation
 *
 * Current Architecture: BBS is the primary proof path.
 */

import { BBSProofPayload, ERROR_CODES, PramanaError } from '@pramana/shared';

export interface IBBSEngine {
  verifyPresentation(
    payload: BBSProofPayload,
    issuerPublicKey: string,
    nonce: string,
  ): Promise<boolean>;
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
