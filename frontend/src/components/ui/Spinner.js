import { jsx as _jsx } from "react/jsx-runtime";
import { clsx } from 'clsx';
const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
};
export function Spinner({ size = 'md', className }) {
    return (_jsx("div", { className: clsx('animate-spin rounded-full border-gray-300 border-t-blue-600', sizeClasses[size], className), role: "status", "aria-label": "Loading" }));
}
