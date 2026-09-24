/**
 * @fileoverview Protocol Overview & Paradigm Landing Page
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import React from 'react';
import { PROTOCOL_NAME } from '@pramana/shared';

export const HomePage: React.FC = () => {
  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <section className="glass-card">
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Move the Question, Not the Data.
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          {PROTOCOL_NAME} inverts traditional identity verification. Instead of citizens uploading
          documents and leaking Personally Identifiable Information (PII), verifiers ask a bounded
          cryptographic question. The citizen's non-custodial wallet produces a zero-knowledge
          selective-disclosure proof. The verifier receives only the verified answer.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              padding: '1rem',
              borderRadius: '8px',
              flex: '1 1 200px',
            }}
          >
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>Tier A: BBS-First</span>
            <p
              style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}
            >
              Selective disclosure over BLS12-381 with zero per-predicate trusted setup.
            </p>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              padding: '1rem',
              borderRadius: '8px',
              flex: '1 1 200px',
            }}
          >
            <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>
              Tier B: Groth16 Fallback
            </span>
            <p
              style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}
            >
              Circom zk-SNARK circuits reserved for complex non-linear arithmetic.
            </p>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              padding: '1rem',
              borderRadius: '8px',
              flex: '1 1 200px',
            }}
          >
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>Minimal Storage</span>
            <p
              style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}
            >
              Verifiers retain only non-identifying audit receipts—ZERO raw citizen PII.
            </p>
          </div>
        </div>
      </section>

      <section className="glass-card">
        <h3 style={{ marginBottom: '1rem' }}>Protocol Architecture Tiers</h3>
        <ul style={{ listStyle: 'none', display: 'grid', gap: '0.75rem', fontSize: '0.9rem' }}>
          <li>
            <strong>Tier 1:</strong> Identity & Schema Mediation (Trust Registry & Checkpoints)
          </li>
          <li>
            <strong>Tier 2:</strong> Cryptographic Minimization Engine (BBS & Groth16)
          </li>
          <li>
            <strong>Tier 3:</strong> Non-Custodial Consent & Channel Protocol (Template-Bound
            Contracts)
          </li>
          <li>
            <strong>Tier 4:</strong> Ephemeral Transport & Verifier Pipeline (QR / Relay & Replay
            Defense)
          </li>
        </ul>
      </section>
    </div>
  );
};
