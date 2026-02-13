import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Badge } from '../ui/Badge';
const statusVariant = {
    open: 'open',
    closed: 'closed',
    completed: 'completed',
};
export function GameInfo({ game }) {
    const [copied, setCopied] = useState(false);
    function copyCode() {
        navigator.clipboard.writeText(game.gameCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
    return (_jsxs("div", { className: "rounded-xl border border-gray-200 bg-white p-6 shadow-sm", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900", children: game.name }), _jsx(Badge, { variant: statusVariant[game.status], children: game.status })] }), _jsxs("div", { className: "mt-4 grid gap-3 text-sm sm:grid-cols-2", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Game Code:" }), ' ', _jsx("button", { onClick: copyCode, className: "rounded bg-gray-100 px-2 py-0.5 font-mono font-medium text-gray-900 hover:bg-gray-200", title: "Click to copy", children: game.gameCode }), copied && _jsx("span", { className: "ml-2 text-xs text-green-600", children: "Copied!" })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Players:" }), ' ', _jsx("span", { className: "font-medium", children: game.playerCount ?? 0 }), game.maxPlayers && _jsxs("span", { className: "text-gray-400", children: [" / ", game.maxPlayers] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Initial Capital:" }), ' ', _jsxs("span", { className: "font-medium", children: ["EUR ", game.initialCapital.toLocaleString()] })] }), game.deadline && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Deadline:" }), ' ', _jsx("span", { className: "font-medium", children: new Date(game.deadline).toLocaleString() })] }))] })] }));
}
