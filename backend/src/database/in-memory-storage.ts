/**
 * @fileoverview In-Memory Minimal Verifier Storage Implementation
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import { MinimalAuditLogEntry } from '@pramana/shared';
import { IVerifierStorage } from './storage-interface.js';

export class InMemoryVerifierStorage implements IVerifierStorage {
  private readonly activeNonces = new Map<string, string>(); // nonce -> expiresAt
  private readonly nullifiers = new Set<string>(); // `${contextId}:${nullifierHash}`
  private readonly auditLogs = new Map<string, MinimalAuditLogEntry>(); // sessionId -> entry

  async registerNonce(nonce: string, expiresAt: string): Promise<boolean> {
    if (this.activeNonces.has(nonce)) {
      return false;
    }
    this.activeNonces.set(nonce, expiresAt);
    return true;
  }

  async burnNonce(nonce: string): Promise<boolean> {
    const expiresAt = this.activeNonces.get(nonce);
    if (!expiresAt) {
      return false;
    }
    this.activeNonces.delete(nonce);
    // Check if expired
    return Date.parse(expiresAt) > Date.now();
  }

  async hasNullifier(contextId: string, nullifierHash: string): Promise<boolean> {
    const key = `${contextId}:${nullifierHash}`;
    return this.nullifiers.has(key);
  }

  async recordNullifier(contextId: string, nullifierHash: string): Promise<void> {
    const key = `${contextId}:${nullifierHash}`;
    this.nullifiers.add(key);
  }

  async appendAuditLog(entry: MinimalAuditLogEntry): Promise<void> {
    this.auditLogs.set(entry.sessionId, entry);
  }

  async getAuditLog(sessionId: string): Promise<MinimalAuditLogEntry | null> {
    return this.auditLogs.get(sessionId) ?? null;
  }
}

export const verifierStorage = new InMemoryVerifierStorage();
