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
  const [joinError, setJoinError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const gamesQuery = useQuery({
    queryKey: ['games'],
    queryFn: api.listGames,
  });

  const joinMutation = useMutation({
    mutationFn: ({ gameId, gameCode }: { gameId: string; gameCode: string }) =>
      api.joinGame(gameId, { gameCode }),
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

  function handleJoin(gameCode: string) {
    // Find game by code from the list, or use the code to find it server-side
    const game = gamesQuery.data?.find(
      (g) => g.gameCode.toUpperCase() === gameCode.toUpperCase(),
    );
    if (game) {
      joinMutation.mutate({ gameId: game.id, gameCode });
    } else {
      setJoinError('Game not found with that code. Check the code and try again.');
    }
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Games</h1>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => { setJoinError(null); setJoinDialogOpen(true); }}>
            Join Game
          </Button>
          {isAdmin && (
            <Button onClick={() => { setCreateError(null); setCreateDialogOpen(true); }}>
              Create Game
            </Button>
          )}
        </div>
      </div>

      {gamesQuery.isLoading && (
        <div className="mt-12 flex justify-center" role="status" aria-label="Loading games">
          <Spinner size="lg" />
        </div>
      )}

      {gamesQuery.error && (
        <div className="mx-auto mt-8 max-w-md text-center">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <p className="font-medium text-red-800">Failed to load games</p>
            <p className="mt-1 text-sm text-red-600">Please check your connection and try again.</p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={() => gamesQuery.refetch()}
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {gamesQuery.data && gamesQuery.data.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-gray-500">
            No games available. {isAdmin ? 'Create one to get started.' : 'Ask an admin to create a game.'}
          </p>
        </div>
      )}

      {gamesQuery.data && gamesQuery.data.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gamesQuery.data.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}

      <JoinGameDialog
        open={isJoinDialogOpen}
        onClose={() => setJoinDialogOpen(false)}
        onJoin={handleJoin}
        loading={joinMutation.isPending}
        error={joinError}
      />

      <CreateGameDialog
        open={isCreateDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={(data) => createMutation.mutate(data)}
        loading={createMutation.isPending}
        error={createError}
      />
    </div>
  );
}
