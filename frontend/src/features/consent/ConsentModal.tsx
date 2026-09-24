/**
 * @fileoverview Template-Bound Citizen Consent Modal
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import React from 'react';
import { RequestContract } from '@pramana/shared';
import { TemplateRenderer } from '../../lib/template-renderer.js';

interface ConsentModalProps {
  contract: RequestContract | null;
  onAuthorize: () => void;
  onReject: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({ contract, onAuthorize, onReject }) => {
  if (!contract) return null;

  const defaultTemplate =
    '{{verifier_name}} is requesting to verify eligibility for {{purpose}}. Under the Pramāṇa protocol, your underlying personal documents will NOT be shared.';

  const renderedText = TemplateRenderer.render(defaultTemplate, {
    verifier_name: contract.verifier.name,
    purpose: contract.purpose,
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div className="glass-card" style={{ maxWidth: '500px', width: '100%' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--accent-cyan)' }}>
          Bounded Consent Request
        </h3>
        <p style={{ marginBottom: '1.25rem', lineHeight: '1.5' }}>{renderedText}</p>

        <div
          style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
          }}
        >
          <div>
            <strong>Nonce:</strong> {contract.nonce.substring(0, 16)}...
          </div>
          <div>
            <strong>Expires:</strong> {contract.expiresAt}
          </div>
          <div>
            <strong>Retention:</strong> {contract.retention}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            onClick={onReject}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Reject
          </button>
          <button className="button-primary" onClick={onAuthorize}>
            Authorize Proof
          </button>
        </div>
      </div>
    </div>
  );
};
