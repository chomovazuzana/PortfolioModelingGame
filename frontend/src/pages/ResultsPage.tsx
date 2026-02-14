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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pdfLoading, setPdfLoading] = useState(false);

  const resultsQuery = useQuery({
    queryKey: ['results', id],
    queryFn: () => api.getResults(id!),
    enabled: !!id,
    retry: false,
  });

  // Page guard: 403 (player not completed) -> redirect to play
  useEffect(() => {
    if (resultsQuery.error instanceof ApiClientError) {
      if (resultsQuery.error.status === 403) {
        navigate(`/games/${id}/play`, { replace: true });
      } else if (resultsQuery.error.status === 404) {
        navigate('/games', { replace: true });
      }
    }
  }, [resultsQuery.error, id, navigate]);

  if (!id) return null;

  // Loading
  if (resultsQuery.isLoading) {
    return (
      <div className="flex justify-center py-12" role="status" aria-label="Loading results">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error (non-redirect)
  if (resultsQuery.error && !(resultsQuery.error instanceof ApiClientError)) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-800">Failed to load results</p>
          <p className="mt-1 text-sm text-red-600">Please check your connection and try again.</p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={() => resultsQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const results = resultsQuery.data;
  if (!results) return null;

  const { leaderboard, playerResult, optimalPath, fundBenchmarks } = results;
  const lastOptimal = optimalPath[optimalPath.length - 1];
  const optimalFinalValue = lastOptimal ? lastOptimal.portfolioValue : 0;
  const firstSnapshot = playerResult.snapshots[0];
  const initialCapital = firstSnapshot ? firstSnapshot.valueStart : 100_000;

  async function handleDownloadPdf() {
    if (!results) return;
    setPdfLoading(true);
    try {
      const { generateResultsPdf } = await import('../utils/generateResultsPdf');
      await generateResultsPdf(results, 'Game Results', user?.displayName ?? 'Player');
    } catch {
      // ignore
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/games/${id}`)}
              className="text-sm text-blue-600 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
            >
              &larr; Back to Dashboard
            </button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={pdfLoading}
            >
              {pdfLoading ? 'Generating...' : 'Download PDF'}
            </Button>
          </div>
          <h1 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">Final Results</h1>
        </div>

        {/* Player summary card */}
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm sm:px-6 sm:py-4">
          <div className="grid grid-cols-3 gap-4 text-center sm:gap-6">
            <div>
              <div className="text-xs text-gray-500">Your Final Value</div>
              <div className="mt-1 text-base font-bold text-gray-900 tabular-nums sm:text-lg">
                EUR {playerResult.finalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Total Return</div>
              <div className={`mt-1 text-base font-bold tabular-nums sm:text-lg ${playerResult.totalReturnPct >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                {playerResult.totalReturnPct >= 0 ? '+' : ''}{playerResult.totalReturnPct.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Rank</div>
              <div className="mt-1 text-base font-bold text-gray-900 sm:text-lg">
                {playerResult.rank} / {playerResult.totalPlayers}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Final Leaderboard */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <FinalLeaderboard
          leaderboard={leaderboard}
          optimalFinalValue={optimalFinalValue}
          currentUserId={user?.id ?? ''}
        />
      </div>

      {/* Section 2: Portfolio Timeline Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <PortfolioTimelineChart
          playerSnapshots={playerResult.snapshots}
          optimalPath={optimalPath}
          initialCapital={initialCapital}
        />
      </div>

      {/* Section 3: Allocation Comparison Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <AllocationComparisonChart
          allocations={playerResult.allocations}
          optimalPath={optimalPath}
        />
      </div>

      {/* Section 4: Fund Benchmark Comparison */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <FundBenchmarkComparison
          playerFinalValue={playerResult.finalValue}
          fundBenchmarks={fundBenchmarks}
          initialCapital={initialCapital}
        />
      </div>
    </div>
  );
}
