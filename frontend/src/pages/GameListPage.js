import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api, ApiClientError } from '../services/api';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { GameCard } from '../components/game/GameCard';
import { JoinGameDialog } from '../components/game/JoinGameDialog';
import { CreateGameDialog } from '../components/game/CreateGameDialog';
export function GameListPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isJoinDialogOpen, setJoinDialogOpen] = useState(false);
    const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
    const [joinError, setJoinError] = useState(null);
    const [createError, setCreateError] = useState(null);
    const gamesQuery = useQuery({
        queryKey: ['games'],
        queryFn: api.listGames,
    });
    const joinMutation = useMutation({
        mutationFn: ({ gameId, gameCode }) => api.joinGame(gameId, { gameCode }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['games'] });
            setJoinDialogOpen(false);
            setJoinError(null);
            navigate(`/games/${data.id}`);
        },
        onError: (err) => {
            setJoinError(err instanceof ApiClientError ? err.message : 'Failed to join game');
        },
    });
    const createMutation = useMutation({
        mutationFn: api.createGame,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['games'] });
            setCreateDialogOpen(false);
            setCreateError(null);
            navigate(`/games/${data.id}`);
        },
        onError: (err) => {
            setCreateError(err instanceof ApiClientError ? err.message : 'Failed to create game');
        },
    });
    function handleJoin(gameCode) {
        // Find game by code from the list, or use the code to find it server-side
        const game = gamesQuery.data?.find((g) => g.gameCode.toUpperCase() === gameCode.toUpperCase());
        if (game) {
            joinMutation.mutate({ gameId: game.id, gameCode });
        }
        else {
            setJoinError('Game not found with that code. Check the code and try again.');
        }
    }
    const isAdmin = user?.role === 'admin';
    return (_jsxs("div", { children: [_jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [_jsx("h1", { className: "text-xl font-bold text-gray-900 sm:text-2xl", children: "Games" }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { variant: "secondary", onClick: () => { setJoinError(null); setJoinDialogOpen(true); }, children: "Join Game" }), isAdmin && (_jsx(Button, { onClick: () => { setCreateError(null); setCreateDialogOpen(true); }, children: "Create Game" }))] })] }), gamesQuery.isLoading && (_jsx("div", { className: "mt-12 flex justify-center", role: "status", "aria-label": "Loading games", children: _jsx(Spinner, { size: "lg" }) })), gamesQuery.error && (_jsx("div", { className: "mx-auto mt-8 max-w-md text-center", children: _jsxs("div", { className: "rounded-xl border border-red-200 bg-red-50 p-6", children: [_jsx("p", { className: "font-medium text-red-800", children: "Failed to load games" }), _jsx("p", { className: "mt-1 text-sm text-red-600", children: "Please check your connection and try again." }), _jsx(Button, { variant: "secondary", size: "sm", className: "mt-4", onClick: () => gamesQuery.refetch(), children: "Retry" })] }) })), gamesQuery.data && gamesQuery.data.length === 0 && (_jsx("div", { className: "mt-12 text-center", children: _jsxs("p", { className: "text-gray-500", children: ["No games available. ", isAdmin ? 'Create one to get started.' : 'Ask an admin to create a game.'] }) })), gamesQuery.data && gamesQuery.data.length > 0 && (_jsx("div", { className: "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: gamesQuery.data.map((game) => (_jsx(GameCard, { game: game }, game.id))) })), _jsx(JoinGameDialog, { open: isJoinDialogOpen, onClose: () => setJoinDialogOpen(false), onJoin: handleJoin, loading: joinMutation.isPending, error: joinError }), _jsx(CreateGameDialog, { open: isCreateDialogOpen, onClose: () => setCreateDialogOpen(false), onCreate: (data) => createMutation.mutate(data), loading: createMutation.isPending, error: createError })] }));
}
