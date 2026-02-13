import { clsx } from 'clsx';
import type { PortfolioSnapshot } from '../../shared/types';
import { GAME_YEARS } from '../../shared/constants';

interface ProgressTimelineProps {
  snapshots: PortfolioSnapshot[];
  currentYear: number;
  initialCapital: number;
}

function formatEur(value: number): string {
  return `EUR ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function ProgressTimeline({ snapshots, currentYear, initialCapital }: ProgressTimelineProps) {
  const snapshotByYear = new Map(snapshots.map((s) => [s.year, s]));

  return (
    <div className="space-y-0">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Portfolio Timeline
      </h3>

      {/* Initial capital */}
      <div className="flex items-center gap-3 pb-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
          &bull;
        </div>
        <div>
          <div className="text-xs text-gray-500">Starting Capital</div>
          <div className="text-sm font-medium text-gray-900">{formatEur(initialCapital)}</div>
        </div>
      </div>

      {GAME_YEARS.map((year) => {
        const snapshot = snapshotByYear.get(year);
        const isCurrent = year === currentYear;
        const isFuture = year > currentYear;

        return (
          <div key={year} className="relative flex items-start gap-3 pb-3 pl-0">
            {/* Vertical connector line */}
            <div className="absolute left-4 top-0 -mt-3 h-3 w-px bg-gray-200" />

            {/* Status icon */}
            <div
              className={clsx(
                'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                snapshot && 'bg-green-100 text-green-700',
                isCurrent && !snapshot && 'bg-blue-100 text-blue-700 ring-2 ring-blue-300',
                isFuture && 'bg-gray-100 text-gray-400',
              )}
            >
              {snapshot ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : isCurrent ? (
                <span className="text-xs">{year.toString().slice(-2)}</span>
              ) : (
                <span className="text-gray-300">&mdash;</span>
              )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-gray-900">Year {year}</div>
              {snapshot ? (
                <div className="mt-0.5 text-xs text-gray-500">
                  {formatEur(snapshot.valueStart)} &rarr; {formatEur(snapshot.valueEnd)}{' '}
                  <span
                    className={clsx(
                      'font-medium',
                      snapshot.returnPct >= 0 ? 'text-green-600' : 'text-red-600',
                    )}
                  >
                    ({snapshot.returnPct >= 0 ? '+' : ''}{snapshot.returnPct.toFixed(2)}%)
                  </span>
                </div>
              ) : isCurrent ? (
                <div className="mt-0.5 text-xs text-blue-600">Awaiting allocation...</div>
              ) : (
                <div className="mt-0.5 text-xs text-gray-400">Upcoming</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
