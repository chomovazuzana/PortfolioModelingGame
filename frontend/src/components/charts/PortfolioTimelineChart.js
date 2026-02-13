import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, } from 'recharts';
import { GAME_YEARS } from '../../shared/constants';
function formatEur(value) {
    return `EUR ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
function buildChartData(playerSnapshots, optimalPath, initialCapital, topPlayers) {
    const snapshotByYear = new Map(playerSnapshots.map((s) => [s.year, s]));
    const optimalByYear = new Map(optimalPath.map((o) => [o.year, o]));
    const data = [
        {
            label: 'Start',
            player: initialCapital,
            optimal: initialCapital,
        },
    ];
    // Add initial capital for top players
    if (topPlayers) {
        for (const tp of topPlayers) {
            data[0][tp.name] = initialCapital;
        }
    }
    for (const year of GAME_YEARS) {
        const point = {
            label: String(year),
            player: snapshotByYear.get(year)?.valueEnd ?? 0,
            optimal: optimalByYear.get(year)?.portfolioValue ?? 0,
        };
        if (topPlayers) {
            for (const tp of topPlayers) {
                const tpSnap = tp.snapshots.find((s) => s.year === year);
                point[tp.name] = tpSnap?.valueEnd ?? 0;
            }
        }
        data.push(point);
    }
    return data;
}
const GRAY_SHADES = ['#9ca3af', '#b0b5bd', '#c4c9d0'];
export function PortfolioTimelineChart({ playerSnapshots, optimalPath, initialCapital, topPlayers, }) {
    const data = buildChartData(playerSnapshots, optimalPath, initialCapital, topPlayers);
    const lastPlayer = playerSnapshots[playerSnapshots.length - 1];
    const lastOptimal = optimalPath[optimalPath.length - 1];
    const summaryText = lastPlayer && lastOptimal
        ? `Portfolio growth chart. Your final value: ${formatEur(lastPlayer.valueEnd)}. Optimal: ${formatEur(lastOptimal.portfolioValue)}.`
        : 'Portfolio growth chart showing your portfolio vs optimal over 4 years.';
    return (_jsxs("div", { children: [_jsx("h2", { className: "mb-4 text-lg font-semibold text-gray-900", children: "Portfolio Growth" }), _jsx("div", { className: "h-64 sm:h-80", role: "img", "aria-label": summaryText, children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: data, margin: { top: 5, right: 10, left: 0, bottom: 5 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb" }), _jsx(XAxis, { dataKey: "label", tick: { fontSize: 11, fill: '#6b7280' }, tickLine: false }), _jsx(YAxis, { tick: { fontSize: 11, fill: '#6b7280' }, tickLine: false, tickFormatter: (value) => `${(value / 1000).toFixed(0)}k`, width: 50 }), _jsx(Tooltip, { formatter: (value) => [
                                    formatEur(Number(value ?? 0)),
                                ], labelStyle: { fontWeight: 600 }, contentStyle: { borderRadius: 8, border: '1px solid #e5e7eb' } }), _jsx(Legend, {}), topPlayers?.map((tp, i) => (_jsx(Line, { type: "monotone", dataKey: tp.name, stroke: GRAY_SHADES[i % GRAY_SHADES.length], strokeWidth: 1, dot: false, strokeDasharray: "4 2" }, tp.name))), _jsx(Line, { type: "monotone", dataKey: "optimal", name: "Optimal", stroke: "#d97706", strokeWidth: 2, strokeDasharray: "6 3", dot: { r: 3, fill: '#d97706' } }), _jsx(Line, { type: "monotone", dataKey: "player", name: "You", stroke: "#2563eb", strokeWidth: 3, dot: { r: 4, fill: '#2563eb' }, activeDot: { r: 6 } })] }) }) })] }));
}
