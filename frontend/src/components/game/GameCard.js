import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
const statusVariant = {
    open: 'open',
    closed: 'closed',
    completed: 'completed',
};
export function GameCard({ game }) {
    const navigate = useNavigate();
    return (_jsx("div", { "data-testid": "game-card", children: _jsxs(Card, { onClick: () => navigate(`/games/${game.id}`), children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900", children: game.name }), _jsxs("p", { className: "mt-1 text-sm text-gray-500", children: ["Code: ", _jsx("span", { className: "font-mono font-medium", children: game.gameCode })] })] }), _jsx(Badge, { variant: statusVariant[game.status], children: game.status })] }), _jsxs("div", { className: "mt-3 flex gap-4 text-sm text-gray-500", children: [game.playerCount !== undefined && (_jsxs("span", { children: [game.playerCount, " player", game.playerCount !== 1 ? 's' : ''] })), game.deadline && (_jsxs("span", { children: ["Deadline: ", new Date(game.deadline).toLocaleDateString()] }))] })] }) }));
}
