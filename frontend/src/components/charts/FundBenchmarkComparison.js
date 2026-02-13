import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { clsx } from 'clsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, } from 'recharts';
function formatEur(value) {
    return `EUR ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function formatPct(value) {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
}
function buildChartEntries(playerFinalValue, fundBenchmarks, initialCapital) {
    const entries = [
        {
            name: 'Your Portfolio',
            value: playerFinalValue,
            returnPct: ((playerFinalValue - initialCapital) / initialCapital) * 100,
            isPlayer: true,
        },
        ...fundBenchmarks.map((fb) => ({
            name: fb.fundName,
            value: fb.finalValue,
            returnPct: fb.cumulativeReturnPct,
            isPlayer: false,
        })),
    ];
    entries.sort((a, b) => b.value - a.value);
    return entries;
}
export function FundBenchmarkComparison({ playerFinalValue, fundBenchmarks, initialCapital, }) {
    if (fundBenchmarks.length === 0) {
        return (_jsxs("div", { children: [_jsx("h2", { className: "mb-4 text-lg font-semibold text-gray-900", children: "Fund Benchmark Comparison" }), _jsx("p", { className: "text-sm text-gray-400", children: "No fund benchmark data available." })] }));
    }
    const entries = buildChartEntries(playerFinalValue, fundBenchmarks, initialCapital);
    const maxValue = Math.max(...entries.map((e) => e.value));
    const playerRank = entries.findIndex((e) => e.isPlayer) + 1;
    const summaryText = `Fund benchmark comparison. Your portfolio ranks ${playerRank} of ${entries.length} (including ${fundBenchmarks.length} fund benchmarks).`;
    return (_jsxs("div", { children: [_jsx("h2", { className: "mb-4 text-lg font-semibold text-gray-900", children: "Fund Benchmark Comparison" }), _jsx("div", { style: { height: entries.length * 44 + 40 }, role: "img", "aria-label": summaryText, children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: entries, layout: "vertical", margin: { top: 5, right: 10, left: 10, bottom: 5 }, children: [_jsx(XAxis, { type: "number", tick: { fontSize: 10, fill: '#6b7280' }, tickLine: false, domain: [0, Math.ceil(maxValue / 10000) * 10000], tickFormatter: (value) => `${(value / 1000).toFixed(0)}k` }), _jsx(YAxis, { type: "category", dataKey: "name", tick: { fontSize: 10, fill: '#374151' }, tickLine: false, width: 120 }), _jsx(Tooltip, { formatter: (value) => [
                                    value != null ? formatEur(value) : '',
                                    'Final Value',
                                ], contentStyle: { borderRadius: 8, border: '1px solid #e5e7eb' } }), _jsx(Bar, { dataKey: "value", radius: [0, 4, 4, 0], barSize: 24, children: entries.map((entry) => (_jsx(Cell, { fill: entry.isPlayer ? '#2563eb' : '#94a3b8' }, entry.name))) })] }) }) }), _jsx("div", { className: "mt-6 overflow-x-auto rounded-lg border border-gray-200", children: _jsxs("table", { className: "w-full text-sm", "aria-label": "Fund benchmark comparison details", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500", children: [_jsx("th", { className: "px-3 py-2 sm:px-4", children: "Fund" }), _jsx("th", { className: "px-3 py-2 text-right whitespace-nowrap sm:px-4", children: "Final Value" }), _jsx("th", { className: "px-3 py-2 text-right whitespace-nowrap sm:px-4", children: "Cumulative Return" })] }) }), _jsx("tbody", { children: entries.map((entry, i) => (_jsxs("tr", { className: clsx('border-t border-gray-100', entry.isPlayer ? 'bg-blue-50 font-medium' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50'), children: [_jsxs("td", { className: "px-3 py-2 text-gray-900 sm:px-4", children: [entry.name, entry.isPlayer && _jsx("span", { className: "ml-1 text-xs text-blue-600", children: "(you)" })] }), _jsx("td", { className: "px-3 py-2 text-right tabular-nums text-gray-700 whitespace-nowrap sm:px-4", children: formatEur(entry.value) }), _jsx("td", { className: clsx('px-3 py-2 text-right tabular-nums whitespace-nowrap sm:px-4', entry.returnPct >= 0 ? 'text-green-700' : 'text-red-600'), children: formatPct(entry.returnPct) })] }, entry.name))) })] }) }), _jsxs("p", { className: "mt-4 rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-800", children: [_jsx("strong", { children: "Note:" }), " Fund benchmarks use 3 asset classes (Cash, Fixed Income, Equity). The game uses 5 asset classes (Cash, Bonds, Equities, Commodities, REITs). This comparison is for educational context, not direct equivalence."] })] }));
}
