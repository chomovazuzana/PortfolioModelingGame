import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { clsx } from 'clsx';
function formatEur(value) {
    return `EUR ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function formatPct(value) {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
}
const MEDAL_ICONS = {
    1: '\u{1F947}',
    2: '\u{1F948}',
    3: '\u{1F949}',
};
export function FinalLeaderboard({ leaderboard, optimalFinalValue, currentUserId }) {
    const optimalReturnPct = ((optimalFinalValue - 100_000) / 100_000) * 100;
    return (_jsxs("div", { children: [_jsx("h2", { className: "mb-4 text-lg font-semibold text-gray-900", children: "Final Leaderboard" }), _jsx("div", { className: "overflow-x-auto rounded-lg border border-gray-200", children: _jsxs("table", { className: "w-full text-sm", "aria-label": "Final leaderboard with player rankings", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500", children: [_jsx("th", { className: "px-3 py-3 w-14 sm:px-4", children: "Rank" }), _jsx("th", { className: "px-3 py-3 sm:px-4", children: "Player" }), _jsx("th", { className: "px-3 py-3 text-right whitespace-nowrap sm:px-4", children: "Final Value" }), _jsx("th", { className: "px-3 py-3 text-right whitespace-nowrap sm:px-4", children: "Total Return" })] }) }), _jsxs("tbody", { children: [leaderboard.map((entry) => {
                                    const isMe = entry.userId === currentUserId;
                                    const medal = MEDAL_ICONS[entry.rank];
                                    return (_jsxs("tr", { className: clsx('border-t border-gray-100', isMe ? 'bg-blue-50 font-medium' : 'bg-white'), children: [_jsx("td", { className: "px-3 py-3 tabular-nums text-gray-600 sm:px-4", children: medal ? (_jsx("span", { className: "mr-1", role: "img", "aria-label": `Rank ${entry.rank}`, children: medal })) : (entry.rank) }), _jsxs("td", { className: "px-3 py-3 text-gray-900 sm:px-4", children: [entry.displayName, isMe && _jsx("span", { className: "ml-1 text-xs text-blue-600", children: "(you)" })] }), _jsx("td", { className: "px-3 py-3 text-right tabular-nums text-gray-700 whitespace-nowrap sm:px-4", children: formatEur(entry.portfolioValue) }), _jsx("td", { className: clsx('px-3 py-3 text-right tabular-nums whitespace-nowrap sm:px-4', entry.totalReturnPct >= 0 ? 'text-green-700' : 'text-red-600'), children: formatPct(entry.totalReturnPct) })] }, entry.userId));
                                }), _jsxs("tr", { className: "border-t-2 border-amber-300 bg-amber-50", children: [_jsx("td", { className: "px-3 py-3 text-amber-700 sm:px-4", children: _jsx("svg", { className: "inline h-4 w-4", fill: "currentColor", viewBox: "0 0 20 20", "aria-hidden": "true", children: _jsx("path", { d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" }) }) }), _jsxs("td", { className: "px-3 py-3 font-medium text-amber-800 sm:px-4", children: ["Optimal Portfolio", _jsx("span", { className: "ml-1 text-xs text-amber-600", children: "(hindsight)" })] }), _jsx("td", { className: "px-3 py-3 text-right tabular-nums font-semibold text-amber-800 whitespace-nowrap sm:px-4", children: formatEur(optimalFinalValue) }), _jsx("td", { className: "px-3 py-3 text-right tabular-nums font-semibold text-amber-800 whitespace-nowrap sm:px-4", children: formatPct(optimalReturnPct) })] })] })] }) })] }));
}
