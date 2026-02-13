import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Layout } from './Layout';
import { Spinner } from './Spinner';
export function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) {
        return (_jsx("div", { className: "flex min-h-screen items-center justify-center", children: _jsx(Spinner, { size: "lg" }) }));
    }
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/", replace: true });
    }
    return (_jsx(Layout, { children: _jsx(Outlet, {}) }));
}
