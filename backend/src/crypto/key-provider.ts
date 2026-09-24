/**
 * @fileoverview Key Provider Interface
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import { KeyPair } from './crypto-interface.js';
import { ERROR_CODES, PramanaError } from '@pramana/shared';

export interface IKeyProvider {
  getKeyPair(keyId: string): Promise<KeyPair>;
}

export class Phase1KeyProvider implements IKeyProvider {
  async getKeyPair(keyId: string): Promise<KeyPair> {
    throw new PramanaError(
      ERROR_CODES.UNVERIFIED_FEATURE,
      `Key provider is uninitialized during Phase 1 setup (Requested keyId: ${keyId})`,
    );
  }
}
