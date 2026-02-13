import { pgTable, uuid, text, integer, decimal, timestamp, pgEnum, uniqueIndex, check, serial, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ── Enums ──────────────────────────────────────────
export const gameStatusEnum = pgEnum('game_status', ['open', 'closed', 'completed']);
export const playerGameStatusEnum = pgEnum('player_game_status', ['playing', 'completed']);
export const userRoleEnum = pgEnum('user_role', ['player', 'admin']);
export const assetClassEnum = pgEnum('asset_class', ['cash', 'bonds', 'equities', 'commodities', 'reits']);

// ── users ──────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  displayName: text('display_name').notNull(),
  role: userRoleEnum('role').notNull().default('player'),
  organizationalUnit: text('organizational_unit'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── games ──────────────────────────────────────────
export const games = pgTable('games', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  gameCode: text('game_code').notNull().unique(),
  status: gameStatusEnum('status').notNull().default('open'),
  initialCapital: decimal('initial_capital', { precision: 12, scale: 2 }).notNull().default('100000.00'),
  deadline: timestamp('deadline', { withTimezone: true }),
  maxPlayers: integer('max_players'),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('games_status_idx').on(table.status),
  index('games_created_by_idx').on(table.createdBy),
]);

// ── game_players ───────────────────────────────────
export const gamePlayers = pgTable('game_players', {
  gameId: uuid('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  currentYear: integer('current_year').notNull().default(2021),
  status: playerGameStatusEnum('status').notNull().default('playing'),
  joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
}, (table) => [
  uniqueIndex('game_players_pk').on(table.gameId, table.userId),
  index('game_players_game_idx').on(table.gameId),
  index('game_players_user_idx').on(table.userId),
]);

// ── allocations ────────────────────────────────────
export const allocations = pgTable('allocations', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameId: uuid('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  year: integer('year').notNull(),
  cashPct: integer('cash_pct').notNull(),
  bondsPct: integer('bonds_pct').notNull(),
  equitiesPct: integer('equities_pct').notNull(),
  commoditiesPct: integer('commodities_pct').notNull(),
  reitsPct: integer('reits_pct').notNull(),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('allocations_unique').on(table.gameId, table.userId, table.year),
  index('allocations_game_user_idx').on(table.gameId, table.userId),
  check('allocations_sum_check',
    sql`${table.cashPct} + ${table.bondsPct} + ${table.equitiesPct} + ${table.commoditiesPct} + ${table.reitsPct} = 100`
  ),
  check('allocations_cash_range', sql`${table.cashPct} BETWEEN 0 AND 100`),
  check('allocations_bonds_range', sql`${table.bondsPct} BETWEEN 0 AND 100`),
  check('allocations_equities_range', sql`${table.equitiesPct} BETWEEN 0 AND 100`),
  check('allocations_commodities_range', sql`${table.commoditiesPct} BETWEEN 0 AND 100`),
  check('allocations_reits_range', sql`${table.reitsPct} BETWEEN 0 AND 100`),
]);

// ── portfolio_snapshots ────────────────────────────
export const portfolioSnapshots = pgTable('portfolio_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameId: uuid('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  year: integer('year').notNull(),
  valueStart: decimal('value_start', { precision: 14, scale: 2 }).notNull(),
  valueEnd: decimal('value_end', { precision: 14, scale: 2 }).notNull(),
  returnPct: decimal('return_pct', { precision: 8, scale: 4 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('snapshots_unique').on(table.gameId, table.userId, table.year),
  index('snapshots_game_user_idx').on(table.gameId, table.userId),
]);

// ── asset_returns ──────────────────────────────────
export const assetReturns = pgTable('asset_returns', {
  id: serial('id').primaryKey(),
  year: integer('year').notNull(),
  assetClass: assetClassEnum('asset_class').notNull(),
  returnPct: decimal('return_pct', { precision: 8, scale: 4 }).notNull(),
  scenarioTitle: text('scenario_title').notNull(),
  scenarioDescription: text('scenario_description').notNull(),
}, (table) => [
  uniqueIndex('asset_returns_unique').on(table.year, table.assetClass),
]);

// ── fund_benchmarks ────────────────────────────────
export const fundBenchmarks = pgTable('fund_benchmarks', {
  id: serial('id').primaryKey(),
  fundId: integer('fund_id').notNull(),
  fundName: text('fund_name').notNull(),
  fundType: text('fund_type').notNull(),
  year: integer('year').notNull(),
  cashPct: decimal('cash_pct', { precision: 6, scale: 2 }).notNull(),
  fixedIncomePct: decimal('fixed_income_pct', { precision: 6, scale: 2 }).notNull(),
  equityPct: decimal('equity_pct', { precision: 6, scale: 2 }).notNull(),
  returnPct: decimal('return_pct', { precision: 8, scale: 4 }).notNull(),
  sharpeRatio: decimal('sharpe_ratio', { precision: 6, scale: 4 }).notNull(),
}, (table) => [
  uniqueIndex('fund_benchmarks_unique').on(table.fundId, table.year),
  index('fund_benchmarks_fund_idx').on(table.fundId),
]);
