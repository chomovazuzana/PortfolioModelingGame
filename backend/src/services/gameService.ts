import { db } from '../db/index';
import { games, gamePlayers, users } from '../db/schema';
import { eq, and, count, sql } from 'drizzle-orm';
import { GAME_CODE_LENGTH } from '../shared/constants';
import type { Game, GameDetail, UserRole } from '../shared/types';

export async function createGame(
  adminId: string,
  data: {
    name: string;
    initialCapital?: number;
    deadline?: string | null;
    maxPlayers?: number | null;
    gameCode?: string;
  }
): Promise<Game> {
  const gameCode = data.gameCode || (await generateGameCode());

  const [game] = await db
    .insert(games)
    .values({
      name: data.name,
      gameCode,
      initialCapital: String(data.initialCapital ?? 100_000),
      deadline: data.deadline ? new Date(data.deadline) : null,
      maxPlayers: data.maxPlayers ?? null,
      createdBy: adminId,
    })
    .returning();

  return mapGame(game!);
}

export async function listGames(
  userId: string,
  role: UserRole
): Promise<Game[]> {
  const playerCountSq = db
    .select({
      gameId: gamePlayers.gameId,
      playerCount: count().as('player_count'),
    })
    .from(gamePlayers)
    .groupBy(gamePlayers.gameId)
    .as('pc');

  let rows;
  if (role === 'admin') {
    rows = await db
      .select({
        game: games,
        playerCount: playerCountSq.playerCount,
      })
      .from(games)
      .leftJoin(playerCountSq, eq(games.id, playerCountSq.gameId))
      .orderBy(games.createdAt);
  } else {
    rows = await db
      .select({
        game: games,
        playerCount: playerCountSq.playerCount,
      })
      .from(games)
      .leftJoin(playerCountSq, eq(games.id, playerCountSq.gameId))
      .where(eq(games.status, 'open'))
      .orderBy(games.createdAt);
  }

  return rows.map((r) => ({
    ...mapGame(r.game),
    playerCount: Number(r.playerCount ?? 0),
  }));
}

export async function getGame(
  gameId: string,
  userId: string
): Promise<GameDetail> {
  const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
  if (!game) {
    throw new ServiceError('Game not found', 'GAME_NOT_FOUND', 404);
  }

  const [playerRow] = await db
    .select()
    .from(gamePlayers)
    .where(and(eq(gamePlayers.gameId, gameId), eq(gamePlayers.userId, userId)))
    .limit(1);

  const [countRow] = await db
    .select({ count: count() })
    .from(gamePlayers)
    .where(eq(gamePlayers.gameId, gameId));

  const result: GameDetail = {
    ...mapGame(game),
    playerCount: countRow?.count ?? 0,
  };

  if (playerRow) {
    result.playerProgress = {
      currentYear: playerRow.currentYear,
      status: playerRow.status as 'playing' | 'completed',
      joinedAt: playerRow.joinedAt.toISOString(),
      completedAt: playerRow.completedAt?.toISOString() ?? null,
    };
  }

  return result;
}

export async function joinGame(
  gameId: string,
  userId: string,
  gameCode: string
): Promise<GameDetail> {
  const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
  if (!game) {
    throw new ServiceError('Game not found', 'GAME_NOT_FOUND', 404);
  }

  if (game.gameCode !== gameCode) {
    throw new ServiceError('Invalid game code', 'INVALID_GAME_CODE', 400);
  }

  if (game.status !== 'open') {
    throw new ServiceError('Game is not accepting new players', 'GAME_NOT_OPEN', 400);
  }

  // Check if already joined
  const [existing] = await db
    .select()
    .from(gamePlayers)
    .where(and(eq(gamePlayers.gameId, gameId), eq(gamePlayers.userId, userId)))
    .limit(1);

  if (existing) {
    throw new ServiceError('Already joined this game', 'ALREADY_JOINED', 400);
  }

  // Check max players
  if (game.maxPlayers) {
    const [countRow] = await db
      .select({ count: count() })
      .from(gamePlayers)
      .where(eq(gamePlayers.gameId, gameId));

    if ((countRow?.count ?? 0) >= game.maxPlayers) {
      throw new ServiceError('Game is full', 'GAME_FULL', 400);
    }
  }

  await db.insert(gamePlayers).values({
    gameId,
    userId,
    currentYear: 2021,
    status: 'playing',
  });

  return getGame(gameId, userId);
}

export async function updateGame(
  gameId: string,
  adminId: string,
  data: { name?: string; deadline?: string | null; maxPlayers?: number | null }
): Promise<Game> {
  const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
  if (!game) {
    throw new ServiceError('Game not found', 'GAME_NOT_FOUND', 404);
  }

  const updates: Record<string, unknown> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.deadline !== undefined) {
    updates.deadline = data.deadline ? new Date(data.deadline) : null;
  }
  if (data.maxPlayers !== undefined) updates.maxPlayers = data.maxPlayers;

  if (Object.keys(updates).length === 0) {
    return mapGame(game);
  }

  const [updated] = await db
    .update(games)
    .set(updates)
    .where(eq(games.id, gameId))
    .returning();

  return mapGame(updated!);
}

export async function closeGame(
  gameId: string,
  adminId: string
): Promise<Game> {
  const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
  if (!game) {
    throw new ServiceError('Game not found', 'GAME_NOT_FOUND', 404);
  }

  if (game.status === 'completed') {
    throw new ServiceError('Game is already completed', 'GAME_ALREADY_COMPLETED', 400);
  }

  const [updated] = await db
    .update(games)
    .set({ status: 'closed' })
    .where(eq(games.id, gameId))
    .returning();

  return mapGame(updated!);
}

export async function generateGameCode(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (let attempt = 0; attempt < 10; attempt++) {
    let code = '';
    for (let i = 0; i < GAME_CODE_LENGTH; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    const [existing] = await db
      .select({ id: games.id })
      .from(games)
      .where(eq(games.gameCode, code))
      .limit(1);

    if (!existing) return code;
  }
  throw new Error('Failed to generate unique game code after 10 attempts');
}

// ── Helpers ──

function mapGame(row: typeof games.$inferSelect): Game {
  return {
    id: row.id,
    name: row.name,
    gameCode: row.gameCode,
    status: row.status as Game['status'],
    initialCapital: Number(row.initialCapital),
    deadline: row.deadline?.toISOString() ?? null,
    maxPlayers: row.maxPlayers,
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
  };
}

// ── Service Error ──

export class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}
