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

  it('POST /api/games/:id/allocations submits fund allocation for 2021', async () => {
    const { gameId } = await createAndJoinGame();

    const res = await request(app)
      .post(`/api/games/${gameId}/allocations`)
      .send({ year: 2021, allocations: { '924': 50, '953': 50 } });

    expect(res.status).toBe(200);
    expect(res.body.year).toBe(2021);
    expect(res.body.portfolioStart).toBe(100000);
    expect(res.body.portfolioEnd).toBeGreaterThan(0);
    expect(res.body.returnPct).toBeDefined();
    expect(res.body.breakdown.length).toBeGreaterThan(0);
    expect(res.body.breakdown[0].fundName).toBeDefined();
    expect(res.body.nextYear).toBe(2022);
    expect(res.body.playerStatus).toBe('playing');
  });

  it('POST /api/games/:id/allocations rejects allocation not summing to 100', async () => {
    const { gameId } = await createAndJoinGame();

    const res = await request(app)
      .post(`/api/games/${gameId}/allocations`)
      .send({ year: 2021, allocations: { '924': 10, '953': 10 } });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/games/:id/allocations rejects wrong year', async () => {
    const { gameId } = await createAndJoinGame();

    const res = await request(app)
      .post(`/api/games/${gameId}/allocations`)
      .send({ year: 2022, allocations: { '924': 100 } });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('WRONG_YEAR');
  });

  it('POST /api/games/:id/allocations rejects double submission', async () => {
    const { gameId } = await createAndJoinGame();

    // First submit
    await request(app)
      .post(`/api/games/${gameId}/allocations`)
      .send({ year: 2021, allocations: { '924': 100 } });

    // Second submit for same year
    const res = await request(app)
      .post(`/api/games/${gameId}/allocations`)
      .send({ year: 2021, allocations: { '924': 100 } });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('WRONG_YEAR');
  });

  it('Full 4-year gameplay flow', async () => {
    const { gameId } = await createAndJoinGame('Full Flow');

    const yearAllocations = [
      { year: 2021, allocations: { '924': 100 } },       // NBG Global Equity
      { year: 2022, allocations: { '953': 100 } },       // DELOS Blue Chips
      { year: 2023, allocations: { '916': 100 } },       // DELOS Small Cap
      { year: 2024, allocations: { '753': 100 } },       // DELOS Synthesis Best Red
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

    // Verify optimal path uses fund IDs
    const optimal = resultsRes.body.optimalPath;
    expect(optimal[0].bestFundId).toBe(924);
    expect(optimal[0].bestFundName).toBe('NBG Global Equity');
    expect(optimal[1].bestFundId).toBe(953);
    expect(optimal[2].bestFundId).toBe(916);
    expect(optimal[3].bestFundId).toBe(753);

    // Verify fund benchmarks have cumulative returns
    for (const fund of resultsRes.body.fundBenchmarks) {
      expect(fund.fundName).toBeDefined();
      expect(fund.fundType).toBeDefined();
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
    // Verify allocation records use new format
    expect(allocsRes.body[0].allocations).toBeDefined();
    expect(typeof allocsRes.body[0].allocations).toBe('object');
  });

  it('GET /api/games/:id/results returns 403 for incomplete player', async () => {
    const { gameId } = await createAndJoinGame('Incomplete');

    // Submit only year 2021
    await request(app)
      .post(`/api/games/${gameId}/allocations`)
      .send({ year: 2021, allocations: { '924': 100 } });

    const res = await request(app).get(`/api/games/${gameId}/results`);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('GAME_NOT_COMPLETED');
  });

  it('Portfolio calculation: 100% NBG Global Equity 2021 yields correct result', async () => {
    const { gameId } = await createAndJoinGame('Calc Check');

    const res = await request(app)
      .post(`/api/games/${gameId}/allocations`)
      .send({ year: 2021, allocations: { '924': 100 } });

    expect(res.status).toBe(200);
    // 100000 * 28.27% = 28270 gain → 128270
    expect(res.body.portfolioEnd).toBeCloseTo(128270, 0);
    expect(res.body.returnPct).toBeCloseTo(28.27, 1);
  });

  it('Admin can view all players', async () => {
    const { gameId } = await createAndJoinGame('Admin View');

    const res = await request(app).get(`/api/admin/games/${gameId}/players`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].displayName).toBeDefined();
    expect(res.body[0].currentYear).toBe(2021);
  });

  it('Admin can view all allocations', async () => {
    const { gameId } = await createAndJoinGame('Admin Allocs');

    await request(app)
      .post(`/api/games/${gameId}/allocations`)
      .send({ year: 2021, allocations: { '924': 100 } });

    const res = await request(app).get(`/api/admin/games/${gameId}/allocations`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].year).toBe(2021);
    expect(res.body[0].allocations).toBeDefined();
    expect(res.body[0].allocations['924']).toBe(100);
  });
});
