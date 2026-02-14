import { db } from '../db/index';
import { games, gamePlayers, allocations, portfolioSnapshots, fundBenchmarks } from '../db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { calculateOptimalPath, cumulativeReturn, compoundReturns } from '../shared/calculations';
import { GAME_YEARS, DEFAULT_INITIAL_CAPITAL } from '../shared/constants';
import type {
  FinalResults,
  PlayerFinalResult,
  FundBenchmark,
  FundYearData,
  AllocationRecord,
  PortfolioSnapshot,
} from '../shared/types';
import { ServiceError } from './gameService';
import { getLeaderboard } from './leaderboardService';

export async function getFinalResults(gameId: string, userId: string): Promise<FinalResults> {
  // 1. Verify player has completed all 4 years
  const [player] = await db
    .select()
    .from(gamePlayers)
    .where(and(eq(gamePlayers.gameId, gameId), eq(gamePlayers.userId, userId)))
    .limit(1);

  if (!player) {
    throw new ServiceError('You have not joined this game', 'NOT_JOINED', 403);
  }

  if (player.status !== 'completed') {
    throw new ServiceError(
      'Final results are available only after completing all 4 years',
      'GAME_NOT_COMPLETED',
      403
    );
  }

  // 2. Get game details
  const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
  if (!game) {
    throw new ServiceError('Game not found', 'GAME_NOT_FOUND', 404);
  }

  const initialCapital = Number(game.initialCapital);

  // 3. Get leaderboard
  const leaderboard = await getLeaderboard(gameId);

  // 4. Get player's snapshots
  const snapshotRows = await db
    .select()
    .from(portfolioSnapshots)
    .where(and(eq(portfolioSnapshots.gameId, gameId), eq(portfolioSnapshots.userId, userId)))
    .orderBy(asc(portfolioSnapshots.year));

  const snapshots: PortfolioSnapshot[] = snapshotRows.map((r) => ({
    year: r.year,
    valueStart: Number(r.valueStart),
    valueEnd: Number(r.valueEnd),
    returnPct: Number(r.returnPct),
  }));

  // 5. Get player's allocations
  const allocationRows = await db
    .select()
    .from(allocations)
    .where(and(eq(allocations.gameId, gameId), eq(allocations.userId, userId)))
    .orderBy(asc(allocations.year));

  const playerAllocations: AllocationRecord[] = allocationRows.map((r) => ({
    id: r.id,
    gameId: r.gameId,
    userId: r.userId,
    year: r.year,
    cash: r.cashPct,
    bonds: r.bondsPct,
    equities: r.equitiesPct,
    commodities: r.commoditiesPct,
    reits: r.reitsPct,
    submittedAt: r.submittedAt.toISOString(),
  }));

  // 6. Compute player result
  const finalValue = snapshots.length > 0 ? snapshots[snapshots.length - 1]!.valueEnd : initialCapital;
  const totalReturnPct = cumulativeReturn(initialCapital, finalValue);
  // rank is 0 if player is hidden from leaderboard (admin secret play)
  const playerRank = leaderboard.find((e) => e.userId === userId)?.rank ?? 0;
  const totalPlayers = leaderboard.length;

  const playerResult: PlayerFinalResult = {
    finalValue,
    totalReturnPct,
    rank: playerRank,
    totalPlayers,
    snapshots,
    allocations: playerAllocations,
  };

  // 7. Compute optimal path
  const optimalPath = calculateOptimalPath(initialCapital);

  // 8. Fetch fund benchmarks and compute cumulative returns
  const fundRows = await db
    .select()
    .from(fundBenchmarks)
    .orderBy(asc(fundBenchmarks.fundId), asc(fundBenchmarks.year));

  const fundMap = new Map<number, { fundName: string; fundType: string; years: FundYearData[] }>();

  for (const row of fundRows) {
    if (!fundMap.has(row.fundId)) {
      fundMap.set(row.fundId, {
        fundName: row.fundName,
        fundType: row.fundType,
        years: [],
      });
    }
    fundMap.get(row.fundId)!.years.push({
      year: row.year,
      returnPct: Number(row.returnPct),
      sharpeRatio: Number(row.sharpeRatio),
      cashPct: Number(row.cashPct),
      fixedIncomePct: Number(row.fixedIncomePct),
      equityPct: Number(row.equityPct),
    });
  }

  const fundBenchmarkResults: FundBenchmark[] = [];
  for (const [fundId, data] of fundMap) {
    const yearlyReturns = data.years.map((y) => y.returnPct);
    const cumReturn = compoundReturns(yearlyReturns);
    const fundFinalValue = Math.round(initialCapital * (1 + cumReturn / 100) * 100) / 100;

    fundBenchmarkResults.push({
      fundId,
      fundName: data.fundName,
      fundType: data.fundType,
      years: data.years,
      cumulativeReturnPct: cumReturn,
      finalValue: fundFinalValue,
    });
  }

  return {
    leaderboard,
    playerResult,
    optimalPath,
    fundBenchmarks: fundBenchmarkResults,
  };
}
