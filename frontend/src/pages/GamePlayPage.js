import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { GameProvider, useGameContext } from '../context/GameContext';
import { api, ApiClientError } from '../services/api';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { ScenarioBriefing } from '../components/game/ScenarioBriefing';
import { AllocationPanel } from '../components/allocation/AllocationPanel';
import { YearResultModal } from '../components/game/YearResultModal';
import { ProgressTimeline } from '../components/game/ProgressTimeline';
import { LeaderboardSnapshot } from '../components/game/LeaderboardSnapshot';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { COMPLETED_YEAR_MARKER } from '../shared/constants';
export function GamePlayPage() {
    const { id } = useParams();
    if (!id)
        return null;
    return (_jsx(GameProvider, { gameId: id, children: _jsx(GamePlayContent, { gameId: id }) }));
}
function GamePlayContent({ gameId }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { playState, yearResult, showResult, isSubmitting, refreshPlayState, submitAllocation, dismissResult, } = useGameContext();
    const [submitError, setSubmitError] = useState(null);
    // Initial load
    const playQuery = useQuery({
        queryKey: ['play', gameId],
        queryFn: () => api.getPlayState(gameId),
    });
    // Sync query data into GameContext
    useEffect(() => {
        if (playQuery.data) {
            refreshPlayState();
        }
    }, [playQuery.data, refreshPlayState]);
    // Leaderboard
    const leaderboardQuery = useLeaderboard(gameId);
    // Snapshots for timeline
    const snapshotsQuery = useQuery({
        queryKey: ['snapshots', gameId],
        queryFn: () => api.getSnapshots(gameId),
    });
    // Page guards
    useEffect(() => {
        if (!playState)
            return;
        if (playState.playerStatus === 'completed' || playState.currentYear >= COMPLETED_YEAR_MARKER) {
            navigate(`/games/${gameId}/results`, { replace: true });
        }
    }, [playState, gameId, navigate]);
    // Handle play query errors (not joined = redirect to dashboard)
    useEffect(() => {
        if (playQuery.error instanceof ApiClientError) {
            if (playQuery.error.status === 403 || playQuery.error.status === 404) {
                navigate(`/games/${gameId}`, { replace: true });
            }
        }
    }, [playQuery.error, gameId, navigate]);
    async function handleSubmit(allocation) {
        if (!playState)
            return;
        setSubmitError(null);
        try {
            await submitAllocation({
                ...allocation,
                year: playState.currentYear,
            });
            // Refresh snapshots after submission
            snapshotsQuery.refetch();
            leaderboardQuery.refetch();
        }
        catch (err) {
            setSubmitError(err instanceof ApiClientError ? err.message : 'Failed to submit allocation');
        }
    }
    function handleContinue() {
        dismissResult();
        if (yearResult && !yearResult.nextYear) {
            navigate(`/games/${gameId}/results`);
        }
        else {
            refreshPlayState();
            snapshotsQuery.refetch();
        }
    }
    // Loading state
    if (playQuery.isLoading || !playState) {
        return (_jsx("div", { className: "flex justify-center py-12", role: "status", "aria-label": "Loading game", children: _jsx(Spinner, { size: "lg" }) }));
    }
    // Error state
    if (playQuery.error && !(playQuery.error instanceof ApiClientError)) {
        return (_jsx("div", { className: "mx-auto max-w-md py-12 text-center", children: _jsxs("div", { className: "rounded-xl border border-red-200 bg-red-50 p-6", children: [_jsx("p", { className: "font-medium text-red-800", children: "Failed to load game" }), _jsx("p", { className: "mt-1 text-sm text-red-600", children: "Please check your connection and try again." }), _jsx(Button, { variant: "secondary", size: "sm", className: "mt-4", onClick: () => playQuery.refetch(), children: "Retry" })] }) }));
    }
    const portfolioDisplay = `EUR ${playState.portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4", children: [_jsxs("div", { children: [_jsx("button", { onClick: () => navigate(`/games/${gameId}`), className: "text-sm text-blue-600 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded", children: "\u2190 Back to Dashboard" }), _jsx("h1", { className: "mt-1 text-xl font-bold text-gray-900 sm:text-2xl", children: playState.gameName })] }), _jsxs("div", { className: "text-left sm:text-right", children: [_jsx("div", { className: "text-sm text-gray-500", children: "Portfolio Value" }), _jsx("div", { className: "text-lg font-bold text-gray-900 sm:text-xl", children: portfolioDisplay }), playState.totalReturnPct !== 0 && (_jsxs("div", { className: `text-sm font-medium ${playState.totalReturnPct >= 0 ? 'text-green-600' : 'text-red-600'}`, children: [playState.totalReturnPct >= 0 ? '+' : '', playState.totalReturnPct.toFixed(2), "%"] }))] })] }), _jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [_jsxs("div", { className: "space-y-6 lg:col-span-2", children: [_jsx(ScenarioBriefing, { scenario: playState.scenario }), _jsxs("div", { className: "rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6", children: [_jsxs("h2", { className: "mb-4 text-lg font-semibold text-gray-900", children: ["Year ", playState.currentYear, " Allocation"] }), playState.allocationSubmitted ? (_jsxs("p", { className: "text-sm text-gray-500", children: ["You have already submitted your allocation for ", playState.currentYear, "."] })) : (_jsx(AllocationPanel, { onSubmit: handleSubmit, isSubmitting: isSubmitting, disabled: playState.allocationSubmitted })), submitError && (_jsx("div", { className: "mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600", role: "alert", children: submitError }))] })] }), _jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6", children: _jsx(ProgressTimeline, { snapshots: snapshotsQuery.data ?? [], currentYear: playState.currentYear, initialCapital: playState.initialCapital }) }), _jsx("div", { className: "rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6", children: leaderboardQuery.isLoading ? (_jsx("div", { className: "flex justify-center py-4", role: "status", "aria-label": "Loading leaderboard", children: _jsx(Spinner, { size: "sm" }) })) : (_jsx(LeaderboardSnapshot, { entries: leaderboardQuery.data ?? [], currentUserId: user?.id ?? '' })) })] })] }), showResult && yearResult && (_jsx(YearResultModal, { result: yearResult, onContinue: handleContinue, onClose: () => dismissResult() }))] }));
}
