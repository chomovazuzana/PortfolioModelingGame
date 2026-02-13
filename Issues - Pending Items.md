# Issues - Pending Items

## Pending

### Important
1. **[DATA] Fund benchmark data uses 3 asset classes, game uses 5** - The NBG/DELOS fund spreadsheet tracks Cash, Fixed Income, and Equity allocations. The game has 5 asset classes (adds Commodities and REITs). The FundBenchmarkComparison component displays fund data as-is with a disclaimer note. No mapping attempted per PLAN.md decision. Keeping open for future review if stakeholders request a mapping.
2. **[AUTH] OAuth2 IdP configuration needed** - The OAuth2 PKCE flow requires a registered client at NBG's identity provider. Need: client ID, client secret, redirect URI registration, scope configuration including `organizational_unit` claim. Development uses `DISABLE_LOGIN=true` bypass.
3. **[SCOPE] Localization** - Requirements document has content in both English and Greek. Need to decide if the app should support both languages or English only. Scenario briefings are currently in English.

### Minor
4. **[SCOPE] Game deadline behavior** - When a game's deadline passes, should unfinished players' portfolios freeze at their last completed year, or should they be excluded from the final leaderboard? Currently no automatic deadline enforcement.
5. **[SCOPE] Single-player / practice mode** - Should a player be able to play solo (no other players) for practice? Currently requires joining a game created by admin. A "practice mode" would need auto-game-creation.
6. **[DEPLOY] Production hosting target** - Docker containers are ready but no hosting platform chosen. Options: AWS ECS, Railway, Fly.io, or self-hosted.
7. **[FRONTEND] Join game by code requires game in list** - GameListPage join-by-code currently searches the already-fetched game list client-side. If the game isn't in the user's list (e.g., they weren't previously a member), the join will fail. Need a dedicated backend endpoint to look up games by code, or change the join flow to POST directly with just the code.
8. **[FRONTEND] react-router-dom added as separate dependency** - PLAN.md specifies imports from `react-router`, but v6.30 exports `BrowserRouter` only from `react-router-dom`. Added `react-router-dom` as dependency; all router imports use `react-router-dom`.
9. **[BUILD] Frontend bundle size warning** - Production build generates a 699KB JS chunk (209KB gzipped). Consider code-splitting Recharts charts via dynamic imports to reduce initial load. Not a blocker but recommended for production.

### Informational
10. **[DATA] Optimal portfolio value differs from SOLUTION-DESIGN.md** - The documented optimal final value (EUR 243,748.59) has a rounding discrepancy at the 2022 step. The mathematically correct value is EUR 243,718.41 (100k * 1.413 * 1.163 * 1.2442 * 1.192). The code uses the correct calculation. Tests updated to match the correct value.

---

## Completed

1. ~~**[DECISION] Real-time vs polling for leaderboard**~~ - Resolved: Polling/manual refresh. Async play model doesn't require real-time updates.
2. ~~**[DECISION] Timer for allocation rounds**~~ - Resolved: No timer. Async play means each player controls their own pace. Optional game-level deadline handles abandoned games.
3. ~~**[DECISION] Re-allocation policy**~~ - Resolved: No re-submission. Once allocation is submitted for a year, it's final.
4. ~~**[DECISION] Sync vs async play model**~~ - Resolved: Asynchronous. Players progress independently.
5. ~~**[DECISION] Authentication approach**~~ - Resolved: OAuth2 with PKCE via NBG identity provider. Encrypted httpOnly cookies.
6. ~~**[DECISION] Fund benchmark timing**~~ - Resolved: Shown only in final results page, not during gameplay. Backend enforces 403 on GET /api/games/:id/results until player status is 'completed'.
7. ~~**[DECISION] Project structure**~~ - Resolved: Separate frontend/ and backend/ directories, each with own package.json and Dockerfile. Docker Compose orchestrates all services.
8. ~~**[DECISION] Anonymous leaderboard mode**~~ - Resolved: Player names visible throughout (async play means no strategic disadvantage from visibility).
9. ~~**[BACKEND] Phase 2 Backend Core**~~ - Completed: OAuth2 PKCE + cookie encryption (with DISABLE_LOGIN bypass), Zod validation, game/gameplay/leaderboard/results services, all routes (auth, games, gameplay, results, admin), 39 passing tests.
10. ~~**[FRONTEND] Phase 3 Frontend Shell**~~ - Completed: API client service, AuthContext + Provider, React Router with protected routes, UI component library (Button, Card, Dialog, Badge, Spinner, Layout), Landing page, GameList page (with GameCard, JoinGameDialog, CreateGameDialog), GameDashboard page (with GameInfo, YourProgress), Play/Results page shells. TypeScript clean, build succeeds, 13 shared tests passing.
11. ~~**[FRONTEND] Phase 4 Frontend Gameplay**~~ - Completed: GameContext (useReducer state management), GamePlayPage (scenario briefing + allocation + timeline + leaderboard), AllocationSlider (range + +/- steppers), AllocationSummary (pie chart preview), AllocationPanel (confirmation dialog), YearResultModal (breakdown table + P&L), ProgressTimeline (vertical year-by-year), LeaderboardSnapshot (30s polling), useAllocation hook, useLeaderboard hook. TypeScript clean, build succeeds, 13 tests passing.
12. ~~**[FRONTEND] Phase 5 Final Results & Analytics**~~ - Completed: ResultsPage (fetches FinalResults, page guard 403->play redirect, 404->games redirect), FinalLeaderboard (ranked table with medals for top 3, current user highlight, optimal portfolio row with star icon), PortfolioTimelineChart (Recharts LineChart: player blue/thick, optimal gold/dashed, optional top players gray), AllocationComparisonChart (Recharts stacked BarChart: player vs optimal side-by-side per year), FundBenchmarkComparison (horizontal BarChart + detailed table + 3-vs-5 asset class disclaimer). Barrel export via charts/index.ts. TypeScript clean, build succeeds, 13 tests passing.
13. ~~**[POLISH] Phase 6 Polish, Testing & Docker**~~ - Completed: P6T1 responsive design (Tailwind breakpoints on all pages, mobile hamburger nav, mobile-friendly charts/tables with overflow-x-auto, larger tap targets on sliders), P6T2 accessibility (WCAG 2.1 AA: aria-label/aria-valuemin/valuenow on sliders, role="img" with text summaries on charts, table aria-labels, role="status" on spinners, role="alert" on errors, focus-visible indicators, aria-expanded on mobile menu), P6T3 error handling (ErrorBoundary wrapping App, QueryWrapper utility, error cards with retry buttons per page, empty states), P6T4 Playwright e2e suite (playwright.config.ts with chromium+mobile projects, game-flow.spec.ts full 4-year flow, join-game.spec.ts code entry), P6T5 production Dockerfiles (backend multi-stage Node 22-alpine, frontend multi-stage with nginx), P6T6 docker-compose.yml (3 services: postgres:16-alpine with healthcheck, backend with env vars, frontend nginx on port 80), P6T7 edge cases verified (all backend guards present: NOT_JOINED 403, GAME_NOT_OPEN 400, ALREADY_SUBMITTED 400, GAME_NOT_COMPLETED 403, GAME_FULL 400, code collision retry; all frontend guards present: play redirect for non-joined, results redirect for incomplete, double-click disabled during submit). TypeScript clean, build succeeds, 13 tests passing.
14. ~~**[DESIGN] Mobile allocation UX**~~ - Resolved in Phase 6: Stepper buttons enlarged to h-10 w-10 on mobile (meets WCAG 44px minimum), scale down to h-8 w-8 on sm+. Sliders retain full-width with focus-visible ring. aria-label on all interactive elements.
