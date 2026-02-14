import { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';

interface CreateGameDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    initialCapital: number;
    deadline?: string;
    round1Deadline?: string;
    round2Deadline?: string;
    round3Deadline?: string;
    round4Deadline?: string;
    maxPlayers?: number;
  }) => void;
  loading: boolean;
  error: string | null;
}

export function CreateGameDialog({ open, onClose, onCreate, loading, error }: CreateGameDialogProps) {
  const [name, setName] = useState('');
  const [initialCapital, setInitialCapital] = useState(100_000);
  const [deadline, setDeadline] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('');
  const [round1Deadline, setRound1Deadline] = useState('');
  const [round2Deadline, setRound2Deadline] = useState('');
  const [round3Deadline, setRound3Deadline] = useState('');
  const [round4Deadline, setRound4Deadline] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const toIso = (val: string) => (val ? new Date(val).toISOString() : undefined);

    onCreate({
      name: name.trim(),
      initialCapital,
      deadline: toIso(deadline),
      round1Deadline: toIso(round1Deadline),
      round2Deadline: toIso(round2Deadline),
      round3Deadline: toIso(round3Deadline),
      round4Deadline: toIso(round4Deadline),
      maxPlayers: maxPlayers ? parseInt(maxPlayers, 10) : undefined,
    });
  }

  function handleClose() {
    setName('');
    setInitialCapital(100_000);
    setDeadline('');
    setMaxPlayers('');
    setRound1Deadline('');
    setRound2Deadline('');
    setRound3Deadline('');
    setRound4Deadline('');
    onClose();
  }

  const inputClass =
    'mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

  return (
    <Dialog open={open} onClose={handleClose} title="Create New Game">
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
            className={inputClass}
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
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
            Game Deadline (optional)
          </label>
          <input
            id="deadline"
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className={inputClass}
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
            className={inputClass}
          />
        </div>

        {/* Round Deadlines */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Round Deadlines (optional)
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Year 2021', value: round1Deadline, setter: setRound1Deadline },
              { label: 'Year 2022', value: round2Deadline, setter: setRound2Deadline },
              { label: 'Year 2023', value: round3Deadline, setter: setRound3Deadline },
              { label: 'Year 2024', value: round4Deadline, setter: setRound4Deadline },
            ].map(({ label, value, setter }) => (
              <div key={label}>
                <label className="block text-xs text-gray-500 mb-1">{label}</label>
                <input
                  type="datetime-local"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={handleClose}>
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
