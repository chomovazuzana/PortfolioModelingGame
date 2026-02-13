import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { clsx } from 'clsx';
function formatEur(value) {
    return `EUR ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
export function LeaderboardSnapshot({ entries, currentUserId }) {
    if (entries.length === 0) {
        return (_jsxs("div", { children: [_jsx("h3", { className: "mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500", children: "Leaderboard" }), _jsx("p", { className: "text-sm text-gray-400", children: "No players have submitted allocations yet." })] }));
    }
    return (_jsxs("div", { children: [_jsx("h3", { className: "mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500", children: "Leaderboard" }), _jsx("div", { className: "overflow-x-auto rounded-lg border border-gray-200", children: _jsxs("table", { className: "w-full text-sm", "aria-label": "Game leaderboard", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500", children: [_jsx("th", { className: "px-3 py-2 w-10", children: "#" }), _jsx("th", { className: "px-3 py-2", children: "Player" }), _jsx("th", { className: "px-3 py-2 text-right whitespace-nowrap", children: "Value" }), _jsx("th", { className: "px-3 py-2 text-right", children: "Year" })] }) }), _jsx("tbody", { children: entries.map((entry) => {
                                const isMe = entry.userId === currentUserId;
                                return (_jsxs("tr", { className: clsx(isMe ? 'bg-blue-50 font-medium' : 'bg-white', 'border-t border-gray-100'), children: [_jsx("td", { className: "px-3 py-2 tabular-nums text-gray-600", children: entry.rank }), _jsxs("td", { className: "px-3 py-2 text-gray-900", children: [entry.displayName, isMe && _jsx("span", { className: "ml-1 text-xs text-blue-600", children: "(you)" })] }), _jsx("td", { className: "px-3 py-2 text-right tabular-nums text-gray-700 whitespace-nowrap", children: formatEur(entry.portfolioValue) }), _jsx("td", { className: "px-3 py-2 text-right text-gray-500", children: entry.status === 'completed' ? 'Done' : entry.currentYear })] }, entry.userId));
                            }) })] }) })] }));
}
