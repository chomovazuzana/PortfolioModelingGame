import { useNavigate } from 'react-router-dom';
import type { Game, GameStatus } from '../../shared/types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface GameCardProps {
  game: Game;
}

const statusVariant: Record<GameStatus, 'open' | 'closed' | 'completed'> = {
  open: 'open',
  closed: 'closed',
  completed: 'completed',
};

export function GameCard({ game }: GameCardProps) {
  const navigate = useNavigate();

  return (
    <div data-testid="game-card">
      <Card onClick={() => navigate(`/games/${game.id}`)}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{game.name}</h3>
            <p className="mt-1 text-sm text-gray-500">
              Code: <span className="font-mono font-medium">{game.gameCode}</span>
            </p>
          </div>
          <Badge variant={statusVariant[game.status]}>{game.status}</Badge>
        </div>
        <div className="mt-3 flex gap-4 text-sm text-gray-500">
          {game.playerCount !== undefined && (
            <span>{game.playerCount} player{game.playerCount !== 1 ? 's' : ''}</span>
          )}
          {game.deadline && (
            <span>Deadline: {new Date(game.deadline).toLocaleDateString()}</span>
          )}
        </div>
      </Card>
    </div>
  );
}
