# Portfolio Modeling Game - Claude Instructions

## Project Overview
A competitive investment simulation game where financial advisors allocate capital across 5 asset classes (Cash, Bonds, Equities, Commodities, REITs) over 4 historical years (2021-2024). Players progress at their own pace (asynchronous). Built as separate frontend and backend applications, containerized with Docker.

**Target Users**: Financial advisors, investment professionals, and trainees at NBG (National Bank of Greece).

## Tech Stack

### Frontend (`/frontend`)
- React 19 + TypeScript 5 + Vite
- Tailwind CSS 4 (styling)
- Recharts (portfolio visualization)
- React Router 7 (routing)
- TanStack Query (server state / API cache)
- React Context + useReducer (local game state)
- Vitest (unit tests), Playwright (e2e)

### Backend (`/backend`)
- Node.js + Express + TypeScript
- Drizzle ORM (type-safe, lightweight, no binary engine)
- PostgreSQL 16
- Zod (request validation)
- OAuth2 with PKCE (authentication via NBG identity provider)
- AES-256-GCM encrypted httpOnly cookies (session management)
- Vitest (unit/integration tests)

## Project Structure
```
PortfolioModelingGame/
├── frontend/                   # React application (own package.json)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── allocation/     # Allocation sliders, summary
│   │   │   ├── game/           # Game-specific components
│   │   │   ├── charts/         # Recharts wrappers
│   │   │   └── ui/             # Generic UI (buttons, cards, etc.)
│   │   ├── pages/              # Route page components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── context/            # AuthContext, GameContext
│   │   ├── services/           # API client (fetch wrappers)
│   │   ├── types/              # TypeScript interfaces
│   │   └── utils/              # Utility functions
│   ├── public/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/                    # Express API (own package.json)
│   ├── src/
│   │   ├── routes/             # Express route handlers
│   │   ├── services/           # Business logic layer
│   │   ├── middleware/         # Auth, validation, error handling
│   │   ├── db/
│   │   │   ├── schema.ts       # Drizzle table definitions
│   │   │   ├── seed.ts         # Historical returns + fund data
│   │   │   └── index.ts        # DB connection
│   │   ├── auth/               # OAuth2 PKCE flow, cookie encryption
│   │   └── types/              # Backend-specific types
│   ├── drizzle/                # Migration files
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                     # Shared TypeScript types (copied at build)
│   ├── types.ts                # Game domain types (API contracts)
│   ├── constants.ts            # Asset returns, game config defaults
│   └── calculations.ts         # Portfolio math (used by both)
│
├── docs/                       # Project documentation
├── docker-compose.yml          # PostgreSQL + backend + frontend
├── .env.example                # Environment variable template
├── CLAUDE.md                   # This file
└── Issues - Pending Items.md   # Issue tracker
```

## Play Model: Asynchronous

Players progress through the game independently at their own pace. There is no synchronized "advance year" mechanic.

### Flow per Player
1. Player joins a game (via game code or link)
2. Player sees Year 2021 scenario briefing
3. Player submits allocation for 2021
4. System immediately computes portfolio result for 2021
5. Player sees their year result and current leaderboard snapshot
6. Player proceeds to Year 2022 briefing (when they choose)
7. Repeat through 2024
8. After Year 2024 submission + resolution, player sees final results

### Game-Level State
- **open**: Accepting new players, players can start/continue playing
- **closed**: No new players, existing players can still finish
- **completed**: All players finished or deadline passed; final results locked

### Player-Level State
Each player has their own progression tracked independently:
- `current_year`: Which year the player is on (2021-2024 or completed)
- `allocations`: Submitted for each completed year
- `snapshots`: Portfolio value after each completed year

### Leaderboard
- Shows all players who have completed at least one year
- Sorted by portfolio value at their furthest completed year
- Players who have completed all 4 years rank above those still playing

## Authentication: OAuth2 with PKCE

Adapted from the NBG enterprise auth pattern. See `docs/Authentication-and-Authorization.md` for full details.

### Architecture
```
React (Vite)  →  Express Backend  →  PostgreSQL
     ↑                ↑
  Zero token     OAuth2 PKCE +
  visibility     AES-256-GCM
                 encrypted cookies
```

### Key Points
- OAuth2 Authorization Code Flow with PKCE via NBG identity provider
- JWT tokens NEVER visible in browser (encrypted in httpOnly cookies)
- Multi-cookie chunking for tokens >4KB
- Roles from JWT claims: **Player** and **Admin**
- Session persists across page refresh (cookie-based, stateless)
- `DISABLE_LOGIN=true` flag for development without OAuth2

### Auth Endpoints (on Express backend)
- `GET /api/auth/login` - Initiates OAuth2 flow (generates PKCE, redirects to IdP)
- `GET /api/auth/callback` - Handles OAuth2 callback, encrypts tokens into cookies
- `GET /api/auth/session` - Returns current user data from encrypted cookie
- `GET /api/auth/logout` - Clears session cookies

### Roles
| Role | Description |
|------|-------------|
| **Player** | Join games, submit allocations, view own results and leaderboard |
| **Admin** | Create/configure games, close games, view all player data, access admin endpoints |

## Database Schema (PostgreSQL)

### Core Tables
- `users` - Player accounts (id, email, display_name, role, organizational_unit, created_at)
- `games` - Game sessions (id, name, game_code, status, initial_capital, deadline, created_by, config)
- `game_players` - Player enrollment (game_id, user_id, current_year, status, joined_at)
- `allocations` - Per-player per-year decisions (game_id, user_id, year, cash_pct, bonds_pct, equities_pct, commodities_pct, reits_pct, submitted_at)
- `portfolio_snapshots` - Computed values per year (game_id, user_id, year, value_start, value_end, return_pct, created_at)
- `asset_returns` - Historical data (year, asset_class, return_pct, scenario_title, scenario_description)
- `fund_benchmarks` - NBG/DELOS fund reference data (fund_id, fund_name, year, cash_pct, fixed_income_pct, equity_pct, return_pct, sharpe_ratio)

### Key Constraints
- `allocations`: CHECK (cash_pct + bonds_pct + equities_pct + commodities_pct + reits_pct = 100)
- `allocations`: CHECK (each pct BETWEEN 0 AND 100)
- `allocations`: UNIQUE (game_id, user_id, year)
- `game_players`: UNIQUE (game_id, user_id)
- `games.game_code`: UNIQUE, 6-char alphanumeric

### Enums
- `game_status`: 'open', 'closed', 'completed'
- `player_game_status`: 'playing', 'completed'
- `user_role`: 'player', 'admin'
- `asset_class`: 'cash', 'bonds', 'equities', 'commodities', 'reits'

## API Design (RESTful)

### Authentication
- `GET /api/auth/login` - Start OAuth2 flow
- `GET /api/auth/callback` - OAuth2 callback
- `GET /api/auth/session` - Get current user
- `GET /api/auth/logout` - Logout

### Games
- `POST /api/games` - Create game (Admin)
- `GET /api/games` - List available games
- `GET /api/games/:id` - Get game details + player's current state
- `POST /api/games/:id/join` - Join game via game code
- `PATCH /api/games/:id` - Update game settings (Admin)
- `POST /api/games/:id/close` - Close game to new players (Admin)

### Gameplay (per-player async progression)
- `GET /api/games/:id/play` - Get current year briefing + portfolio state
- `POST /api/games/:id/allocations` - Submit allocation for current year
- `GET /api/games/:id/allocations` - Get own allocation history

### Results
- `GET /api/games/:id/leaderboard` - Current leaderboard (all players)
- `GET /api/games/:id/results` - Final results with optimal comparison + fund benchmarks
- `GET /api/games/:id/snapshots` - Own portfolio snapshots per year

### Admin
- `GET /api/admin/games/:id/players` - All players and their progress
- `GET /api/admin/games/:id/allocations` - All player allocations

## Code Conventions

### TypeScript
- Strict mode enabled, no `any` types
- Use `interface` for object shapes, `type` for unions/intersections
- Prefer named exports over default exports
- Barrel exports from each directory via `index.ts`

### React (Frontend)
- Functional components only
- Custom hooks for business logic (`useGameState`, `useAllocation`, `useLeaderboard`)
- Co-locate component, styles, and tests
- Pages are thin wrappers that compose components

### Express (Backend)
- Controller -> Service -> Repository pattern
- All business logic in services (route handlers are thin)
- Validate all inputs at route level with Zod schemas
- Consistent error format: `{ error: string, code: string, details?: object }`

### Database
- Drizzle migrations for all schema changes
- Seed script for asset returns + fund benchmark data
- `timestamptz` for all timestamps
- UUIDs for all primary keys

### Testing
- Unit tests for portfolio calculations (shared)
- Integration tests for API routes (backend)
- Component tests for interactive UI (frontend)
- E2e tests for critical game flow
- Test files co-located: `*.test.ts` / `*.test.tsx`

## Key Business Rules
1. Allocations must sum to exactly 100% (integers only, 0-100 range)
2. Players cannot re-submit allocation for a completed year
3. Portfolio value compounds: Year N start = Year N-1 end value
4. Initial capital: EUR 100,000 (configurable per game)
5. 5 asset classes: Cash, Bonds, Equities, Commodities, REITs
6. Optimal portfolio = 100% in best-performing asset each year
7. **Fund benchmark data is shown ONLY in final results** (not during gameplay)
8. Players progress independently (no waiting for others)
9. Submitting allocation immediately triggers year resolution for that player

## Historical Returns Data
```typescript
export const ASSET_RETURNS = {
  2021: { cash: 0.1, bonds: -1.5, equities: 22.35, commodities: 40.1, reits: 41.3 },
  2022: { cash: 0.4, bonds: -12.3, equities: -17.73, commodities: 16.3, reits: -24.4 },
  2023: { cash: 4.5, bonds: 5.3, equities: 24.42, commodities: -10.3, reits: 10.6 },
  2024: { cash: 5.0, bonds: -1.7, equities: 19.2, commodities: 3.0, reits: 8.8 },
} as const;
```

## Environment Variables
```bash
# Backend
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

# Frontend
VITE_API_URL=http://localhost:3001/api
```

## Docker Setup
```yaml
# docker-compose.yml services:
# - postgres:  PostgreSQL 16 on port 5432
# - backend:   Express API on port 3001
# - frontend:  Vite dev server on port 5173 (or nginx in prod)
```

## Common Commands
```bash
# Frontend
cd frontend && npm install && npm run dev     # Start frontend dev server
cd frontend && npm run build                  # Production build
cd frontend && npm test                       # Run frontend tests

# Backend
cd backend && npm install && npm run dev      # Start backend dev server
cd backend && npm run db:migrate              # Run database migrations
cd backend && npm run db:seed                 # Seed historical + fund data
cd backend && npm test                        # Run backend tests

# Docker
docker compose up -d postgres                 # Start only PostgreSQL
docker compose up -d                          # Start all services
docker compose down                           # Stop all services
```

## Working with This Codebase
- Always check `Issues - Pending Items.md` before starting work
- When fixing an issue, remove it from the pending list
- When discovering a new issue, add it to the file
- Run TypeScript checks before committing (`npm run typecheck` in both frontend and backend)
- Keep `shared/` minimal - only types, constants, and calculation logic that both sides need
- When changing shared types, update both frontend and backend copies
