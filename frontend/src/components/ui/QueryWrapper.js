import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Spinner } from './Spinner';
import { Button } from './Button';
export function QueryWrapper({ query, loadingLabel = 'Loading', children, emptyCheck, emptyMessage = 'No data available.', }) {
    if (query.isLoading) {
        return (_jsx("div", { className: "flex justify-center py-12", role: "status", "aria-label": loadingLabel, children: _jsx(Spinner, { size: "lg" }) }));
    }
    if (query.error) {
        return (_jsx("div", { className: "mx-auto max-w-md py-12 text-center", children: _jsxs("div", { className: "rounded-xl border border-red-200 bg-red-50 p-6", children: [_jsx("p", { className: "font-medium text-red-800", children: "Failed to load data" }), _jsx("p", { className: "mt-1 text-sm text-red-600", children: "Please check your connection and try again." }), _jsx(Button, { variant: "secondary", size: "sm", className: "mt-4", onClick: () => query.refetch(), children: "Retry" })] }) }));
    }
    if (!query.data)
        return null;
    if (emptyCheck && emptyCheck(query.data)) {
        return (_jsx("div", { className: "py-12 text-center", children: _jsx("p", { className: "text-gray-500", children: emptyMessage }) }));
    }
    return _jsx(_Fragment, { children: children(query.data) });
}
