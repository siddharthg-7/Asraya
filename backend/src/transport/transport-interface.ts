/**
 * @fileoverview Ephemeral Transport Interfaces
 * Pramāṇa Protocol - Phase 1 Foundation
 */

export interface ITransportChannel {
  readonly channelType: 'ONLINE_HTTP' | 'QR_OFFLINE' | 'BLE_PROXIMITY';
  send(payload: Uint8Array): Promise<void>;
  receive(): Promise<Uint8Array>;
}

export interface IHPKEEncapsulation {
  /**
   * Hybrid Public Key Encryption encapsulation (RFC 9180)
   * Status: UNVERIFIED / PLANNED FOR PHASE 3
   */
  seal(plaintext: Uint8Array, recipientPublicKey: string): Promise<Uint8Array>;
  open(ciphertext: Uint8Array, recipientPrivateKeyRef: string): Promise<Uint8Array>;
}
