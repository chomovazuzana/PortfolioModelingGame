import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
export function AdminGamePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [expandedUserId, setExpandedUserId] = useState(null);
    const gameQuery = useQuery({
        queryKey: ['games', id],
        queryFn: () => api.getGame(id),
        enabled: !!id,
    });
    const playersQuery = useQuery({
        queryKey: ['admin-players', id],
        queryFn: () => api.getAdminPlayers(id),
        enabled: !!id,
    });
    if (!id)
        return null;
    if (gameQuery.isLoading || playersQuery.isLoading) {
        return (_jsx("div", { className: "flex justify-center py-12", role: "status", "aria-label": "Loading admin view", children: _jsx(Spinner, { size: "lg" }) }));
    }
    if (gameQuery.error || playersQuery.error) {
        return (_jsx("div", { className: "mx-auto max-w-md py-12 text-center", children: _jsxs("div", { className: "rounded-xl border border-red-200 bg-red-50 p-6", children: [_jsx("p", { className: "font-medium text-red-800", children: "Failed to load data" }), _jsx(Button, { variant: "secondary", size: "sm", className: "mt-4", onClick: () => navigate(`/games/${id}`), children: "Back to Dashboard" })] }) }));
    }
    const game = gameQuery.data;
    const players = playersQuery.data ?? [];
    // Summary stats
    const totalPlayers = players.length;
    const completedCount = players.filter((p) => p.status === 'completed').length;
    const roundCounts = [2021, 2022, 2023, 2024].map((year) => players.filter((p) => p.currentYear === year && p.status === 'playing').length);
    const avgPortfolioValue = totalPlayers > 0
        ? players.reduce((sum, p) => sum + p.portfolioValue, 0) / totalPlayers
        : 0;
    async function downloadCsv() {
        try {
            const res = await api.downloadLeaderboardCsv(id);
            const blob = await res.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `leaderboard-${game.gameCode}.csv`;
            a.click();
            URL.revokeObjectURL(a.href);
        }
        catch {
            // ignore
        }
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { children: [_jsx(Link, { to: `/games/${id}`, className: "text-sm text-blue-600 hover:text-blue-800", children: "\u2190 Back to Dashboard" }), _jsxs("h1", { className: "mt-1 text-xl font-bold text-gray-900 sm:text-2xl", children: [game.name, " - Player Progress"] })] }), _jsx(Button, { variant: "secondary", size: "sm", onClick: downloadCsv, children: "Download CSV" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7", children: [_jsx(SummaryCard, { label: "Total Players", value: totalPlayers }), [2021, 2022, 2023, 2024].map((year, i) => (_jsx(SummaryCard, { label: `Round ${year}`, value: roundCounts[i] }, year))), _jsx(SummaryCard, { label: "Completed", value: completedCount }), _jsx(SummaryCard, { label: "Avg Portfolio", value: `EUR ${avgPortfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` })] }), _jsx("div", { className: "overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm", children: _jsxs("table", { className: "min-w-full text-sm", "aria-label": "Player progress table", children: [_jsx("thead", { className: "border-b border-gray-200 bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left font-medium text-gray-600", children: "Name" }), _jsx("th", { className: "px-4 py-3 text-left font-medium text-gray-600", children: "Email" }), _jsx("th", { className: "px-4 py-3 text-center font-medium text-gray-600", children: "Round" }), _jsx("th", { className: "px-4 py-3 text-center font-medium text-gray-600", children: "Status" }), _jsx("th", { className: "px-4 py-3 text-right font-medium text-gray-600", children: "Portfolio Value" }), _jsx("th", { className: "px-4 py-3 text-center font-medium text-gray-600", children: "Hidden" })] }) }), _jsxs("tbody", { className: "divide-y divide-gray-100", children: [players.map((p) => (_jsx(PlayerRow, { player: p, expanded: expandedUserId === p.userId, onToggle: () => setExpandedUserId(expandedUserId === p.userId ? null : p.userId), initialCapital: game.initialCapital }, p.userId))), players.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "px-4 py-8 text-center text-gray-400", children: "No players have joined yet." }) }))] })] }) })] }));
}
function SummaryCard({ label, value }) {
    return (_jsxs("div", { className: "rounded-lg border border-gray-200 bg-white px-3 py-2 text-center shadow-sm", children: [_jsx("div", { className: "text-xs text-gray-500", children: label }), _jsx("div", { className: "mt-0.5 text-lg font-bold text-gray-900", children: value })] }));
}
function PlayerRow({ player, expanded, onToggle, initialCapital, }) {
    const returnPct = initialCapital > 0
        ? ((player.portfolioValue - initialCapital) / initialCapital) * 100
        : 0;
    return (_jsxs(_Fragment, { children: [_jsxs("tr", { className: "cursor-pointer hover:bg-gray-50", onClick: onToggle, children: [_jsxs("td", { className: "px-4 py-3 font-medium text-gray-900", children: [_jsx("span", { className: "mr-1 text-gray-400", children: expanded ? '\u25BC' : '\u25B6' }), player.displayName] }), _jsx("td", { className: "px-4 py-3 text-gray-600", children: player.email }), _jsx("td", { className: "px-4 py-3 text-center", children: player.status === 'completed' ? 'Done' : player.currentYear }), _jsx("td", { className: "px-4 py-3 text-center", children: _jsx("span", { className: `inline-block rounded-full px-2 py-0.5 text-xs font-medium ${player.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'}`, children: player.status }) }), _jsxs("td", { className: "px-4 py-3 text-right tabular-nums", children: [_jsxs("div", { children: ["EUR ", player.portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })] }), _jsxs("div", { className: `text-xs ${returnPct >= 0 ? 'text-green-600' : 'text-red-600'}`, children: [returnPct >= 0 ? '+' : '', returnPct.toFixed(2), "%"] })] }), _jsx("td", { className: "px-4 py-3 text-center", children: player.hiddenFromLeaderboard && (_jsx("span", { className: "text-xs text-gray-400", children: "Hidden" })) })] }), expanded && (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "bg-gray-50 px-6 py-4", children: _jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [_jsxs("div", { children: [_jsx("h4", { className: "mb-2 text-sm font-semibold text-gray-700", children: "Allocations" }), player.allocations.length === 0 ? (_jsx("p", { className: "text-xs text-gray-400", children: "No allocations yet" })) : (_jsxs("table", { className: "w-full text-xs", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b text-gray-500", children: [_jsx("th", { className: "py-1 text-left", children: "Year" }), _jsx("th", { className: "py-1 text-right", children: "Cash" }), _jsx("th", { className: "py-1 text-right", children: "Bonds" }), _jsx("th", { className: "py-1 text-right", children: "Equities" }), _jsx("th", { className: "py-1 text-right", children: "Commodities" }), _jsx("th", { className: "py-1 text-right", children: "REITs" })] }) }), _jsx("tbody", { children: player.allocations.map((a) => (_jsxs("tr", { className: "border-b border-gray-100", children: [_jsx("td", { className: "py-1", children: a.year }), _jsxs("td", { className: "py-1 text-right", children: [a.cash, "%"] }), _jsxs("td", { className: "py-1 text-right", children: [a.bonds, "%"] }), _jsxs("td", { className: "py-1 text-right", children: [a.equities, "%"] }), _jsxs("td", { className: "py-1 text-right", children: [a.commodities, "%"] }), _jsxs("td", { className: "py-1 text-right", children: [a.reits, "%"] })] }, a.year))) })] }))] }), _jsxs("div", { children: [_jsx("h4", { className: "mb-2 text-sm font-semibold text-gray-700", children: "Portfolio Snapshots" }), player.snapshots.length === 0 ? (_jsx("p", { className: "text-xs text-gray-400", children: "No snapshots yet" })) : (_jsxs("table", { className: "w-full text-xs", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b text-gray-500", children: [_jsx("th", { className: "py-1 text-left", children: "Year" }), _jsx("th", { className: "py-1 text-right", children: "Start" }), _jsx("th", { className: "py-1 text-right", children: "End" }), _jsx("th", { className: "py-1 text-right", children: "Return" })] }) }), _jsx("tbody", { children: player.snapshots.map((s) => (_jsxs("tr", { className: "border-b border-gray-100", children: [_jsx("td", { className: "py-1", children: s.year }), _jsxs("td", { className: "py-1 text-right", children: ["EUR ", s.valueStart.toLocaleString(undefined, { maximumFractionDigits: 0 })] }), _jsxs("td", { className: "py-1 text-right", children: ["EUR ", s.valueEnd.toLocaleString(undefined, { maximumFractionDigits: 0 })] }), _jsxs("td", { className: `py-1 text-right ${s.returnPct >= 0 ? 'text-green-600' : 'text-red-600'}`, children: [s.returnPct >= 0 ? '+' : '', s.returnPct.toFixed(2), "%"] })] }, s.year))) })] }))] })] }) }) }))] }));
}
