import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { AllocationRecord, OptimalYearResult } from '../../shared/types';
import { FUND_NAMES, GAME_YEARS } from '../../shared/constants';

interface AllocationComparisonChartProps {
  allocations: AllocationRecord[];
  optimalPath: OptimalYearResult[];
}

interface ChartDataPoint {
  year: number;
  label: string;
  playerReturn: number;
  optimalReturn: number;
  optimalFundName: string;
}

function buildChartData(
  allocationRecords: AllocationRecord[],
  optimalPath: OptimalYearResult[],
): ChartDataPoint[] {
  const allocByYear = new Map(allocationRecords.map((a) => [a.year, a]));
  const optByYear = new Map(optimalPath.map((o) => [o.year, o]));

  return GAME_YEARS.map((year) => {
    const opt = optByYear.get(year);
    // We don't have the player's per-year return in AllocationRecord directly,
    // but the chart shows allocation comparison per year — show returns for context
    return {
      year,
      label: String(year),
      playerReturn: 0, // Will be filled if we have snapshots; keep for structure
      optimalReturn: opt?.returnPct ?? 0,
      optimalFundName: opt?.bestFundName ?? '',
    };
  });
}

export function AllocationComparisonChart({ allocations, optimalPath }: AllocationComparisonChartProps) {
  const allocByYear = new Map(allocations.map((a) => [a.year, a]));
  const optByYear = new Map(optimalPath.map((o) => [o.year, o]));

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Allocation Comparison</h2>
      <p className="mb-4 text-sm text-gray-500">
        Your fund allocation vs. the optimal hindsight fund for each year.
      </p>

      <div className="space-y-4">
        {GAME_YEARS.map((year) => {
          const alloc = allocByYear.get(year);
          const opt = optByYear.get(year);
          const playerFunds = alloc
            ? Object.entries(alloc.allocations)
                .filter(([, pct]) => pct > 0)
                .map(([fundId, pct]) => ({
                  fundId: Number(fundId),
                  name: FUND_NAMES[Number(fundId)] ?? `Fund ${fundId}`,
                  pct,
                }))
                .sort((a, b) => b.pct - a.pct)
            : [];

          return (
            <div key={year} className="rounded-lg border border-gray-200 p-3">
              <h3 className="mb-2 text-sm font-semibold text-gray-800">{year}</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {/* Player allocation */}
                <div>
                  <div className="mb-1 text-xs font-medium text-gray-500">Your Allocation</div>
                  <div className="space-y-0.5">
                    {playerFunds.map((f) => (
                      <div key={f.fundId} className="flex items-center gap-2 text-xs">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${f.pct}%`, minWidth: 4 }}
                        />
                        <span className="whitespace-nowrap text-gray-600">
                          {f.name}: {f.pct}%
                        </span>
                      </div>
                    ))}
                    {playerFunds.length === 0 && (
                      <span className="text-xs text-gray-400">No data</span>
                    )}
                  </div>
                </div>

                {/* Optimal */}
                <div>
                  <div className="mb-1 text-xs font-medium text-gray-500">Optimal (Hindsight)</div>
                  {opt && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="h-2 w-full rounded-full bg-green-500" />
                      <span className="whitespace-nowrap text-gray-600">
                        {opt.bestFundName}: 100% ({opt.returnPct >= 0 ? '+' : ''}{opt.returnPct.toFixed(2)}%)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
