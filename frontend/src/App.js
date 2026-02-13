import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsx(ErrorBoundary, { children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(AuthProvider, { children: _jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(LandingPage, {}) }), _jsxs(Route, { element: _jsx(ProtectedRoute, {}), children: [_jsx(Route, { path: "/games", element: _jsx(GameListPage, {}) }), _jsx(Route, { path: "/games/:id", element: _jsx(GameDashboardPage, {}) }), _jsx(Route, { path: "/games/:id/play", element: _jsx(GamePlayPage, {}) }), _jsx(Route, { path: "/games/:id/results", element: _jsx(ResultsPage, {}) })] })] }) }) }) }) }));
}
