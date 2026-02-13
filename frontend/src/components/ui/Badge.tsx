import { clsx } from 'clsx';

type BadgeVariant = 'open' | 'closed' | 'completed' | 'playing' | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  open: 'bg-green-100 text-green-800',
  closed: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  playing: 'bg-purple-100 text-purple-800',
  default: 'bg-gray-100 text-gray-800',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
