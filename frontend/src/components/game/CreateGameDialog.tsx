import { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';

interface CreateGameDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; initialCapital: number; deadline?: string; maxPlayers?: number }) => void;
  loading: boolean;
  error: string | null;
}

export function CreateGameDialog({ open, onClose, onCreate, loading, error }: CreateGameDialogProps) {
  const [name, setName] = useState('');
  const [initialCapital, setInitialCapital] = useState(100_000);
  const [deadline, setDeadline] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    onCreate({
      name: name.trim(),
      initialCapital,
      deadline: deadline || undefined,
      maxPlayers: maxPlayers ? parseInt(maxPlayers, 10) : undefined,
    });
  }

  return (
    <Dialog open={open} onClose={onClose} title="Create New Game">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="gameName" className="block text-sm font-medium text-gray-700">
            Game Name <span className="text-red-500">*</span>
          </label>
          <input
            id="gameName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Training Session Q1"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="initialCapital" className="block text-sm font-medium text-gray-700">
            Initial Capital (EUR)
          </label>
          <input
            id="initialCapital"
            type="number"
            value={initialCapital}
            onChange={(e) => setInitialCapital(Number(e.target.value))}
            min={1000}
            step={1000}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
            Deadline (optional)
          </label>
          <input
            id="deadline"
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="maxPlayers" className="block text-sm font-medium text-gray-700">
            Max Players (optional)
          </label>
          <input
            id="maxPlayers"
            type="number"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(e.target.value)}
            min={2}
            placeholder="No limit"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={!name.trim()}>
            Create Game
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
