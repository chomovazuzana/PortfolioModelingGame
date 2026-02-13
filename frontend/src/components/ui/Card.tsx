import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface CardProps {
  header?: ReactNode;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ header, children, className, onClick }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-gray-200 bg-white shadow-sm',
        onClick && 'cursor-pointer hover:border-blue-300 hover:shadow-md transition-all',
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick(); } : undefined}
    >
      {header && (
        <div className="border-b border-gray-200 px-6 py-4 font-semibold text-gray-900">
          {header}
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
    </div>
  );
}
