import React from 'react';
import { ShieldCheck, Lock, KeyRound, EyeOff } from 'lucide-react';

export interface TrustBadgeProps {
  type: 'zero-pii' | 'bbs-tier-a' | 'local-enclave' | 'non-custodial';
  size?: 'sm' | 'md';
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({ type, size = 'md' }) => {
  const configs = {
    'zero-pii': {
      label: 'Zero Raw PII Disclosed',
      icon: <EyeOff className="w-3.5 h-3.5 text-[#137333]" />,
      bg: 'bg-[#e6f4ea] border-[#ceead6] text-[#137333]',
    },
    'bbs-tier-a': {
      label: 'Tier A BBS+ Proof',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-[#0064e0]" />,
      bg: 'bg-[#e7f0ff] border-[#b8d5ff] text-[#0064e0]',
    },
    'local-enclave': {
      label: 'Local Wallet Enclave',
      icon: <Lock className="w-3.5 h-3.5 text-[#1a73e8]" />,
      bg: 'bg-[#e8f0fe] border-[#d2e3fc] text-[#1a73e8]',
    },
    'non-custodial': {
      label: 'Citizen Non-Custodial',
      icon: <KeyRound className="w-3.5 h-3.5 text-[#a121ce]" />,
      bg: 'bg-[#f3e8fd] border-[#e1c5f7] text-[#a121ce]',
    },
  };

  const config = configs[type];
  const sizeClasses =
    size === 'sm'
      ? 'px-2.5 py-0.5 text-xs gap-1 font-semibold'
      : 'px-3 py-1 text-xs gap-1.5 font-bold';

  return (
    <span className={`inline-flex items-center rounded-full border ${config.bg} ${sizeClasses}`}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
