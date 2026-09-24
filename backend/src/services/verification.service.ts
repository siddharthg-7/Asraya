/**
 * @fileoverview Verifier Pipeline Service (Tier 4 Execution)
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import { ProofEnvelope, VerificationReceipt, ERROR_CODES, PramanaError } from '@pramana/shared';
import { verifierStorage } from '../database/in-memory-storage.js';
import { trustRegistry } from '../registry/trust-registry.js';
import { proofOrchestrator } from '../proofs/proof-engine.js';
import { isTimestampValid } from '../utils/nonce.js';

export class VerificationService {
  async processProofEnvelope(envelope: ProofEnvelope): Promise<VerificationReceipt> {
    // 1. Validate temporal freshness
    if (!isTimestampValid(envelope.createdAt)) {
      throw new PramanaError(
        ERROR_CODES.EXPIRED_REQUEST,
        'Proof envelope creation timestamp is expired or outside temporal tolerance',
      );
    }

    // 2. Anti-Replay: Burn the active nonce
    const nonceBurned = await verifierStorage.burnNonce(envelope.nonce);
    if (!nonceBurned) {
      throw new PramanaError(
        ERROR_CODES.REPLAY_DETECTED,
        `Replay attack detected: Nonce ${envelope.nonce} has already been burned or expired`,
      );
    }

    // 3. Double-Claim Protection: Check Context-Scoped Nullifier
    const nullifierClaimed = await verifierStorage.hasNullifier(
      envelope.nullifier.contextId,
      envelope.nullifier.nullifierHash,
    );
    if (nullifierClaimed) {
      throw new PramanaError(
        ERROR_CODES.INVALID_REQUEST,
        'Duplicate claim detected: Context-scoped nullifier has already been redeemed for this campaign context',
      );
    }

    // 4. Registry verification: fetch issuer public key
    const issuerRecord = await trustRegistry.getIssuer('did:pramana:issuer:gov-civil-dept');
    const issuerKey = issuerRecord?.publicKeys.bbsG2PublicKey ?? 'default_key';

    // 5. Cryptographic proof verification
    // Note: In Phase 1, proofOrchestrator will throw NOT_IMPLEMENTED for real math, or reject invalid mock
    await proofOrchestrator.verify(envelope, issuerKey);

    // 6. Record context-scoped nullifier
    await verifierStorage.recordNullifier(
      envelope.nullifier.contextId,
      envelope.nullifier.nullifierHash,
    );

    // 7. Minimal verifier storage: Append non-identifying audit log
    const sessionId = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const verifiedAt = new Date().toISOString();
    const signature = `verif_sig_${sessionId}`;

    await verifierStorage.appendAuditLog({
      sessionId,
      verifierDid: envelope.verifierDid,
      purposeCode: 'PURPOSE_VERIFIED',
      timestamp: verifiedAt,
      verdict: 'VERIFIED',
      nullifierHash: envelope.nullifier.nullifierHash,
      receiptSignature: signature,
    });

    // 8. Return verification receipt
    return {
      id: `rcpt-${sessionId}`,
      contractId: envelope.contractId,
      verifierDid: envelope.verifierDid,
      purpose: 'PURPOSE_VERIFIED',
      verdict: 'VERIFIED',
      verifiedAt,
      nullifierHash: envelope.nullifier.nullifierHash,
      signature,
    };
  }
}

export const verificationService = new VerificationService();
