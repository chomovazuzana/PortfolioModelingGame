import { clsx } from 'clsx';
import type { YearResult } from '../../shared/types';
import { ASSET_CLASS_LABELS } from '../../shared/constants';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';

interface YearResultModalProps {
  result: YearResult;
  onContinue: () => void;
  onClose: () => void;
}

function formatEur(value: number): string {
  return `EUR ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPct(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function YearResultModal({ result, onContinue, onClose }: YearResultModalProps) {
  const pnl = result.portfolioEnd - result.portfolioStart;
  const isPositive = result.returnPct >= 0;

  return (
    <Dialog
      open
      onClose={onClose}
      title={`Year ${result.year} Results`}
      className="max-w-xl"
    >
      <div className="space-y-5">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-500">Start Value</div>
            <div className="mt-1 text-sm font-semibold text-gray-900">
              {formatEur(result.portfolioStart)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">End Value</div>
            <div className={clsx('mt-1 text-sm font-semibold', isPositive ? 'text-green-700' : 'text-red-600')}>
              {formatEur(result.portfolioEnd)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Return</div>
            <div className={clsx('mt-1 text-sm font-semibold', isPositive ? 'text-green-700' : 'text-red-600')}>
              {formatPct(result.returnPct)}
            </div>
          </div>
        </div>

        {/* Breakdown table */}
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="px-4 py-2">Asset</th>
                <th className="px-4 py-2 text-right">Allocation</th>
                <th className="px-4 py-2 text-right">Return</th>
                <th className="px-4 py-2 text-right">Contribution</th>
              </tr>
            </thead>
            <tbody>
              {result.breakdown.map((row, i) => (
                <tr
                  key={row.asset}
                  className={clsx(i % 2 === 0 ? 'bg-white' : 'bg-gray-50')}
                >
                  <td className="px-4 py-2 font-medium text-gray-900">
                    {ASSET_CLASS_LABELS[row.asset]}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-gray-700">
                    {row.allocated}%
                  </td>
                  <td className={clsx(
                    'px-4 py-2 text-right tabular-nums',
                    row.returnPct >= 0 ? 'text-green-700' : 'text-red-600',
                  )}>
                    {formatPct(row.returnPct)}
                  </td>
                  <td className={clsx(
                    'px-4 py-2 text-right tabular-nums',
                    row.contribution >= 0 ? 'text-green-700' : 'text-red-600',
                  )}>
                    {formatEur(row.contribution)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total P&L */}
        <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
          <span className="font-medium text-gray-700">Total P&L</span>
          <span className={clsx('text-lg font-bold tabular-nums', pnl >= 0 ? 'text-green-700' : 'text-red-600')}>
            {pnl >= 0 ? '+' : ''}{formatEur(pnl)}
          </span>
        </div>

        {/* Continue button */}
        <div className="flex justify-end">
          <Button onClick={onContinue} className="w-full sm:w-auto">
            {result.nextYear
              ? `Continue to Year ${result.nextYear}`
              : 'View Final Results'}
            {' '}
            <span aria-hidden="true">&rarr;</span>
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
