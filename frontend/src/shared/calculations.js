import { ASSET_RETURNS, ASSET_CLASSES, GAME_YEARS } from './constants';
/**
 * Calculate the portfolio result for a single year given an allocation and starting value.
 */
export function calculateYearResult(allocation, year, portfolioStartValue) {
    const yearReturns = ASSET_RETURNS[year];
    if (!yearReturns) {
        throw new Error(`No return data for year ${year}`);
    }
    const breakdown = ASSET_CLASSES.map((asset) => {
        const pct = allocation[asset];
        const allocated = portfolioStartValue * (pct / 100);
        const returnPct = yearReturns[asset];
        const contribution = allocated * (returnPct / 100);
        return { asset, allocated, returnPct, contribution };
    });
    const totalContribution = breakdown.reduce((sum, b) => sum + b.contribution, 0);
    const valueEnd = portfolioStartValue + totalContribution;
    const returnPct = (totalContribution / portfolioStartValue) * 100;
    return {
        valueEnd: roundCurrency(valueEnd),
        returnPct: roundPercent(returnPct),
        breakdown: breakdown.map((b) => ({
            ...b,
            allocated: roundCurrency(b.allocated),
            contribution: roundCurrency(b.contribution),
        })),
    };
}
/**
 * Compute the optimal portfolio path (100% in best-performing asset each year).
 */
export function calculateOptimalPath(initialCapital) {
    const results = [];
    let currentValue = initialCapital;
    for (const year of GAME_YEARS) {
        const yearReturns = ASSET_RETURNS[year];
        let bestAsset = 'cash';
        let bestReturn = -Infinity;
        for (const asset of ASSET_CLASSES) {
            if (yearReturns[asset] > bestReturn) {
                bestReturn = yearReturns[asset];
                bestAsset = asset;
            }
        }
        currentValue = roundCurrency(currentValue * (1 + bestReturn / 100));
        results.push({ year, bestAsset, returnPct: bestReturn, portfolioValue: currentValue });
    }
    return results;
}
/**
 * Given a set of snapshots, compute the cumulative return percentage.
 */
export function cumulativeReturn(initialCapital, finalValue) {
    return roundPercent(((finalValue - initialCapital) / initialCapital) * 100);
}
/**
 * Compute cumulative fund return from yearly returns (compounded).
 */
export function compoundReturns(yearlyReturnPcts) {
    let factor = 1;
    for (const r of yearlyReturnPcts) {
        factor *= 1 + r / 100;
    }
    return roundPercent((factor - 1) * 100);
}
/**
 * Validates that an allocation sums to exactly 100 and each value is 0-100 integer.
 */
export function validateAllocation(allocation) {
    const values = ASSET_CLASSES.map((a) => allocation[a]);
    for (const v of values) {
        if (!Number.isInteger(v))
            return { valid: false, error: 'All allocations must be integers' };
        if (v < 0 || v > 100)
            return { valid: false, error: 'Each allocation must be between 0 and 100' };
    }
    const sum = values.reduce((a, b) => a + b, 0);
    if (sum !== 100)
        return { valid: false, error: `Allocations must sum to 100, got ${sum}` };
    return { valid: true };
}
// ── Helpers ──
function roundCurrency(value) {
    return Math.round(value * 100) / 100;
}
function roundPercent(value) {
    return Math.round(value * 100) / 100;
}
