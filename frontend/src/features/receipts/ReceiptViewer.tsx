/**
 * @fileoverview Verifiable Receipt Viewer Component
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import React from 'react';
import { VerificationReceipt } from '@pramana/shared';

interface ReceiptViewerProps {
  receipts: readonly VerificationReceipt[];
}

export const ReceiptViewer: React.FC<ReceiptViewerProps> = ({ receipts }) => {
  if (receipts.length === 0) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>No audit receipts recorded.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {receipts.map((rcpt) => (
        <div key={rcpt.id} className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 600 }}>{rcpt.purpose}</span>
            <span className="badge badge-cyan">{rcpt.verdict}</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Contract: {rcpt.contractId} | Time: {rcpt.verifiedAt}
          </p>
        </div>
      ))}
    </div>
  );
};
