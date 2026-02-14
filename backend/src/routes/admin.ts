import { Router } from 'express';
import { requireAdmin } from '../middleware/auth';
import { validateParams } from '../middleware/validation';
import { gameIdParam } from './schemas';
import { db } from '../db/index';
import { gamePlayers, users, allocations, portfolioSnapshots, games } from '../db/schema';
import { eq, and, asc } from 'drizzle-orm';
import * as leaderboardService from '../services/leaderboardService';
import type { AdminPlayerDetail, PortfolioSnapshot, AllocationRecord } from '../shared/types';

const router = Router();

function paramStr(val: string | string[] | undefined): string {
  return Array.isArray(val) ? val[0]! : val!;
}

// GET /api/admin/games/:id/players — All players and their progress (enhanced)
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
        hiddenFromLeaderboard: gamePlayers.hiddenFromLeaderboard,
      })
      .from(gamePlayers)
      .innerJoin(users, eq(gamePlayers.userId, users.id))
      .where(eq(gamePlayers.gameId, gameId))
      .orderBy(asc(gamePlayers.joinedAt));

    // Get all snapshots for this game
    const snapshotRows = await db
      .select()
      .from(portfolioSnapshots)
      .where(eq(portfolioSnapshots.gameId, gameId))
      .orderBy(asc(portfolioSnapshots.userId), asc(portfolioSnapshots.year));

    // Build snapshot map: userId -> PortfolioSnapshot[]
    const snapshotMap = new Map<string, PortfolioSnapshot[]>();
    for (const row of snapshotRows) {
      if (!snapshotMap.has(row.userId)) {
        snapshotMap.set(row.userId, []);
      }
      snapshotMap.get(row.userId)!.push({
        year: row.year,
        valueStart: Number(row.valueStart),
        valueEnd: Number(row.valueEnd),
        returnPct: Number(row.returnPct),
      });
    }

    // Get all allocations for this game
    const allocationRows = await db
      .select({
        id: allocations.id,
        gameId: allocations.gameId,
        userId: allocations.userId,
        year: allocations.year,
        cashPct: allocations.cashPct,
        bondsPct: allocations.bondsPct,
        equitiesPct: allocations.equitiesPct,
        commoditiesPct: allocations.commoditiesPct,
        reitsPct: allocations.reitsPct,
        submittedAt: allocations.submittedAt,
      })
      .from(allocations)
      .where(eq(allocations.gameId, gameId))
      .orderBy(asc(allocations.userId), asc(allocations.year));

    // Build allocation map: userId -> AllocationRecord[]
    const allocationMap = new Map<string, AllocationRecord[]>();
    for (const r of allocationRows) {
      if (!allocationMap.has(r.userId)) {
        allocationMap.set(r.userId, []);
      }
      allocationMap.get(r.userId)!.push({
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
      });
    }

    const players: AdminPlayerDetail[] = playerRows.map((p) => {
      const playerSnapshots = snapshotMap.get(p.userId) ?? [];
      const lastSnapshot = playerSnapshots[playerSnapshots.length - 1];
      const portfolioValue = lastSnapshot ? lastSnapshot.valueEnd : initialCapital;

      return {
        userId: p.userId,
        displayName: p.displayName,
        email: p.email,
        currentYear: p.currentYear,
        status: p.status as 'playing' | 'completed',
        joinedAt: p.joinedAt.toISOString(),
        completedAt: p.completedAt?.toISOString() ?? null,
        portfolioValue,
        hiddenFromLeaderboard: p.hiddenFromLeaderboard,
        snapshots: playerSnapshots,
        allocations: allocationMap.get(p.userId) ?? [],
      };
    });

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

// GET /api/admin/games/:id/leaderboard/export — Download leaderboard as CSV
router.get('/games/:id/leaderboard/export', requireAdmin, validateParams(gameIdParam), async (req, res) => {
  try {
    const gameId = paramStr(req.params.id);

    // Get game for the code
    const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
    if (!game) {
      res.status(404).json({ error: 'Game not found', code: 'GAME_NOT_FOUND' });
      return;
    }

    const leaderboard = await leaderboardService.getLeaderboard(gameId);

    // Get emails for leaderboard users
    const userIds = leaderboard.map((e) => e.userId);
    const emailMap = new Map<string, string>();
    if (userIds.length > 0) {
      const userRows = await db
        .select({ id: users.id, email: users.email })
        .from(users);
      for (const u of userRows) {
        emailMap.set(u.id, u.email);
      }
    }

    const initialCapital = Number(game.initialCapital);

    // Build CSV
    const headers = ['Rank', 'Name', 'Email', 'Portfolio Value', 'Total Return %', 'Status', 'Current Year'];
    const rows = leaderboard.map((e) => [
      e.rank,
      `"${e.displayName.replace(/"/g, '""')}"`,
      emailMap.get(e.userId) ?? '',
      e.portfolioValue.toFixed(2),
      e.totalReturnPct.toFixed(2),
      e.status,
      e.currentYear,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="leaderboard-${game.gameCode}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

export default router;
