import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { db } from '../db/index';
import { games, gamePlayers, allocations, portfolioSnapshots } from '../db/schema';

process.env.DISABLE_LOGIN = 'true';
const app = createApp();

async function cleanGameData() {
  await db.delete(portfolioSnapshots);
  await db.delete(allocations);
  await db.delete(gamePlayers);
  await db.delete(games);
}

async function createAndJoinGame(name: string = 'Gameplay Test'): Promise<{ gameId: string; gameCode: string }> {
  const createRes = await request(app)
    .post('/api/games')
    .send({ name });

  const gameId = createRes.body.id;
  const gameCode = createRes.body.gameCode;

  await request(app)
    .post(`/api/games/${gameId}/join`)
    .send({ gameCode });

  return { gameId, gameCode };
}

describe('Gameplay routes', () => {
  beforeEach(async () => {
    await cleanGameData();
  });

  afterAll(async () => {
    await cleanGameData();
  });

  it('GET /api/games/:id/play returns play state for year 2021', async () => {
    const { gameId } = await createAndJoinGame();

    const res = await request(app).get(`/api/games/${gameId}/play`);
    expect(res.status).toBe(200);
    expect(res.body.currentYear).toBe(2021);
    expect(res.body.portfolioValue).toBe(100000);
    expect(res.body.initialCapital).toBe(100000);
    expect(res.body.scenario.year).toBe(2021);
    expect(res.body.scenario.title).toBe('The Year of Strong Recovery');
    expect(res.body.allocationSubmitted).toBe(false);
    expect(res.body.playerStatus).toBe('playing');
    expect(res.body.completedYears).toEqual([]);
  });

  it('GET /api/games/:id/play returns 403 for non-joined player', async () => {
    const createRes = await request(app)
      .post('/api/games')
      .send({ name: 'Not Joined' });

    const res = await request(app).get(`/api/games/${createRes.body.id}/play`);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('NOT_JOINED');
  });

  it('POST /api/games/:id/allocations submits allocation for 2021', async () => {
    const { gameId } = await createAndJoinGame();

    const res = await request(app)
      .post(`/api/games/${gameId}/allocations`)
      .send({ year: 2021, cash: 20, bonds: 20, equities: 20, commodities: 20, reits: 20 });

    expect(res.status).toBe(200);
    expect(res.body.year).toBe(2021);
    expect(res.body.portfolioStart).toBe(100000);
    expect(res.body.portfolioEnd).toBeGreaterThan(0);
    expect(res.body.returnPct).toBeDefined();
    expect(res.body.breakdown).toHaveLength(5);
    expect(res.body.nextYear).toBe(2022);
    expect(res.body.playerStatus).toBe('playing');
  });

  it('POST /api/games/:id/allocations rejects allocation not summing to 100', async () => {
    const { gameId } = await createAndJoinGame();

    const res = await request(app)
      .post(`/api/games/${gameId}/allocations`)
      .send({ year: 2021, cash: 10, bonds: 10, equities: 10, commodities: 10, reits: 10 });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/games/:id/allocations rejects wrong year', async () => {
    const { gameId } = await createAndJoinGame();

    const res = await request(app)
      .post(`/api/games/${gameId}/allocations`)
      .send({ year: 2022, cash: 20, bonds: 20, equities: 20, commodities: 20, reits: 20 });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('WRONG_YEAR');
  });

  it('POST /api/games/:id/allocations rejects double submission', async () => {
    const { gameId } = await createAndJoinGame();

    // First submit
    await request(app)
      .post(`/api/games/${gameId}/allocations`)
      .send({ year: 2021, cash: 100, bonds: 0, equities: 0, commodities: 0, reits: 0 });

    // Second submit for same year
    const res = await request(app)
      .post(`/api/games/${gameId}/allocations`)
      .send({ year: 2021, cash: 100, bonds: 0, equities: 0, commodities: 0, reits: 0 });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('WRONG_YEAR');
  });

  it('Full 4-year gameplay flow', async () => {
    const { gameId } = await createAndJoinGame('Full Flow');

    const yearAllocations = [
      { year: 2021, cash: 0, bonds: 0, equities: 0, commodities: 0, reits: 100 },
      { year: 2022, cash: 0, bonds: 0, equities: 0, commodities: 100, reits: 0 },
      { year: 2023, cash: 0, bonds: 0, equities: 100, commodities: 0, reits: 0 },
      { year: 2024, cash: 0, bonds: 0, equities: 100, commodities: 0, reits: 0 },
    ];

    let lastEnd = 100000;

    for (const alloc of yearAllocations) {
      const res = await request(app)
        .post(`/api/games/${gameId}/allocations`)
        .send(alloc);

      expect(res.status).toBe(200);
      expect(res.body.year).toBe(alloc.year);
      expect(res.body.portfolioStart).toBeCloseTo(lastEnd, 0);
      expect(res.body.portfolioEnd).toBeGreaterThan(0);
      lastEnd = res.body.portfolioEnd;
    }

    // After year 2024, player should be completed
    const playRes = await request(app).get(`/api/games/${gameId}/play`);
    expect(playRes.body.playerStatus).toBe('completed');

    // Verify leaderboard
    const leaderboardRes = await request(app).get(`/api/games/${gameId}/leaderboard`);
    expect(leaderboardRes.status).toBe(200);
    expect(leaderboardRes.body.length).toBe(1);
    expect(leaderboardRes.body[0].status).toBe('completed');
    expect(leaderboardRes.body[0].rank).toBe(1);

    // Verify final results (fund benchmarks included)
    const resultsRes = await request(app).get(`/api/games/${gameId}/results`);
    expect(resultsRes.status).toBe(200);
    expect(resultsRes.body.leaderboard).toBeDefined();
    expect(resultsRes.body.playerResult).toBeDefined();
    expect(resultsRes.body.playerResult.snapshots).toHaveLength(4);
    expect(resultsRes.body.playerResult.allocations).toHaveLength(4);
    expect(resultsRes.body.optimalPath).toHaveLength(4);
    expect(resultsRes.body.fundBenchmarks).toBeDefined();
    expect(resultsRes.body.fundBenchmarks.length).toBeGreaterThan(0);

    // Verify optimal path
    const optimal = resultsRes.body.optimalPath;
    expect(optimal[0].bestAsset).toBe('reits');
    expect(optimal[1].bestAsset).toBe('commodities');
    expect(optimal[2].bestAsset).toBe('equities');
    expect(optimal[3].bestAsset).toBe('equities');

    // Verify fund benchmarks have cumulative returns
    for (const fund of resultsRes.body.fundBenchmarks) {
      expect(fund.fundName).toBeDefined();
      expect(fund.cumulativeReturnPct).toBeDefined();
      expect(fund.finalValue).toBeDefined();
      expect(fund.years).toHaveLength(4);
    }

    // Verify snapshots endpoint
    const snapshotsRes = await request(app).get(`/api/games/${gameId}/snapshots`);
    expect(snapshotsRes.status).toBe(200);
    expect(snapshotsRes.body).toHaveLength(4);

    // Verify allocations endpoint
    const allocsRes = await request(app).get(`/api/games/${gameId}/allocations`);
    expect(allocsRes.status).toBe(200);
    expect(allocsRes.body).toHaveLength(4);
  });

  it('GET /api/games/:id/results returns 403 for incomplete player', async () => {
    const { gameId } = await createAndJoinGame('Incomplete');

    // Submit only year 2021
    await request(app)
      .post(`/api/games/${gameId}/allocations`)
      .send({ year: 2021, cash: 100, bonds: 0, equities: 0, commodities: 0, reits: 0 });

    const res = await request(app).get(`/api/games/${gameId}/results`);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('GAME_NOT_COMPLETED');
  });

  it('Portfolio calculation: 100% equities 2021 yields correct result', async () => {
    const { gameId } = await createAndJoinGame('Calc Check');

    const res = await request(app)
      .post(`/api/games/${gameId}/allocations`)
      .send({ year: 2021, cash: 0, bonds: 0, equities: 100, commodities: 0, reits: 0 });

    expect(res.status).toBe(200);
    // 100000 * 22.35% = 22350 gain → 122350
    expect(res.body.portfolioEnd).toBeCloseTo(122350, 0);
    expect(res.body.returnPct).toBeCloseTo(22.35, 1);
  });

  it('Admin can view all players', async () => {
    const { gameId } = await createAndJoinGame('Admin View');

    const res = await request(app).get(`/api/admin/games/${gameId}/players`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].displayName).toBe('Dev User');
    expect(res.body[0].currentYear).toBe(2021);
  });

  it('Admin can view all allocations', async () => {
    const { gameId } = await createAndJoinGame('Admin Allocs');

    await request(app)
      .post(`/api/games/${gameId}/allocations`)
      .send({ year: 2021, cash: 100, bonds: 0, equities: 0, commodities: 0, reits: 0 });

    const res = await request(app).get(`/api/admin/games/${gameId}/allocations`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].year).toBe(2021);
    expect(res.body[0].cash).toBe(100);
  });
});
