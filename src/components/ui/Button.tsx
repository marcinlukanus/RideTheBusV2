import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'dark';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-hover',
  secondary: 'bg-amber-600 text-white hover:bg-amber-700',
  ghost: 'bg-white text-black hover:bg-gray-100',
  dark: 'bg-black text-white hover:bg-gray-900',
};

export const Button = ({ variant = 'primary', className = '', ...props }: ButtonProps) => {
  return (
    <button
      {...props}
      className={`cursor-pointer rounded-lg px-4 py-2 text-lg font-bold shadow-md transition-colors active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
    />
  );
};
