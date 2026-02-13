import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
export function CreateGameDialog({ open, onClose, onCreate, loading, error }) {
    const [name, setName] = useState('');
    const [initialCapital, setInitialCapital] = useState(100_000);
    const [deadline, setDeadline] = useState('');
    const [maxPlayers, setMaxPlayers] = useState('');
    function handleSubmit(e) {
        e.preventDefault();
        if (!name.trim())
            return;
        onCreate({
            name: name.trim(),
            initialCapital,
            deadline: deadline || undefined,
            maxPlayers: maxPlayers ? parseInt(maxPlayers, 10) : undefined,
        });
    }
    return (_jsx(Dialog, { open: open, onClose: onClose, title: "Create New Game", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("label", { htmlFor: "gameName", className: "block text-sm font-medium text-gray-700", children: ["Game Name ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { id: "gameName", type: "text", value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g., Training Session Q1", className: "mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500", autoFocus: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "initialCapital", className: "block text-sm font-medium text-gray-700", children: "Initial Capital (EUR)" }), _jsx("input", { id: "initialCapital", type: "number", value: initialCapital, onChange: (e) => setInitialCapital(Number(e.target.value)), min: 1000, step: 1000, className: "mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "deadline", className: "block text-sm font-medium text-gray-700", children: "Deadline (optional)" }), _jsx("input", { id: "deadline", type: "datetime-local", value: deadline, onChange: (e) => setDeadline(e.target.value), className: "mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "maxPlayers", className: "block text-sm font-medium text-gray-700", children: "Max Players (optional)" }), _jsx("input", { id: "maxPlayers", type: "number", value: maxPlayers, onChange: (e) => setMaxPlayers(e.target.value), min: 2, placeholder: "No limit", className: "mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" })] }), error && _jsx("p", { className: "text-sm text-red-600", children: error }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx(Button, { variant: "secondary", type: "button", onClick: onClose, children: "Cancel" }), _jsx(Button, { type: "submit", loading: loading, disabled: !name.trim(), children: "Create Game" })] })] }) }));
}
