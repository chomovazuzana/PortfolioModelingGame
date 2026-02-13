import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { COMPLETED_YEAR_MARKER } from '../../shared/constants';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
export function YourProgress({ game }) {
    const navigate = useNavigate();
    const progress = game.playerProgress;
    // Not joined yet
    if (!progress) {
        return (_jsxs(Card, { header: "Your Progress", children: [_jsx("p", { className: "text-sm text-gray-500", children: "You haven't joined this game yet." }), game.status === 'open' && (_jsx(Button, { className: "mt-4", size: "sm", onClick: () => navigate(`/games/${game.id}`), children: "Join Game" }))] }));
    }
    const isCompleted = progress.status === 'completed' || progress.currentYear >= COMPLETED_YEAR_MARKER;
    return (_jsx(Card, { header: "Your Progress", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Status" }), _jsx(Badge, { variant: isCompleted ? 'completed' : 'playing', children: isCompleted ? 'Completed' : 'Playing' })] }), !isCompleted && (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Current Year" }), _jsx("span", { className: "font-medium text-gray-900", children: progress.currentYear })] })), _jsx("div", { className: "pt-2", children: isCompleted ? (_jsx(Button, { className: "w-full", onClick: () => navigate(`/games/${game.id}/results`), children: "View Final Results" })) : (_jsxs(Button, { className: "w-full", onClick: () => navigate(`/games/${game.id}/play`), children: ["Continue to Year ", progress.currentYear] })) })] }) }));
}
