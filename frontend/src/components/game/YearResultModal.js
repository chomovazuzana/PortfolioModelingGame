import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { clsx } from 'clsx';
import { ASSET_CLASS_LABELS } from '../../shared/constants';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
function formatEur(value) {
    return `EUR ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function formatPct(value) {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
}
export function YearResultModal({ result, onContinue, onClose }) {
    const pnl = result.portfolioEnd - result.portfolioStart;
    const isPositive = result.returnPct >= 0;
    return (_jsx(Dialog, { open: true, onClose: onClose, title: `Year ${result.year} Results`, className: "max-w-xl", children: _jsxs("div", { className: "space-y-5", children: [_jsxs("div", { className: "grid grid-cols-3 gap-4 text-center", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs text-gray-500", children: "Start Value" }), _jsx("div", { className: "mt-1 text-sm font-semibold text-gray-900", children: formatEur(result.portfolioStart) })] }), _jsxs("div", { children: [_jsx("div", { className: "text-xs text-gray-500", children: "End Value" }), _jsx("div", { className: clsx('mt-1 text-sm font-semibold', isPositive ? 'text-green-700' : 'text-red-600'), children: formatEur(result.portfolioEnd) })] }), _jsxs("div", { children: [_jsx("div", { className: "text-xs text-gray-500", children: "Return" }), _jsx("div", { className: clsx('mt-1 text-sm font-semibold', isPositive ? 'text-green-700' : 'text-red-600'), children: formatPct(result.returnPct) })] })] }), _jsx("div", { className: "overflow-hidden rounded-lg border border-gray-200", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500", children: [_jsx("th", { className: "px-4 py-2", children: "Asset" }), _jsx("th", { className: "px-4 py-2 text-right", children: "Allocation" }), _jsx("th", { className: "px-4 py-2 text-right", children: "Return" }), _jsx("th", { className: "px-4 py-2 text-right", children: "Contribution" })] }) }), _jsx("tbody", { children: result.breakdown.map((row, i) => (_jsxs("tr", { className: clsx(i % 2 === 0 ? 'bg-white' : 'bg-gray-50'), children: [_jsx("td", { className: "px-4 py-2 font-medium text-gray-900", children: ASSET_CLASS_LABELS[row.asset] }), _jsxs("td", { className: "px-4 py-2 text-right tabular-nums text-gray-700", children: [row.allocated, "%"] }), _jsx("td", { className: clsx('px-4 py-2 text-right tabular-nums', row.returnPct >= 0 ? 'text-green-700' : 'text-red-600'), children: formatPct(row.returnPct) }), _jsx("td", { className: clsx('px-4 py-2 text-right tabular-nums', row.contribution >= 0 ? 'text-green-700' : 'text-red-600'), children: formatEur(row.contribution) })] }, row.asset))) })] }) }), _jsxs("div", { className: "flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3", children: [_jsx("span", { className: "font-medium text-gray-700", children: "Total P&L" }), _jsxs("span", { className: clsx('text-lg font-bold tabular-nums', pnl >= 0 ? 'text-green-700' : 'text-red-600'), children: [pnl >= 0 ? '+' : '', formatEur(pnl)] })] }), _jsx("div", { className: "flex justify-end", children: _jsxs(Button, { onClick: onContinue, className: "w-full sm:w-auto", children: [result.nextYear
                                ? `Continue to Year ${result.nextYear}`
                                : 'View Final Results', ' ', _jsx("span", { "aria-hidden": "true", children: "\u2192" })] }) })] }) }));
}
