/**
 * @fileoverview Citizen Domain Model
 * Pramāṇa Protocol - Phase 1 Foundation
 */

export interface CitizenIdentity {
  readonly holderPublicKeyHash: string;
  readonly preferredLocale: string;
}

export interface CitizenCredentialRef {
  readonly credentialId: string;
  readonly schemaId: string;
  readonly issuerDid: string;
  readonly issuedAt: string;
}
