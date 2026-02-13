import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validation';
import { createGameSchema, updateGameSchema, joinGameSchema, gameIdParam } from './schemas';
import * as gameService from '../services/gameService';
import { ServiceError } from '../services/gameService';

const router = Router();

function paramStr(val: string | string[] | undefined): string {
  return Array.isArray(val) ? val[0]! : val!;
}

// POST /api/games — Create game (Admin only)
router.post('/games', requireAdmin, validateBody(createGameSchema), async (req, res) => {
  try {
    const game = await gameService.createGame(req.user!.id, req.body);
    res.status(201).json(game);
  } catch (err) {
    handleError(err, res);
  }
});

// GET /api/games — List games
router.get('/games', requireAuth, async (req, res) => {
  try {
    const games = await gameService.listGames(req.user!.id, req.user!.role);
    res.json(games);
  } catch (err) {
    handleError(err, res);
  }
});

// GET /api/games/:id — Get game details
router.get('/games/:id', requireAuth, validateParams(gameIdParam), async (req, res) => {
  try {
    const game = await gameService.getGame(paramStr(req.params.id), req.user!.id);
    res.json(game);
  } catch (err) {
    handleError(err, res);
  }
});

// POST /api/games/:id/join — Join game
router.post('/games/:id/join', requireAuth, validateParams(gameIdParam), validateBody(joinGameSchema), async (req, res) => {
  try {
    const game = await gameService.joinGame(paramStr(req.params.id), req.user!.id, req.body.gameCode);
    res.json(game);
  } catch (err) {
    handleError(err, res);
  }
});

// PATCH /api/games/:id — Update game (Admin only)
router.patch('/games/:id', requireAdmin, validateParams(gameIdParam), validateBody(updateGameSchema), async (req, res) => {
  try {
    const game = await gameService.updateGame(paramStr(req.params.id), req.user!.id, req.body);
    res.json(game);
  } catch (err) {
    handleError(err, res);
  }
});

// POST /api/games/:id/close — Close game (Admin only)
router.post('/games/:id/close', requireAdmin, validateParams(gameIdParam), async (req, res) => {
  try {
    const game = await gameService.closeGame(paramStr(req.params.id), req.user!.id);
    res.json(game);
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
