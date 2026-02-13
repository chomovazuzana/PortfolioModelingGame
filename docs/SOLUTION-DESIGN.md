# Solution Design Document: Portfolio Modeling Game

## 1. Executive Summary

The Portfolio Modeling Game is a competitive investment simulation that tests financial advisors' ability to allocate capital across asset classes in response to historical macro-economic conditions. Players allocate a starting capital of EUR 100,000 across Cash, Bonds, Equities, Commodities, and REITs for each year from 2021 to 2024. Returns are calculated using actual historical market data. The winner is the player with the highest portfolio value at the end of 2024.

**Target Users**: Financial advisors, investment professionals, and trainees at NBG (National Bank of Greece) and affiliated entities.

**Business Goal**: Prevent investment education from becoming static by introducing a competitive, data-driven simulation that reinforces macro-economic awareness and portfolio construction skills.

**Play Model**: Asynchronous. Players join a game and progress through 4 years at their own pace. No synchronized turns or admin-driven year advancement.

---

## 2. Functional Requirements

### 2.1 Game Lifecycle

| Phase | Description |
|-------|-------------|
| **Game Creation** | Admin creates a game session with a unique game code. Configures initial capital and optional deadline. |
| **Joining** | Players join via game code or shareable link. Game is in "open" status. |
| **Playing (Async)** | Each player independently progresses through years 2021-2024. For each year: read scenario briefing, submit allocation, see year result. |
| **Closing** | Admin closes the game (no new players). Existing players can still finish. |
| **Completed** | All players finished or deadline passed. Final results locked. Fund benchmarks revealed. |

### 2.2 Per-Player Game Flow (Async)

```
JOIN GAME
    │
    ▼
┌──────────────────────┐
│  YEAR BRIEFING       │ Read macro-economic scenario
│  (2021, 2022, ...)   │ (returns NOT revealed)
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  ALLOCATE            │ Set 5 sliders summing to 100%
│  Cash/Bonds/Eq/Cm/RE │
└──────────┬───────────┘
           │ submit
           ▼
┌──────────────────────┐
│  YEAR RESULT         │ System applies actual returns
│  + updated portfolio │ Shows P&L breakdown per asset
│  + leaderboard snap  │ Shows current standings
└──────────┬───────────┘
           │
     year < 2024?
     ┌──yes──┴──no──┐
     │              │
     ▼              ▼
  next year    FINAL RESULTS
  briefing     + optimal comparison
               + fund benchmarks
```

### 2.3 Asset Classes

| Asset Class | Description |
|-------------|-------------|
| **Cash** | Low risk, low return. Eroded by inflation. |
| **Bonds** | Income-producing, inversely affected by interest rate changes. |
| **Equities** | Higher risk/return. Driven by economic growth and corporate earnings. |
| **Commodities** | Energy, metals, agriculture. Inflation hedge. Geopolitics-driven. |
| **REITs** | Real estate investment trusts. Dividend income, rate-sensitive. |

### 2.4 Historical Returns (Actual Data)

| Year | Cash | Bonds | Equities | Commodities | REITs |
|------|------|-------|----------|-------------|-------|
| 2021 | +0.10% | -1.50% | +22.35% | +40.10% | +41.30% |
| 2022 | +0.40% | -12.30% | -17.73% | +16.30% | -24.40% |
| 2023 | +4.50% | +5.30% | +24.42% | -10.30% | +10.60% |
| 2024 | +5.00% | -1.70% | +19.20% | +3.00% | +8.80% |

### 2.5 Scoring

- **Primary metric**: Final portfolio value after 2024
- **Optimal portfolio** (100% in best-performing asset each year):

| Year | Best Asset | Return | Portfolio Value |
|------|-----------|--------|-----------------|
| Start | - | - | EUR 100,000.00 |
| 2021 | REITs | +41.30% | EUR 141,300.00 |
| 2022 | Commodities | +16.30% | EUR 164,351.90 |
| 2023 | Equities | +24.42% | EUR 204,487.07 |
| 2024 | Equities | +19.20% | EUR 243,748.59 |

### 2.6 Fund Benchmark Data (Final Results Only)

12 NBG/DELOS mutual fund performance records (2021-2024) are stored in the database and shown **only in the final results screen** after a player completes all 4 years. This data:
- Provides benchmark comparison against real fund managers
- Demonstrates that even professionals don't achieve optimal returns
- Is NOT visible during gameplay to avoid influencing allocation decisions

### 2.7 User Roles

| Role | Source | Capabilities |
|------|--------|-------------|
| **Player** | JWT claim from OAuth2 IdP | Join games, submit allocations, view own results, view leaderboard |
| **Admin** | JWT claim from OAuth2 IdP | Create/configure/close games, view all player data, access admin endpoints |

### 2.8 Game Configuration (Admin)

- Game name / description
- Starting capital (default: EUR 100,000)
- Game code (auto-generated 6-char alphanumeric, or custom)
- Optional deadline (after which game auto-closes)
- Max players (optional)

---

## 3. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| **Concurrent Users** | Up to 50 players per game session |
| **Response Time** | < 200ms for API calls |
| **Browser Support** | Chrome, Safari, Edge (latest 2 versions) |
| **Mobile** | Responsive design, touch-friendly allocation inputs |
| **Accessibility** | WCAG 2.1 AA for all interactive elements |
| **Data Integrity** | Allocations validated server-side (sum = 100%, 0-100 range) |
| **Security** | OAuth2 PKCE, encrypted httpOnly cookies, parameterized queries |
| **Deployment** | Dockerized (frontend + backend + PostgreSQL) |

---

## 4. Technical Architecture

### 4.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Client (Browser)                       │
│  ┌────────────────────────────────────────────────────┐  │
│  │         React 19 + TypeScript + Vite               │  │
│  │                                                     │  │
│  │  AuthContext ──── OAuth2 session (cookie-based)     │  │
│  │  GameContext ──── Per-player async game state       │  │
│  │  TanStack Query ─ API cache + background refetch   │  │
│  │  Recharts ─────── Portfolio charts + comparisons    │  │
│  └───────────────────────────┬────────────────────────┘  │
│                               │ HTTP/JSON (cookies)      │
└──────────────────────────────┼───────────────────────────┘
                               │
┌──────────────────────────────┼───────────────────────────┐
│              Docker Network   │                           │
│  ┌───────────────────────────▼────────────────────────┐  │
│  │         Express + TypeScript (backend)              │  │
│  │                                                     │  │
│  │  /api/auth/* ── OAuth2 PKCE + AES-256 cookies      │  │
│  │  /api/games/* ─ Game CRUD + async progression      │  │
│  │  /api/admin/* ─ Admin-only endpoints               │  │
│  │                                                     │  │
│  │  Middleware: cookie decrypt → JWT validate → Zod    │  │
│  │  Services:  game logic, portfolio calc, leaderboard │  │
│  │  Drizzle ORM → type-safe queries                   │  │
│  └───────────────────────────┬────────────────────────┘  │
│                               │                           │
│  ┌───────────────────────────▼────────────────────────┐  │
│  │              PostgreSQL 16                          │  │
│  │  users │ games │ game_players │ allocations         │  │
│  │  portfolio_snapshots │ asset_returns │ fund_benchmarks│ │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### 4.2 Separate Frontend / Backend

The frontend and backend are **independent applications** with their own `package.json`, `Dockerfile`, and build pipelines. They communicate exclusively via REST API with JSON payloads and httpOnly cookies.

```
PortfolioModelingGame/
├── frontend/          # React + Vite (port 5173 dev / nginx in prod)
│   ├── Dockerfile
│   └── package.json
├── backend/           # Express + TypeScript (port 3001)
│   ├── Dockerfile
│   └── package.json
├── shared/            # Shared types copied to both at build time
├── docker-compose.yml # Orchestrates all 3 services
└── .env.example
```

**Why separate (not monorepo)**:
- Each service has its own Dockerfile and can be deployed independently
- Frontend can be served via CDN/nginx, backend scales separately
- Clear API contract boundary between teams/agents
- Simpler Docker builds (no monorepo tooling in containers)

### 4.3 Database Schema (ERD)

```
┌───────────────────┐          ┌────────────────────────┐
│      users        │          │        games           │
├───────────────────┤          ├────────────────────────┤
│ id (uuid PK)      │          │ id (uuid PK)           │
│ email (unique)    │          │ name                   │
│ display_name      │          │ game_code (unique, 6c) │
│ role (enum)       │          │ status (enum)          │
│ org_unit          │          │ initial_capital (dec)  │
│ created_at        │          │ deadline (timestamptz) │
└────────┬──────────┘          │ max_players (int|null) │
         │                     │ created_by (FK→users)  │
         │                     │ created_at             │
         │                     └───────────┬────────────┘
         │                                 │
         │    ┌────────────────────────────┤
         │    │                            │
         ▼    ▼                            │
┌────────────────────────┐                 │
│    game_players        │                 │
├────────────────────────┤                 │
│ game_id (FK)           │                 │
│ user_id (FK)           │                 │
│ current_year (int)     │  ← tracks async │
│ status (enum)          │    progression  │
│ joined_at              │                 │
│ completed_at (nullable)│                 │
│ PK(game_id, user_id)  │                 │
└────────┬───────────────┘                 │
         │                                 │
         │    ┌────────────────────────────┘
         │    │
         ▼    ▼
┌─────────────────────────┐   ┌────────────────────────────┐
│    allocations          │   │   portfolio_snapshots       │
├─────────────────────────┤   ├────────────────────────────┤
│ id (uuid PK)            │   │ id (uuid PK)               │
│ game_id (FK)            │   │ game_id (FK)               │
│ user_id (FK)            │   │ user_id (FK)               │
│ year (int)              │   │ year (int)                 │
│ cash_pct (int)          │   │ value_start (decimal)      │
│ bonds_pct (int)         │   │ value_end (decimal)        │
│ equities_pct (int)      │   │ return_pct (decimal)       │
│ commodities_pct (int)   │   │ created_at                 │
│ reits_pct (int)         │   └────────────────────────────┘
│ submitted_at            │
│ UNIQUE(game,user,year)  │   ┌────────────────────────────┐
│ CHECK(sum = 100)        │   │   asset_returns            │
│ CHECK(each 0..100)      │   ├────────────────────────────┤
└─────────────────────────┘   │ id (serial PK)             │
                              │ year (int)                 │
┌─────────────────────────┐   │ asset_class (enum)         │
│   fund_benchmarks       │   │ return_pct (decimal)       │
├─────────────────────────┤   │ scenario_title (text)      │
│ id (serial PK)          │   │ scenario_description (text)│
│ fund_id (int)           │   │ UNIQUE(year, asset_class)  │
│ fund_name (text)        │   └────────────────────────────┘
│ fund_type (text)        │
│ year (int)              │
│ cash_pct (decimal)      │
│ fixed_income_pct (dec)  │
│ equity_pct (decimal)    │
│ return_pct (decimal)    │
│ sharpe_ratio (decimal)  │
│ UNIQUE(fund_id, year)   │
└─────────────────────────┘
```

---

## 5. Authentication & Authorization

### 5.1 Approach: OAuth2 with PKCE

Enterprise-grade authentication using NBG's OAuth2 identity provider. Full specification in `docs/Authentication-and-Authorization.md`.

### 5.2 Architecture (Adapted for React + Express)

```
React (Vite)           Express Backend              NBG Identity Provider
     │                       │                              │
     │  click "Login"        │                              │
     │ ─────────────────────▶│                              │
     │                       │  generate PKCE verifier      │
     │                       │  store in temp cookie        │
     │                       │  redirect ──────────────────▶│
     │                       │                              │
     │                       │       user authenticates     │
     │                       │                              │
     │                       │◀── callback with auth code ──│
     │                       │                              │
     │                       │  exchange code + verifier    │
     │                       │  for JWT tokens ────────────▶│
     │                       │◀── JWT (access + refresh) ───│
     │                       │                              │
     │                       │  encrypt tokens AES-256-GCM  │
     │                       │  set httpOnly cookies        │
     │◀─── redirect home ────│                              │
     │                       │                              │
     │  GET /api/auth/session│                              │
     │ ─────────────────────▶│  decrypt cookie → validate   │
     │◀─── { user data } ────│  return user info            │
```

### 5.3 Security Properties
- JWT tokens NEVER appear in browser (network tab, localStorage, sessionStorage)
- Tokens encrypted with AES-256-GCM in httpOnly cookies
- Multi-cookie chunking for large tokens (>4KB)
- PKCE prevents authorization code interception
- SameSite cookie flags for CSRF protection
- Development bypass: `DISABLE_LOGIN=true` returns mock user

### 5.4 Roles and Permissions

| Action | Player | Admin |
|--------|:------:|:-----:|
| Join game | Y | Y |
| Submit allocation | Y | Y |
| View own results | Y | Y |
| View leaderboard | Y | Y |
| Create game | - | Y |
| Close/configure game | - | Y |
| View all player data | - | Y |

---

## 6. Frontend Design

### 6.1 Page Map

| Route | Page | Auth | Description |
|-------|------|------|-------------|
| `/` | Landing | No | Game overview + login button |
| `/games` | Game List | Yes | Browse open games, join via code |
| `/games/:id` | Game Dashboard | Yes | Game info, player list, your progress |
| `/games/:id/play` | Game Play | Yes | Year briefing + allocation + results |
| `/games/:id/results` | Final Results | Yes | Final rankings, optimal comparison, fund benchmarks |

### 6.2 Game Play Interface (Per-Year, Async)

```
┌──────────────────────────────────────────────────────────┐
│  Portfolio Modeling Game        Year: 2022   EUR 110,850 │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─── Scenario Briefing ────────────────────────────┐    │
│  │ 2022: The Year of Inflation and Tightening        │    │
│  │                                                    │    │
│  │ High inflation dominates. Central banks raise      │    │
│  │ rates aggressively. Markets face uncertainty       │    │
│  │ about recession, energy costs, and geopolitical    │    │
│  │ tensions from the war in Ukraine...                │    │
│  └───────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─── Allocate Your Portfolio ───────────────────────┐   │
│  │                                                    │   │
│  │  Cash         ██░░░░░░░░░░░░░░░░░░  10%  [−][+]  │   │
│  │  Bonds        ███░░░░░░░░░░░░░░░░░  15%  [−][+]  │   │
│  │  Equities     ██████░░░░░░░░░░░░░░  30%  [−][+]  │   │
│  │  Commodities  ███████░░░░░░░░░░░░░  35%  [−][+]  │   │
│  │  REITs        ██░░░░░░░░░░░░░░░░░░  10%  [−][+]  │   │
│  │                                     ────           │   │
│  │                              Total: 100%           │   │
│  │                                                    │   │
│  │              [ Submit Allocation ]                  │   │
│  └────────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─── Your Progress ────────────────────────────────┐    │
│  │  2021: EUR 100,000 → EUR 127,080  (+27.1%)  [done]│    │
│  │  2022: EUR 127,080 → awaiting allocation...       │    │
│  │  2023: ─                                          │    │
│  │  2024: ─                                          │    │
│  └───────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─── Leaderboard (snapshot) ─────────────────────────┐  │
│  │  1. Alice    EUR 131,200  (completed 2021)         │  │
│  │  2. You      EUR 127,080  (completed 2021)         │  │
│  │  3. Charlie  EUR 122,350  (completed 2021)         │  │
│  │  4. Diana    EUR 100,000  (on year 2021)           │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### 6.3 Year Result (shown after allocation submission)

```
┌──────────────────────────────────────────────────────────┐
│  Year 2021 Results                              [Close]  │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Starting Value: EUR 100,000.00                          │
│  Ending Value:   EUR 127,080.00  (+27.08%)               │
│                                                           │
│  ┌─── Breakdown ────────────────────────────────────┐    │
│  │  Asset        Alloc   Return   Contribution       │    │
│  │  Cash          5%     +0.10%   +EUR     5.00      │    │
│  │  Bonds        10%     -1.50%   -EUR   150.00      │    │
│  │  Equities     40%    +22.35%   +EUR 8,940.00      │    │
│  │  Commodities  25%    +40.10%   +EUR 10,025.00     │    │
│  │  REITs        20%    +41.30%   +EUR 8,260.00      │    │
│  │                                ──────────────     │    │
│  │  Total P&L:                    +EUR 27,080.00     │    │
│  └───────────────────────────────────────────────────┘    │
│                                                           │
│             [ Continue to Year 2022 → ]                   │
└──────────────────────────────────────────────────────────┘
```

### 6.4 Final Results Page (Fund Benchmarks Revealed)

```
┌──────────────────────────────────────────────────────────┐
│  Final Results - Training Session Q1                     │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─── Final Leaderboard ─────────────────────────────┐  │
│  │  1. Alice     EUR 152,340  (+52.3%)               │  │
│  │  2. Bob       EUR 141,200  (+41.2%)               │  │
│  │  3. You       EUR 135,800  (+35.8%)               │  │
│  │  Optimal      EUR 243,749  (+143.7%)              │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌─── Portfolio Value Over Time (chart) ─────────────┐  │
│  │  [Line chart: you vs top players vs optimal]       │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌─── Your Allocations vs Optimal ───────────────────┐  │
│  │  [Stacked bar: your allocation vs optimal per yr]  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌─── How Did Real Funds Perform? ───────────────────┐  │
│  │                                                    │  │
│  │  Your Result:  EUR 135,800                        │  │
│  │                                                    │  │
│  │  NBG/DELOS Fund Benchmarks:                       │  │
│  │  DELOS Blue Chips         +88.6%  EUR 188,600     │  │
│  │  NBG Global Equity        +53.4%  EUR 153,400     │  │
│  │  DELOS Synth Best Red     +43.2%  EUR 143,200     │  │
│  │  DELOS Mixed              +35.1%  EUR 135,100     │  │
│  │  DELOS Short/Med Term     +3.6%   EUR 103,600     │  │
│  │  ...                                              │  │
│  │                                                    │  │
│  │  [Note: Funds use 3 asset classes (Cash, Fixed     │  │
│  │   Income, Equity). Game uses 5. Comparison is      │  │
│  │   for educational context, not direct equivalence.] │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### 6.5 Component Architecture

```
App
├── AuthProvider (OAuth2 session context)
├── QueryClientProvider (TanStack Query)
├── Router
│   ├── LandingPage
│   ├── GameListPage
│   │   ├── GameCard
│   │   ├── JoinGameDialog (enter game code)
│   │   └── CreateGameDialog (admin only)
│   ├── GameDashboardPage
│   │   ├── GameInfo (name, code, player count)
│   │   ├── PlayerProgressList
│   │   └── YourProgress (which year you're on)
│   ├── GamePlayPage
│   │   ├── GameProvider (player's async game state)
│   │   ├── ScenarioBriefing
│   │   ├── AllocationPanel
│   │   │   ├── AllocationSlider (x5, with +/- steppers)
│   │   │   ├── AllocationSummary (total %, pie preview)
│   │   │   └── SubmitButton (disabled until sum = 100)
│   │   ├── YearResultModal (after submission)
│   │   ├── ProgressTimeline (completed years)
│   │   └── LeaderboardSnapshot
│   └── ResultsPage
│       ├── FinalLeaderboard
│       ├── PortfolioTimelineChart
│       ├── AllocationComparisonChart
│       └── FundBenchmarkComparison
```

---

## 7. API Design

### 7.1 Authentication

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/login` | GET | No | Initiates OAuth2 PKCE flow, redirects to IdP |
| `/api/auth/callback` | GET | No | Handles OAuth2 callback, sets encrypted cookies |
| `/api/auth/session` | GET | Cookie | Returns current user data from encrypted cookie |
| `/api/auth/logout` | GET | Cookie | Clears session cookies |

### 7.2 Games

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `POST /api/games` | POST | Admin | Create game session |
| `GET /api/games` | GET | Any | List games (open games for players, all for admin) |
| `GET /api/games/:id` | GET | Any | Game details + player's progress |
| `POST /api/games/:id/join` | POST | Player | Join game (body: `{ gameCode }`) |
| `PATCH /api/games/:id` | PATCH | Admin | Update game settings |
| `POST /api/games/:id/close` | POST | Admin | Close game to new players |

### 7.3 Gameplay (Async Progression)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `GET /api/games/:id/play` | GET | Player | Get current year state (briefing, portfolio value, whether allocation submitted) |
| `POST /api/games/:id/allocations` | POST | Player | Submit allocation for current year. Triggers immediate year resolution. Returns year result + new portfolio value. |
| `GET /api/games/:id/allocations` | GET | Player | Get own allocation history (all years) |

### 7.4 Results

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `GET /api/games/:id/leaderboard` | GET | Player | Current leaderboard (all players, sorted by furthest year + value) |
| `GET /api/games/:id/results` | GET | Player | Final results: rankings, optimal path, fund benchmarks. Only available after player completes year 2024. |
| `GET /api/games/:id/snapshots` | GET | Player | Own portfolio snapshots per year |

### 7.5 Admin

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `GET /api/admin/games/:id/players` | GET | Admin | All players with their progress and portfolio values |
| `GET /api/admin/games/:id/allocations` | GET | Admin | All player allocations for all years |

### 7.6 Key Request/Response Examples

**Submit Allocation (triggers immediate resolution)**
```
POST /api/games/abc-123/allocations
Content-Type: application/json

{
  "year": 2022,
  "cash": 10,
  "bonds": 15,
  "equities": 30,
  "commodities": 35,
  "reits": 10
}
```

**Response (year result)**
```json
{
  "year": 2022,
  "allocation": { "cash": 10, "bonds": 15, "equities": 30, "commodities": 35, "reits": 10 },
  "portfolioStart": 127080.00,
  "portfolioEnd": 124331.42,
  "returnPct": -2.16,
  "breakdown": [
    { "asset": "cash", "allocated": 12708.00, "returnPct": 0.4, "contribution": 50.83 },
    { "asset": "bonds", "allocated": 19062.00, "returnPct": -12.3, "contribution": -2344.63 },
    { "asset": "equities", "allocated": 38124.00, "returnPct": -17.73, "contribution": -6759.39 },
    { "asset": "commodities", "allocated": 44478.00, "returnPct": 16.3, "contribution": 7249.91 },
    { "asset": "reits", "allocated": 12708.00, "returnPct": -24.4, "contribution": -3100.75 }
  ],
  "nextYear": 2023,
  "playerStatus": "playing"
}
```

**Get Play State**
```
GET /api/games/abc-123/play
```
```json
{
  "gameId": "abc-123",
  "gameName": "Training Session Q1",
  "currentYear": 2023,
  "portfolioValue": 124331.42,
  "initialCapital": 100000.00,
  "totalReturnPct": 24.33,
  "scenario": {
    "year": 2023,
    "title": "The Year of Stabilization and Artificial Intelligence",
    "description": "Inflation begins to ease and markets anticipate the end of the rate-hiking cycle..."
  },
  "completedYears": [2021, 2022],
  "allocationSubmitted": false
}
```

---

## 8. Portfolio Calculation Logic

### 8.1 Core Formula

```
For each asset class a in year y:
  amount_allocated(a) = portfolio_value * (allocation_pct(a) / 100)
  contribution(a) = amount_allocated(a) * return(a, y) / 100
  ending_value(a) = amount_allocated(a) + contribution(a)

portfolio_value(y+1) = SUM(ending_value(a)) for all asset classes a
```

### 8.2 Calculation is Immediate and Server-Side

When a player submits an allocation:
1. Server validates allocation (sum = 100, each 0-100)
2. Server reads current portfolio value from latest snapshot (or initial capital if year 2021)
3. Server applies returns from `asset_returns` table
4. Server writes `portfolio_snapshots` record
5. Server advances player's `current_year` in `game_players`
6. Server returns full year result to player

This happens in a single database transaction.

### 8.3 Worked Example

Starting capital: EUR 100,000

**Year 2021 allocation**: Cash 5%, Bonds 10%, Equities 40%, Commodities 25%, REITs 20%

```
Cash:        5,000  * (1 + 0.001)   =   5,005.00
Bonds:      10,000  * (1 - 0.015)   =   9,850.00
Equities:   40,000  * (1 + 0.2235)  =  48,940.00
Commodities:25,000  * (1 + 0.401)   =  35,025.00
REITs:      20,000  * (1 + 0.413)   =  28,260.00
                                     ────────────
Portfolio end of 2021:               = 127,080.00
```

---

## 9. Security

| Area | Implementation |
|------|---------------|
| **Authentication** | OAuth2 Authorization Code + PKCE via NBG identity provider |
| **Token Storage** | AES-256-GCM encrypted httpOnly cookies (multi-chunk for >4KB) |
| **Token Visibility** | Zero - JWT never appears in browser network tab, localStorage, or sessionStorage |
| **Authorization** | Role-based from JWT claims (Player/Admin), enforced server-side |
| **Input Validation** | Zod schemas on all API inputs, DB-level CHECK constraints |
| **SQL Injection** | Parameterized queries via Drizzle ORM |
| **XSS** | React auto-escaping, Content-Security-Policy headers |
| **CSRF** | SameSite cookie flags, PKCE state parameter |
| **CORS** | Configured for specific frontend origin only |
| **Dev Bypass** | `DISABLE_LOGIN=true` for local development without IdP |

---

## 10. Deployment Architecture

### 10.1 Docker Compose (Development + Production)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]

  backend:
    build: ./backend
    ports: ["3001:3001"]
    depends_on: [postgres]
    environment:
      - DATABASE_URL=postgresql://...
      - TOKEN_ENCRYPTION_KEY=...

  frontend:
    build: ./frontend
    ports: ["80:80"]       # nginx serves built React app
    depends_on: [backend]
    environment:
      - VITE_API_URL=http://backend:3001/api
```

### 10.2 Production Target (Future)

```
┌─────────────────┐     ┌──────────────┐     ┌──────────────┐
│   nginx /        │     │   Express     │     │  PostgreSQL   │
│   CDN            │────▶│   Container   │────▶│  Container    │
│   (Frontend)     │     │   (Backend)   │     │  (Database)   │
└─────────────────┘     └──────────────┘     └──────────────┘
```

Each service is a separate Docker container. Can be deployed to any container orchestration platform (Docker Compose, Kubernetes, ECS, etc.).

---

## 11. Implementation Phases

### Phase 1: Project Setup & Foundation
- Create `frontend/` and `backend/` with separate `package.json`
- Docker Compose for PostgreSQL
- Drizzle ORM schema + migrations
- Seed data: historical asset returns, scenario descriptions, fund benchmarks
- `shared/` types and portfolio calculation functions
- Dev auth bypass (mock user)

### Phase 2: Backend Core
- OAuth2 PKCE auth flow (login, callback, session, logout)
- Game CRUD (create, list, join, close)
- Async gameplay: get play state, submit allocation, immediate year resolution
- Leaderboard computation
- Zod validation on all endpoints
- Integration tests

### Phase 3: Frontend - Auth & Game Management
- Auth flow (login redirect, session check, protected routes)
- Landing page
- Game list page (browse, join via code)
- Game dashboard (info, player list, progress)
- Create game dialog (admin)

### Phase 4: Frontend - Gameplay
- Scenario briefing display
- Allocation panel (5 sliders with +/- steppers, sum validation)
- Submit allocation → year result modal
- Progress timeline (completed years with values)
- Leaderboard snapshot
- Year-to-year navigation

### Phase 5: Frontend - Final Results & Analytics
- Final leaderboard
- Portfolio value timeline chart (you vs others vs optimal)
- Allocation comparison chart (your decisions vs optimal)
- Fund benchmark comparison section
- Recharts integration for all visualizations

### Phase 6: Polish, Testing & Docker
- Responsive design (mobile/tablet allocation UX)
- Accessibility audit (WCAG 2.1 AA)
- E2e test suite (Playwright)
- Production Dockerfiles (multi-stage builds)
- Full docker-compose.yml for all services
- Error handling, loading states, edge cases

---

## 12. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Invalid allocation submission | Data integrity | Server-side Zod validation + DB CHECK constraint (sum=100, each 0-100) |
| Player submits for wrong year | Game corruption | Server checks player's `current_year` matches submitted year |
| Concurrent allocation for same year | Duplicate writes | UNIQUE constraint (game_id, user_id, year) + DB transaction |
| OAuth2 provider unavailable | Can't login | `DISABLE_LOGIN=true` dev bypass; production: IdP SLA |
| Token encryption key leak | Session hijack | Key in env vars only, never in code. Rotate key invalidates all sessions. |
| Fund benchmark data shown during game | Unfair advantage | Enforced server-side: `/results` endpoint checks player has completed all 4 years |
| Shared types drift between FE/BE | Runtime errors | CI step validates shared types match; API integration tests |

---

## 13. Decisions Made

| Question | Decision | Rationale |
|----------|----------|-----------|
| Sync vs async play | **Asynchronous** | Players log in at different times, progress at own pace. Simpler architecture (no WebSockets). |
| Authentication | **OAuth2 PKCE** | Enterprise-grade, matches NBG infrastructure. Encrypted cookies, zero token visibility. |
| Fund benchmarks timing | **Final results only** | Prevents anchoring bias during gameplay. More impactful reveal at the end. |
| Project structure | **Separate FE/BE** | Clean Docker containerization. Independent deployment. Clear API boundary. |
| Leaderboard updates | **Polling / manual refresh** | Async play means no real-time sync needed. TanStack Query handles background refetch. |
| Re-allocation | **No re-submission** | Once submitted, allocation for that year is final. Adds strategic weight to decisions. |
| Missing player submission | **N/A (async)** | Each player controls their own pace. No timeout needed. Optional game deadline handles abandoned games. |
