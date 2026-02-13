import { useNavigate } from 'react-router-dom';
import type { GameDetail } from '../../shared/types';
import { COMPLETED_YEAR_MARKER } from '../../shared/constants';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface YourProgressProps {
  game: GameDetail;
}

export function YourProgress({ game }: YourProgressProps) {
  const navigate = useNavigate();
  const progress = game.playerProgress;

  // Not joined yet
  if (!progress) {
    return (
      <Card header="Your Progress">
        <p className="text-sm text-gray-500">You haven't joined this game yet.</p>
        {game.status === 'open' && (
          <Button className="mt-4" size="sm" onClick={() => navigate(`/games/${game.id}`)}>
            Join Game
          </Button>
        )}
      </Card>
    );
  }

  const isCompleted = progress.status === 'completed' || progress.currentYear >= COMPLETED_YEAR_MARKER;

  return (
    <Card header="Your Progress">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Status</span>
          <Badge variant={isCompleted ? 'completed' : 'playing'}>
            {isCompleted ? 'Completed' : 'Playing'}
          </Badge>
        </div>

        {!isCompleted && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Current Year</span>
            <span className="font-medium text-gray-900">{progress.currentYear}</span>
          </div>
        )}

        <div className="pt-2">
          {isCompleted ? (
            <Button
              className="w-full"
              onClick={() => navigate(`/games/${game.id}/results`)}
            >
              View Final Results
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={() => navigate(`/games/${game.id}/play`)}
            >
              Continue to Year {progress.currentYear}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
