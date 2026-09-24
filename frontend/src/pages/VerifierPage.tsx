/**
 * @fileoverview Verifier Portal & Pipeline View
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import React, { useState } from 'react';
import { VerificationResult } from '../features/verification/VerificationResult.js';

export const VerifierPage: React.FC = () => {
  const [purpose, setPurpose] = useState('PURPOSE_AGE_VERIFICATION');
  const [createdContract, setCreatedContract] = useState<string | null>(null);

  const handleCreateContract = () => {
    setCreatedContract(`req-${Date.now().toString(36)}`);
  };

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Verifier Portal & Verification Pipeline</h2>
        <span className="badge badge-cyan">Tier 4 Verifier</span>
      </div>

      <div className="glass-card">
        <h4 style={{ marginBottom: '1rem' }}>Formulate Bounded Request Contract</h4>
        <div style={{ marginBottom: '1rem' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              marginBottom: '0.4rem',
            }}
          >
            Regulatory Purpose Code
          </label>
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '6px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-color)',
              color: 'white',
            }}
          />
        </div>

        <button className="button-primary" onClick={handleCreateContract}>
          Issue Signed Request Contract
        </button>

        {createdContract && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: 'rgba(6, 182, 212, 0.1)',
              borderRadius: '6px',
            }}
          >
            Active Contract: <code>{createdContract}</code> (Fresh Nonce Armed)
          </div>
        )}
      </div>

      <VerificationResult />
    </div>
  );
};
