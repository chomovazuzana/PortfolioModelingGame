import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { clsx } from 'clsx';
export function Card({ header, children, className, onClick }) {
    return (_jsxs("div", { className: clsx('rounded-xl border border-gray-200 bg-white shadow-sm', onClick && 'cursor-pointer hover:border-blue-300 hover:shadow-md transition-all', className), onClick: onClick, role: onClick ? 'button' : undefined, tabIndex: onClick ? 0 : undefined, onKeyDown: onClick ? (e) => { if (e.key === 'Enter')
            onClick(); } : undefined, children: [header && (_jsx("div", { className: "border-b border-gray-200 px-6 py-4 font-semibold text-gray-900", children: header })), _jsx("div", { className: "px-6 py-4", children: children })] }));
}
