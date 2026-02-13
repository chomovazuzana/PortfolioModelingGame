import { jsx as _jsx } from "react/jsx-runtime";
import { clsx } from 'clsx';
const variantClasses = {
    open: 'bg-green-100 text-green-800',
    closed: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    playing: 'bg-purple-100 text-purple-800',
    default: 'bg-gray-100 text-gray-800',
};
export function Badge({ variant = 'default', children, className }) {
    return (_jsx("span", { className: clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', variantClasses[variant], className), children: children }));
}
