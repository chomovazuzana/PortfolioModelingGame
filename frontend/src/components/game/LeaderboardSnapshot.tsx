import { clsx } from 'clsx';
import type { LeaderboardEntry } from '../../shared/types';

interface LeaderboardSnapshotProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
}

function formatEur(value: number): string {
  return `EUR ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function LeaderboardSnapshot({ entries, currentUserId }: LeaderboardSnapshotProps) {
  if (entries.length === 0) {
    return (
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Leaderboard
        </h3>
        <p className="text-sm text-gray-400">No players have submitted allocations yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Leaderboard
      </h3>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm" aria-label="Game leaderboard">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-3 py-2 w-10">#</th>
              <th className="px-3 py-2">Player</th>
              <th className="px-3 py-2 text-right whitespace-nowrap">Value</th>
              <th className="px-3 py-2 text-right">Year</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const isMe = entry.userId === currentUserId;
              return (
                <tr
                  key={entry.userId}
                  className={clsx(
                    isMe ? 'bg-blue-50 font-medium' : 'bg-white',
                    'border-t border-gray-100',
                  )}
                >
                  <td className="px-3 py-2 tabular-nums text-gray-600">{entry.rank}</td>
                  <td className="px-3 py-2 text-gray-900">
                    {entry.displayName}
                    {isMe && <span className="ml-1 text-xs text-blue-600">(you)</span>}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-700 whitespace-nowrap">
                    {formatEur(entry.portfolioValue)}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-500">
                    {entry.status === 'completed' ? 'Done' : entry.currentYear}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
