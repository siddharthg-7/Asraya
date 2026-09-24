/**
 * @fileoverview Status Badge Component
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'cyan' | 'emerald' | 'amber';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant = 'cyan' }) => {
  return <span className={`badge badge-${variant}`}>{status}</span>;
};
