import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
import { Button } from './Button';
export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }
    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };
    render() {
        if (this.state.hasError) {
            return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-gray-50 px-4", children: _jsx("div", { className: "max-w-md text-center", children: _jsxs("div", { className: "rounded-xl border border-red-200 bg-white p-8 shadow-sm", children: [_jsx("div", { className: "mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100", children: _jsx("svg", { className: "h-6 w-6 text-red-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }) }), _jsx("h1", { className: "text-lg font-semibold text-gray-900", children: "Something went wrong" }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: "An unexpected error occurred. Please try again." }), this.state.error && (_jsx("p", { className: "mt-2 text-xs text-gray-400", children: this.state.error.message })), _jsxs("div", { className: "mt-6 flex justify-center gap-3", children: [_jsx(Button, { variant: "secondary", onClick: this.handleReset, children: "Try Again" }), _jsx(Button, { onClick: () => { window.location.href = '/games'; }, children: "Go to Games" })] })] }) }) }));
        }
        return this.props.children;
    }
}
