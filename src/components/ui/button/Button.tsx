import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'gray' | 'ghost' | "destructive";
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  loading = false,
  disabled,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center px-3 py-1.5 rounded-md text-sm font-medium transition-transform transition-shadow duration-150 ease-out focus:outline-none';
  const stateDisabled = loading || disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'hover:shadow-md active:translate-y-[1px]';

  const variants: Record<string, string> = {
    primary: 'bg-[#1976d2] text-white hover:bg-[#1560b6] focus:ring-4 focus:ring-[#1976d233]',
    outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-200',
    gray: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-4 focus:ring-gray-200',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-4 focus:ring-gray-100',
    destructive: 'bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2 h-10flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${stateDisabled} ${className}`}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white/90" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
      )}
      <span className="truncate">{children}</span>
    </button>
  );
};

export default Button;
