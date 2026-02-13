import { db } from '../db/index';
import { games, gamePlayers, users, portfolioSnapshots } from '../db/schema';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import type { LeaderboardEntry } from '../shared/types';
import { ServiceError } from './gameService';

export async function getLeaderboard(gameId: string): Promise<LeaderboardEntry[]> {
  // Verify game exists
  const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
  if (!game) {
    throw new ServiceError('Game not found', 'GAME_NOT_FOUND', 404);
  }

  const initialCapital = Number(game.initialCapital);

  // Get all players with their latest snapshot
  const playerRows = await db
    .select({
      userId: gamePlayers.userId,
      displayName: users.displayName,
      currentYear: gamePlayers.currentYear,
      status: gamePlayers.status,
    })
    .from(gamePlayers)
    .innerJoin(users, eq(gamePlayers.userId, users.id))
    .where(eq(gamePlayers.gameId, gameId));

  // Get the latest snapshot value for each player
  const snapshotRows = await db
    .select({
      userId: portfolioSnapshots.userId,
      maxYear: sql<number>`MAX(${portfolioSnapshots.year})`.as('max_year'),
      lastValue: sql<string>`(
        SELECT ${portfolioSnapshots.valueEnd}
        FROM portfolio_snapshots ps2
        WHERE ps2.game_id = ${gameId}
          AND ps2.user_id = ${portfolioSnapshots.userId}
        ORDER BY ps2.year DESC
        LIMIT 1
      )`.as('last_value'),
    })
    .from(portfolioSnapshots)
    .where(eq(portfolioSnapshots.gameId, gameId))
    .groupBy(portfolioSnapshots.userId);

  const snapshotMap = new Map<string, number>();
  for (const row of snapshotRows) {
    snapshotMap.set(row.userId, Number(row.lastValue));
  }

  // Build entries
  const entries: LeaderboardEntry[] = playerRows.map((p) => {
    const portfolioValue = snapshotMap.get(p.userId) ?? initialCapital;
    const totalReturnPct =
      initialCapital > 0
        ? Math.round(((portfolioValue - initialCapital) / initialCapital) * 10000) / 100
        : 0;

    return {
      rank: 0, // computed below
      userId: p.userId,
      displayName: p.displayName,
      portfolioValue,
      totalReturnPct,
      currentYear: p.currentYear,
      status: p.status as 'playing' | 'completed',
    };
  });

  // Sort: 1) completed first, 2) then by current_year desc, 3) then by portfolio value desc
  entries.sort((a, b) => {
    // Completed players first
    if (a.status === 'completed' && b.status !== 'completed') return -1;
    if (a.status !== 'completed' && b.status === 'completed') return 1;

    // Same status: sort by current year desc (further along ranks higher)
    if (a.currentYear !== b.currentYear) return b.currentYear - a.currentYear;

    // Same year: sort by portfolio value desc
    return b.portfolioValue - a.portfolioValue;
  });

  // Assign ranks
  for (let i = 0; i < entries.length; i++) {
    entries[i]!.rank = i + 1;
  }

  return entries;
}
