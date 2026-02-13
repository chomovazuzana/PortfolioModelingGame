import { Router } from 'express';
import { requireAdmin } from '../middleware/auth';
import { validateParams } from '../middleware/validation';
import { gameIdParam } from './schemas';
import { db } from '../db/index';
import { gamePlayers, users, allocations, portfolioSnapshots, games } from '../db/schema';
import { eq, and, asc, sql } from 'drizzle-orm';

const router = Router();

function paramStr(val: string | string[] | undefined): string {
  return Array.isArray(val) ? val[0]! : val!;
}

// GET /api/admin/games/:id/players — All players and their progress
router.get('/games/:id/players', requireAdmin, validateParams(gameIdParam), async (req, res) => {
  try {
    const gameId = paramStr(req.params.id);

    // Verify game exists
    const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
    if (!game) {
      res.status(404).json({ error: 'Game not found', code: 'GAME_NOT_FOUND' });
      return;
    }

    const initialCapital = Number(game.initialCapital);

    const playerRows = await db
      .select({
        userId: gamePlayers.userId,
        displayName: users.displayName,
        email: users.email,
        currentYear: gamePlayers.currentYear,
        status: gamePlayers.status,
        joinedAt: gamePlayers.joinedAt,
        completedAt: gamePlayers.completedAt,
      })
      .from(gamePlayers)
      .innerJoin(users, eq(gamePlayers.userId, users.id))
      .where(eq(gamePlayers.gameId, gameId))
      .orderBy(asc(gamePlayers.joinedAt));

    // Get latest snapshot values for all players in this game
    const snapshotRows = await db
      .select({
        userId: portfolioSnapshots.userId,
        valueEnd: portfolioSnapshots.valueEnd,
        year: portfolioSnapshots.year,
      })
      .from(portfolioSnapshots)
      .where(eq(portfolioSnapshots.gameId, gameId))
      .orderBy(asc(portfolioSnapshots.userId), asc(portfolioSnapshots.year));

    // Build a map of userId -> latest valueEnd
    const valueMap = new Map<string, number>();
    for (const row of snapshotRows) {
      // Since ordered by year asc, the last one per user is the latest
      valueMap.set(row.userId, Number(row.valueEnd));
    }

    const players = playerRows.map((p) => ({
      userId: p.userId,
      displayName: p.displayName,
      email: p.email,
      currentYear: p.currentYear,
      status: p.status,
      joinedAt: p.joinedAt.toISOString(),
      completedAt: p.completedAt?.toISOString() ?? null,
      portfolioValue: valueMap.get(p.userId) ?? initialCapital,
    }));

    res.json(players);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// GET /api/admin/games/:id/allocations — All player allocations
router.get('/games/:id/allocations', requireAdmin, validateParams(gameIdParam), async (req, res) => {
  try {
    const gameId = paramStr(req.params.id);

    // Verify game exists
    const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
    if (!game) {
      res.status(404).json({ error: 'Game not found', code: 'GAME_NOT_FOUND' });
      return;
    }

    const rows = await db
      .select({
        id: allocations.id,
        userId: allocations.userId,
        displayName: users.displayName,
        year: allocations.year,
        cashPct: allocations.cashPct,
        bondsPct: allocations.bondsPct,
        equitiesPct: allocations.equitiesPct,
        commoditiesPct: allocations.commoditiesPct,
        reitsPct: allocations.reitsPct,
        submittedAt: allocations.submittedAt,
      })
      .from(allocations)
      .innerJoin(users, eq(allocations.userId, users.id))
      .where(eq(allocations.gameId, gameId))
      .orderBy(asc(allocations.userId), asc(allocations.year));

    const result = rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      displayName: r.displayName,
      year: r.year,
      cash: r.cashPct,
      bonds: r.bondsPct,
      equities: r.equitiesPct,
      commodities: r.commoditiesPct,
      reits: r.reitsPct,
      submittedAt: r.submittedAt.toISOString(),
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

export default router;
