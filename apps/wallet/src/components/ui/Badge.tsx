import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-xs gap-1 font-medium',
    md: 'px-3 py-1 text-xs gap-1.5 font-bold',
  };

  const variantStyles = {
    neutral: 'bg-[#f1f4f7] text-[#1c1e21] border border-[#dee3e9]',
    indigo: 'bg-[#e7f0ff] text-[#0064e0] border border-[#b8d5ff]',
    emerald: 'bg-[#e6f4ea] text-[#137333] border border-[#ceead6]',
    amber: 'bg-[#fef7e0] text-[#b06000] border border-[#feefc3]',
    rose: 'bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf]',
    cyan: 'bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
};

