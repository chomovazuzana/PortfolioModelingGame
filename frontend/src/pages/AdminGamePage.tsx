import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { FUND_NAMES } from '../shared/constants';
import type { AdminPlayerDetail } from '../shared/types';

export function AdminGamePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const gameQuery = useQuery({
    queryKey: ['games', id],
    queryFn: () => api.getGame(id!),
    enabled: !!id,
  });

  const playersQuery = useQuery({
    queryKey: ['admin-players', id],
    queryFn: () => api.getAdminPlayers(id!),
    enabled: !!id,
  });

  if (!id) return null;

  if (gameQuery.isLoading || playersQuery.isLoading) {
    return (
      <div className="flex justify-center py-12" role="status" aria-label="Loading admin view">
        <Spinner size="lg" />
      </div>
    );
  }

  if (gameQuery.error || playersQuery.error) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-800">Failed to load data</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={() => navigate(`/games/${id}`)}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const game = gameQuery.data!;
  const players = playersQuery.data ?? [];

  // Summary stats
  const totalPlayers = players.length;
  const completedCount = players.filter((p) => p.status === 'completed').length;
  const roundCounts = [2021, 2022, 2023, 2024].map(
    (year) => players.filter((p) => p.currentYear === year && p.status === 'playing').length
  );
  const avgPortfolioValue =
    totalPlayers > 0
      ? players.reduce((sum, p) => sum + p.portfolioValue, 0) / totalPlayers
      : 0;

  async function downloadCsv() {
    try {
      const res = await api.downloadLeaderboardCsv(id!);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `leaderboard-${game.gameCode}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to={`/games/${id}`}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            &larr; Back to Dashboard
          </Link>
          <h1 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">
            {game.name} - Player Progress
          </h1>
        </div>
        <Button variant="secondary" size="sm" onClick={downloadCsv}>
          Download CSV
        </Button>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <SummaryCard label="Total Players" value={totalPlayers} />
        {[2021, 2022, 2023, 2024].map((year, i) => (
          <SummaryCard key={year} label={`Round ${year}`} value={roundCounts[i]!} />
        ))}
        <SummaryCard label="Completed" value={completedCount} />
        <SummaryCard
          label="Avg Portfolio"
          value={`EUR ${avgPortfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
        />
      </div>

      {/* Player table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm" aria-label="Player progress table">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Round</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Portfolio Value</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Hidden</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {players.map((p) => (
              <PlayerRow
                key={p.userId}
                player={p}
                expanded={expandedUserId === p.userId}
                onToggle={() =>
                  setExpandedUserId(expandedUserId === p.userId ? null : p.userId)
                }
                initialCapital={game.initialCapital}
              />
            ))}
            {players.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No players have joined yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-center shadow-sm">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-0.5 text-lg font-bold text-gray-900">{value}</div>
    </div>
  );
}

function PlayerRow({
  player,
  expanded,
  onToggle,
  initialCapital,
}: {
  player: AdminPlayerDetail;
  expanded: boolean;
  onToggle: () => void;
  initialCapital: number;
}) {
  const returnPct =
    initialCapital > 0
      ? ((player.portfolioValue - initialCapital) / initialCapital) * 100
      : 0;

  return (
    <>
      <tr
        className="cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        <td className="px-4 py-3 font-medium text-gray-900">
          <span className="mr-1 text-gray-400">{expanded ? '\u25BC' : '\u25B6'}</span>
          {player.displayName}
        </td>
        <td className="px-4 py-3 text-gray-600">{player.email}</td>
        <td className="px-4 py-3 text-center">
          {player.status === 'completed' ? 'Done' : player.currentYear}
        </td>
        <td className="px-4 py-3 text-center">
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
              player.status === 'completed'
                ? 'bg-green-100 text-green-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {player.status}
          </span>
        </td>
        <td className="px-4 py-3 text-right tabular-nums">
          <div>EUR {player.portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          <div className={`text-xs ${returnPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {returnPct >= 0 ? '+' : ''}{returnPct.toFixed(2)}%
          </div>
        </td>
        <td className="px-4 py-3 text-center">
          {player.hiddenFromLeaderboard && (
            <span className="text-xs text-gray-400">Hidden</span>
          )}
        </td>
      </tr>

      {expanded && (
        <tr>
          <td colSpan={6} className="bg-gray-50 px-6 py-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Allocations */}
              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-700">Allocations</h4>
                {player.allocations.length === 0 ? (
                  <p className="text-xs text-gray-400">No allocations yet</p>
                ) : (
                  <div className="space-y-2">
                    {player.allocations.map((a) => {
                      const entries = Object.entries(a.allocations)
                        .filter(([, pct]) => pct > 0)
                        .map(([fundId, pct]) => ({
                          name: FUND_NAMES[Number(fundId)] ?? `Fund ${fundId}`,
                          pct,
                        }));
                      return (
                        <div key={a.year} className="border-b border-gray-100 pb-1">
                          <span className="text-xs font-medium text-gray-600">{a.year}:</span>{' '}
                          <span className="text-xs text-gray-500">
                            {entries.map((e) => `${e.name} ${e.pct}%`).join(', ') || 'None'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Snapshots */}
              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-700">Portfolio Snapshots</h4>
                {player.snapshots.length === 0 ? (
                  <p className="text-xs text-gray-400">No snapshots yet</p>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b text-gray-500">
                        <th className="py-1 text-left">Year</th>
                        <th className="py-1 text-right">Start</th>
                        <th className="py-1 text-right">End</th>
                        <th className="py-1 text-right">Return</th>
                      </tr>
                    </thead>
                    <tbody>
                      {player.snapshots.map((s) => (
                        <tr key={s.year} className="border-b border-gray-100">
                          <td className="py-1">{s.year}</td>
                          <td className="py-1 text-right">EUR {s.valueStart.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                          <td className="py-1 text-right">EUR {s.valueEnd.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                          <td className={`py-1 text-right ${s.returnPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {s.returnPct >= 0 ? '+' : ''}{s.returnPct.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
