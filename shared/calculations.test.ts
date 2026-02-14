import { describe, it, expect } from 'vitest';
import { calculateYearResult, calculateOptimalPath, validateAllocation, compoundReturns } from './calculations';

describe('calculateYearResult', () => {
  it('computes 2021 result for 100% NBG Global Equity', () => {
    const result = calculateYearResult(
      { 924: 100 },
      2021,
      100_000
    );
    // 100000 * 28.27% = 128270
    expect(result.valueEnd).toBeCloseTo(128_270, 0);
    expect(result.returnPct).toBeCloseTo(28.27, 1);
  });

  it('computes 2021 result for split allocation', () => {
    const result = calculateYearResult(
      { 924: 50, 953: 50 },
      2021,
      100_000
    );
    // 50000 * 28.27% + 50000 * 13.47% = 14135 + 6735 = 20870 gain → 120870
    expect(result.valueEnd).toBeCloseTo(120_870, 0);
    expect(result.returnPct).toBeCloseTo(20.87, 1);
  });

  it('throws for invalid year', () => {
    expect(() =>
      calculateYearResult(
        { 924: 100 },
        2020,
        100_000
      )
    ).toThrow('No return data for year 2020');
  });

  it('computes correct breakdown entries', () => {
    const result = calculateYearResult(
      { 750: 30, 924: 70 },
      2021,
      100_000
    );
    expect(result.breakdown).toHaveLength(2);
    expect(result.breakdown[0]!.fundId).toBe(750);
    expect(result.breakdown[0]!.fundName).toBe('DELOS Synthesis Best Blue');
    expect(result.breakdown[0]!.allocated).toBeCloseTo(30_000, 0);
    expect(result.breakdown[1]!.fundId).toBe(924);
    expect(result.breakdown[1]!.allocated).toBeCloseTo(70_000, 0);
  });

  it('filters out zero-allocation funds from breakdown', () => {
    const result = calculateYearResult(
      { 924: 100 },
      2021,
      100_000
    );
    expect(result.breakdown).toHaveLength(1);
    expect(result.breakdown[0]!.fundId).toBe(924);
  });
});

describe('calculateOptimalPath', () => {
  it('finds best fund per year', () => {
    const path = calculateOptimalPath(100_000);
    expect(path[0]!.bestFundId).toBe(924);   // 2021: NBG Global Equity 28.27%
    expect(path[0]!.bestFundName).toBe('NBG Global Equity');
    expect(path[1]!.bestFundId).toBe(953);   // 2022: DELOS Blue Chips 4.27%
    expect(path[1]!.bestFundName).toBe('DELOS Blue Chips');
    expect(path[2]!.bestFundId).toBe(916);   // 2023: DELOS Small Cap 38.39%
    expect(path[2]!.bestFundName).toBe('DELOS Small Cap');
    expect(path[3]!.bestFundId).toBe(753);   // 2024: DELOS Synthesis Best Red 21.23%
    expect(path[3]!.bestFundName).toBe('DELOS Synthesis Best Red');
  });

  it('computes correct cumulative optimal value', () => {
    const path = calculateOptimalPath(100_000);
    // 100000 * 1.2827 * 1.0427 * 1.3839 * 1.2123
    const expected = 100_000 * 1.2827 * 1.0427 * 1.3839 * 1.2123;
    expect(path[3]!.portfolioValue).toBeCloseTo(expected, 0);
  });
});

describe('validateAllocation', () => {
  it('accepts valid fund allocation', () => {
    expect(validateAllocation({ 924: 50, 953: 50 }).valid).toBe(true);
  });

  it('accepts single fund at 100%', () => {
    expect(validateAllocation({ 924: 100 }).valid).toBe(true);
  });

  it('rejects sum != 100', () => {
    expect(validateAllocation({ 924: 50, 953: 40 }).valid).toBe(false);
  });

  it('rejects negative values', () => {
    expect(validateAllocation({ 924: -10, 953: 110 }).valid).toBe(false);
  });

  it('rejects non-integer values', () => {
    expect(validateAllocation({ 924: 50.5, 953: 49.5 }).valid).toBe(false);
  });

  it('rejects values over 100', () => {
    expect(validateAllocation({ 924: 110 }).valid).toBe(false);
  });

  it('rejects invalid fund IDs', () => {
    expect(validateAllocation({ 999: 100 }).valid).toBe(false);
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
