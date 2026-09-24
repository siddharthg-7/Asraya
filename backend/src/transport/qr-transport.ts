/**
 * @fileoverview Offline QR Transport Abstraction
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import { ITransportChannel } from './transport-interface.js';
import { ERROR_CODES, PramanaError } from '@pramana/shared';

export interface QRChunkOptions {
  readonly maxChunkSize: number;
  readonly errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

export class QROfflineTransport implements ITransportChannel {
  readonly channelType = 'QR_OFFLINE';

  async send(_payload: Uint8Array): Promise<void> {
    throw new PramanaError(
      ERROR_CODES.NOT_IMPLEMENTED,
      'QR rendering transport not initialized for server execution',
    );
  }

  async receive(): Promise<Uint8Array> {
    throw new PramanaError(
      ERROR_CODES.NOT_IMPLEMENTED,
      'QR scanning transport not initialized for server execution',
    );
  }

  chunkPayload(payload: string, maxChunkLength: number = 512): readonly string[] {
    const chunks: string[] = [];
    for (let i = 0; i < payload.length; i += maxChunkLength) {
      chunks.push(payload.slice(i, i + maxChunkLength));
    }
    return chunks;
  }
}
