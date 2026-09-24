import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'bordered' | 'accent';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  onClick,
}) => {
  const variantStyles = {
    default: 'bg-white border border-[#dee3e9] shadow-none',
    subtle: 'bg-[#f1f4f7] border border-[#dee3e9] shadow-none',
    bordered: 'bg-white border border-[#ced0d4] shadow-none',
    accent: 'bg-white border border-[#0064e0]/30 shadow-sm',
  };

  const clickableStyles = onClick ? 'cursor-pointer hover:border-[#ced0d4] transition-all duration-150' : '';

  return (
    <div
      onClick={onClick}
      className={`rounded-3xl p-6 sm:p-8 ${variantStyles[variant]} ${clickableStyles} ${className}`}
    >
      {children}
    </div>
  );
};

