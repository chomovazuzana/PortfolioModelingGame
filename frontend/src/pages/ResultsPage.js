import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api, ApiClientError } from '../services/api';
import { FinalLeaderboard } from '../components/charts/FinalLeaderboard';
import { PortfolioTimelineChart } from '../components/charts/PortfolioTimelineChart';
import { AllocationComparisonChart } from '../components/charts/AllocationComparisonChart';
import { FundBenchmarkComparison } from '../components/charts/FundBenchmarkComparison';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
export function ResultsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [pdfLoading, setPdfLoading] = useState(false);
    const resultsQuery = useQuery({
        queryKey: ['results', id],
        queryFn: () => api.getResults(id),
        enabled: !!id,
        retry: false,
    });
    // Page guard: 403 (player not completed) -> redirect to play
    useEffect(() => {
        if (resultsQuery.error instanceof ApiClientError) {
            if (resultsQuery.error.status === 403) {
                navigate(`/games/${id}/play`, { replace: true });
            }
            else if (resultsQuery.error.status === 404) {
                navigate('/games', { replace: true });
            }
        }
    }, [resultsQuery.error, id, navigate]);
    if (!id)
        return null;
    // Loading
    if (resultsQuery.isLoading) {
        return (_jsx("div", { className: "flex justify-center py-12", role: "status", "aria-label": "Loading results", children: _jsx(Spinner, { size: "lg" }) }));
    }
    // Error (non-redirect)
    if (resultsQuery.error && !(resultsQuery.error instanceof ApiClientError)) {
        return (_jsx("div", { className: "mx-auto max-w-md py-12 text-center", children: _jsxs("div", { className: "rounded-xl border border-red-200 bg-red-50 p-6", children: [_jsx("p", { className: "font-medium text-red-800", children: "Failed to load results" }), _jsx("p", { className: "mt-1 text-sm text-red-600", children: "Please check your connection and try again." }), _jsx(Button, { variant: "secondary", size: "sm", className: "mt-4", onClick: () => resultsQuery.refetch(), children: "Retry" })] }) }));
    }
    const results = resultsQuery.data;
    if (!results)
        return null;
    const { leaderboard, playerResult, optimalPath, fundBenchmarks } = results;
    const lastOptimal = optimalPath[optimalPath.length - 1];
    const optimalFinalValue = lastOptimal ? lastOptimal.portfolioValue : 0;
    const firstSnapshot = playerResult.snapshots[0];
    const initialCapital = firstSnapshot ? firstSnapshot.valueStart : 100_000;
    async function handleDownloadPdf() {
        if (!results)
            return;
        setPdfLoading(true);
        try {
            const { generateResultsPdf } = await import('../utils/generateResultsPdf');
            await generateResultsPdf(results, 'Game Results', user?.displayName ?? 'Player');
        }
        catch {
            // ignore
        }
        finally {
            setPdfLoading(false);
        }
    }
    return (_jsxs("div", { className: "space-y-6 sm:space-y-8", children: [_jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: () => navigate(`/games/${id}`), className: "text-sm text-blue-600 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded", children: "\u2190 Back to Dashboard" }), _jsx(Button, { variant: "secondary", size: "sm", onClick: handleDownloadPdf, disabled: pdfLoading, children: pdfLoading ? 'Generating...' : 'Download PDF' })] }), _jsx("h1", { className: "mt-1 text-xl font-bold text-gray-900 sm:text-2xl", children: "Final Results" })] }), _jsx("div", { className: "rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm sm:px-6 sm:py-4", children: _jsxs("div", { className: "grid grid-cols-3 gap-4 text-center sm:gap-6", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs text-gray-500", children: "Your Final Value" }), _jsxs("div", { className: "mt-1 text-base font-bold text-gray-900 tabular-nums sm:text-lg", children: ["EUR ", playerResult.finalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })] })] }), _jsxs("div", { children: [_jsx("div", { className: "text-xs text-gray-500", children: "Total Return" }), _jsxs("div", { className: `mt-1 text-base font-bold tabular-nums sm:text-lg ${playerResult.totalReturnPct >= 0 ? 'text-green-700' : 'text-red-600'}`, children: [playerResult.totalReturnPct >= 0 ? '+' : '', playerResult.totalReturnPct.toFixed(2), "%"] })] }), _jsxs("div", { children: [_jsx("div", { className: "text-xs text-gray-500", children: "Rank" }), _jsxs("div", { className: "mt-1 text-base font-bold text-gray-900 sm:text-lg", children: [playerResult.rank, " / ", playerResult.totalPlayers] })] })] }) })] }), _jsx("div", { className: "rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6", children: _jsx(FinalLeaderboard, { leaderboard: leaderboard, optimalFinalValue: optimalFinalValue, currentUserId: user?.id ?? '' }) }), _jsx("div", { className: "rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6", children: _jsx(PortfolioTimelineChart, { playerSnapshots: playerResult.snapshots, optimalPath: optimalPath, initialCapital: initialCapital }) }), _jsx("div", { className: "rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6", children: _jsx(AllocationComparisonChart, { allocations: playerResult.allocations, optimalPath: optimalPath }) }), _jsx("div", { className: "rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6", children: _jsx(FundBenchmarkComparison, { playerFinalValue: playerResult.finalValue, fundBenchmarks: fundBenchmarks, initialCapital: initialCapital }) })] }));
}
