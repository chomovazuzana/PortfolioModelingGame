import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api, ApiClientError } from '../services/api';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { GameInfo } from '../components/game/GameInfo';
import { YourProgress } from '../components/game/YourProgress';
export function GameDashboardPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const gameQuery = useQuery({
        queryKey: ['games', id],
        queryFn: () => api.getGame(id),
        enabled: !!id,
    });
    const closeMutation = useMutation({
        mutationFn: () => api.closeGame(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['games', id] });
        },
    });
    const joinMutation = useMutation({
        mutationFn: () => api.joinGame(id, { gameCode: gameQuery.data.gameCode }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['games', id] });
        },
    });
    const secretJoinMutation = useMutation({
        mutationFn: () => api.joinGame(id, { gameCode: gameQuery.data.gameCode, hidden: true }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['games', id] });
        },
    });
    if (gameQuery.isLoading) {
        return (_jsx("div", { className: "flex justify-center py-12", role: "status", "aria-label": "Loading game details", children: _jsx(Spinner, { size: "lg" }) }));
    }
    if (gameQuery.error) {
        const isApiError = gameQuery.error instanceof ApiClientError;
        const errMsg = isApiError ? gameQuery.error.message : 'Failed to load game';
        return (_jsx("div", { className: "mx-auto max-w-md py-12 text-center", children: _jsxs("div", { className: "rounded-xl border border-red-200 bg-red-50 p-6", children: [_jsx("p", { className: "font-medium text-red-800", children: errMsg }), !isApiError && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: "Please check your connection and try again." })), _jsxs("div", { className: "mt-4 flex justify-center gap-3", children: [_jsx(Button, { variant: "secondary", size: "sm", onClick: () => navigate('/games'), children: "Back to Games" }), _jsx(Button, { variant: "secondary", size: "sm", onClick: () => gameQuery.refetch(), children: "Retry" })] })] }) }));
    }
    const game = gameQuery.data;
    const isAdmin = user?.role === 'admin';
    const hasJoined = !!game.playerProgress;
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("button", { onClick: () => navigate('/games'), className: "text-sm text-blue-600 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded", children: "\u2190 Back to Games" }), _jsx(GameInfo, { game: game }), _jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [hasJoined ? (_jsx(YourProgress, { game: game })) : (game.status === 'open' && (_jsxs("div", { className: "rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6", children: [_jsx("h3", { className: "font-semibold text-gray-900", children: "Join this Game" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "You haven't joined this game yet. Join to start playing." }), _jsx(Button, { className: "mt-4", onClick: () => joinMutation.mutate(), loading: joinMutation.isPending, children: "Join Game" }), joinMutation.error && (_jsx("p", { className: "mt-2 text-sm text-red-600", role: "alert", children: joinMutation.error instanceof ApiClientError
                                    ? joinMutation.error.message
                                    : 'Failed to join' }))] }))), isAdmin && (_jsxs("div", { className: "rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6", children: [_jsx("h3", { className: "font-semibold text-gray-900", children: "Admin Actions" }), _jsxs("div", { className: "mt-4 space-y-3", children: [_jsx(Button, { variant: "secondary", size: "sm", onClick: () => navigate(`/admin/games/${id}`), children: "View Player Progress" }), game.status === 'open' && !hasJoined && (_jsxs("div", { children: [_jsx(Button, { variant: "secondary", size: "sm", onClick: () => secretJoinMutation.mutate(), loading: secretJoinMutation.isPending, children: "Play Secretly" }), _jsx("p", { className: "mt-1 text-xs text-gray-400", children: "Join hidden from the leaderboard." }), secretJoinMutation.error && (_jsx("p", { className: "mt-1 text-xs text-red-600", role: "alert", children: secretJoinMutation.error instanceof ApiClientError
                                                    ? secretJoinMutation.error.message
                                                    : 'Failed to join' }))] })), game.status === 'open' && (_jsx(Button, { variant: "danger", size: "sm", onClick: () => closeMutation.mutate(), loading: closeMutation.isPending, children: "Close Game" })), _jsx("p", { className: "text-xs text-gray-400", children: game.status === 'open'
                                            ? 'Closing prevents new players from joining.'
                                            : `Game is ${game.status}.` })] })] }))] })] }));
}
