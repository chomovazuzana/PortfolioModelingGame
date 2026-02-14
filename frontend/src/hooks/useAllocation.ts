import { useState, useCallback } from 'react';
import type { Allocation } from '../shared/types';
import { FUND_IDS } from '../shared/constants';

function createDefaultAllocation(): Allocation {
  const alloc: Allocation = {};
  for (const id of FUND_IDS) {
    alloc[id] = 0;
  }
  return alloc;
}

const DEFAULT_ALLOCATION = createDefaultAllocation();

export function useAllocation(initialAllocation?: Allocation) {
  const [allocation, setAllocation] = useState<Allocation>(
    initialAllocation ?? { ...DEFAULT_ALLOCATION },
  );

  const setFund = useCallback((fundId: number, value: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(value)));
    setAllocation((prev) => ({ ...prev, [fundId]: clamped }));
  }, []);

  const total = Object.values(allocation).reduce((sum, v) => sum + v, 0);
  const isValid = total === 100;

  const reset = useCallback(() => {
    setAllocation(initialAllocation ?? { ...DEFAULT_ALLOCATION });
  }, [initialAllocation]);

  return { allocation, setFund, total, isValid, reset };
}
