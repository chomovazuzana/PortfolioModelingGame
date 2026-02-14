const API_URL = import.meta.env.VITE_API_URL || '/api';
export class ApiClientError extends Error {
    status;
    code;
    constructor(status, message, code) {
        super(message);
        this.status = status;
        this.code = code;
    }
}
async function request(path, options) {
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
        throw new ApiClientError(res.status, body?.error ?? 'Request failed', body?.code ?? 'UNKNOWN');
    }
    // Handle 204 No Content
    if (res.status === 204) {
        return undefined;
    }
    return res.json();
}
export const api = {
    // Auth
    getSession: () => request('/auth/session'),
    logout: () => request('/auth/logout'),
    // Dev mode
    getDevUsers: () => request('/auth/dev-users'),
    devSwitch: (userId) => request('/auth/dev-switch', {
        method: 'POST',
        body: JSON.stringify({ userId }),
    }),
    // Games
    listGames: () => request('/games'),
    getGame: (id) => request(`/games/${id}`),
    createGame: (data) => request('/games', { method: 'POST', body: JSON.stringify(data) }),
    joinGame: (id, data) => request(`/games/${id}/join`, {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateGame: (id, data) => request(`/games/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
    closeGame: (id) => request(`/games/${id}/close`, { method: 'POST' }),
    // Gameplay
    getPlayState: (id) => request(`/games/${id}/play`),
    submitAllocation: (id, data) => request(`/games/${id}/allocations`, {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    getAllocations: (id) => request(`/games/${id}/allocations`),
    // Results
    getLeaderboard: (id) => request(`/games/${id}/leaderboard`),
    getResults: (id) => request(`/games/${id}/results`),
    getSnapshots: (id) => request(`/games/${id}/snapshots`),
    // Admin
    getAdminPlayers: (id) => request(`/admin/games/${id}/players`),
    downloadLeaderboardCsv: (id) => fetch(`${API_URL}/admin/games/${id}/leaderboard/export`, { credentials: 'include' }),
};
