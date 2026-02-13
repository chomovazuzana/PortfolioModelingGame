import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ASSET_CLASS_LABELS } from '../../shared/constants';
import { useAllocation } from '../../hooks/useAllocation';
import { AllocationSlider } from './AllocationSlider';
import { AllocationSummary } from './AllocationSummary';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
const SLIDER_CONFIG = [
    { asset: 'cash', color: 'text-emerald-600' },
    { asset: 'bonds', color: 'text-blue-600' },
    { asset: 'equities', color: 'text-violet-600' },
    { asset: 'commodities', color: 'text-amber-600' },
    { asset: 'reits', color: 'text-rose-600' },
];
export function AllocationPanel({ onSubmit, isSubmitting, disabled }) {
    const { allocation, setAsset, total, isValid, reset } = useAllocation();
    const [showConfirm, setShowConfirm] = useState(false);
    function handleSubmit() {
        if (!isValid)
            return;
        setShowConfirm(true);
    }
    function handleConfirm() {
        setShowConfirm(false);
        onSubmit(allocation);
    }
    return (_jsxs("div", { className: "space-y-5", children: [_jsx("div", { className: "space-y-4", children: SLIDER_CONFIG.map(({ asset, color }) => (_jsx(AllocationSlider, { asset: asset, label: ASSET_CLASS_LABELS[asset], value: allocation[asset], onChange: (val) => setAsset(asset, val), color: color }, asset))) }), _jsx(AllocationSummary, { allocation: allocation, isValid: isValid, total: total }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { onClick: handleSubmit, disabled: !isValid || disabled, loading: isSubmitting, className: "flex-1", children: "Submit Allocation" }), _jsx(Button, { variant: "ghost", onClick: reset, disabled: isSubmitting, children: "Reset" })] }), _jsxs(Dialog, { open: showConfirm, onClose: () => setShowConfirm(false), title: "Confirm Allocation", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Are you sure you want to submit this allocation? This cannot be undone." }), _jsxs("div", { className: "mt-4 space-y-2 rounded-lg bg-gray-50 p-3", children: [SLIDER_CONFIG.map(({ asset }) => (_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: ASSET_CLASS_LABELS[asset] }), _jsxs("span", { className: "font-medium text-gray-900", children: [allocation[asset], "%"] })] }, asset))), _jsxs("div", { className: "mt-1 border-t border-gray-200 pt-2 flex justify-between text-sm font-semibold", children: [_jsx("span", { children: "Total" }), _jsxs("span", { children: [total, "%"] })] })] }), _jsxs("div", { className: "mt-6 flex justify-end gap-3", children: [_jsx(Button, { variant: "secondary", onClick: () => setShowConfirm(false), children: "Cancel" }), _jsx(Button, { onClick: handleConfirm, children: "Confirm & Submit" })] })] })] }));
}
