import { z } from 'zod';

export const createGameSchema = z.object({
  name: z.string().min(1).max(100),
  initialCapital: z.number().int().min(1000).max(10_000_000).default(100_000),
  deadline: z.string().datetime().nullable().optional(),
  maxPlayers: z.number().int().min(2).max(500).nullable().optional(),
  gameCode: z.string().regex(/^[A-Z0-9]{6}$/).optional(),
});

export const updateGameSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  deadline: z.string().datetime().nullable().optional(),
  maxPlayers: z.number().int().min(2).max(500).nullable().optional(),
});

export const joinGameSchema = z.object({
  gameCode: z.string().min(1).max(10),
});

export const submitAllocationSchema = z.object({
  year: z.number().int().min(2021).max(2024),
  cash: z.number().int().min(0).max(100),
  bonds: z.number().int().min(0).max(100),
  equities: z.number().int().min(0).max(100),
  commodities: z.number().int().min(0).max(100),
  reits: z.number().int().min(0).max(100),
}).refine(
  (data) => data.cash + data.bonds + data.equities + data.commodities + data.reits === 100,
  { message: 'Allocations must sum to 100' }
);

export const gameIdParam = z.object({
  id: z.string().uuid(),
});
