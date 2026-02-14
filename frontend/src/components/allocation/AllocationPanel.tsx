import { useState } from 'react';
import type { Allocation } from '../../shared/types';
import { FUND_IDS, FUND_NAMES, FUND_TYPES } from '../../shared/constants';
import { useAllocation } from '../../hooks/useAllocation';
import { AllocationFundInput } from './AllocationFundInput';
import { AllocationSummary } from './AllocationSummary';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';

interface AllocationPanelProps {
  onSubmit: (allocation: Allocation) => void;
  isSubmitting: boolean;
  disabled: boolean;
}

const FUND_TYPE_ORDER = ['Bond', 'Mixed', 'Equity'] as const;

function groupFundsByType(): { type: string; fundIds: number[] }[] {
  return FUND_TYPE_ORDER.map((type) => ({
    type,
    fundIds: FUND_IDS.filter((id) => FUND_TYPES[id] === type),
  }));
}

const FUND_GROUPS = groupFundsByType();

export function AllocationPanel({ onSubmit, isSubmitting, disabled }: AllocationPanelProps) {
  const { allocation, setFund, total, isValid, reset } = useAllocation();
  const [showConfirm, setShowConfirm] = useState(false);

  function handleSubmit() {
    if (!isValid) return;
    setShowConfirm(true);
  }

  function handleConfirm() {
    setShowConfirm(false);
    onSubmit(allocation);
  }

  const nonZeroFunds = FUND_IDS.filter((id) => (allocation[id] ?? 0) > 0);

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        {FUND_GROUPS.map(({ type, fundIds }) => (
          <div key={type}>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {type} Funds
            </h3>
            <div className="divide-y divide-gray-100">
              {fundIds.map((fundId) => (
                <AllocationFundInput
                  key={fundId}
                  fundId={fundId}
                  label={FUND_NAMES[fundId] ?? `Fund ${fundId}`}
                  value={allocation[fundId] ?? 0}
                  onChange={(val) => setFund(fundId, val)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <AllocationSummary allocation={allocation} isValid={isValid} total={total} />

      <div className="flex gap-3">
        <Button
          onClick={handleSubmit}
          disabled={!isValid || disabled}
          loading={isSubmitting}
          className="flex-1"
        >
          Submit Allocation
        </Button>
        <Button variant="ghost" onClick={reset} disabled={isSubmitting}>
          Reset
        </Button>
      </div>

      <Dialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Allocation"
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to submit this allocation? This cannot be undone.
        </p>
        <div className="mt-4 space-y-1 rounded-lg bg-gray-50 p-3">
          {nonZeroFunds.map((fundId) => (
            <div key={fundId} className="flex justify-between text-sm">
              <span className="text-gray-600">{FUND_NAMES[fundId]}</span>
              <span className="font-medium text-gray-900">{allocation[fundId]}%</span>
            </div>
          ))}
          {nonZeroFunds.length === 0 && (
            <p className="text-sm text-gray-400">No funds selected</p>
          )}
          <div className="mt-1 border-t border-gray-200 pt-2 flex justify-between text-sm font-semibold">
            <span>Total</span>
            <span>{total}%</span>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Confirm & Submit
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
