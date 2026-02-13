import { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';

interface JoinGameDialogProps {
  open: boolean;
  onClose: () => void;
  onJoin: (gameCode: string) => void;
  loading: boolean;
  error: string | null;
}

export function JoinGameDialog({ open, onClose, onJoin, loading, error }: JoinGameDialogProps) {
  const [gameCode, setGameCode] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (gameCode.trim()) {
      onJoin(gameCode.trim().toUpperCase());
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Join a Game">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="gameCode" className="block text-sm font-medium text-gray-700">
            Game Code
          </label>
          <input
            id="gameCode"
            type="text"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value)}
            placeholder="Enter 6-character code"
            maxLength={6}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase placeholder:normal-case focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={!gameCode.trim()}>
            Join Game
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
