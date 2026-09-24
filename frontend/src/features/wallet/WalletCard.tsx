/**
 * @fileoverview Citizen Wallet Credential Card Component
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import React from 'react';
import { VerifiableCredential } from '@pramana/shared';

interface WalletCardProps {
  credential?: VerifiableCredential | undefined;
}

export const WalletCard: React.FC<WalletCardProps> = ({ credential }) => {
  if (!credential) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>No credentials loaded in wallet.</p>
        <span className="badge badge-cyan" style={{ marginTop: '0.75rem' }}>
          Non-Custodial Secure Enclave
        </span>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontWeight: 700 }}>{credential.issuer.name}</span>
        <span className="badge badge-emerald">BBS+ Signed</span>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        ID: {credential.metadata.id}
      </p>
    </div>
  );
};
