import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { db } from '../db/index';
import { games, gamePlayers, allocations, portfolioSnapshots } from '../db/schema';
import { sql } from 'drizzle-orm';

process.env.DISABLE_LOGIN = 'true';
const app = createApp();

async function cleanGameData() {
  await db.delete(portfolioSnapshots);
  await db.delete(allocations);
  await db.delete(gamePlayers);
  await db.delete(games);
}

describe('Game routes', () => {
  beforeEach(async () => {
    await cleanGameData();
  });

  afterAll(async () => {
    await cleanGameData();
  });

  it('POST /api/games creates a game (admin)', async () => {
    const res = await request(app)
      .post('/api/games')
      .send({ name: 'Test Game' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Game');
    expect(res.body.gameCode).toMatch(/^[A-Z0-9]{6}$/);
    expect(res.body.status).toBe('open');
    expect(res.body.initialCapital).toBe(100000);
  });

  it('POST /api/games with custom initial capital', async () => {
    const res = await request(app)
      .post('/api/games')
      .send({ name: 'Rich Game', initialCapital: 500000 });

    expect(res.status).toBe(201);
    expect(res.body.initialCapital).toBe(500000);
  });

  it('POST /api/games validates name is required', async () => {
    const res = await request(app)
      .post('/api/games')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/games lists games', async () => {
    // Create a game first
    await request(app)
      .post('/api/games')
      .send({ name: 'List Test' });

    const res = await request(app).get('/api/games');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].name).toBe('List Test');
  });

  it('GET /api/games/:id returns game details', async () => {
    const createRes = await request(app)
      .post('/api/games')
      .send({ name: 'Detail Test' });

    const res = await request(app).get(`/api/games/${createRes.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Detail Test');
    expect(res.body.id).toBe(createRes.body.id);
  });

  it('GET /api/games/:id returns 404 for non-existent game', async () => {
    const res = await request(app).get('/api/games/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('GAME_NOT_FOUND');
  });

  it('POST /api/games/:id/join joins a game with correct code', async () => {
    const createRes = await request(app)
      .post('/api/games')
      .send({ name: 'Join Test' });

    const gameCode = createRes.body.gameCode;
    const gameId = createRes.body.id;

    const res = await request(app)
      .post(`/api/games/${gameId}/join`)
      .send({ gameCode });

    expect(res.status).toBe(200);
    expect(res.body.playerProgress).toBeDefined();
    expect(res.body.playerProgress.currentYear).toBe(2021);
    expect(res.body.playerProgress.status).toBe('playing');
  });

  it('POST /api/games/:id/join rejects wrong game code', async () => {
    const createRes = await request(app)
      .post('/api/games')
      .send({ name: 'Bad Code Test' });

    const res = await request(app)
      .post(`/api/games/${createRes.body.id}/join`)
      .send({ gameCode: 'WRONG1' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_GAME_CODE');
  });

  it('POST /api/games/:id/join rejects duplicate join', async () => {
    const createRes = await request(app)
      .post('/api/games')
      .send({ name: 'Dup Join Test' });

    const gameCode = createRes.body.gameCode;
    const gameId = createRes.body.id;

    // First join
    await request(app)
      .post(`/api/games/${gameId}/join`)
      .send({ gameCode });

    // Second join
    const res = await request(app)
      .post(`/api/games/${gameId}/join`)
      .send({ gameCode });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('ALREADY_JOINED');
  });

  it('POST /api/games/:id/close closes a game', async () => {
    const createRes = await request(app)
      .post('/api/games')
      .send({ name: 'Close Test' });

    const res = await request(app)
      .post(`/api/games/${createRes.body.id}/close`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('closed');
  });

  it('PATCH /api/games/:id updates game settings', async () => {
    const createRes = await request(app)
      .post('/api/games')
      .send({ name: 'Update Test' });

    const res = await request(app)
      .patch(`/api/games/${createRes.body.id}`)
      .send({ name: 'Updated Name', maxPlayers: 50 });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Name');
    expect(res.body.maxPlayers).toBe(50);
  });
});
