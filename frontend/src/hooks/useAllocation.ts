import { useState, useCallback } from 'react';
import type { Allocation, AssetClass } from '../shared/types';

const DEFAULT_ALLOCATION: Allocation = {
  cash: 20,
  bonds: 20,
  equities: 20,
  commodities: 20,
  reits: 20,
};

export function useAllocation(initialAllocation?: Allocation) {
  const [allocation, setAllocation] = useState<Allocation>(
    initialAllocation ?? DEFAULT_ALLOCATION,
  );

  const setAsset = useCallback((asset: AssetClass, value: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(value)));
    setAllocation((prev) => ({ ...prev, [asset]: clamped }));
  }, []);

  const total =
    allocation.cash +
    allocation.bonds +
    allocation.equities +
    allocation.commodities +
    allocation.reits;

  const isValid = total === 100;

  const reset = useCallback(() => {
    setAllocation(initialAllocation ?? DEFAULT_ALLOCATION);
  }, [initialAllocation]);

  return { allocation, setAsset, total, isValid, reset };
}
