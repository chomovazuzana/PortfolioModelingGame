import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ui/ProtectedRoute';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { DevSwitcherBar } from './components/ui/DevSwitcherBar';
import { LandingPage } from './pages/LandingPage';
import { GameListPage } from './pages/GameListPage';
import { GameDashboardPage } from './pages/GameDashboardPage';
import { GamePlayPage } from './pages/GamePlayPage';
import { ResultsPage } from './pages/ResultsPage';
import { AdminGamePage } from './pages/AdminGamePage';
const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});
export function App() {
    return (_jsx(ErrorBoundary, { children: _jsx(QueryClientProvider, { client: queryClient, children: _jsxs(AuthProvider, { children: [_jsx(DevSwitcherBar, {}), _jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(LandingPage, {}) }), _jsxs(Route, { element: _jsx(ProtectedRoute, {}), children: [_jsx(Route, { path: "/games", element: _jsx(GameListPage, {}) }), _jsx(Route, { path: "/games/:id", element: _jsx(GameDashboardPage, {}) }), _jsx(Route, { path: "/games/:id/play", element: _jsx(GamePlayPage, {}) }), _jsx(Route, { path: "/games/:id/results", element: _jsx(ResultsPage, {}) }), _jsx(Route, { path: "/admin/games/:id", element: _jsx(AdminGamePage, {}) })] })] }) })] }) }) }));
}
