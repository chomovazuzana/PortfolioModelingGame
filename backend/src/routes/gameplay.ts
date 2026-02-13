import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validation';
import { submitAllocationSchema, gameIdParam } from './schemas';
import * as gameplayService from '../services/gameplayService';
import { ServiceError } from '../services/gameService';

const router = Router();

function paramStr(val: string | string[] | undefined): string {
  return Array.isArray(val) ? val[0]! : val!;
}

// GET /api/games/:id/play — Get current play state
router.get('/games/:id/play', requireAuth, validateParams(gameIdParam), async (req, res) => {
  try {
    const playState = await gameplayService.getPlayState(paramStr(req.params.id), req.user!.id);
    res.json(playState);
  } catch (err) {
    handleError(err, res);
  }
});

// POST /api/games/:id/allocations — Submit allocation for current year
router.post('/games/:id/allocations', requireAuth, validateParams(gameIdParam), validateBody(submitAllocationSchema), async (req, res) => {
  try {
    const result = await gameplayService.submitAllocation(paramStr(req.params.id), req.user!.id, req.body);
    res.json(result);
  } catch (err) {
    handleError(err, res);
  }
});

// GET /api/games/:id/allocations — Get own allocation history
router.get('/games/:id/allocations', requireAuth, validateParams(gameIdParam), async (req, res) => {
  try {
    const allocs = await gameplayService.getAllocations(paramStr(req.params.id), req.user!.id);
    res.json(allocs);
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
