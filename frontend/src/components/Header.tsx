/**
 * @fileoverview Application Header Component
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import React from 'react';
import { PROTOCOL_NAME, PROTOCOL_VERSION } from '@pramana/shared';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: 'overview' | 'wallet' | 'verifier' | 'receipts') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <header
      style={{
        borderBottom: '1px solid var(--border-color)',
        padding: '1rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h1
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            background: 'linear-gradient(90deg, #06b6d4, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {PROTOCOL_NAME}
        </h1>
        <span className="badge badge-cyan">v{PROTOCOL_VERSION} Foundation</span>
      </div>

      <nav style={{ display: 'flex', gap: '0.5rem' }}>
        {(['overview', 'wallet', 'verifier', 'receipts'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              border: activeTab === tab ? '1px solid var(--accent-cyan)' : '1px solid transparent',
              background: activeTab === tab ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
              color: activeTab === tab ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 600,
              textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </nav>
    </header>
  );
};
