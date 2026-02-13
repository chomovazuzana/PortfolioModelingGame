# Portfolio Modeling Game - Execution Instructions

## How to Run This

### Step 1: Open a new terminal window

```bash
cd /Users/suzy/ClaudeProjects/PortfolioModelingGame
```

### Step 2: Start Claude Code in the project directory

```bash
claude
```

### Step 3: Paste Prompt A (generates the implementation plan)

Copy everything between the `---START---` and `---END---` markers below and paste it into the new Claude Code window.

Wait for it to finish writing `PLAN.md`. Read through the plan. If anything looks wrong, tell Claude to fix it before proceeding.

### Step 4: Paste Prompt B (builds the application)

Once you're happy with `PLAN.md`, copy and paste Prompt B. This kicks off the actual build. Claude will work through each phase and report progress after each one.

### Step 5 (if needed): Resume after interruption

If the session drops or you need to continue in a new window, open a new Claude Code session in the same directory and paste Prompt C.

### Step 6: Final verification and Docker

After all 6 phases are built, paste Prompt D to run tests, create Dockerfiles, and verify everything works.

---

## Prompt A: Create Implementation Plan

---START---

You are building the Portfolio Modeling Game — a competitive investment simulation for NBG financial advisors.

Read these documents in order to fully understand the project:
1. CLAUDE.md (project instructions, tech stack, conventions)
2. docs/SOLUTION-DESIGN.md (full solution design: architecture, DB schema, API, game flow, auth)
3. docs/Authentication-and-Authorization.md (OAuth2 PKCE auth specification)
4. docs/game-requirements.md (original game rules and asset return data)
5. docs/game-data-reference.md (NBG/DELOS fund benchmark data)
6. Issues - Pending Items.md (open issues and resolved decisions)

After reading all documents, create a detailed phase-by-phase implementation plan as PLAN.md at the project root. The plan must:

- Follow the 6 implementation phases defined in SOLUTION-DESIGN.md Section 11
- Break each phase into concrete, ordered tasks with file paths and what each file should contain
- Specify exact npm packages and versions for both frontend/ and backend/
- Include the full Drizzle ORM schema (all 7 tables with constraints, enums, indexes)
- Include the seed data script content (all 4 years x 5 asset classes returns + all 12 fund benchmarks from game-data-reference.md)
- Include docker-compose.yml specification
- For each API endpoint: route file, Zod validation schema, service function, expected request/response
- For each React page: component breakdown, hooks needed, API calls, state management
- Mark dependencies between tasks (what must be built before what)
- Flag the pending issues from "Issues - Pending Items.md" where they affect implementation, with your recommended resolution

The plan must be detailed enough that each task can be executed independently without ambiguity. Write the full PLAN.md now.

---END---

---

## Prompt B: Build the Application

---START---

Read CLAUDE.md and PLAN.md. Execute the plan phase by phase.

Rules:
- Follow PLAN.md exactly. Do not skip tasks or reorder phases.
- Build backend/ and frontend/ as separate applications (separate package.json, separate Dockerfile)
- After completing each phase, run all tests and verify the build before moving to the next phase
- Use the shared/ directory for types, constants, and calculation logic — copy these into both frontend/src/shared/ and backend/src/shared/ during setup
- Use DISABLE_LOGIN=true for auth bypass during Phases 1-4. Implement real OAuth2 PKCE in Phase 2 but wire it up with the bypass flag
- Seed the database with ALL historical return data and ALL 12 fund benchmarks from docs/game-data-reference.md
- Validate every allocation endpoint with: sum = 100, each value 0-100 integers, correct current_year for player
- Portfolio calculation happens server-side in a single DB transaction on allocation submission
- Fund benchmark data must NOT be returned by any endpoint except GET /api/games/:id/results, and only after the player has completed all 4 years
- Update "Issues - Pending Items.md" as you discover or resolve issues
- After each phase, report what was built and what's ready to test

Start with Phase 1 now.

---END---

---

## Prompt C: Resume After Interruption

---START---

Read CLAUDE.md and PLAN.md. Check the current state of the codebase (what files exist, what's been built). Determine which phase and task you should resume from. Continue execution from that point, following the same rules as the original execution prompt. Update "Issues - Pending Items.md" if needed.

---END---

---

## Prompt D: Verify and Dockerize

---START---

Read CLAUDE.md. The application should be fully built. Do the following:

1. Run all backend tests (npm test in backend/)
2. Run all frontend tests (npm test in frontend/)
3. Run TypeScript checks in both (npm run typecheck)
4. Create production Dockerfiles for both frontend (multi-stage: build + nginx) and backend (multi-stage: build + node)
5. Create the final docker-compose.yml with all 3 services (postgres, backend, frontend)
6. Test that docker compose up builds and starts all services
7. Write a final summary of what was built, what works, and any remaining items from "Issues - Pending Items.md"

---END---

---

## Prerequisites

Before starting, make sure you have:
- **Node.js 18+** installed (`node --version`)
- **Docker Desktop** running (needed for PostgreSQL in Phase 1)
- **npm** available (`npm --version`)

PostgreSQL runs in Docker — you do not need it installed locally. The first prompt will set up `docker-compose.yml` and start it.
