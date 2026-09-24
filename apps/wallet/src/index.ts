/**
 * @fileoverview Application Boundary: @pramana/wallet
 *
 * Status: SETUP ONLY (Application Implementation NOT STARTED)
 *
 * Future Responsibilities:
 * - Citizen non-custodial credential storage
 * - Bounded consent contract prompt rendering from canonical templates
 * - Selective disclosure and proof generation (Tier A BBS / Tier B Groth16)
 * - Ephemeral transport (QR / Relay)
 *
 * Prohibitions during setup phase:
 * - DO NOT build the wallet application.
 * - DO NOT build UI screens.
 * - DO NOT build cryptography.
 */

export const WALLET_APP_STATUS = 'SETUP_ONLY_NOT_STARTED' as const;

export type WalletAppStatus = typeof WALLET_APP_STATUS;
