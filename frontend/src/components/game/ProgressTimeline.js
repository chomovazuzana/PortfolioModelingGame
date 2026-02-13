import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { clsx } from 'clsx';
import { GAME_YEARS } from '../../shared/constants';
function formatEur(value) {
    return `EUR ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
export function ProgressTimeline({ snapshots, currentYear, initialCapital }) {
    const snapshotByYear = new Map(snapshots.map((s) => [s.year, s]));
    return (_jsxs("div", { className: "space-y-0", children: [_jsx("h3", { className: "mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500", children: "Portfolio Timeline" }), _jsxs("div", { className: "flex items-center gap-3 pb-3", children: [_jsx("div", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600", children: "\u2022" }), _jsxs("div", { children: [_jsx("div", { className: "text-xs text-gray-500", children: "Starting Capital" }), _jsx("div", { className: "text-sm font-medium text-gray-900", children: formatEur(initialCapital) })] })] }), GAME_YEARS.map((year) => {
                const snapshot = snapshotByYear.get(year);
                const isCurrent = year === currentYear;
                const isFuture = year > currentYear;
                return (_jsxs("div", { className: "relative flex items-start gap-3 pb-3 pl-0", children: [_jsx("div", { className: "absolute left-4 top-0 -mt-3 h-3 w-px bg-gray-200" }), _jsx("div", { className: clsx('relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold', snapshot && 'bg-green-100 text-green-700', isCurrent && !snapshot && 'bg-blue-100 text-blue-700 ring-2 ring-blue-300', isFuture && 'bg-gray-100 text-gray-400'), children: snapshot ? (_jsx("svg", { className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2.5, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M5 13l4 4L19 7" }) })) : isCurrent ? (_jsx("span", { className: "text-xs", children: year.toString().slice(-2) })) : (_jsx("span", { className: "text-gray-300", children: "\u2014" })) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "text-sm font-medium text-gray-900", children: ["Year ", year] }), snapshot ? (_jsxs("div", { className: "mt-0.5 text-xs text-gray-500", children: [formatEur(snapshot.valueStart), " \u2192 ", formatEur(snapshot.valueEnd), ' ', _jsxs("span", { className: clsx('font-medium', snapshot.returnPct >= 0 ? 'text-green-600' : 'text-red-600'), children: ["(", snapshot.returnPct >= 0 ? '+' : '', snapshot.returnPct.toFixed(2), "%)"] })] })) : isCurrent ? (_jsx("div", { className: "mt-0.5 text-xs text-blue-600", children: "Awaiting allocation..." })) : (_jsx("div", { className: "mt-0.5 text-xs text-gray-400", children: "Upcoming" }))] })] }, year));
            })] }));
}
