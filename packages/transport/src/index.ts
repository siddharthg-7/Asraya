/**
 * @fileoverview Module Boundary: @pramana/transport
 *
 * Status: SETUP ONLY (Implementation NOT STARTED)
 *
 * Responsibilities:
 * - Ephemeral transport protocols (QR, BLE, HTTPS relay, WebRTC)
 * - Anti-replay token and nonce generation/checking
 * - End-to-end encrypted envelope transport (HPKE)
 * - Compression and QR chunking for offline/air-gapped scenarios
 *
 * Prohibitions:
 * - Never transmit unencrypted proof or attribute envelopes over untrusted channels.
 */

export const TRANSPORT_MODULE_STATUS = 'SETUP_ONLY_NOT_STARTED' as const;

export type TransportModuleStatus = typeof TRANSPORT_MODULE_STATUS;

export type TransportChannelType = 'QR_OFFLINE' | 'HTTPS_RELAY' | 'BLE_PROXIMITY';
