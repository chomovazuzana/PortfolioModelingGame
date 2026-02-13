import { clsx } from 'clsx';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { FundBenchmark } from '../../shared/types';

interface FundBenchmarkComparisonProps {
  playerFinalValue: number;
  fundBenchmarks: FundBenchmark[];
  initialCapital: number;
}

function formatEur(value: number): string {
  return `EUR ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPct(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

interface ChartEntry {
  name: string;
  value: number;
  returnPct: number;
  isPlayer: boolean;
}

function buildChartEntries(
  playerFinalValue: number,
  fundBenchmarks: FundBenchmark[],
  initialCapital: number,
): ChartEntry[] {
  const entries: ChartEntry[] = [
    {
      name: 'Your Portfolio',
      value: playerFinalValue,
      returnPct: ((playerFinalValue - initialCapital) / initialCapital) * 100,
      isPlayer: true,
    },
    ...fundBenchmarks.map((fb) => ({
      name: fb.fundName,
      value: fb.finalValue,
      returnPct: fb.cumulativeReturnPct,
      isPlayer: false,
    })),
  ];

  entries.sort((a, b) => b.value - a.value);
  return entries;
}

export function FundBenchmarkComparison({
  playerFinalValue,
  fundBenchmarks,
  initialCapital,
}: FundBenchmarkComparisonProps) {
  if (fundBenchmarks.length === 0) {
    return (
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Fund Benchmark Comparison</h2>
        <p className="text-sm text-gray-400">No fund benchmark data available.</p>
      </div>
    );
  }

  const entries = buildChartEntries(playerFinalValue, fundBenchmarks, initialCapital);
  const maxValue = Math.max(...entries.map((e) => e.value));

  const playerRank = entries.findIndex((e) => e.isPlayer) + 1;
  const summaryText = `Fund benchmark comparison. Your portfolio ranks ${playerRank} of ${entries.length} (including ${fundBenchmarks.length} fund benchmarks).`;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Fund Benchmark Comparison</h2>

      {/* Horizontal bar chart */}
      <div
        style={{ height: entries.length * 44 + 40 }}
        role="img"
        aria-label={summaryText}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={entries}
            layout="vertical"
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickLine={false}
              domain={[0, Math.ceil(maxValue / 10000) * 10000]}
              tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 10, fill: '#374151' }}
              tickLine={false}
              width={120}
            />
            <Tooltip
              formatter={(value: number | undefined) => [
                value != null ? formatEur(value) : '',
                'Final Value',
              ]}
              contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
              {entries.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.isPlayer ? '#2563eb' : '#94a3b8'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed table */}
      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm" aria-label="Fund benchmark comparison details">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-3 py-2 sm:px-4">Fund</th>
              <th className="px-3 py-2 text-right whitespace-nowrap sm:px-4">Final Value</th>
              <th className="px-3 py-2 text-right whitespace-nowrap sm:px-4">Cumulative Return</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr
                key={entry.name}
                className={clsx(
                  'border-t border-gray-100',
                  entry.isPlayer ? 'bg-blue-50 font-medium' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50',
                )}
              >
                <td className="px-3 py-2 text-gray-900 sm:px-4">
                  {entry.name}
                  {entry.isPlayer && <span className="ml-1 text-xs text-blue-600">(you)</span>}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-gray-700 whitespace-nowrap sm:px-4">
                  {formatEur(entry.value)}
                </td>
                <td className={clsx(
                  'px-3 py-2 text-right tabular-nums whitespace-nowrap sm:px-4',
                  entry.returnPct >= 0 ? 'text-green-700' : 'text-red-600',
                )}>
                  {formatPct(entry.returnPct)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Disclaimer */}
      <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <strong>Note:</strong> Fund benchmarks use 3 asset classes (Cash, Fixed Income, Equity).
        The game uses 5 asset classes (Cash, Bonds, Equities, Commodities, REITs).
        This comparison is for educational context, not direct equivalence.
      </p>
    </div>
  );
}
