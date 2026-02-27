import type { HTMLAttributes } from 'react';

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Panel = ({ children, className = '', ...props }: PanelProps) => {
  return (
    <div
      {...props}
      className={`rounded-lg border border-black bg-surface-raised p-5 shadow-md ${className}`}
    >
      {children}
    </div>
  );
};
