import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateParams } from '../middleware/validation';
import { gameIdParam } from './schemas';
import * as leaderboardService from '../services/leaderboardService';
import * as resultsService from '../services/resultsService';
import * as gameplayService from '../services/gameplayService';
import { ServiceError } from '../services/gameService';

const router = Router();

function paramStr(val: string | string[] | undefined): string {
  return Array.isArray(val) ? val[0]! : val!;
}

// GET /api/games/:id/leaderboard — Current leaderboard
router.get('/games/:id/leaderboard', requireAuth, validateParams(gameIdParam), async (req, res) => {
  try {
    const leaderboard = await leaderboardService.getLeaderboard(paramStr(req.params.id));
    res.json(leaderboard);
  } catch (err) {
    handleError(err, res);
  }
});

// GET /api/games/:id/results — Final results (only for completed players)
router.get('/games/:id/results', requireAuth, validateParams(gameIdParam), async (req, res) => {
  try {
    const results = await resultsService.getFinalResults(paramStr(req.params.id), req.user!.id);
    res.json(results);
  } catch (err) {
    handleError(err, res);
  }
});

// GET /api/games/:id/snapshots — Own portfolio snapshots
router.get('/games/:id/snapshots', requireAuth, validateParams(gameIdParam), async (req, res) => {
  try {
    const snapshots = await gameplayService.getSnapshots(paramStr(req.params.id), req.user!.id);
    res.json(snapshots);
  } catch (err) {
    handleError(err, res);
  }
});

function handleError(err: unknown, res: import('express').Response): void {
  if (err instanceof ServiceError) {
    res.status(err.statusCode).json({ error: err.message, code: err.code });
  } else {
    console.error(err);
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
}

export default router;
