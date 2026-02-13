import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
export function useLeaderboard(gameId) {
    return useQuery({
        queryKey: ['leaderboard', gameId],
        queryFn: () => api.getLeaderboard(gameId),
        refetchInterval: 30_000,
    });
}
