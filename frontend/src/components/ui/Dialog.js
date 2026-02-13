import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { clsx } from 'clsx';
export function Dialog({ open, onClose, title, children, className }) {
    const dialogRef = useRef(null);
    useEffect(() => {
        const el = dialogRef.current;
        if (!el)
            return;
        if (open && !el.open) {
            el.showModal();
        }
        else if (!open && el.open) {
            el.close();
        }
    }, [open]);
    return (_jsxs("dialog", { ref: dialogRef, onClose: onClose, className: clsx('rounded-xl border-0 p-0 shadow-xl backdrop:bg-black/50', 'max-w-lg w-full', className), children: [_jsxs("div", { className: "flex items-center justify-between border-b border-gray-200 px-6 py-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: title }), _jsx("button", { onClick: onClose, className: "rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600", "aria-label": "Close", children: _jsx("svg", { className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsx("div", { className: "px-6 py-4", children: children })] }));
}
