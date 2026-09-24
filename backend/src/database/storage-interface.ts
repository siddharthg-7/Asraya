/**
 * @fileoverview Verifier Storage Abstraction (Minimal Verifier-Side Storage)
 * Pramāṇa Protocol - Phase 1 Foundation
 *
 * Invariant: The verifier storage interface must NEVER allow storing raw citizen attributes.
 */

import { MinimalAuditLogEntry } from '@pramana/shared';

export interface IVerifierStorage {
  /**
   * Records a nonce as active, rejecting if already present (anti-replay)
   */
  registerNonce(nonce: string, expiresAt: string): Promise<boolean>;

  /**
   * Consumes and burns a nonce, returning true if successfully burned, false if missing/already used
   */
  burnNonce(nonce: string): Promise<boolean>;

  /**
   * Checks whether a context-scoped nullifier has already been claimed (double-claim defense)
   */
  hasNullifier(contextId: string, nullifierHash: string): Promise<boolean>;

  /**
   * Records a context-scoped nullifier upon successful proof verification
   */
  recordNullifier(contextId: string, nullifierHash: string): Promise<void>;

  /**
   * Appends a minimal, non-identifying audit log entry
   */
  appendAuditLog(entry: MinimalAuditLogEntry): Promise<void>;

  /**
   * Retrieves an audit log entry by session ID for regulatory compliance review
   */
  getAuditLog(sessionId: string): Promise<MinimalAuditLogEntry | null>;
}
