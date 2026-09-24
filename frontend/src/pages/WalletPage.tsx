/**
 * @fileoverview Citizen Wallet View
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import React from 'react';
import { WalletCard } from '../features/wallet/WalletCard.js';
import { useWallet } from '../hooks/useWallet.js';

export const WalletPage: React.FC = () => {
  const { credentials } = useWallet();

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Citizen Sovereign Wallet</h2>
        <span className="badge badge-emerald">Non-Custodial</span>
      </div>

      <WalletCard credential={credentials[0]} />

      <div className="glass-card">
        <h4 style={{ marginBottom: '0.5rem' }}>Sovereignty Invariant</h4>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Your cryptographic holder keys reside exclusively on this device. When verifiers submit
          questions, you review the exact template-bound prompt and approve proof generation without
          exposing your personal documents.
        </p>
      </div>
    </div>
  );
};
