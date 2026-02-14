import { db } from '../db/index';
import { games, gamePlayers, allocations, portfolioSnapshots } from '../db/schema';
import { eq, and, asc, sql } from 'drizzle-orm';
import { calculateYearResult } from '../shared/calculations';
import { SCENARIO_BRIEFINGS, GAME_YEARS, COMPLETED_YEAR_MARKER } from '../shared/constants';
import type { PlayState, YearResult, AllocationRecord, PortfolioSnapshot, Allocation } from '../shared/types';
import { ServiceError } from './gameService';

export async function getPlayState(gameId: string, userId: string): Promise<PlayState> {
  const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
  if (!game) {
    throw new ServiceError('Game not found', 'GAME_NOT_FOUND', 404);
  }

  const [player] = await db
    .select()
    .from(gamePlayers)
    .where(and(eq(gamePlayers.gameId, gameId), eq(gamePlayers.userId, userId)))
    .limit(1);

  if (!player) {
    throw new ServiceError('You have not joined this game', 'NOT_JOINED', 403);
  }

  const currentYear = player.currentYear;
  const playerStatus = player.status as 'playing' | 'completed';

  // Get completed snapshots
  const snapshots = await db
    .select()
    .from(portfolioSnapshots)
    .where(and(eq(portfolioSnapshots.gameId, gameId), eq(portfolioSnapshots.userId, userId)))
    .orderBy(asc(portfolioSnapshots.year));

  // Current portfolio value
  const initialCapital = Number(game.initialCapital);
  let portfolioValue = initialCapital;
  const completedYears: number[] = [];

  if (snapshots.length > 0) {
    const lastSnapshot = snapshots[snapshots.length - 1]!;
    portfolioValue = Number(lastSnapshot.valueEnd);
    for (const s of snapshots) {
      completedYears.push(s.year);
    }
  }

  const totalReturnPct =
    initialCapital > 0
      ? Math.round(((portfolioValue - initialCapital) / initialCapital) * 10000) / 100
      : 0;

  // Check if allocation already submitted for current year
  let allocationSubmitted = false;
  if (currentYear <= 2024) {
    const [existingAlloc] = await db
      .select()
      .from(allocations)
      .where(
        and(
          eq(allocations.gameId, gameId),
          eq(allocations.userId, userId),
          eq(allocations.year, currentYear)
        )
      )
      .limit(1);
    allocationSubmitted = !!existingAlloc;
  }

  // Compute round deadline for the current year
  const roundDeadlineMap: Record<number, Date | null> = {
    2021: game.round1Deadline,
    2022: game.round2Deadline,
    2023: game.round3Deadline,
    2024: game.round4Deadline,
  };
  const roundDeadline = roundDeadlineMap[currentYear]?.toISOString() ?? null;

  // Scenario briefing (use last year if completed)
  const scenarioYear = currentYear <= 2024 ? currentYear : 2024;
  const briefing = SCENARIO_BRIEFINGS[scenarioYear]!;

  return {
    gameId,
    gameName: game.name,
    currentYear,
    portfolioValue,
    initialCapital,
    totalReturnPct,
    scenario: { year: scenarioYear, title: briefing.title, description: briefing.description },
    completedYears,
    allocationSubmitted,
    playerStatus,
    roundDeadline,
  };
}

export async function submitAllocation(
  gameId: string,
  userId: string,
  allocationData: { year: number; cash: number; bonds: number; equities: number; commodities: number; reits: number }
): Promise<YearResult> {
  // Use Drizzle transaction with raw SQL for FOR UPDATE support
  return await db.transaction(async (tx) => {
    // 1. Lock and read player row with FOR UPDATE
    const playerRows = await tx.execute<{
      game_id: string;
      user_id: string;
      current_year: number;
      status: string;
    }>(sql`
      SELECT game_id, user_id, current_year, status
      FROM game_players
      WHERE game_id = ${gameId} AND user_id = ${userId}
      FOR UPDATE
    `);

    if (playerRows.length === 0) {
      throw new ServiceError('You have not joined this game', 'NOT_JOINED', 403);
    }

    const player = playerRows[0]!;
    const currentYear = player.current_year;
    const playerStatus = player.status;

    if (playerStatus === 'completed') {
      throw new ServiceError('You have already completed this game', 'GAME_NOT_ACTIVE', 400);
    }

    // 2. Validate submitted year matches current_year
    if (allocationData.year !== currentYear) {
      throw new ServiceError(
        `Expected year ${currentYear}, got ${allocationData.year}`,
        'WRONG_YEAR',
        400
      );
    }

    // 3. Check for double-submission
    const [existingAlloc] = await tx
      .select({ id: allocations.id })
      .from(allocations)
      .where(
        and(
          eq(allocations.gameId, gameId),
          eq(allocations.userId, userId),
          eq(allocations.year, currentYear)
        )
      )
      .limit(1);

    if (existingAlloc) {
      throw new ServiceError('Allocation already submitted for this year', 'ALREADY_SUBMITTED', 400);
    }

    // 3b. Check round deadline
    const [game] = await tx.select().from(games).where(eq(games.id, gameId)).limit(1);
    const roundDeadlineMap: Record<number, Date | null> = {
      2021: game!.round1Deadline,
      2022: game!.round2Deadline,
      2023: game!.round3Deadline,
      2024: game!.round4Deadline,
    };
    const roundDeadline = roundDeadlineMap[currentYear] ?? null;
    if (roundDeadline && new Date() > roundDeadline) {
      throw new ServiceError('The deadline for this round has passed', 'ROUND_DEADLINE_PASSED', 400);
    }

    // 4. Get current portfolio value
    const initialCapital = Number(game!.initialCapital);

    let portfolioStart = initialCapital;
    if (currentYear > 2021) {
      const prevSnapshots = await tx
        .select({ valueEnd: portfolioSnapshots.valueEnd })
        .from(portfolioSnapshots)
        .where(and(eq(portfolioSnapshots.gameId, gameId), eq(portfolioSnapshots.userId, userId)))
        .orderBy(asc(portfolioSnapshots.year));

      if (prevSnapshots.length > 0) {
        portfolioStart = Number(prevSnapshots[prevSnapshots.length - 1]!.valueEnd);
      }
    }

    // 5. Compute year result
    const allocation: Allocation = {
      cash: allocationData.cash,
      bonds: allocationData.bonds,
      equities: allocationData.equities,
      commodities: allocationData.commodities,
      reits: allocationData.reits,
    };

    const calcResult = calculateYearResult(allocation, currentYear, portfolioStart);

    // 6. Insert allocation record
    await tx.insert(allocations).values({
      gameId,
      userId,
      year: currentYear,
      cashPct: allocationData.cash,
      bondsPct: allocationData.bonds,
      equitiesPct: allocationData.equities,
      commoditiesPct: allocationData.commodities,
      reitsPct: allocationData.reits,
    });

    // 7. Insert portfolio snapshot
    await tx.insert(portfolioSnapshots).values({
      gameId,
      userId,
      year: currentYear,
      valueStart: String(portfolioStart),
      valueEnd: String(calcResult.valueEnd),
      returnPct: String(calcResult.returnPct),
    });

    // 8. Advance player to next year (or mark completed)
    const isLastYear = currentYear === GAME_YEARS[GAME_YEARS.length - 1];
    const nextYear = isLastYear ? COMPLETED_YEAR_MARKER : currentYear + 1;
    const newStatus = isLastYear ? 'completed' : 'playing';

    if (isLastYear) {
      await tx
        .update(gamePlayers)
        .set({ currentYear: nextYear, status: newStatus, completedAt: new Date() })
        .where(and(eq(gamePlayers.gameId, gameId), eq(gamePlayers.userId, userId)));
    } else {
      await tx
        .update(gamePlayers)
        .set({ currentYear: nextYear, status: newStatus })
        .where(and(eq(gamePlayers.gameId, gameId), eq(gamePlayers.userId, userId)));
    }

    return {
      year: currentYear,
      allocation,
      portfolioStart,
      portfolioEnd: calcResult.valueEnd,
      returnPct: calcResult.returnPct,
      breakdown: calcResult.breakdown,
      nextYear: isLastYear ? null : nextYear,
      playerStatus: newStatus as 'playing' | 'completed',
    } satisfies YearResult;
  });
}

export async function getAllocations(gameId: string, userId: string): Promise<AllocationRecord[]> {
  const rows = await db
    .select()
    .from(allocations)
    .where(and(eq(allocations.gameId, gameId), eq(allocations.userId, userId)))
    .orderBy(asc(allocations.year));

  return rows.map((r) => ({
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
}

export async function getSnapshots(gameId: string, userId: string): Promise<PortfolioSnapshot[]> {
  const rows = await db
    .select()
    .from(portfolioSnapshots)
    .where(and(eq(portfolioSnapshots.gameId, gameId), eq(portfolioSnapshots.userId, userId)))
    .orderBy(asc(portfolioSnapshots.year));

  return rows.map((r) => ({
    year: r.year,
    valueStart: Number(r.valueStart),
    valueEnd: Number(r.valueEnd),
    returnPct: Number(r.returnPct),
  }));
}
