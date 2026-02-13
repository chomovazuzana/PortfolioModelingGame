import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { clsx } from 'clsx';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ASSET_CLASS_LABELS } from '../../shared/constants';
const ASSET_COLORS = {
    cash: '#059669',
    bonds: '#2563eb',
    equities: '#7c3aed',
    commodities: '#d97706',
    reits: '#e11d48',
};
export function AllocationSummary({ allocation, isValid, total }) {
    const pieData = Object.keys(allocation)
        .filter((key) => allocation[key] > 0)
        .map((key) => ({
        name: ASSET_CLASS_LABELS[key],
        value: allocation[key],
        color: ASSET_COLORS[key],
    }));
    return (_jsxs("div", { className: "flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4", children: [pieData.length > 0 && (_jsx("div", { className: "h-16 w-16 shrink-0", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsx(PieChart, { children: _jsx(Pie, { data: pieData, dataKey: "value", cx: "50%", cy: "50%", outerRadius: 30, innerRadius: 12, strokeWidth: 1, children: pieData.map((entry) => (_jsx(Cell, { fill: entry.color }, entry.name))) }) }) }) })), _jsxs("div", { className: "flex items-center gap-2", children: [isValid ? (_jsx("svg", { className: "h-5 w-5 text-green-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) })) : (_jsx("svg", { className: "h-5 w-5 text-red-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) })), _jsxs("span", { className: clsx('text-lg font-bold tabular-nums', isValid ? 'text-green-700' : 'text-red-600'), children: [total, "%"] }), _jsx("span", { className: "text-sm text-gray-500", children: isValid ? 'Ready to submit' : total < 100 ? `${100 - total}% remaining` : `${total - 100}% over` })] })] }));
}
