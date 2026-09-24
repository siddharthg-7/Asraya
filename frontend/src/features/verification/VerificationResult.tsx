/**
 * @fileoverview Verifier Result Component (Minimal Storage Indicator)
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import React from 'react';
import { VerificationReceipt } from '@pramana/shared';

interface VerificationResultProps {
  receipt?: VerificationReceipt;
}

export const VerificationResult: React.FC<VerificationResultProps> = ({ receipt }) => {
  if (!receipt) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Awaiting verification proof submission...</p>
      </div>
    );
  }

  const isVerified = receipt.verdict === 'VERIFIED';

  return (
    <div
      className="glass-card"
      style={{ borderLeft: `4px solid ${isVerified ? 'var(--accent-emerald)' : '#ef4444'}` }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h3 style={{ color: isVerified ? 'var(--accent-emerald)' : '#ef4444' }}>
          {receipt.verdict}
        </h3>
        <span className="badge badge-emerald">Minimal Verifier Storage</span>
      </div>

      <div style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
        <div>
          <strong>Receipt ID:</strong> {receipt.id}
        </div>
        <div>
          <strong>Verifier DID:</strong> {receipt.verifierDid}
        </div>
        <div>
          <strong>Timestamp:</strong> {receipt.verifiedAt}
        </div>
        <div>
          <strong>Nullifier Hash:</strong> <code>{receipt.nullifierHash.substring(0, 16)}...</code>
        </div>
      </div>
    </div>
  );
};
