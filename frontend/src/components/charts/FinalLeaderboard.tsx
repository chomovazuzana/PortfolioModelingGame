import { clsx } from 'clsx';
import type { LeaderboardEntry } from '../../shared/types';

interface FinalLeaderboardProps {
  leaderboard: LeaderboardEntry[];
  optimalFinalValue: number;
  currentUserId: string;
}

function formatEur(value: number): string {
  return `EUR ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPct(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

const MEDAL_ICONS: Record<number, string> = {
  1: '\u{1F947}',
  2: '\u{1F948}',
  3: '\u{1F949}',
};

export function FinalLeaderboard({ leaderboard, optimalFinalValue, currentUserId }: FinalLeaderboardProps) {
  const optimalReturnPct = ((optimalFinalValue - 100_000) / 100_000) * 100;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Final Leaderboard</h2>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm" aria-label="Final leaderboard with player rankings">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-3 py-3 w-14 sm:px-4">Rank</th>
              <th className="px-3 py-3 sm:px-4">Player</th>
              <th className="px-3 py-3 text-right whitespace-nowrap sm:px-4">Final Value</th>
              <th className="px-3 py-3 text-right whitespace-nowrap sm:px-4">Total Return</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry) => {
              const isMe = entry.userId === currentUserId;
              const medal = MEDAL_ICONS[entry.rank];

              return (
                <tr
                  key={entry.userId}
                  className={clsx(
                    'border-t border-gray-100',
                    isMe ? 'bg-blue-50 font-medium' : 'bg-white',
                  )}
                >
                  <td className="px-3 py-3 tabular-nums text-gray-600 sm:px-4">
                    {medal ? (
                      <span className="mr-1" role="img" aria-label={`Rank ${entry.rank}`}>{medal}</span>
                    ) : (
                      entry.rank
                    )}
                  </td>
                  <td className="px-3 py-3 text-gray-900 sm:px-4">
                    {entry.displayName}
                    {isMe && <span className="ml-1 text-xs text-blue-600">(you)</span>}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-gray-700 whitespace-nowrap sm:px-4">
                    {formatEur(entry.portfolioValue)}
                  </td>
                  <td className={clsx(
                    'px-3 py-3 text-right tabular-nums whitespace-nowrap sm:px-4',
                    entry.totalReturnPct >= 0 ? 'text-green-700' : 'text-red-600',
                  )}>
                    {formatPct(entry.totalReturnPct)}
                  </td>
                </tr>
              );
            })}

            {/* Optimal portfolio row */}
            <tr className="border-t-2 border-amber-300 bg-amber-50">
              <td className="px-3 py-3 text-amber-700 sm:px-4">
                <svg className="inline h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </td>
              <td className="px-3 py-3 font-medium text-amber-800 sm:px-4">
                Optimal Portfolio
                <span className="ml-1 text-xs text-amber-600">(hindsight)</span>
              </td>
              <td className="px-3 py-3 text-right tabular-nums font-semibold text-amber-800 whitespace-nowrap sm:px-4">
                {formatEur(optimalFinalValue)}
              </td>
              <td className="px-3 py-3 text-right tabular-nums font-semibold text-amber-800 whitespace-nowrap sm:px-4">
                {formatPct(optimalReturnPct)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
