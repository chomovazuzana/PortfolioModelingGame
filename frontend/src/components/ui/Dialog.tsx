import { useEffect, useRef, type ReactNode } from 'react';
import { clsx } from 'clsx';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;

    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className={clsx(
        'rounded-xl border-0 p-0 shadow-xl backdrop:bg-black/50',
        'max-w-lg w-full',
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="px-6 py-4">{children}</div>
    </dialog>
  );
}
