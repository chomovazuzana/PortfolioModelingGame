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
import type { Allocation } from '../shared/types';
import { COMPLETED_YEAR_MARKER } from '../shared/constants';

export function GamePlayPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) return null;

  return (
    <GameProvider gameId={id}>
      <GamePlayContent gameId={id} />
    </GameProvider>
  );
}

function GamePlayContent({ gameId }: { gameId: string }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    playState,
    yearResult,
    showResult,
    isSubmitting,
    refreshPlayState,
    submitAllocation,
    dismissResult,
  } = useGameContext();

  const [submitError, setSubmitError] = useState<string | null>(null);

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
    if (!playState) return;

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

  async function handleSubmit(allocation: Allocation) {
    if (!playState) return;
    setSubmitError(null);
    try {
      await submitAllocation({
        ...allocation,
        year: playState.currentYear,
      });
      // Refresh snapshots after submission
      snapshotsQuery.refetch();
      leaderboardQuery.refetch();
    } catch (err) {
      setSubmitError(
        err instanceof ApiClientError ? err.message : 'Failed to submit allocation',
      );
    }
  }

  function handleContinue() {
    dismissResult();
    if (yearResult && !yearResult.nextYear) {
      navigate(`/games/${gameId}/results`);
    } else {
      refreshPlayState();
      snapshotsQuery.refetch();
    }
  }

  // Loading state
  if (playQuery.isLoading || !playState) {
    return (
      <div className="flex justify-center py-12" role="status" aria-label="Loading game">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (playQuery.error && !(playQuery.error instanceof ApiClientError)) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-800">Failed to load game</p>
          <p className="mt-1 text-sm text-red-600">Please check your connection and try again.</p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={() => playQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const portfolioDisplay = `EUR ${playState.portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
        <div>
          <button
            onClick={() => navigate(`/games/${gameId}`)}
            className="text-sm text-blue-600 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
          >
            &larr; Back to Dashboard
          </button>
          <h1 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">{playState.gameName}</h1>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-sm text-gray-500">Portfolio Value</div>
          <div className="text-lg font-bold text-gray-900 sm:text-xl">{portfolioDisplay}</div>
          {playState.totalReturnPct !== 0 && (
            <div className={`text-sm font-medium ${playState.totalReturnPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {playState.totalReturnPct >= 0 ? '+' : ''}{playState.totalReturnPct.toFixed(2)}%
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: scenario + allocation */}
        <div className="space-y-6 lg:col-span-2">
          <ScenarioBriefing scenario={playState.scenario} />

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Year {playState.currentYear} Allocation
            </h2>

            {playState.allocationSubmitted ? (
              <p className="text-sm text-gray-500">
                You have already submitted your allocation for {playState.currentYear}.
              </p>
            ) : (
              <AllocationPanel
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                disabled={playState.allocationSubmitted}
              />
            )}

            {submitError && (
              <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
                {submitError}
              </div>
            )}
          </div>
        </div>

        {/* Right: timeline + leaderboard */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <ProgressTimeline
              snapshots={snapshotsQuery.data ?? []}
              currentYear={playState.currentYear}
              initialCapital={playState.initialCapital}
            />
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            {leaderboardQuery.isLoading ? (
              <div className="flex justify-center py-4" role="status" aria-label="Loading leaderboard">
                <Spinner size="sm" />
              </div>
            ) : (
              <LeaderboardSnapshot
                entries={leaderboardQuery.data ?? []}
                currentUserId={user?.id ?? ''}
              />
            )}
          </div>
        </div>
      </div>

      {/* Year result modal */}
      {showResult && yearResult && (
        <YearResultModal
          result={yearResult}
          onContinue={handleContinue}
          onClose={() => dismissResult()}
        />
      )}
    </div>
  );
}
