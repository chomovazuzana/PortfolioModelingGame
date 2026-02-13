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
import type { AllocationRecord, OptimalYearResult, AssetClass } from '../../shared/types';
import { ASSET_CLASS_LABELS, GAME_YEARS } from '../../shared/constants';

interface AllocationComparisonChartProps {
  allocations: AllocationRecord[];
  optimalPath: OptimalYearResult[];
}

const ASSET_COLORS: Record<AssetClass, string> = {
  cash: '#059669',
  bonds: '#2563eb',
  equities: '#7c3aed',
  commodities: '#d97706',
  reits: '#e11d48',
};

const ASSET_KEYS: AssetClass[] = ['cash', 'bonds', 'equities', 'commodities', 'reits'];

interface BarDataPoint {
  label: string;
  cash: number;
  bonds: number;
  equities: number;
  commodities: number;
  reits: number;
}

function buildBarData(
  allocations: AllocationRecord[],
  optimalPath: OptimalYearResult[],
): BarDataPoint[] {
  const allocByYear = new Map(allocations.map((a) => [a.year, a]));
  const optByYear = new Map(optimalPath.map((o) => [o.year, o]));
  const data: BarDataPoint[] = [];

  for (const year of GAME_YEARS) {
    const alloc = allocByYear.get(year);
    const opt = optByYear.get(year);

    // Player allocation
    data.push({
      label: `${year} You`,
      cash: alloc?.cash ?? 0,
      bonds: alloc?.bonds ?? 0,
      equities: alloc?.equities ?? 0,
      commodities: alloc?.commodities ?? 0,
      reits: alloc?.reits ?? 0,
    });

    // Optimal allocation (100% in best asset)
    const optPoint: BarDataPoint = {
      label: `${year} Opt`,
      cash: 0,
      bonds: 0,
      equities: 0,
      commodities: 0,
      reits: 0,
    };
    if (opt) {
      optPoint[opt.bestAsset] = 100;
    }
    data.push(optPoint);
  }

  return data;
}

export function AllocationComparisonChart({ allocations, optimalPath }: AllocationComparisonChartProps) {
  const data = buildBarData(allocations, optimalPath);

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Allocation Comparison</h2>
      <p className="mb-4 text-sm text-gray-500">
        Your allocation vs. the optimal hindsight allocation for each year.
      </p>

      <div
        className="h-72 sm:h-80"
        role="img"
        aria-label="Stacked bar chart comparing your asset allocation to the optimal allocation for each year from 2021 to 2024."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickLine={false}
              interval={0}
              angle={-35}
              textAnchor="end"
              height={55}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(value: number) => `${value}%`}
              width={45}
            />
            <Tooltip
              formatter={(value) => [`${Number(value ?? 0)}%`]}
              contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
            <Legend />

            {ASSET_KEYS.map((asset) => (
              <Bar
                key={asset}
                dataKey={asset}
                name={ASSET_CLASS_LABELS[asset]}
                stackId="stack"
                fill={ASSET_COLORS[asset]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
