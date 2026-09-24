/**
 * @fileoverview Receipt Abstractions (Verification Receipts & Audit Receipts)
 * Pramāṇa Protocol - Phase 1 Foundation
 */

export type VerificationVerdict = 'VERIFIED' | 'REJECTED' | 'EXPIRED' | 'MALFORMED';

export interface VerificationReceipt {
  readonly id: string; // UUIDv4
  readonly contractId: string;
  readonly verifierDid: string;
  readonly purpose: string;
  readonly verdict: VerificationVerdict;
  readonly verifiedAt: string; // ISO 8601 UTC
  readonly nullifierHash: string; // Context-scoped duplicate detection token
  readonly signature: string; // Verifier signature sealing verification verdict
}

export interface MinimalAuditLogEntry {
  readonly sessionId: string;
  readonly verifierDid: string;
  readonly purposeCode: string;
  readonly timestamp: string;
  readonly verdict: VerificationVerdict;
  readonly nullifierHash: string;
  readonly receiptSignature: string;
}
