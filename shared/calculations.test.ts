import { describe, it, expect } from 'vitest';
import { calculateYearResult, calculateOptimalPath, validateAllocation, compoundReturns } from './calculations';

describe('calculateYearResult', () => {
  it('computes 2021 result for worked example', () => {
    const result = calculateYearResult(
      { cash: 5, bonds: 10, equities: 40, commodities: 25, reits: 20 },
      2021,
      100_000
    );
    expect(result.valueEnd).toBeCloseTo(127_080, 0);
    expect(result.returnPct).toBeCloseTo(27.08, 1);
  });

  it('preserves capital with 100% cash in 2021', () => {
    const result = calculateYearResult(
      { cash: 100, bonds: 0, equities: 0, commodities: 0, reits: 0 },
      2021,
      100_000
    );
    expect(result.valueEnd).toBeCloseTo(100_100, 0);
  });

  it('throws for invalid year', () => {
    expect(() =>
      calculateYearResult(
        { cash: 100, bonds: 0, equities: 0, commodities: 0, reits: 0 },
        2020,
        100_000
      )
    ).toThrow('No return data for year 2020');
  });

  it('computes correct breakdown amounts', () => {
    const result = calculateYearResult(
      { cash: 20, bonds: 20, equities: 20, commodities: 20, reits: 20 },
      2021,
      100_000
    );
    expect(result.breakdown).toHaveLength(5);
    expect(result.breakdown[0]!.asset).toBe('cash');
    expect(result.breakdown[0]!.allocated).toBe(20_000);
  });
});

describe('calculateOptimalPath', () => {
  it('matches documented optimal: EUR 243,748.59', () => {
    const path = calculateOptimalPath(100_000);
    expect(path[0]!.bestAsset).toBe('reits');      // 2021
    expect(path[1]!.bestAsset).toBe('commodities'); // 2022
    expect(path[2]!.bestAsset).toBe('equities');    // 2023
    expect(path[3]!.bestAsset).toBe('equities');    // 2024
    // Correct optimal: 100k * 1.413 * 1.163 * 1.2442 * 1.192 = 243,718.41
    expect(path[3]!.portfolioValue).toBeCloseTo(243_718.41, 0);
  });
});

describe('validateAllocation', () => {
  it('accepts valid allocation', () => {
    expect(validateAllocation({ cash: 20, bonds: 20, equities: 20, commodities: 20, reits: 20 }).valid).toBe(true);
  });

  it('rejects sum != 100', () => {
    expect(validateAllocation({ cash: 20, bonds: 20, equities: 20, commodities: 20, reits: 10 }).valid).toBe(false);
  });

  it('rejects negative values', () => {
    expect(validateAllocation({ cash: -10, bonds: 30, equities: 30, commodities: 30, reits: 20 }).valid).toBe(false);
  });

  it('rejects non-integer values', () => {
    expect(validateAllocation({ cash: 20.5, bonds: 19.5, equities: 20, commodities: 20, reits: 20 }).valid).toBe(false);
  });

  it('rejects values over 100', () => {
    expect(validateAllocation({ cash: 110, bonds: -10, equities: 0, commodities: 0, reits: 0 }).valid).toBe(false);
  });
});

describe('compoundReturns', () => {
  it('compounds correctly', () => {
    // 10% then 20% = 1.1 * 1.2 = 1.32 → 32%
    expect(compoundReturns([10, 20])).toBeCloseTo(32, 1);
  });

  it('handles negative returns', () => {
    // -50% then +100% = 0.5 * 2.0 = 1.0 → 0%
    expect(compoundReturns([-50, 100])).toBeCloseTo(0, 1);
  });

  it('handles empty array', () => {
    expect(compoundReturns([])).toBe(0);
  });
});
