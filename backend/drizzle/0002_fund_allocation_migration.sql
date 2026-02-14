-- Migration: Convert from 5-asset-class columns to JSONB fund allocations
-- Pre-production: existing game data is dropped (no user data to preserve)

-- 0. Clear existing game data (allocations reference old columns)
DELETE FROM "portfolio_snapshots";
DELETE FROM "allocations";
DELETE FROM "game_players";
DELETE FROM "games";

-- 1. Drop old allocation columns and constraints
ALTER TABLE "allocations" DROP CONSTRAINT IF EXISTS "allocations_sum_check";
ALTER TABLE "allocations" DROP CONSTRAINT IF EXISTS "allocations_cash_range";
ALTER TABLE "allocations" DROP CONSTRAINT IF EXISTS "allocations_bonds_range";
ALTER TABLE "allocations" DROP CONSTRAINT IF EXISTS "allocations_equities_range";
ALTER TABLE "allocations" DROP CONSTRAINT IF EXISTS "allocations_commodities_range";
ALTER TABLE "allocations" DROP CONSTRAINT IF EXISTS "allocations_reits_range";
ALTER TABLE "allocations" DROP COLUMN IF EXISTS "cash_pct";
ALTER TABLE "allocations" DROP COLUMN IF EXISTS "bonds_pct";
ALTER TABLE "allocations" DROP COLUMN IF EXISTS "equities_pct";
ALTER TABLE "allocations" DROP COLUMN IF EXISTS "commodities_pct";
ALTER TABLE "allocations" DROP COLUMN IF EXISTS "reits_pct";

-- 2. Add fund_allocations JSONB column (NOT NULL safe since table is empty)
ALTER TABLE "allocations" ADD COLUMN "fund_allocations" jsonb NOT NULL DEFAULT '{}';

-- 3. Remove the default (application always provides a value)
ALTER TABLE "allocations" ALTER COLUMN "fund_allocations" DROP DEFAULT;

-- 4. Drop asset_returns table
DROP TABLE IF EXISTS "asset_returns";

-- 5. Drop asset_class enum type
DROP TYPE IF EXISTS "asset_class";
