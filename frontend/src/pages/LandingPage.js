import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
export function LandingPage() {
    const { isAuthenticated, isLoading, login } = useAuth();
    if (isLoading) {
        return (_jsx("div", { className: "flex min-h-screen items-center justify-center", children: _jsx(Spinner, { size: "lg" }) }));
    }
    if (isAuthenticated) {
        return _jsx(Navigate, { to: "/games", replace: true });
    }
    return (_jsx("div", { className: "flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4", children: _jsxs("div", { className: "max-w-xl text-center", children: [_jsx("h1", { className: "text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl", children: "Portfolio Modeling Game" }), _jsx("p", { className: "mt-4 text-lg text-gray-600", children: "A competitive investment simulation where you allocate capital across 5 asset classes over 4 historical years." }), _jsxs("div", { className: "mt-8 rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm", children: [_jsx("h2", { className: "mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500", children: "How it works" }), _jsxs("ul", { className: "space-y-3 text-sm text-gray-700", children: [_jsxs("li", { className: "flex gap-3", children: [_jsx("span", { className: "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700", children: "1" }), "Start with EUR 100,000 in virtual capital"] }), _jsxs("li", { className: "flex gap-3", children: [_jsx("span", { className: "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700", children: "2" }), "Allocate across Cash, Bonds, Equities, Commodities, and REITs"] }), _jsxs("li", { className: "flex gap-3", children: [_jsx("span", { className: "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700", children: "3" }), "Navigate 4 years of real market conditions (2021-2024)"] }), _jsxs("li", { className: "flex gap-3", children: [_jsx("span", { className: "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700", children: "4" }), "Compete for the highest portfolio value"] })] })] }), _jsx(Button, { size: "lg", className: "mt-8", onClick: login, children: "Login to Play" })] }) }));
}
