import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useReducer, } from 'react';
import { api, ApiClientError } from '../services/api';
function authReducer(_state, action) {
    switch (action.type) {
        case 'LOADING':
            return { user: null, isAuthenticated: false, isLoading: true, error: null };
        case 'AUTHENTICATED':
            return { user: action.user, isAuthenticated: true, isLoading: false, error: null };
        case 'UNAUTHENTICATED':
            return { user: null, isAuthenticated: false, isLoading: false, error: null };
        case 'ERROR':
            return { user: null, isAuthenticated: false, isLoading: false, error: action.error };
    }
}
const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || '/api';
export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, {
        user: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
    });
    useEffect(() => {
        let cancelled = false;
        async function checkSession() {
            try {
                const { user } = await api.getSession();
                if (!cancelled)
                    dispatch({ type: 'AUTHENTICATED', user });
            }
            catch (err) {
                if (cancelled)
                    return;
                if (err instanceof ApiClientError && err.status === 401) {
                    dispatch({ type: 'UNAUTHENTICATED' });
                }
                else {
                    dispatch({
                        type: 'ERROR',
                        error: err instanceof Error ? err.message : 'Session check failed',
                    });
                }
            }
        }
        checkSession();
        return () => { cancelled = true; };
    }, []);
    function login() {
        window.location.href = `${API_URL}/auth/login`;
    }
    async function logout() {
        try {
            await api.logout();
        }
        finally {
            dispatch({ type: 'UNAUTHENTICATED' });
        }
    }
    return (_jsx(AuthContext.Provider, { value: { ...state, login, logout }, children: children }));
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return ctx;
}
