import { FUND_RETURNS, FUND_IDS, FUND_NAMES, GAME_YEARS } from './constants';
import type { Allocation, FundBreakdown, OptimalYearResult } from './types';

/**
 * Calculate the portfolio result for a single year given a fund allocation and starting value.
 */
export function calculateYearResult(
  allocation: Allocation,
  year: number,
  portfolioStartValue: number
): { valueEnd: number; returnPct: number; breakdown: FundBreakdown[] } {
  const yearReturns = FUND_RETURNS[year];
  if (!yearReturns) {
    throw new Error(`No return data for year ${year}`);
  }

  const breakdown: FundBreakdown[] = [];

  for (const fundId of FUND_IDS) {
    const pct = allocation[fundId] ?? 0;
    if (pct === 0) continue;

    const allocated = portfolioStartValue * (pct / 100);
    const returnPct = yearReturns[fundId] ?? 0;
    const contribution = allocated * (returnPct / 100);

    breakdown.push({
      fundId,
      fundName: FUND_NAMES[fundId] ?? `Fund ${fundId}`,
      allocated: roundCurrency(allocated),
      returnPct,
      contribution: roundCurrency(contribution),
    });
  }

  const totalContribution = breakdown.reduce((sum, b) => sum + b.contribution, 0);
  const valueEnd = portfolioStartValue + totalContribution;
  const returnPct = (totalContribution / portfolioStartValue) * 100;

  return {
    valueEnd: roundCurrency(valueEnd),
    returnPct: roundPercent(returnPct),
    breakdown,
  };
}

/**
 * Compute the optimal portfolio path (100% in best-performing fund each year).
 */
export function calculateOptimalPath(initialCapital: number): OptimalYearResult[] {
  const results: OptimalYearResult[] = [];
  let currentValue = initialCapital;

  for (const year of GAME_YEARS) {
    const yearReturns = FUND_RETURNS[year]!;
    let bestFundId = FUND_IDS[0]!;
    let bestReturn = -Infinity;

    for (const fundId of FUND_IDS) {
      const ret = yearReturns[fundId] ?? 0;
      if (ret > bestReturn) {
        bestReturn = ret;
        bestFundId = fundId;
      }
    }

    currentValue = roundCurrency(currentValue * (1 + bestReturn / 100));
    results.push({
      year,
      bestFundId,
      bestFundName: FUND_NAMES[bestFundId] ?? `Fund ${bestFundId}`,
      returnPct: bestReturn,
      portfolioValue: currentValue,
    });
  }

  return results;
}

/**
 * Given a set of snapshots, compute the cumulative return percentage.
 */
export function cumulativeReturn(initialCapital: number, finalValue: number): number {
  return roundPercent(((finalValue - initialCapital) / initialCapital) * 100);
}

/**
 * Compute cumulative fund return from yearly returns (compounded).
 */
export function compoundReturns(yearlyReturnPcts: number[]): number {
  let factor = 1;
  for (const r of yearlyReturnPcts) {
    factor *= 1 + r / 100;
  }
  return roundPercent((factor - 1) * 100);
}

/**
 * Validates that a fund allocation sums to exactly 100 and each value is 0-100 integer.
 */
export function validateAllocation(allocation: Allocation): { valid: boolean; error?: string } {
  const validIdSet = new Set(FUND_IDS);
  const keys = Object.keys(allocation).map(Number);

  for (const key of keys) {
    if (!validIdSet.has(key)) {
      return { valid: false, error: `Invalid fund ID: ${key}` };
    }
  }

  const values = keys.map((k) => allocation[k]!);

  for (const v of values) {
    if (!Number.isInteger(v)) return { valid: false, error: 'All allocations must be integers' };
    if (v < 0 || v > 100) return { valid: false, error: 'Each allocation must be between 0 and 100' };
  }

  const sum = values.reduce((a, b) => a + b, 0);
  if (sum !== 100) return { valid: false, error: `Allocations must sum to 100, got ${sum}` };

  return { valid: true };
}

// ── Helpers ──

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundPercent(value: number): number {
  return Math.round(value * 100) / 100;
}
