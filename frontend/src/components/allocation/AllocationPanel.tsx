import { useState } from 'react';
import type { Allocation, AssetClass } from '../../shared/types';
import { ASSET_CLASS_LABELS } from '../../shared/constants';
import { useAllocation } from '../../hooks/useAllocation';
import { AllocationSlider } from './AllocationSlider';
import { AllocationSummary } from './AllocationSummary';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';

interface AllocationPanelProps {
  onSubmit: (allocation: Allocation) => void;
  isSubmitting: boolean;
  disabled: boolean;
}

const SLIDER_CONFIG: { asset: AssetClass; color: string }[] = [
  { asset: 'cash', color: 'text-emerald-600' },
  { asset: 'bonds', color: 'text-blue-600' },
  { asset: 'equities', color: 'text-violet-600' },
  { asset: 'commodities', color: 'text-amber-600' },
  { asset: 'reits', color: 'text-rose-600' },
];

export function AllocationPanel({ onSubmit, isSubmitting, disabled }: AllocationPanelProps) {
  const { allocation, setAsset, total, isValid, reset } = useAllocation();
  const [showConfirm, setShowConfirm] = useState(false);

  function handleSubmit() {
    if (!isValid) return;
    setShowConfirm(true);
  }

  function handleConfirm() {
    setShowConfirm(false);
    onSubmit(allocation);
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        {SLIDER_CONFIG.map(({ asset, color }) => (
          <AllocationSlider
            key={asset}
            asset={asset}
            label={ASSET_CLASS_LABELS[asset]}
            value={allocation[asset]}
            onChange={(val) => setAsset(asset, val)}
            color={color}
          />
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
        <div className="mt-4 space-y-2 rounded-lg bg-gray-50 p-3">
          {SLIDER_CONFIG.map(({ asset }) => (
            <div key={asset} className="flex justify-between text-sm">
              <span className="text-gray-600">{ASSET_CLASS_LABELS[asset]}</span>
              <span className="font-medium text-gray-900">{allocation[asset]}%</span>
            </div>
          ))}
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
