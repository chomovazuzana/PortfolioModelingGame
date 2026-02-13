import { useState } from 'react';
import type { GameDetail, GameStatus } from '../../shared/types';
import { Badge } from '../ui/Badge';

interface GameInfoProps {
  game: GameDetail;
}

const statusVariant: Record<GameStatus, 'open' | 'closed' | 'completed'> = {
  open: 'open',
  closed: 'closed',
  completed: 'completed',
};

export function GameInfo({ game }: GameInfoProps) {
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(game.gameCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <h2 className="text-xl font-bold text-gray-900">{game.name}</h2>
        <Badge variant={statusVariant[game.status]}>{game.status}</Badge>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <span className="text-gray-500">Game Code:</span>{' '}
          <button
            onClick={copyCode}
            className="rounded bg-gray-100 px-2 py-0.5 font-mono font-medium text-gray-900 hover:bg-gray-200"
            title="Click to copy"
          >
            {game.gameCode}
          </button>
          {copied && <span className="ml-2 text-xs text-green-600">Copied!</span>}
        </div>
        <div>
          <span className="text-gray-500">Players:</span>{' '}
          <span className="font-medium">{game.playerCount ?? 0}</span>
          {game.maxPlayers && <span className="text-gray-400"> / {game.maxPlayers}</span>}
        </div>
        <div>
          <span className="text-gray-500">Initial Capital:</span>{' '}
          <span className="font-medium">EUR {game.initialCapital.toLocaleString()}</span>
        </div>
        {game.deadline && (
          <div>
            <span className="text-gray-500">Deadline:</span>{' '}
            <span className="font-medium">{new Date(game.deadline).toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );
}
