import type {
  User,
  Game,
  GameDetail,
  CreateGameRequest,
  JoinGameRequest,
  UpdateGameRequest,
  PlayState,
  SubmitAllocationRequest,
  YearResult,
  AllocationRecord,
  LeaderboardEntry,
  FinalResults,
  PortfolioSnapshot,
  AdminPlayerDetail,
} from '../shared/types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export class ApiClientError extends Error {
  constructor(
    public status: number,
    message: string,
    public code: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiClientError(
      res.status,
      body?.error ?? 'Request failed',
      body?.code ?? 'UNKNOWN',
    );
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export const api = {
  // Auth
  getSession: () => request<{ user: User }>('/auth/session'),
  logout: () => request<void>('/auth/logout'),

  // Dev mode
  getDevUsers: () => request<User[]>('/auth/dev-users'),
  devSwitch: (userId: string) =>
    request<{ user: User }>('/auth/dev-switch', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  // Games
  listGames: () => request<Game[]>('/games'),
  getGame: (id: string) => request<GameDetail>(`/games/${id}`),
  createGame: (data: CreateGameRequest) =>
    request<Game>('/games', { method: 'POST', body: JSON.stringify(data) }),
  joinGame: (id: string, data: JoinGameRequest) =>
    request<GameDetail>(`/games/${id}/join`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateGame: (id: string, data: UpdateGameRequest) =>
    request<Game>(`/games/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  closeGame: (id: string) =>
    request<Game>(`/games/${id}/close`, { method: 'POST' }),

  // Gameplay
  getPlayState: (id: string) => request<PlayState>(`/games/${id}/play`),
  submitAllocation: (id: string, data: SubmitAllocationRequest) =>
    request<YearResult>(`/games/${id}/allocations`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAllocations: (id: string) =>
    request<AllocationRecord[]>(`/games/${id}/allocations`),

  // Results
  getLeaderboard: (id: string) =>
    request<LeaderboardEntry[]>(`/games/${id}/leaderboard`),
  getResults: (id: string) => request<FinalResults>(`/games/${id}/results`),
  getSnapshots: (id: string) =>
    request<PortfolioSnapshot[]>(`/games/${id}/snapshots`),

  // Admin
  getAdminPlayers: (id: string) =>
    request<AdminPlayerDetail[]>(`/admin/games/${id}/players`),
  downloadLeaderboardCsv: (id: string) =>
    fetch(`${API_URL}/admin/games/${id}/leaderboard/export`, { credentials: 'include' }),
};
