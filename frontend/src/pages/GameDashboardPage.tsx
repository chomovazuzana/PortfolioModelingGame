import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api, ApiClientError } from '../services/api';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { GameInfo } from '../components/game/GameInfo';
import { YourProgress } from '../components/game/YourProgress';

export function GameDashboardPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const gameQuery = useQuery({
    queryKey: ['games', id],
    queryFn: () => api.getGame(id!),
    enabled: !!id,
  });

  const closeMutation = useMutation({
    mutationFn: () => api.closeGame(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games', id] });
    },
  });

  const joinMutation = useMutation({
    mutationFn: () => api.joinGame(id!, { gameCode: gameQuery.data!.gameCode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games', id] });
    },
  });

  const secretJoinMutation = useMutation({
    mutationFn: () =>
      api.joinGame(id!, { gameCode: gameQuery.data!.gameCode, hidden: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games', id] });
    },
  });

  if (gameQuery.isLoading) {
    return (
      <div className="flex justify-center py-12" role="status" aria-label="Loading game details">
        <Spinner size="lg" />
      </div>
    );
  }

  if (gameQuery.error) {
    const isApiError = gameQuery.error instanceof ApiClientError;
    const errMsg = isApiError ? gameQuery.error.message : 'Failed to load game';
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-800">{errMsg}</p>
          {!isApiError && (
            <p className="mt-1 text-sm text-red-600">Please check your connection and try again.</p>
          )}
          <div className="mt-4 flex justify-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => navigate('/games')}>
              Back to Games
            </Button>
            <Button variant="secondary" size="sm" onClick={() => gameQuery.refetch()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const game = gameQuery.data!;
  const isAdmin = user?.role === 'admin';
  const hasJoined = !!game.playerProgress;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/games')}
        className="text-sm text-blue-600 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
      >
        &larr; Back to Games
      </button>

      <GameInfo game={game} />

      <div className="grid gap-6 md:grid-cols-2">
        {hasJoined ? (
          <YourProgress game={game} />
        ) : (
          !isAdmin && game.status === 'open' && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
              <h3 className="font-semibold text-gray-900">Join this Game</h3>
              <p className="mt-2 text-sm text-gray-500">
                You haven't joined this game yet. Join to start playing.
              </p>
              <Button
                className="mt-4"
                onClick={() => joinMutation.mutate()}
                loading={joinMutation.isPending}
              >
                Join Game
              </Button>
              {joinMutation.error && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {joinMutation.error instanceof ApiClientError
                    ? joinMutation.error.message
                    : 'Failed to join'}
                </p>
              )}
            </div>
          )
        )}

        {isAdmin && (
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <h3 className="font-semibold text-gray-900">Admin Actions</h3>
            <div className="mt-4 space-y-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/admin/games/${id}`)}
              >
                View Player Progress
              </Button>

              {game.status === 'open' && !hasJoined && (
                <div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => secretJoinMutation.mutate()}
                    loading={secretJoinMutation.isPending}
                  >
                    Play Secretly
                  </Button>
                  <p className="mt-1 text-xs text-gray-400">
                    Join hidden from the leaderboard.
                  </p>
                  {secretJoinMutation.error && (
                    <p className="mt-1 text-xs text-red-600" role="alert">
                      {secretJoinMutation.error instanceof ApiClientError
                        ? secretJoinMutation.error.message
                        : 'Failed to join'}
                    </p>
                  )}
                </div>
              )}

              {game.status === 'open' && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => closeMutation.mutate()}
                  loading={closeMutation.isPending}
                >
                  Close Game
                </Button>
              )}
              <p className="text-xs text-gray-400">
                {game.status === 'open'
                  ? 'Closing prevents new players from joining.'
                  : `Game is ${game.status}.`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
