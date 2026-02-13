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
