# PLAN.md — Portfolio Modeling Game Implementation Plan

> **Generated**: 2026-02-13
> **Source documents**: CLAUDE.md, SOLUTION-DESIGN.md, Authentication-and-Authorization.md, game-requirements.md, game-data-reference.md, Issues - Pending Items.md

---

## Table of Contents

- [Phase 1: Project Setup & Foundation](#phase-1-project-setup--foundation)
- [Phase 2: Backend Core](#phase-2-backend-core)
- [Phase 3: Frontend — Auth & Game Management](#phase-3-frontend--auth--game-management)
- [Phase 4: Frontend — Gameplay](#phase-4-frontend--gameplay)
- [Phase 5: Frontend — Final Results & Analytics](#phase-5-frontend--final-results--analytics)
- [Phase 6: Polish, Testing & Docker](#phase-6-polish-testing--docker)
- [Appendix A: Full Drizzle Schema](#appendix-a-full-drizzle-schema)
- [Appendix B: Seed Data Script](#appendix-b-seed-data-script)
- [Appendix C: docker-compose.yml](#appendix-c-docker-composeyml)
- [Appendix D: Pending Issues & Recommended Resolutions](#appendix-d-pending-issues--recommended-resolutions)
- [Appendix E: Dependency Graph](#appendix-e-dependency-graph)

---

## Conventions

- **Task IDs** follow the pattern `P<phase>T<task>` (e.g., `P1T3` = Phase 1, Task 3).
- **Blocked by** lists the prerequisite task IDs.
- File paths are relative to the project root (`PortfolioModelingGame/`).

---

# Phase 1: Project Setup & Foundation

**Goal**: Skeleton projects, database, shared code, Docker for Postgres, dev auth bypass.

## P1T1 — Root project files

**Blocked by**: none

Create the following files at the project root:

### `docker-compose.yml`

See [Appendix C](#appendix-c-docker-composeyml) for the full specification.

### `.env.example`

```bash
# === Backend ===
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portfolio_game
PORT=3001
NODE_ENV=development

# OAuth2 (Backend)
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret
OAUTH_REDIRECT_URI=http://localhost:3001/api/auth/callback
OAUTH_AUTHORIZATION_URL=https://identity-server/connect/authorize
OAUTH_TOKEN_URL=https://identity-server/connect/token
OAUTH_SCOPE=openid profile email organizational_unit
TOKEN_ENCRYPTION_KEY=your-32-character-encryption-key-here

# Dev bypass
DISABLE_LOGIN=true

# === Frontend ===
VITE_API_URL=http://localhost:3001/api
```

### `.gitignore`

```
node_modules/
dist/
.env
*.local
.DS_Store
```

---

## P1T2 — Backend project initialization

**Blocked by**: P1T1

### File: `backend/package.json`

```json
{
  "name": "portfolio-game-backend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:seed": "tsx src/db/seed.ts",
    "db:studio": "drizzle-kit studio"
  }
}
```

### Exact npm packages

**Dependencies:**
| Package | Version | Purpose |
|---------|---------|---------|
| `express` | `^4.21.2` | HTTP framework |
| `cors` | `^2.8.5` | CORS middleware |
| `cookie-parser` | `^1.4.7` | Parse cookies |
| `helmet` | `^8.0.0` | Security headers |
| `drizzle-orm` | `^0.38.4` | Type-safe ORM |
| `postgres` | `^3.4.5` | PostgreSQL driver (postgres.js) |
| `zod` | `^3.24.2` | Schema validation |
| `jsonwebtoken` | `^9.0.2` | JWT decode/verify |
| `dotenv` | `^16.4.7` | Env var loading |
| `uuid` | `^11.0.5` | UUID generation |

**DevDependencies:**
| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | `^5.7.3` | TypeScript compiler |
| `tsx` | `^4.19.2` | TS execution + watch |
| `drizzle-kit` | `^0.30.4` | Migrations CLI |
| `vitest` | `^3.0.5` | Test runner |
| `supertest` | `^7.0.0` | HTTP integration tests |
| `@types/express` | `^5.0.0` | Express types |
| `@types/cors` | `^2.8.17` | CORS types |
| `@types/cookie-parser` | `^1.4.8` | cookie-parser types |
| `@types/jsonwebtoken` | `^9.0.9` | JWT types |
| `@types/uuid` | `^10.0.0` | UUID types |
| `@types/supertest` | `^6.0.2` | Supertest types |

### File: `backend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUncheckedIndexedAccess": true,
    "paths": {
      "@shared/*": ["../shared/*"]
    }
  },
  "include": ["src/**/*", "../shared/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### File: `backend/drizzle.config.ts`

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Directory structure to create

```
backend/
├── src/
│   ├── index.ts            # Express app entry point
│   ├── app.ts              # Express app factory (for testing)
│   ├── routes/             # Route handlers
│   ├── services/           # Business logic
│   ├── middleware/          # Auth, validation, errors
│   ├── db/
│   │   ├── index.ts        # DB connection
│   │   ├── schema.ts       # Drizzle schema (all 7 tables)
│   │   └── seed.ts         # Seed data script
│   ├── auth/               # OAuth2 PKCE + cookie encryption
│   └── types/              # Backend-specific types
├── drizzle/                # Migration files (auto-generated)
├── package.json
├── tsconfig.json
└── drizzle.config.ts
```

---

## P1T3 — Frontend project initialization

**Blocked by**: P1T1

### File: `frontend/package.json`

```json
{
  "name": "portfolio-game-frontend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

### Exact npm packages

**Dependencies:**
| Package | Version | Purpose |
|---------|---------|---------|
| `react` | `^19.0.0` | UI library |
| `react-dom` | `^19.0.0` | DOM renderer |
| `react-router` | `^7.1.5` | Client routing |
| `@tanstack/react-query` | `^5.66.0` | Server state cache |
| `recharts` | `^2.15.1` | Charts |
| `clsx` | `^2.1.1` | Class merging |

**DevDependencies:**
| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | `^5.7.3` | TypeScript compiler |
| `vite` | `^6.1.0` | Dev server + bundler |
| `@vitejs/plugin-react` | `^4.3.4` | React fast refresh |
| `tailwindcss` | `^4.0.6` | Utility-first CSS |
| `@tailwindcss/vite` | `^4.0.6` | Tailwind Vite plugin |
| `vitest` | `^3.0.5` | Unit test runner |
| `@testing-library/react` | `^16.2.0` | Component testing |
| `@testing-library/jest-dom` | `^6.6.3` | DOM matchers |
| `jsdom` | `^26.0.0` | DOM env for tests |
| `@playwright/test` | `^1.50.1` | E2e tests |
| `@types/react` | `^19.0.8` | React types |
| `@types/react-dom` | `^19.0.3` | ReactDOM types |

### File: `frontend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noUncheckedIndexedAccess": true,
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["../shared/*"]
    }
  },
  "include": ["src", "../shared"],
  "exclude": ["node_modules"]
}
```

### File: `frontend/vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

### File: `frontend/src/index.css`

```css
@import "tailwindcss";
```

### Directory structure to create

```
frontend/
├── src/
│   ├── main.tsx            # Entry point
│   ├── App.tsx             # Root with providers + router
│   ├── index.css           # Tailwind import
│   ├── components/
│   │   ├── allocation/     # Allocation sliders, summary
│   │   ├── game/           # Game-specific components
│   │   ├── charts/         # Recharts wrappers
│   │   └── ui/             # Generic UI (buttons, cards, etc.)
│   ├── pages/              # Route page components
│   ├── hooks/              # Custom React hooks
│   ├── context/            # AuthContext, GameContext
│   ├── services/           # API client (fetch wrappers)
│   ├── types/              # TypeScript interfaces
│   └── utils/              # Utility functions
├── public/
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## P1T4 — Shared types, constants, and calculations

**Blocked by**: none

### File: `shared/types.ts`

All API contract types shared between frontend and backend.

```typescript
// ── Enums ──────────────────────────────────────────
export type GameStatus = 'open' | 'closed' | 'completed';
export type PlayerGameStatus = 'playing' | 'completed';
export type UserRole = 'player' | 'admin';
export type AssetClass = 'cash' | 'bonds' | 'equities' | 'commodities' | 'reits';

// ── User ───────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  organizationalUnit: string | null;
}

// ── Game ───────────────────────────────────────────
export interface Game {
  id: string;
  name: string;
  gameCode: string;
  status: GameStatus;
  initialCapital: number;
  deadline: string | null;       // ISO 8601
  maxPlayers: number | null;
  createdBy: string;
  createdAt: string;
  playerCount?: number;          // computed on list
}

export interface GameDetail extends Game {
  playerProgress?: PlayerProgress; // current user's progress (if joined)
}

// ── Allocation ─────────────────────────────────────
export interface Allocation {
  cash: number;
  bonds: number;
  equities: number;
  commodities: number;
  reits: number;
}

export interface AllocationRecord extends Allocation {
  id: string;
  gameId: string;
  userId: string;
  year: number;
  submittedAt: string;
}

// ── Portfolio Snapshot ──────────────────────────────
export interface PortfolioSnapshot {
  year: number;
  valueStart: number;
  valueEnd: number;
  returnPct: number;
}

// ── Player Progress ────────────────────────────────
export interface PlayerProgress {
  currentYear: number;           // 2021-2024 or 2025 = completed
  status: PlayerGameStatus;
  joinedAt: string;
  completedAt: string | null;
}

// ── Play State ─────────────────────────────────────
export interface PlayState {
  gameId: string;
  gameName: string;
  currentYear: number;
  portfolioValue: number;
  initialCapital: number;
  totalReturnPct: number;
  scenario: ScenarioBriefing;
  completedYears: number[];
  allocationSubmitted: boolean;
  playerStatus: PlayerGameStatus;
}

export interface ScenarioBriefing {
  year: number;
  title: string;
  description: string;
}

// ── Year Result (returned after allocation submit) ──
export interface YearResult {
  year: number;
  allocation: Allocation;
  portfolioStart: number;
  portfolioEnd: number;
  returnPct: number;
  breakdown: AssetBreakdown[];
  nextYear: number | null;       // null if game complete
  playerStatus: PlayerGameStatus;
}

export interface AssetBreakdown {
  asset: AssetClass;
  allocated: number;
  returnPct: number;
  contribution: number;
}

// ── Leaderboard ────────────────────────────────────
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  portfolioValue: number;
  totalReturnPct: number;
  currentYear: number;
  status: PlayerGameStatus;
}

// ── Final Results ──────────────────────────────────
export interface FinalResults {
  leaderboard: LeaderboardEntry[];
  playerResult: PlayerFinalResult;
  optimalPath: OptimalYearResult[];
  fundBenchmarks: FundBenchmark[];
}

export interface PlayerFinalResult {
  finalValue: number;
  totalReturnPct: number;
  rank: number;
  totalPlayers: number;
  snapshots: PortfolioSnapshot[];
  allocations: AllocationRecord[];
}

export interface OptimalYearResult {
  year: number;
  bestAsset: AssetClass;
  returnPct: number;
  portfolioValue: number;
}

export interface FundBenchmark {
  fundId: number;
  fundName: string;
  fundType: string;
  years: FundYearData[];
  cumulativeReturnPct: number;
  finalValue: number;
}

export interface FundYearData {
  year: number;
  returnPct: number;
  sharpeRatio: number;
  cashPct: number;
  fixedIncomePct: number;
  equityPct: number;
}

// ── API Request Bodies ─────────────────────────────
export interface CreateGameRequest {
  name: string;
  initialCapital?: number;       // default 100000
  deadline?: string;             // ISO 8601
  maxPlayers?: number;
  gameCode?: string;             // auto-generated if omitted
}

export interface UpdateGameRequest {
  name?: string;
  deadline?: string | null;
  maxPlayers?: number | null;
}

export interface JoinGameRequest {
  gameCode: string;
}

export interface SubmitAllocationRequest {
  year: number;
  cash: number;
  bonds: number;
  equities: number;
  commodities: number;
  reits: number;
}

// ── API Error ──────────────────────────────────────
export interface ApiError {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}
```

### File: `shared/constants.ts`

```typescript
import type { AssetClass } from './types';

export const GAME_YEARS = [2021, 2022, 2023, 2024] as const;
export type GameYear = (typeof GAME_YEARS)[number];

export const ASSET_CLASSES: AssetClass[] = ['cash', 'bonds', 'equities', 'commodities', 'reits'];

export const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  cash: 'Cash',
  bonds: 'Bonds',
  equities: 'Equities',
  commodities: 'Commodities',
  reits: 'REITs',
};

export const DEFAULT_INITIAL_CAPITAL = 100_000;

export const ASSET_RETURNS: Record<number, Record<AssetClass, number>> = {
  2021: { cash: 0.1, bonds: -1.5, equities: 22.35, commodities: 40.1, reits: 41.3 },
  2022: { cash: 0.4, bonds: -12.3, equities: -17.73, commodities: 16.3, reits: -24.4 },
  2023: { cash: 4.5, bonds: 5.3, equities: 24.42, commodities: -10.3, reits: 10.6 },
  2024: { cash: 5.0, bonds: -1.7, equities: 19.2, commodities: 3.0, reits: 8.8 },
};

export const SCENARIO_BRIEFINGS: Record<number, { title: string; description: string }> = {
  2021: {
    title: 'The Year of Strong Recovery',
    description:
      'The global economy bounces back from COVID-19. Vaccination programs accelerate, economies reopen, and consumer spending surges. Supply chains struggle to keep up with demand. Energy prices rise. Central banks keep interest rates near zero to support recovery. Real estate markets heat up as remote work reshapes housing demand.',
  },
  2022: {
    title: 'The Year of Inflation and Tightening',
    description:
      'Inflation reaches multi-decade highs across the globe. Central banks respond with aggressive interest rate hikes. The war in Ukraine disrupts energy and food supplies. Bond markets suffer historic losses as yields spike. Technology stocks retreat from pandemic highs. Energy commodities surge on supply fears.',
  },
  2023: {
    title: 'The Year of Stabilization and Artificial Intelligence',
    description:
      'Inflation begins to ease and markets anticipate the end of the rate-hiking cycle. The AI revolution, led by breakthroughs in large language models, drives a tech stock rally. Corporate earnings stabilize. Bond markets begin to recover. Real estate markets cool but remain resilient in key segments.',
  },
  2024: {
    title: 'The Year of Resilience',
    description:
      'The economy proves more resilient than expected. Central banks begin cautious rate cuts. Equity markets continue upward, driven by technology and AI adoption. Bond markets remain volatile with mixed signals on inflation. Commodities stabilize. REITs benefit from the rate-cutting outlook.',
  },
};

/** Maximum year value representing "all years completed" */
export const COMPLETED_YEAR_MARKER = 2025;

/** Game code length */
export const GAME_CODE_LENGTH = 6;
```

### File: `shared/calculations.ts`

```typescript
import { ASSET_RETURNS, ASSET_CLASSES, GAME_YEARS } from './constants';
import type { Allocation, AssetBreakdown, AssetClass, OptimalYearResult, PortfolioSnapshot } from './types';

/**
 * Calculate the portfolio result for a single year given an allocation and starting value.
 */
export function calculateYearResult(
  allocation: Allocation,
  year: number,
  portfolioStartValue: number
): { valueEnd: number; returnPct: number; breakdown: AssetBreakdown[] } {
  const yearReturns = ASSET_RETURNS[year];
  if (!yearReturns) {
    throw new Error(`No return data for year ${year}`);
  }

  const breakdown: AssetBreakdown[] = ASSET_CLASSES.map((asset) => {
    const pct = allocation[asset];
    const allocated = portfolioStartValue * (pct / 100);
    const returnPct = yearReturns[asset];
    const contribution = allocated * (returnPct / 100);
    return { asset, allocated, returnPct, contribution };
  });

  const totalContribution = breakdown.reduce((sum, b) => sum + b.contribution, 0);
  const valueEnd = portfolioStartValue + totalContribution;
  const returnPct = (totalContribution / portfolioStartValue) * 100;

  return {
    valueEnd: roundCurrency(valueEnd),
    returnPct: roundPercent(returnPct),
    breakdown: breakdown.map((b) => ({
      ...b,
      allocated: roundCurrency(b.allocated),
      contribution: roundCurrency(b.contribution),
    })),
  };
}

/**
 * Compute the optimal portfolio path (100% in best-performing asset each year).
 */
export function calculateOptimalPath(initialCapital: number): OptimalYearResult[] {
  const results: OptimalYearResult[] = [];
  let currentValue = initialCapital;

  for (const year of GAME_YEARS) {
    const yearReturns = ASSET_RETURNS[year]!;
    let bestAsset: AssetClass = 'cash';
    let bestReturn = -Infinity;

    for (const asset of ASSET_CLASSES) {
      if (yearReturns[asset] > bestReturn) {
        bestReturn = yearReturns[asset];
        bestAsset = asset;
      }
    }

    currentValue = roundCurrency(currentValue * (1 + bestReturn / 100));
    results.push({ year, bestAsset, returnPct: bestReturn, portfolioValue: currentValue });
  }

  return results;
}

/**
 * Given a set of snapshots, compute the cumulative return percentage.
 */
export function cumulativeReturn(initialCapital: number, finalValue: number): number {
  return roundPercent(((finalValue - initialCapital) / initialCapital) * 100);
}

/**
 * Compute cumulative fund return from yearly returns (compounded).
 */
export function compoundReturns(yearlyReturnPcts: number[]): number {
  let factor = 1;
  for (const r of yearlyReturnPcts) {
    factor *= 1 + r / 100;
  }
  return roundPercent((factor - 1) * 100);
}

/**
 * Validates that an allocation sums to exactly 100 and each value is 0-100 integer.
 */
export function validateAllocation(allocation: Allocation): { valid: boolean; error?: string } {
  const values = ASSET_CLASSES.map((a) => allocation[a]);

  for (const v of values) {
    if (!Number.isInteger(v)) return { valid: false, error: 'All allocations must be integers' };
    if (v < 0 || v > 100) return { valid: false, error: 'Each allocation must be between 0 and 100' };
  }

  const sum = values.reduce((a, b) => a + b, 0);
  if (sum !== 100) return { valid: false, error: `Allocations must sum to 100, got ${sum}` };

  return { valid: true };
}

// ── Helpers ──

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundPercent(value: number): number {
  return Math.round(value * 100) / 100;
}
```

### File: `shared/calculations.test.ts`

Unit tests for `calculateYearResult`, `calculateOptimalPath`, `validateAllocation`, `compoundReturns`.

```typescript
import { describe, it, expect } from 'vitest';
import { calculateYearResult, calculateOptimalPath, validateAllocation, compoundReturns } from './calculations';

describe('calculateYearResult', () => {
  it('computes 2021 result for worked example', () => {
    const result = calculateYearResult(
      { cash: 5, bonds: 10, equities: 40, commodities: 25, reits: 20 },
      2021,
      100_000
    );
    expect(result.valueEnd).toBeCloseTo(127_080, 0);
    expect(result.returnPct).toBeCloseTo(27.08, 1);
  });

  it('preserves capital with 100% cash in 2021', () => {
    const result = calculateYearResult(
      { cash: 100, bonds: 0, equities: 0, commodities: 0, reits: 0 },
      2021,
      100_000
    );
    expect(result.valueEnd).toBeCloseTo(100_100, 0);
  });
});

describe('calculateOptimalPath', () => {
  it('matches documented optimal: EUR 243,748.59', () => {
    const path = calculateOptimalPath(100_000);
    expect(path[0]!.bestAsset).toBe('reits');      // 2021
    expect(path[1]!.bestAsset).toBe('commodities'); // 2022
    expect(path[2]!.bestAsset).toBe('equities');    // 2023
    expect(path[3]!.bestAsset).toBe('equities');    // 2024
    expect(path[3]!.portfolioValue).toBeCloseTo(243_748.59, 0);
  });
});

describe('validateAllocation', () => {
  it('accepts valid allocation', () => {
    expect(validateAllocation({ cash: 20, bonds: 20, equities: 20, commodities: 20, reits: 20 }).valid).toBe(true);
  });

  it('rejects sum != 100', () => {
    expect(validateAllocation({ cash: 20, bonds: 20, equities: 20, commodities: 20, reits: 10 }).valid).toBe(false);
  });

  it('rejects negative values', () => {
    expect(validateAllocation({ cash: -10, bonds: 30, equities: 30, commodities: 30, reits: 20 }).valid).toBe(false);
  });

  it('rejects non-integer values', () => {
    expect(validateAllocation({ cash: 20.5, bonds: 19.5, equities: 20, commodities: 20, reits: 20 }).valid).toBe(false);
  });
});

describe('compoundReturns', () => {
  it('compounds correctly', () => {
    // 10% then 20% = 1.1 * 1.2 = 1.32 → 32%
    expect(compoundReturns([10, 20])).toBeCloseTo(32, 1);
  });
});
```

---

## P1T5 — Database schema (Drizzle ORM)

**Blocked by**: P1T2

### File: `backend/src/db/schema.ts`

See [Appendix A](#appendix-a-full-drizzle-schema) for the complete schema with all 7 tables, enums, constraints, and indexes.

---

## P1T6 — Database connection

**Blocked by**: P1T2, P1T5

### File: `backend/src/db/index.ts`

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, { max: 10 });

export const db = drizzle(client, { schema });
export type Database = typeof db;
```

---

## P1T7 — Database migrations

**Blocked by**: P1T5, P1T6

Run:
```bash
cd backend && npx drizzle-kit generate
cd backend && npx drizzle-kit migrate
```

This generates SQL migration files in `backend/drizzle/` from the schema.

---

## P1T8 — Seed data script

**Blocked by**: P1T7

### File: `backend/src/db/seed.ts`

See [Appendix B](#appendix-b-seed-data-script) for the complete seed script containing all 20 asset return records (4 years × 5 asset classes) and all 48 fund benchmark records (12 funds × 4 years).

---

## P1T9 — Express app skeleton

**Blocked by**: P1T2, P1T6

### File: `backend/src/app.ts`

```typescript
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }));
  app.use(express.json());
  app.use(cookieParser());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Routes will be added in Phase 2

  // Global error handler
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  });

  return app;
}
```

### File: `backend/src/index.ts`

```typescript
import 'dotenv/config';
import { createApp } from './app';

const port = process.env.PORT || 3001;
const app = createApp();

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
```

---

## P1T10 — Dev auth bypass middleware

**Blocked by**: P1T9

### File: `backend/src/middleware/auth.ts`

Implements the `requireAuth` and `requireAdmin` Express middleware. When `DISABLE_LOGIN=true`, injects a mock user. Otherwise, decrypts the session cookie and validates the JWT.

```typescript
import type { Request, Response, NextFunction } from 'express';
import type { User } from '@shared/types';

// Extend Express Request with user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const MOCK_USER: User = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'dev@example.com',
  displayName: 'Dev User',
  role: 'admin',
  organizationalUnit: 'Development',
};

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (process.env.DISABLE_LOGIN === 'true') {
    req.user = MOCK_USER;
    return next();
  }

  // Real auth implemented in Phase 2 (P2T1)
  // Decrypt cookie → validate JWT → attach user
  res.status(401).json({ error: 'Not authenticated', code: 'AUTH_REQUIRED' });
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required', code: 'ADMIN_REQUIRED' });
      return;
    }
    next();
  });
}
```

---

# Phase 2: Backend Core

**Goal**: Full backend API — auth, games, gameplay, leaderboard. All endpoints validated, tested.

## P2T1 — OAuth2 PKCE + Cookie Encryption

**Blocked by**: P1T9, P1T10

### File: `backend/src/auth/crypto.ts`

AES-256-GCM encrypt/decrypt functions for cookie data. Multi-cookie chunking for tokens >4KB.

**Contents:**
- `encrypt(plaintext: string, key: string): string` — AES-256-GCM encrypt. Returns `iv:authTag:ciphertext` base64.
- `decrypt(encrypted: string, key: string): string` — Reverse.
- `setEncryptedCookies(res: Response, name: string, data: string, key: string, maxAge: number): void` — Encrypts data and splits into `name_0`, `name_1`, etc. if >3800 bytes per chunk.
- `getEncryptedCookies(req: Request, name: string, key: string): string | null` — Reassembles chunks and decrypts.

Implementation uses Node.js built-in `crypto` module (`createCipheriv`, `createDecipheriv`, `randomBytes`).

### File: `backend/src/auth/pkce.ts`

PKCE helper functions.

**Contents:**
- `generateCodeVerifier(): string` — Random 43–128 char string (base64url).
- `generateCodeChallenge(verifier: string): string` — SHA-256 hash, base64url encoded.
- `generateState(): string` — Random string for CSRF protection.

### File: `backend/src/auth/oauth.ts`

OAuth2 flow logic.

**Contents:**
- `buildAuthorizationUrl(codeChallenge: string, state: string): string` — Constructs the IdP authorization URL with all params (client_id, redirect_uri, scope, code_challenge, state, response_type=code).
- `exchangeCodeForTokens(code: string, codeVerifier: string): Promise<TokenResponse>` — POSTs to token endpoint, returns `{ access_token, refresh_token, expires_in, id_token }`.
- `decodeUserFromToken(idToken: string): User` — Decodes JWT (without verification in dev, with verification in prod) and maps claims to `User` type.

### File: `backend/src/routes/auth.ts`

**Route**: `GET /api/auth/login`
- Generate PKCE verifier + challenge + state.
- Store verifier and state in temporary httpOnly cookies.
- Redirect to authorization URL.

**Route**: `GET /api/auth/callback`
- Read auth code from query params.
- Read verifier and state from temp cookies.
- Validate state matches.
- Exchange code for tokens via `exchangeCodeForTokens()`.
- Upsert user in `users` table.
- Encrypt tokens with `setEncryptedCookies()`.
- Clear temp cookies.
- Redirect to frontend (`/games`).

**Route**: `GET /api/auth/session`
- Read encrypted cookie, decrypt.
- Decode user from token.
- Return `{ user: User }` or `401`.

**Route**: `GET /api/auth/logout`
- Clear all `auth_session_*` cookies.
- Return `{ success: true }` or redirect to landing.

### Update: `backend/src/middleware/auth.ts`

Replace the placeholder real auth logic:
- `requireAuth`: If `DISABLE_LOGIN !== 'true'`, call `getEncryptedCookies` → decode JWT → validate expiry → attach `req.user`. Return `401` if invalid.

---

## P2T2 — Zod validation schemas

**Blocked by**: P1T4

### File: `backend/src/middleware/validation.ts`

Generic Zod validation middleware factory.

```typescript
import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: result.error.flatten().fieldErrors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      res.status(400).json({
        error: 'Invalid parameters',
        code: 'VALIDATION_ERROR',
        details: result.error.flatten().fieldErrors,
      });
      return;
    }
    next();
  };
}
```

### File: `backend/src/routes/schemas.ts`

All Zod schemas for API request validation.

```typescript
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
```

---

## P2T3 — Game service (business logic)

**Blocked by**: P1T5, P1T6, P1T4

### File: `backend/src/services/gameService.ts`

**Functions:**

| Function | Description |
|----------|-------------|
| `createGame(adminId, data)` | Insert into `games` table. Generate 6-char alphanumeric game code if not provided. Return game. |
| `listGames(userId, role)` | For players: games with status 'open'. For admin: all games. Include player count (subquery on `game_players`). |
| `getGame(gameId, userId)` | Return game details + player's progress (join `game_players` where user_id matches). |
| `joinGame(gameId, userId, gameCode)` | Validate game code matches game. Validate game is 'open'. Validate max_players not exceeded. Insert into `game_players` with `current_year: 2021`, `status: 'playing'`. Return updated game. |
| `updateGame(gameId, adminId, data)` | Update game fields. Only admin who created it (or any admin — TBD). |
| `closeGame(gameId, adminId)` | Set game status to 'closed'. Players already in can finish. |
| `generateGameCode()` | Generate random 6-char uppercase alphanumeric. Check uniqueness against DB. Retry if collision. |

---

## P2T4 — Gameplay service (allocation + year resolution)

**Blocked by**: P2T3, P1T4

### File: `backend/src/services/gameplayService.ts`

**Functions:**

| Function | Description |
|----------|-------------|
| `getPlayState(gameId, userId)` | Read `game_players.current_year`. Fetch scenario briefing from constants. Compute current portfolio value from latest snapshot (or initial capital if year 2021). Check if allocation already submitted for current year. Return `PlayState`. |
| `submitAllocation(gameId, userId, allocation)` | **All in a single DB transaction:** 1. Read player's `current_year` from `game_players` (with `FOR UPDATE` row lock). 2. Validate submitted year matches `current_year`. 3. Validate allocation (sum=100, 0-100 each). 4. Read current portfolio value (latest `portfolio_snapshots.value_end`, or `games.initial_capital` for 2021). 5. Compute year result via `calculateYearResult()`. 6. Insert `allocations` record. 7. Insert `portfolio_snapshots` record. 8. Update `game_players.current_year` to next year (or `2025`/status `'completed'` if year was 2024). 9. Return `YearResult`. |
| `getAllocations(gameId, userId)` | Fetch all allocations for user in this game, ordered by year. |
| `getSnapshots(gameId, userId)` | Fetch all portfolio snapshots for user in this game, ordered by year. |

**Transaction safety:** The `submitAllocation` function uses a Postgres transaction with `SELECT ... FOR UPDATE` on the `game_players` row to prevent double-submission races.

---

## P2T5 — Leaderboard service

**Blocked by**: P2T3, P2T4

### File: `backend/src/services/leaderboardService.ts`

**Functions:**

| Function | Description |
|----------|-------------|
| `getLeaderboard(gameId)` | Query all players in the game. For each, get their latest `portfolio_snapshots.value_end` (or initial capital if no snapshots). Sort: 1) players with `status='completed'` first, 2) then by `current_year` descending, 3) then by `portfolio value` descending. Return `LeaderboardEntry[]`. |

**SQL approach**: Join `game_players` with `users` and a lateral subquery on `portfolio_snapshots` for the max-year snapshot value per player. Use `games.initial_capital` as fallback.

---

## P2T6 — Results service

**Blocked by**: P2T4, P2T5

### File: `backend/src/services/resultsService.ts`

**Functions:**

| Function | Description |
|----------|-------------|
| `getFinalResults(gameId, userId)` | 1. Verify player has `status='completed'` in `game_players`. If not, return 403. 2. Compute leaderboard. 3. Get player's snapshots and allocations. 4. Compute optimal path via `calculateOptimalPath()`. 5. Fetch all `fund_benchmarks` records. 6. Compute each fund's cumulative return over 4 years. 7. Return `FinalResults`. |

> **⚠ ISSUE FLAG** — Pending Issue #1 (fund benchmark 3 vs 5 asset classes). **Resolution**: Show raw fund data as-is with a disclaimer note. The fund allocation breakdown (Cash/Fixed Income/Equity) is displayed alongside the player's 5-class allocation, with a visible note: "Funds use 3 asset classes (Cash, Fixed Income, Equity). Game uses 5. Comparison is for educational context." No mapping attempted.

---

## P2T7 — Game routes

**Blocked by**: P2T2, P2T3

### File: `backend/src/routes/games.ts`

| Route | Handler | Auth | Zod Schema | Service Call |
|-------|---------|------|------------|-------------|
| `POST /api/games` | `createGame` | `requireAdmin` | `createGameSchema` | `gameService.createGame(req.user.id, req.body)` |
| `GET /api/games` | `listGames` | `requireAuth` | — | `gameService.listGames(req.user.id, req.user.role)` |
| `GET /api/games/:id` | `getGame` | `requireAuth` | `gameIdParam` | `gameService.getGame(req.params.id, req.user.id)` |
| `POST /api/games/:id/join` | `joinGame` | `requireAuth` | `joinGameSchema` | `gameService.joinGame(req.params.id, req.user.id, req.body.gameCode)` |
| `PATCH /api/games/:id` | `updateGame` | `requireAdmin` | `updateGameSchema` | `gameService.updateGame(req.params.id, req.user.id, req.body)` |
| `POST /api/games/:id/close` | `closeGame` | `requireAdmin` | `gameIdParam` | `gameService.closeGame(req.params.id, req.user.id)` |

**Response format**: All routes return JSON. Errors use `{ error, code, details? }`.

---

## P2T8 — Gameplay routes

**Blocked by**: P2T2, P2T4

### File: `backend/src/routes/gameplay.ts`

| Route | Handler | Auth | Zod Schema | Service Call |
|-------|---------|------|------------|-------------|
| `GET /api/games/:id/play` | `getPlayState` | `requireAuth` | `gameIdParam` | `gameplayService.getPlayState(params.id, user.id)` |
| `POST /api/games/:id/allocations` | `submitAllocation` | `requireAuth` | `submitAllocationSchema` | `gameplayService.submitAllocation(params.id, user.id, body)` |
| `GET /api/games/:id/allocations` | `getAllocations` | `requireAuth` | `gameIdParam` | `gameplayService.getAllocations(params.id, user.id)` |

**Request**: `POST /api/games/:id/allocations`
```json
{ "year": 2022, "cash": 10, "bonds": 15, "equities": 30, "commodities": 35, "reits": 10 }
```

**Response (200)**: `YearResult` object (see `shared/types.ts`).

**Error responses**:
- `400 VALIDATION_ERROR` — invalid allocation
- `400 WRONG_YEAR` — submitted year doesn't match player's current year
- `400 ALREADY_SUBMITTED` — player already submitted for this year
- `400 GAME_NOT_ACTIVE` — game is completed
- `403 NOT_JOINED` — player hasn't joined this game

---

## P2T9 — Results & leaderboard routes

**Blocked by**: P2T5, P2T6

### File: `backend/src/routes/results.ts`

| Route | Handler | Auth | Zod Schema | Service Call |
|-------|---------|------|------------|-------------|
| `GET /api/games/:id/leaderboard` | `getLeaderboard` | `requireAuth` | `gameIdParam` | `leaderboardService.getLeaderboard(params.id)` |
| `GET /api/games/:id/results` | `getResults` | `requireAuth` | `gameIdParam` | `resultsService.getFinalResults(params.id, user.id)` |
| `GET /api/games/:id/snapshots` | `getSnapshots` | `requireAuth` | `gameIdParam` | `gameplayService.getSnapshots(params.id, user.id)` |

**`GET /api/games/:id/results` response guard**: Returns `403 GAME_NOT_COMPLETED` if the requesting player has not completed all 4 years.

---

## P2T10 — Admin routes

**Blocked by**: P2T7

### File: `backend/src/routes/admin.ts`

| Route | Handler | Auth | Service Call |
|-------|---------|------|-------------|
| `GET /api/admin/games/:id/players` | `getPlayers` | `requireAdmin` | Query `game_players` joined with `users` and latest snapshot value |
| `GET /api/admin/games/:id/allocations` | `getAllocations` | `requireAdmin` | Query all `allocations` for the game, joined with user display names |

---

## P2T11 — Register routes in app

**Blocked by**: P2T1, P2T7, P2T8, P2T9, P2T10

### Update: `backend/src/app.ts`

Import and mount all route modules:
```typescript
import authRoutes from './routes/auth';
import gameRoutes from './routes/games';
import gameplayRoutes from './routes/gameplay';
import resultsRoutes from './routes/results';
import adminRoutes from './routes/admin';

app.use('/api/auth', authRoutes);
app.use('/api', gameRoutes);
app.use('/api', gameplayRoutes);
app.use('/api', resultsRoutes);
app.use('/api/admin', adminRoutes);
```

---

## P2T12 — Backend integration tests

**Blocked by**: P2T11

### File: `backend/src/routes/games.test.ts`

Tests for game CRUD: create game (admin), list games, join game, close game. Uses `supertest` with `createApp()`.

### File: `backend/src/routes/gameplay.test.ts`

Tests for the full gameplay flow:
1. Create game as admin.
2. Join game as player.
3. Get play state (year 2021).
4. Submit allocation for 2021 → verify year result response.
5. Get play state (year 2022).
6. Submit through all 4 years.
7. Verify player status = completed.
8. Verify leaderboard.
9. Verify final results include optimal path + fund benchmarks.

### File: `backend/src/routes/auth.test.ts`

Tests for dev bypass mode:
1. With `DISABLE_LOGIN=true`, `GET /api/auth/session` returns mock user.
2. Auth middleware injects user on all protected routes.

Test environment: Set `DISABLE_LOGIN=true` in test setup. Use a separate test database or in-memory setup.

---

# Phase 3: Frontend — Auth & Game Management

**Goal**: Auth flow, protected routes, game listing, joining, creation.

## P3T1 — API client service

**Blocked by**: P1T3, P1T4

### File: `frontend/src/services/api.ts`

Fetch wrapper with credentials and error handling.

```typescript
const API_URL = import.meta.env.VITE_API_URL || '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',       // send cookies
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiClientError(res.status, body?.error ?? 'Request failed', body?.code ?? 'UNKNOWN');
  }

  return res.json();
}

export class ApiClientError extends Error {
  constructor(public status: number, message: string, public code: string) {
    super(message);
  }
}

export const api = {
  // Auth
  getSession: () => request<{ user: User }>('/auth/session'),
  logout: () => request<void>('/auth/logout'),

  // Games
  listGames: () => request<Game[]>('/games'),
  getGame: (id: string) => request<GameDetail>(`/games/${id}`),
  createGame: (data: CreateGameRequest) => request<Game>('/games', { method: 'POST', body: JSON.stringify(data) }),
  joinGame: (id: string, data: JoinGameRequest) => request<GameDetail>(`/games/${id}/join`, { method: 'POST', body: JSON.stringify(data) }),
  updateGame: (id: string, data: UpdateGameRequest) => request<Game>(`/games/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  closeGame: (id: string) => request<Game>(`/games/${id}/close`, { method: 'POST' }),

  // Gameplay
  getPlayState: (id: string) => request<PlayState>(`/games/${id}/play`),
  submitAllocation: (id: string, data: SubmitAllocationRequest) => request<YearResult>(`/games/${id}/allocations`, { method: 'POST', body: JSON.stringify(data) }),
  getAllocations: (id: string) => request<AllocationRecord[]>(`/games/${id}/allocations`),

  // Results
  getLeaderboard: (id: string) => request<LeaderboardEntry[]>(`/games/${id}/leaderboard`),
  getResults: (id: string) => request<FinalResults>(`/games/${id}/results`),
  getSnapshots: (id: string) => request<PortfolioSnapshot[]>(`/games/${id}/snapshots`),
};
```

---

## P3T2 — AuthContext + Provider

**Blocked by**: P3T1

### File: `frontend/src/context/AuthContext.tsx`

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

**Behaviour:**
- On mount, calls `api.getSession()`.
- If successful, sets `user` and `isAuthenticated = true`.
- If 401, sets `isAuthenticated = false` (not an error — just not logged in).
- Exposes `login()` (redirects to `/api/auth/login`), `logout()`, `user`, `isAuthenticated`, `isLoading`.

---

## P3T3 — React Router setup + protected routes

**Blocked by**: P3T2

### File: `frontend/src/App.tsx`

```typescript
import { BrowserRouter, Routes, Route } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ui/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import GameListPage from './pages/GameListPage';
import GameDashboardPage from './pages/GameDashboardPage';
import GamePlayPage from './pages/GamePlayPage';
import ResultsPage from './pages/ResultsPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/games" element={<GameListPage />} />
              <Route path="/games/:id" element={<GameDashboardPage />} />
              <Route path="/games/:id/play" element={<GamePlayPage />} />
              <Route path="/games/:id/results" element={<ResultsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

### File: `frontend/src/components/ui/ProtectedRoute.tsx`

Outlet-based protected route wrapper. If `isLoading`, show spinner. If not authenticated, redirect to `/`.

---

## P3T4 — Landing page

**Blocked by**: P3T3

### File: `frontend/src/pages/LandingPage.tsx`

**Components used:** none (self-contained).

**Content:**
- Game title: "Portfolio Modeling Game"
- Subtitle: competitive investment simulation.
- Brief rules overview (5 asset classes, 4 years, EUR 100K start).
- "Login to Play" button → calls `login()` from AuthContext (redirects to `/api/auth/login`).
- If already authenticated, redirect to `/games`.

**State**: Uses `useAuth()` hook.

---

## P3T5 — Game list page

**Blocked by**: P3T3, P3T1

### File: `frontend/src/pages/GameListPage.tsx`

**Components:**
- `GameCard` — displays game name, code, status, player count, deadline.
- `JoinGameDialog` — modal with game code input field + "Join" button.
- `CreateGameDialog` — modal with name, initial capital, deadline, max players fields (admin only).

**Hooks:**
- `useQuery(['games'], api.listGames)` — fetches game list.
- `useMutation(api.joinGame)` — join a game.
- `useMutation(api.createGame)` — create a game (admin).

**State:**
- `isJoinDialogOpen`, `isCreateDialogOpen` — local state.
- Auth context for role check (show "Create Game" button only for admin).

**API calls:**
- `GET /api/games` on mount.
- `POST /api/games` on create submit.
- `POST /api/games/:id/join` on join submit.

**Navigation:** Clicking a GameCard navigates to `/games/:id`.

### File: `frontend/src/components/game/GameCard.tsx`

Displays: game name, status badge (open/closed/completed), game code, player count, deadline (if set). Clickable → navigates to game dashboard.

### File: `frontend/src/components/game/JoinGameDialog.tsx`

Modal with a single text input for game code. On submit, calls join mutation. Shows success/error feedback.

### File: `frontend/src/components/game/CreateGameDialog.tsx`

Form fields:
- Name (required)
- Initial capital (default 100,000)
- Deadline (optional date picker)
- Max players (optional)

On submit, calls create mutation. On success, navigates to the new game's dashboard.

---

## P3T6 — Game dashboard page

**Blocked by**: P3T5

### File: `frontend/src/pages/GameDashboardPage.tsx`

**Components:**
- `GameInfo` — name, code (copyable), status, player count, deadline.
- `YourProgress` — which year the current player is on, portfolio value, "Continue Playing" button.
- `PlayerProgressList` — (admin view) table of all players with their progress.

**Hooks:**
- `useQuery(['games', id], () => api.getGame(id))` — game details + player progress.

**State**: TanStack Query handles all state.

**Navigation:**
- "Continue Playing" → `/games/:id/play`
- "View Results" → `/games/:id/results` (only if player completed)
- Admin: "Close Game" button calls `POST /api/games/:id/close`.

### File: `frontend/src/components/game/GameInfo.tsx`

Displays game metadata. Game code with click-to-copy.

### File: `frontend/src/components/game/YourProgress.tsx`

Shows: current year, portfolio value, completion status. Primary CTA button based on state:
- Playing → "Continue to Year 20XX"
- Completed → "View Final Results"
- Not joined → "Join Game"

---

## P3T7 — UI component library (base)

**Blocked by**: P1T3

### File: `frontend/src/components/ui/Button.tsx`

Reusable button with variants: `primary`, `secondary`, `danger`, `ghost`. Sizes: `sm`, `md`, `lg`. Loading state with spinner.

### File: `frontend/src/components/ui/Card.tsx`

Card wrapper with optional header.

### File: `frontend/src/components/ui/Dialog.tsx`

Modal dialog with backdrop, close button, title, content.

### File: `frontend/src/components/ui/Badge.tsx`

Status badge component (colored pill). Variants map to game/player statuses.

### File: `frontend/src/components/ui/Spinner.tsx`

Loading spinner.

### File: `frontend/src/components/ui/Layout.tsx`

Page layout shell with header (game title, user menu, logout) and main content area.

### File: `frontend/src/components/ui/index.ts`

Barrel export for all UI components.

---

# Phase 4: Frontend — Gameplay

**Goal**: The core game play experience — scenario briefing, allocation sliders, submit → year result, progress timeline, leaderboard.

## P4T1 — GameContext (player game state)

**Blocked by**: P3T1

### File: `frontend/src/context/GameContext.tsx`

Wraps the game play page with player-specific game state.

**State (via useReducer):**
```typescript
interface GameState {
  playState: PlayState | null;
  yearResult: YearResult | null;
  isSubmitting: boolean;
  showResult: boolean;      // whether to show the year result modal
}
```

**Actions:** `SET_PLAY_STATE`, `SET_YEAR_RESULT`, `SHOW_RESULT`, `DISMISS_RESULT`, `SET_SUBMITTING`.

**Exposed:**
- `playState`, `yearResult`, `showResult`, `isSubmitting`
- `refreshPlayState()` — re-fetches play state from API.
- `submitAllocation(allocation)` — submits, sets year result, shows result modal.

---

## P4T2 — Game play page

**Blocked by**: P4T1, P3T6

### File: `frontend/src/pages/GamePlayPage.tsx`

**Components used:**
- `ScenarioBriefing`
- `AllocationPanel` (contains `AllocationSlider` × 5 + `AllocationSummary` + `SubmitButton`)
- `YearResultModal`
- `ProgressTimeline`
- `LeaderboardSnapshot`

**Hooks:**
- `useQuery(['play', gameId], () => api.getPlayState(gameId))` — initial load.
- `useGameContext()` — from GameContext.
- `useQuery(['leaderboard', gameId], () => api.getLeaderboard(gameId))` — leaderboard sidebar.

**Layout:**
- Header: game name, current year, portfolio value.
- Main area: scenario briefing + allocation panel.
- Sidebar/below: progress timeline + leaderboard.
- Modal: year result (overlay after submission).

**Page guards:**
- If player status is `'completed'`, redirect to `/games/:id/results`.
- If player hasn't joined, redirect to `/games/:id`.

---

## P4T3 — Scenario briefing component

**Blocked by**: P1T4

### File: `frontend/src/components/game/ScenarioBriefing.tsx`

**Props:** `scenario: ScenarioBriefing`

Displays: year title and description. Styled as a card with a distinctive visual treatment (background accent, icon).

---

## P4T4 — Allocation panel

**Blocked by**: P3T7

> **⚠ ISSUE FLAG** — Pending Issue #2 (Mobile allocation UX). **Resolution**: Implement both sliders AND +/- stepper buttons. On desktop, sliders are the primary input. On mobile (< 640px), steppers are more prominent with larger tap targets. Sliders still available but steppers are the recommended input on small screens.

### File: `frontend/src/components/allocation/AllocationSlider.tsx`

**Props:**
- `asset: AssetClass`
- `label: string`
- `value: number` (0-100)
- `onChange: (value: number) => void`
- `color: string` (Tailwind color class for the track)

**Renders:** Label, range slider, numeric display (e.g., "35%"), +/- stepper buttons.

**Behaviour:**
- Slider range: 0-100, step 1.
- +/- buttons increment/decrement by 5 (configurable step).
- Clamps to 0-100.

### File: `frontend/src/components/allocation/AllocationSummary.tsx`

**Props:**
- `allocation: Allocation`
- `isValid: boolean` (sum === 100)

**Renders:** Total percentage with visual indicator (green check if 100, red warning if not). Mini pie chart preview (optional, using Recharts PieChart).

### File: `frontend/src/components/allocation/AllocationPanel.tsx`

**Props:**
- `onSubmit: (allocation: Allocation) => void`
- `isSubmitting: boolean`
- `disabled: boolean` (if allocation already submitted for current year)

**Internal state:** `allocation: Allocation` (5 integers, initialized to `{cash: 20, bonds: 20, equities: 20, commodities: 20, reits: 20}`).

**Behaviour:**
- 5 `AllocationSlider` components.
- `AllocationSummary` showing the running total.
- Submit button disabled unless sum === 100.
- Confirmation dialog before submit ("Are you sure? This cannot be undone.").
- Calls `onSubmit(allocation)` on confirm.

### File: `frontend/src/hooks/useAllocation.ts`

Custom hook managing allocation state.

```typescript
function useAllocation(initialAllocation?: Allocation) {
  const [allocation, setAllocation] = useState<Allocation>(
    initialAllocation ?? { cash: 20, bonds: 20, equities: 20, commodities: 20, reits: 20 }
  );

  const setAsset = (asset: AssetClass, value: number) => { ... };
  const total = cash + bonds + equities + commodities + reits;
  const isValid = total === 100;
  const reset = () => { ... };

  return { allocation, setAsset, total, isValid, reset };
}
```

### File: `frontend/src/components/allocation/index.ts`

Barrel export.

---

## P4T5 — Year result modal

**Blocked by**: P4T4

### File: `frontend/src/components/game/YearResultModal.tsx`

**Props:**
- `result: YearResult`
- `onContinue: () => void`
- `onClose: () => void`

**Renders:**
- Starting value, ending value, total return %.
- Breakdown table: asset name, allocation %, actual return %, EUR contribution.
- Total P&L.
- "Continue to Year 20XX →" button (or "View Final Results" if `nextYear` is null).

**Styling:** Modal overlay. Positive returns green, negative red. Table with alternating row colors.

---

## P4T6 — Progress timeline

**Blocked by**: P3T7

### File: `frontend/src/components/game/ProgressTimeline.tsx`

**Props:**
- `snapshots: PortfolioSnapshot[]`
- `currentYear: number`
- `initialCapital: number`

**Renders:** Vertical timeline showing each year:
- Completed years: start value → end value (return %). Checkmark icon.
- Current year: "Awaiting allocation..."
- Future years: grayed out dash.

---

## P4T7 — Leaderboard snapshot

**Blocked by**: P3T7

### File: `frontend/src/components/game/LeaderboardSnapshot.tsx`

**Props:**
- `entries: LeaderboardEntry[]`
- `currentUserId: string`

**Renders:** Compact leaderboard table: rank, name, portfolio value, year status. Current user's row highlighted.

### File: `frontend/src/hooks/useLeaderboard.ts`

```typescript
function useLeaderboard(gameId: string) {
  return useQuery({
    queryKey: ['leaderboard', gameId],
    queryFn: () => api.getLeaderboard(gameId),
    refetchInterval: 30_000,  // refresh every 30s
  });
}
```

---

# Phase 5: Frontend — Final Results & Analytics

**Goal**: Final results page with leaderboard, charts, optimal comparison, fund benchmarks.

## P5T1 — Results page

**Blocked by**: P4T2

### File: `frontend/src/pages/ResultsPage.tsx`

**Components:**
- `FinalLeaderboard`
- `PortfolioTimelineChart`
- `AllocationComparisonChart`
- `FundBenchmarkComparison`

**Hooks:**
- `useQuery(['results', gameId], () => api.getResults(gameId))` — fetches full results.

**Page guard:** If API returns 403 (player not completed), redirect to `/games/:id/play`.

**Layout:** Scrollable page with sections: leaderboard → portfolio chart → allocation chart → fund benchmarks.

---

## P5T2 — Final leaderboard component

**Blocked by**: P3T7

### File: `frontend/src/components/charts/FinalLeaderboard.tsx`

**Props:**
- `leaderboard: LeaderboardEntry[]`
- `optimalFinalValue: number`
- `currentUserId: string`

**Renders:**
- Full leaderboard table with rank, name, final value, total return %.
- Optimal portfolio row at bottom (distinguished styling).
- Current user highlighted.
- Top 3 with medal/trophy icons.

---

## P5T3 — Portfolio timeline chart

**Blocked by**: P1T3 (Recharts installed)

### File: `frontend/src/components/charts/PortfolioTimelineChart.tsx`

**Props:**
- `playerSnapshots: PortfolioSnapshot[]`
- `optimalPath: OptimalYearResult[]`
- `initialCapital: number`
- `topPlayers?: { name: string; snapshots: PortfolioSnapshot[] }[]` (optional, for comparison)

**Renders:** Recharts `LineChart` with:
- X-axis: years (Start, 2021, 2022, 2023, 2024).
- Y-axis: portfolio value (EUR).
- Lines: "You" (blue, thick), "Optimal" (gold, dashed), top players (gray, thin).
- Legend.
- Tooltip with exact values.

**Recharts components used:** `LineChart`, `Line`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `Legend`, `ResponsiveContainer`.

---

## P5T4 — Allocation comparison chart

**Blocked by**: P1T3

### File: `frontend/src/components/charts/AllocationComparisonChart.tsx`

**Props:**
- `allocations: AllocationRecord[]`
- `optimalPath: OptimalYearResult[]`

**Renders:** Side-by-side stacked bar chart per year:
- Left bar: player's allocation (5 colors for 5 asset classes).
- Right bar: optimal allocation (100% in one asset).

**Recharts components used:** `BarChart`, `Bar`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `Legend`, `ResponsiveContainer`.

---

## P5T5 — Fund benchmark comparison

**Blocked by**: P3T7

### File: `frontend/src/components/charts/FundBenchmarkComparison.tsx`

**Props:**
- `playerFinalValue: number`
- `fundBenchmarks: FundBenchmark[]`
- `initialCapital: number`

**Renders:**
- Player's result highlighted at top.
- Horizontal bar chart or sorted list of fund benchmarks (name, cumulative return, final value).
- Each fund shows a bar proportional to its final value.
- Funds sorted by final value descending.
- Disclaimer note: "Funds use 3 asset classes (Cash, Fixed Income, Equity). The game uses 5 asset classes. This comparison is for educational context, not direct equivalence."

> **⚠ ISSUE FLAG** — Pending Issue #1 applied here. Funds displayed as-is with disclaimer.

---

# Phase 6: Polish, Testing & Docker

**Goal**: Production-ready application with responsive design, accessibility, e2e tests, and Docker deployment.

## P6T1 — Responsive design

**Blocked by**: Phase 4, Phase 5 complete

> **⚠ ISSUE FLAG** — Pending Issue #2 (Mobile allocation UX) addressed here. The +/- steppers implemented in P4T4 are made more prominent on small screens.

**Files to update:**
- All page components — ensure Tailwind responsive breakpoints (`sm:`, `md:`, `lg:`).
- `AllocationPanel` — stack sliders vertically on mobile, increase stepper button size.
- `LeaderboardSnapshot` — horizontal scroll or card layout on mobile.
- `PortfolioTimelineChart` — reduce label density, enable touch zoom.
- `Layout` — collapsible mobile nav.

---

## P6T2 — Accessibility audit

**Blocked by**: P6T1

**WCAG 2.1 AA checklist:**
- All interactive elements have visible focus indicators.
- Sliders have `aria-label`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`.
- Color contrast ≥ 4.5:1 for text, ≥ 3:1 for large text.
- Charts have text alternatives (data tables or `aria-label` summaries).
- Modal traps focus. Escape closes.
- All form inputs have associated labels.
- Keyboard navigation for all interactive components.
- Screen reader announcements for state changes (allocation submit, year result).

**Files to update:** All components in `components/ui/`, `components/allocation/`, `components/game/`, `components/charts/`.

---

## P6T3 — Error handling & loading states

**Blocked by**: Phases 3–5

**Per page:**
- Loading: skeleton screens or spinner while data loads.
- Error: error message card with retry button.
- Empty: appropriate messaging (e.g., "No games available" on game list).
- Network error: toast notification with retry.

### File: `frontend/src/components/ui/ErrorBoundary.tsx`

React error boundary wrapping the app. Shows fallback UI on render errors.

### File: `frontend/src/components/ui/QueryWrapper.tsx`

Wrapper for TanStack Query states: loading → spinner, error → error card, success → children.

---

## P6T4 — E2e test suite (Playwright)

**Blocked by**: P6T3

### File: `frontend/playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 1,
  webServer: [
    { command: 'cd ../backend && npm run dev', port: 3001, reuseExistingServer: true },
    { command: 'npm run dev', port: 5173, reuseExistingServer: true },
  ],
  use: { baseURL: 'http://localhost:5173' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
});
```

### File: `frontend/e2e/game-flow.spec.ts`

Full gameplay e2e test (with `DISABLE_LOGIN=true`):
1. Visit landing page → redirected or click login.
2. See game list → create a game (admin).
3. Navigate to game → see dashboard.
4. Click "Start Playing" → see year 2021 briefing.
5. Set allocation sliders → submit.
6. See year result modal → continue.
7. Repeat for years 2022-2024.
8. See final results page with leaderboard, charts, fund benchmarks.

### File: `frontend/e2e/join-game.spec.ts`

Test joining via game code.

---

## P6T5 — Production Dockerfiles

**Blocked by**: P1T2, P1T3

### File: `backend/Dockerfile`

```dockerfile
# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY ../shared ./shared
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/drizzle ./drizzle
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

### File: `frontend/Dockerfile`

```dockerfile
# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY ../shared ./shared
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### File: `frontend/nginx.conf`

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API to backend
    location /api/ {
        proxy_pass http://backend:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## P6T6 — Full docker-compose.yml

**Blocked by**: P6T5

See [Appendix C](#appendix-c-docker-composeyml). Update the initial docker-compose.yml from P1T1 to include the full 3-service setup with proper healthchecks, volumes, and environment variables.

---

## P6T7 — Edge cases & game state guards

**Blocked by**: Phase 2, Phase 4

**Backend edge cases to handle:**
- Player tries to submit allocation for a game they haven't joined → 403.
- Player tries to join a closed/completed game → 400.
- Player tries to submit for a year they've already completed → 400.
- Player tries to view results before completing all years → 403.
- Game reaches max_players → reject new joins.
- Game code collision on creation → retry.

**Frontend edge cases:**
- Navigate to play page for a game not joined → redirect to dashboard.
- Navigate to results before completing → redirect to play.
- Submit button double-click protection (disable during submission).
- Browser back/forward navigation preserves state correctly.

---

# Appendix A: Full Drizzle Schema

### File: `backend/src/db/schema.ts`

```typescript
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
```

### Schema Summary Table

| Table | PK | FKs | Unique Constraints | CHECK Constraints | Indexes |
|-------|----|----|-------------------|-------------------|---------|
| `users` | `id` (uuid) | — | `email` | — | — |
| `games` | `id` (uuid) | `created_by → users.id` | `game_code` | — | `status`, `created_by` |
| `game_players` | composite (`game_id`, `user_id`) | `game_id → games.id`, `user_id → users.id` | `(game_id, user_id)` | — | `game_id`, `user_id` |
| `allocations` | `id` (uuid) | `game_id → games.id`, `user_id → users.id` | `(game_id, user_id, year)` | sum=100, each 0-100 | `(game_id, user_id)` |
| `portfolio_snapshots` | `id` (uuid) | `game_id → games.id`, `user_id → users.id` | `(game_id, user_id, year)` | — | `(game_id, user_id)` |
| `asset_returns` | `id` (serial) | — | `(year, asset_class)` | — | — |
| `fund_benchmarks` | `id` (serial) | — | `(fund_id, year)` | — | `fund_id` |

---

# Appendix B: Seed Data Script

### File: `backend/src/db/seed.ts`

```typescript
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { assetReturns, fundBenchmarks, users } from './schema';

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function seed() {
  console.log('Seeding database...');

  // ── Seed dev admin user (for DISABLE_LOGIN mode) ──
  await db.insert(users).values({
    id: '00000000-0000-0000-0000-000000000001',
    email: 'dev@example.com',
    displayName: 'Dev User',
    role: 'admin',
    organizationalUnit: 'Development',
  }).onConflictDoNothing();

  // ── Seed Asset Returns (4 years × 5 asset classes = 20 rows) ──
  const scenarios = {
    2021: {
      title: 'The Year of Strong Recovery',
      description: 'The global economy bounces back from COVID-19. Vaccination programs accelerate, economies reopen, and consumer spending surges. Supply chains struggle to keep up with demand. Energy prices rise. Central banks keep interest rates near zero to support recovery. Real estate markets heat up as remote work reshapes housing demand.',
    },
    2022: {
      title: 'The Year of Inflation and Tightening',
      description: 'Inflation reaches multi-decade highs across the globe. Central banks respond with aggressive interest rate hikes. The war in Ukraine disrupts energy and food supplies. Bond markets suffer historic losses as yields spike. Technology stocks retreat from pandemic highs. Energy commodities surge on supply fears.',
    },
    2023: {
      title: 'The Year of Stabilization and Artificial Intelligence',
      description: 'Inflation begins to ease and markets anticipate the end of the rate-hiking cycle. The AI revolution, led by breakthroughs in large language models, drives a tech stock rally. Corporate earnings stabilize. Bond markets begin to recover. Real estate markets cool but remain resilient in key segments.',
    },
    2024: {
      title: 'The Year of Resilience',
      description: 'The economy proves more resilient than expected. Central banks begin cautious rate cuts. Equity markets continue upward, driven by technology and AI adoption. Bond markets remain volatile with mixed signals on inflation. Commodities stabilize. REITs benefit from the rate-cutting outlook.',
    },
  };

  const returns = [
    // 2021
    { year: 2021, assetClass: 'cash' as const, returnPct: '0.1000' },
    { year: 2021, assetClass: 'bonds' as const, returnPct: '-1.5000' },
    { year: 2021, assetClass: 'equities' as const, returnPct: '22.3500' },
    { year: 2021, assetClass: 'commodities' as const, returnPct: '40.1000' },
    { year: 2021, assetClass: 'reits' as const, returnPct: '41.3000' },
    // 2022
    { year: 2022, assetClass: 'cash' as const, returnPct: '0.4000' },
    { year: 2022, assetClass: 'bonds' as const, returnPct: '-12.3000' },
    { year: 2022, assetClass: 'equities' as const, returnPct: '-17.7300' },
    { year: 2022, assetClass: 'commodities' as const, returnPct: '16.3000' },
    { year: 2022, assetClass: 'reits' as const, returnPct: '-24.4000' },
    // 2023
    { year: 2023, assetClass: 'cash' as const, returnPct: '4.5000' },
    { year: 2023, assetClass: 'bonds' as const, returnPct: '5.3000' },
    { year: 2023, assetClass: 'equities' as const, returnPct: '24.4200' },
    { year: 2023, assetClass: 'commodities' as const, returnPct: '-10.3000' },
    { year: 2023, assetClass: 'reits' as const, returnPct: '10.6000' },
    // 2024
    { year: 2024, assetClass: 'cash' as const, returnPct: '5.0000' },
    { year: 2024, assetClass: 'bonds' as const, returnPct: '-1.7000' },
    { year: 2024, assetClass: 'equities' as const, returnPct: '19.2000' },
    { year: 2024, assetClass: 'commodities' as const, returnPct: '3.0000' },
    { year: 2024, assetClass: 'reits' as const, returnPct: '8.8000' },
  ];

  const assetReturnRows = returns.map((r) => ({
    ...r,
    scenarioTitle: scenarios[r.year as keyof typeof scenarios].title,
    scenarioDescription: scenarios[r.year as keyof typeof scenarios].description,
  }));

  await db.insert(assetReturns).values(assetReturnRows).onConflictDoNothing();
  console.log(`  Inserted ${assetReturnRows.length} asset return records`);

  // ── Seed Fund Benchmarks (12 funds × 4 years = 48 rows) ──
  // Fund type classification based on equity allocation:
  //   0% equity → "Bond", <50% → "Mixed", ≥50% → "Equity"

  const funds = [
    {
      fundId: 965, fundName: 'DELOS Strategic Investments', fundType: 'Mixed',
      years: [
        { year: 2021, cashPct: '16.00', fixedIncomePct: '32.70', equityPct: '51.30', returnPct: '10.8500', sharpeRatio: '0.8100' },
        { year: 2022, cashPct: '21.30', fixedIncomePct: '26.60', equityPct: '52.10', returnPct: '-8.8400', sharpeRatio: '0.0200' },
        { year: 2023, cashPct: '18.90', fixedIncomePct: '37.70', equityPct: '43.40', returnPct: '13.3100', sharpeRatio: '0.5200' },
        { year: 2024, cashPct: '11.00', fixedIncomePct: '39.10', equityPct: '49.90', returnPct: '6.2700', sharpeRatio: '0.3700' },
      ],
    },
    {
      fundId: 962, fundName: 'DELOS Short & Medium-Term', fundType: 'Bond',
      years: [
        { year: 2021, cashPct: '21.90', fixedIncomePct: '78.10', equityPct: '0.00', returnPct: '-0.0400', sharpeRatio: '-0.0600' },
        { year: 2022, cashPct: '21.40', fixedIncomePct: '78.60', equityPct: '0.00', returnPct: '-3.9200', sharpeRatio: '-0.3800' },
        { year: 2023, cashPct: '16.50', fixedIncomePct: '83.50', equityPct: '0.00', returnPct: '4.3100', sharpeRatio: '0.0300' },
        { year: 2024, cashPct: '25.90', fixedIncomePct: '74.10', equityPct: '0.00', returnPct: '3.3600', sharpeRatio: '0.5900' },
      ],
    },
    {
      fundId: 970, fundName: 'DELOS Greek Growth', fundType: 'Bond',
      years: [
        { year: 2021, cashPct: '15.40', fixedIncomePct: '84.60', equityPct: '0.00', returnPct: '0.9200', sharpeRatio: '0.6900' },
        { year: 2022, cashPct: '10.10', fixedIncomePct: '89.90', equityPct: '0.00', returnPct: '-9.6200', sharpeRatio: '-0.3200' },
        { year: 2023, cashPct: '8.20', fixedIncomePct: '91.80', equityPct: '0.00', returnPct: '6.4900', sharpeRatio: '-0.2200' },
        { year: 2024, cashPct: '12.20', fixedIncomePct: '87.80', equityPct: '0.00', returnPct: '4.6900', sharpeRatio: '0.0600' },
      ],
    },
    {
      fundId: 953, fundName: 'DELOS Blue Chips', fundType: 'Equity',
      years: [
        { year: 2021, cashPct: '4.60', fixedIncomePct: '2.40', equityPct: '93.00', returnPct: '13.4700', sharpeRatio: '0.6000' },
        { year: 2022, cashPct: '2.00', fixedIncomePct: '1.00', equityPct: '97.00', returnPct: '4.2700', sharpeRatio: '0.0700' },
        { year: 2023, cashPct: '3.20', fixedIncomePct: '0.70', equityPct: '96.10', returnPct: '38.3400', sharpeRatio: '1.0600' },
        { year: 2024, cashPct: '1.70', fixedIncomePct: '0.00', equityPct: '98.30', returnPct: '14.2500', sharpeRatio: '1.1500' },
      ],
    },
    {
      fundId: 916, fundName: 'DELOS Small Cap', fundType: 'Equity',
      years: [
        { year: 2021, cashPct: '1.50', fixedIncomePct: '0.00', equityPct: '98.50', returnPct: '12.3500', sharpeRatio: '0.5900' },
        { year: 2022, cashPct: '1.70', fixedIncomePct: '0.00', equityPct: '98.30', returnPct: '-3.2400', sharpeRatio: '0.0200' },
        { year: 2023, cashPct: '1.30', fixedIncomePct: '0.00', equityPct: '98.70', returnPct: '38.3900', sharpeRatio: '0.8900' },
        { year: 2024, cashPct: '1.50', fixedIncomePct: '0.00', equityPct: '98.50', returnPct: '8.4900', sharpeRatio: '0.8700' },
      ],
    },
    {
      fundId: 951, fundName: 'DELOS Mixed', fundType: 'Mixed',
      years: [
        { year: 2021, cashPct: '6.90', fixedIncomePct: '43.30', equityPct: '49.80', returnPct: '6.2400', sharpeRatio: '0.9100' },
        { year: 2022, cashPct: '16.70', fixedIncomePct: '36.30', equityPct: '47.00', returnPct: '-3.5300', sharpeRatio: '0.0500' },
        { year: 2023, cashPct: '12.70', fixedIncomePct: '42.80', equityPct: '44.50', returnPct: '22.4000', sharpeRatio: '0.7700' },
        { year: 2024, cashPct: '2.70', fixedIncomePct: '47.40', equityPct: '49.90', returnPct: '7.4300', sharpeRatio: '0.8500' },
      ],
    },
    {
      fundId: 750, fundName: 'DELOS Synthesis Best Blue', fundType: 'Bond',
      years: [
        { year: 2021, cashPct: '18.50', fixedIncomePct: '81.50', equityPct: '0.00', returnPct: '-0.8800', sharpeRatio: '0.1600' },
        { year: 2022, cashPct: '12.30', fixedIncomePct: '87.70', equityPct: '0.00', returnPct: '-4.9600', sharpeRatio: '-0.9600' },
        { year: 2023, cashPct: '10.30', fixedIncomePct: '89.70', equityPct: '0.00', returnPct: '3.6900', sharpeRatio: '-0.3900' },
        { year: 2024, cashPct: '1.90', fixedIncomePct: '98.10', equityPct: '0.00', returnPct: '3.1400', sharpeRatio: '0.2600' },
      ],
    },
    {
      fundId: 752, fundName: 'DELOS Synthesis Best Yellow', fundType: 'Mixed',
      years: [
        { year: 2021, cashPct: '7.60', fixedIncomePct: '45.90', equityPct: '46.50', returnPct: '10.1600', sharpeRatio: '1.3400' },
        { year: 2022, cashPct: '5.00', fixedIncomePct: '49.00', equityPct: '46.00', returnPct: '-8.9400', sharpeRatio: '0.1300' },
        { year: 2023, cashPct: '17.10', fixedIncomePct: '38.40', equityPct: '44.50', returnPct: '7.7500', sharpeRatio: '0.4200' },
        { year: 2024, cashPct: '12.90', fixedIncomePct: '40.20', equityPct: '46.90', returnPct: '12.0500', sharpeRatio: '0.4900' },
      ],
    },
    {
      fundId: 753, fundName: 'DELOS Synthesis Best Red', fundType: 'Equity',
      years: [
        { year: 2021, cashPct: '4.70', fixedIncomePct: '3.70', equityPct: '91.50', returnPct: '22.0900', sharpeRatio: '1.5700' },
        { year: 2022, cashPct: '5.60', fixedIncomePct: '2.30', equityPct: '92.10', returnPct: '-11.9900', sharpeRatio: '0.3000' },
        { year: 2023, cashPct: '8.50', fixedIncomePct: '1.20', equityPct: '90.30', returnPct: '11.2100', sharpeRatio: '0.5600' },
        { year: 2024, cashPct: '7.70', fixedIncomePct: '1.40', equityPct: '90.90', returnPct: '21.2300', sharpeRatio: '0.5200' },
      ],
    },
    {
      fundId: 782, fundName: 'DELOS Fixed Income Plus', fundType: 'Bond',
      years: [
        { year: 2021, cashPct: '16.00', fixedIncomePct: '84.00', equityPct: '0.00', returnPct: '-2.8000', sharpeRatio: '0.2000' },
        { year: 2022, cashPct: '13.20', fixedIncomePct: '86.80', equityPct: '0.00', returnPct: '-17.1300', sharpeRatio: '-0.9200' },
        { year: 2023, cashPct: '14.60', fixedIncomePct: '85.40', equityPct: '0.00', returnPct: '8.4000', sharpeRatio: '-0.6100' },
        { year: 2024, cashPct: '3.80', fixedIncomePct: '96.20', equityPct: '0.00', returnPct: '1.4500', sharpeRatio: '-0.4000' },
      ],
    },
    {
      fundId: 924, fundName: 'NBG Global Equity', fundType: 'Equity',
      years: [
        { year: 2021, cashPct: '1.90', fixedIncomePct: '0.00', equityPct: '98.10', returnPct: '28.2700', sharpeRatio: '1.5600' },
        { year: 2022, cashPct: '3.30', fixedIncomePct: '0.00', equityPct: '96.70', returnPct: '-11.7100', sharpeRatio: '0.3400' },
        { year: 2023, cashPct: '2.90', fixedIncomePct: '0.00', equityPct: '97.10', returnPct: '16.5300', sharpeRatio: '0.9300' },
        { year: 2024, cashPct: '2.20', fixedIncomePct: '0.00', equityPct: '97.80', returnPct: '16.6600', sharpeRatio: '0.6000' },
      ],
    },
    {
      fundId: 940, fundName: 'NBG European Allstars', fundType: 'Equity',
      years: [
        { year: 2021, cashPct: '9.00', fixedIncomePct: '0.00', equityPct: '91.00', returnPct: '19.6500', sharpeRatio: '0.7100' },
        { year: 2022, cashPct: '6.30', fixedIncomePct: '0.00', equityPct: '93.70', returnPct: '-10.7200', sharpeRatio: '0.0100' },
        { year: 2023, cashPct: '6.30', fixedIncomePct: '0.00', equityPct: '93.70', returnPct: '16.1500', sharpeRatio: '0.5700' },
        { year: 2024, cashPct: '6.30', fixedIncomePct: '0.00', equityPct: '93.70', returnPct: '7.1000', sharpeRatio: '0.2700' },
      ],
    },
  ];

  const fundRows = funds.flatMap((fund) =>
    fund.years.map((yearData) => ({
      fundId: fund.fundId,
      fundName: fund.fundName,
      fundType: fund.fundType,
      ...yearData,
    }))
  );

  await db.insert(fundBenchmarks).values(fundRows).onConflictDoNothing();
  console.log(`  Inserted ${fundRows.length} fund benchmark records`);

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
```

---

# Appendix C: docker-compose.yml

### File: `docker-compose.yml`

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: portfolio_game
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    restart: unless-stopped
    ports:
      - '3001:3001'
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/portfolio_game
      PORT: '3001'
      NODE_ENV: production
      DISABLE_LOGIN: 'false'
      OAUTH_CLIENT_ID: ${OAUTH_CLIENT_ID}
      OAUTH_CLIENT_SECRET: ${OAUTH_CLIENT_SECRET}
      OAUTH_REDIRECT_URI: ${OAUTH_REDIRECT_URI}
      OAUTH_AUTHORIZATION_URL: ${OAUTH_AUTHORIZATION_URL}
      OAUTH_TOKEN_URL: ${OAUTH_TOKEN_URL}
      OAUTH_SCOPE: ${OAUTH_SCOPE}
      TOKEN_ENCRYPTION_KEY: ${TOKEN_ENCRYPTION_KEY}
      FRONTEND_URL: http://localhost

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    restart: unless-stopped
    ports:
      - '80:80'
    depends_on:
      - backend

volumes:
  pgdata:
```

### Development-only docker-compose override

During development, you only need PostgreSQL. The backend and frontend run locally via `npm run dev`.

```bash
docker compose up -d postgres
```

---

# Appendix D: Pending Issues & Recommended Resolutions

| # | Issue | Affects Tasks | Recommended Resolution |
|---|-------|-------------|----------------------|
| 1 | **Fund benchmark 3 vs 5 asset classes** | P2T6, P5T5 | Show raw fund data as-is. Add a disclaimer note on the fund benchmark comparison UI: "Funds use 3 asset classes (Cash, Fixed Income, Equity). The game uses 5 asset classes (adds Commodities and REITs). This comparison is for educational context, not direct equivalence." No mapping or normalization attempted. |
| 2 | **Mobile allocation UX** | P4T4, P6T1 | Implement both sliders and +/- stepper buttons. Sliders are primary on desktop (≥640px). On mobile (<640px), steppers get larger tap targets (min 44×44px per WCAG), sliders remain but narrower. The stepper increment is 5% by default, tap-hold for 1%. This gives mobile users a usable alternative without removing sliders entirely. |
| 3 | **OAuth2 IdP configuration needed** | P2T1 | Development and testing use `DISABLE_LOGIN=true` bypass with a mock admin user. OAuth2 code is written to spec but cannot be end-to-end tested until NBG provides: client ID, client secret, redirect URI registration, and scope configuration. Flag in code with `// TODO: verify with real IdP` comments. The auth module is fully self-contained, so the rest of the app is not blocked. |
| 4 | **Localization** | All frontend | Build English-only for v1. All UI strings are hardcoded in English. Scenario briefings are in English (from constants). If Greek is needed later, extract strings to a JSON file and use a simple i18n approach (react-intl or custom). Not a blocker for initial delivery. |
| 5 | **Game deadline behavior** | P2T3, P6T7 | When deadline passes, unfinished players' portfolios freeze at their last completed year. They remain on the leaderboard ranked by their last known value but below all completed players. The game status transitions to 'completed'. Implement as a check in `getPlayState`: if deadline has passed and game was open/closed, transition to completed. |
| 6 | **Single-player / practice mode** | Not in scope for v1 | Defer to a future milestone. The current architecture supports it (a game with 1 player), but the UX flow (auto-create game, skip code entry) isn't prioritized. |
| 7 | **Production hosting target** | P6T5, P6T6 | Docker containers are platform-agnostic. The docker-compose.yml works for any Docker host. For production hosting, Railway or Fly.io are the simplest options for small deployments. This decision can be deferred — no code changes needed. |

---

# Appendix E: Dependency Graph

```
P1T1 (root files)
 ├── P1T2 (backend init)
 │    ├── P1T5 (schema) ──── P1T6 (db connection) ──── P1T7 (migrations) ──── P1T8 (seed)
 │    └── P1T9 (express app) ─── P1T10 (dev auth)
 ├── P1T3 (frontend init)
 └── P1T4 (shared code) ─── [no blockers]

P2T1 (OAuth2) ←── P1T9, P1T10
P2T2 (Zod schemas) ←── P1T4
P2T3 (game service) ←── P1T5, P1T6, P1T4
P2T4 (gameplay service) ←── P2T3, P1T4
P2T5 (leaderboard service) ←── P2T3, P2T4
P2T6 (results service) ←── P2T4, P2T5
P2T7 (game routes) ←── P2T2, P2T3
P2T8 (gameplay routes) ←── P2T2, P2T4
P2T9 (results routes) ←── P2T5, P2T6
P2T10 (admin routes) ←── P2T7
P2T11 (register routes) ←── P2T1, P2T7, P2T8, P2T9, P2T10
P2T12 (backend tests) ←── P2T11

P3T1 (API client) ←── P1T3, P1T4
P3T2 (AuthContext) ←── P3T1
P3T3 (Router + protected routes) ←── P3T2
P3T4 (Landing page) ←── P3T3
P3T5 (Game list page) ←── P3T3, P3T1
P3T6 (Game dashboard) ←── P3T5
P3T7 (UI component library) ←── P1T3

P4T1 (GameContext) ←── P3T1
P4T2 (Game play page) ←── P4T1, P3T6
P4T3 (Scenario briefing) ←── P1T4
P4T4 (Allocation panel) ←── P3T7
P4T5 (Year result modal) ←── P4T4
P4T6 (Progress timeline) ←── P3T7
P4T7 (Leaderboard snapshot) ←── P3T7

P5T1 (Results page) ←── P4T2
P5T2 (Final leaderboard) ←── P3T7
P5T3 (Portfolio timeline chart) ←── P1T3
P5T4 (Allocation comparison chart) ←── P1T3
P5T5 (Fund benchmark comparison) ←── P3T7

P6T1 (Responsive design) ←── Phase 4, Phase 5
P6T2 (Accessibility) ←── P6T1
P6T3 (Error handling) ←── Phases 3-5
P6T4 (E2e tests) ←── P6T3
P6T5 (Dockerfiles) ←── P1T2, P1T3
P6T6 (docker-compose) ←── P6T5
P6T7 (Edge cases) ←── Phase 2, Phase 4
```

### Critical Path

The longest dependency chain determining minimum sequential work:

```
P1T1 → P1T2 → P1T5 → P1T6 → P1T7 → P1T8 (Foundation)
                                ↓
P1T9 → P1T10 → P2T1 → P2T11 (Backend wiring)
                  ↓
P2T3 → P2T4 → P2T5 → P2T6 → P2T9 (Backend services)
                                ↓
P3T1 → P3T2 → P3T3 → P3T5 → P3T6 → P4T2 → P5T1 (Frontend flow)
                                                ↓
P6T1 → P6T2 → P6T4 (Polish)
```

### Parallelism Opportunities

These task groups can be worked on concurrently:

- **P1T2** (backend init) ∥ **P1T3** (frontend init) ∥ **P1T4** (shared code)
- **P2T1** (OAuth2) ∥ **P2T2** (Zod) ∥ **P2T3** (game service) — all have different prerequisites already met
- **P3T7** (UI components) can start as soon as P1T3 is done, in parallel with all Phase 2 work
- **P4T3, P4T4, P4T6, P4T7** (gameplay components) can be built in parallel
- **P5T2, P5T3, P5T4, P5T5** (results components) can be built in parallel
- **P6T5** (Dockerfiles) can be done any time after P1T2/P1T3

---

*End of PLAN.md*
