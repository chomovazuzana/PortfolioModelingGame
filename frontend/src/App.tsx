import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ui/ProtectedRoute';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

import { LandingPage } from './pages/LandingPage';
import { GameListPage } from './pages/GameListPage';
import { GameDashboardPage } from './pages/GameDashboardPage';
import { GamePlayPage } from './pages/GamePlayPage';
import { ResultsPage } from './pages/ResultsPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

export function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
