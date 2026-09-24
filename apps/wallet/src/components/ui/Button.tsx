import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'action' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold tracking-tight transition-all duration-150 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0064e0] focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer select-none';

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs gap-1.5',
    md: 'px-6 py-2.5 text-sm gap-2',
    lg: 'px-8 py-3.5 text-sm sm:text-base gap-2 font-bold',
  };

  const variantStyles = {
    primary: 'bg-[#000000] hover:bg-[#1c1e21] text-white border border-[#000000]',
    action: 'bg-[#0064e0] hover:bg-[#0457cb] text-white border border-[#0064e0]',
    secondary: 'bg-transparent hover:bg-[#f1f4f7] text-[#0a1317] border-2 border-[#0a1317]',
    outline: 'bg-white hover:bg-[#f1f4f7] text-[#1c1e21] border border-[#ced0d4]',
    ghost: 'bg-transparent hover:bg-[#f1f4f7] text-[#1c1e21] border border-transparent',
    danger: 'bg-[#e41e3f] hover:bg-[#f0284a] text-white border border-[#e41e3f]',
    success: 'bg-[#31a24c] hover:bg-[#28843e] text-white border border-[#31a24c]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
