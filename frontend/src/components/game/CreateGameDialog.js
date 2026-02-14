import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
export function CreateGameDialog({ open, onClose, onCreate, loading, error }) {
    const [name, setName] = useState('');
    const [initialCapital, setInitialCapital] = useState(100_000);
    const [deadline, setDeadline] = useState('');
    const [maxPlayers, setMaxPlayers] = useState('');
    const [round1Deadline, setRound1Deadline] = useState('');
    const [round2Deadline, setRound2Deadline] = useState('');
    const [round3Deadline, setRound3Deadline] = useState('');
    const [round4Deadline, setRound4Deadline] = useState('');
    function handleSubmit(e) {
        e.preventDefault();
        if (!name.trim())
            return;
        const toIso = (val) => (val ? new Date(val).toISOString() : undefined);
        onCreate({
            name: name.trim(),
            initialCapital,
            deadline: toIso(deadline),
            round1Deadline: toIso(round1Deadline),
            round2Deadline: toIso(round2Deadline),
            round3Deadline: toIso(round3Deadline),
            round4Deadline: toIso(round4Deadline),
            maxPlayers: maxPlayers ? parseInt(maxPlayers, 10) : undefined,
        });
    }
    function handleClose() {
        setName('');
        setInitialCapital(100_000);
        setDeadline('');
        setMaxPlayers('');
        setRound1Deadline('');
        setRound2Deadline('');
        setRound3Deadline('');
        setRound4Deadline('');
        onClose();
    }
    const inputClass = 'mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';
    return (_jsx(Dialog, { open: open, onClose: handleClose, title: "Create New Game", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("label", { htmlFor: "gameName", className: "block text-sm font-medium text-gray-700", children: ["Game Name ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { id: "gameName", type: "text", value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g., Training Session Q1", className: inputClass, autoFocus: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "initialCapital", className: "block text-sm font-medium text-gray-700", children: "Initial Capital (EUR)" }), _jsx("input", { id: "initialCapital", type: "number", value: initialCapital, onChange: (e) => setInitialCapital(Number(e.target.value)), min: 1000, step: 1000, className: inputClass })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "deadline", className: "block text-sm font-medium text-gray-700", children: "Game Deadline (optional)" }), _jsx("input", { id: "deadline", type: "datetime-local", value: deadline, onChange: (e) => setDeadline(e.target.value), className: inputClass })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "maxPlayers", className: "block text-sm font-medium text-gray-700", children: "Max Players (optional)" }), _jsx("input", { id: "maxPlayers", type: "number", value: maxPlayers, onChange: (e) => setMaxPlayers(e.target.value), min: 2, placeholder: "No limit", className: inputClass })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Round Deadlines (optional)" }), _jsx("div", { className: "grid grid-cols-2 gap-3", children: [
                                { label: 'Year 2021', value: round1Deadline, setter: setRound1Deadline },
                                { label: 'Year 2022', value: round2Deadline, setter: setRound2Deadline },
                                { label: 'Year 2023', value: round3Deadline, setter: setRound3Deadline },
                                { label: 'Year 2024', value: round4Deadline, setter: setRound4Deadline },
                            ].map(({ label, value, setter }) => (_jsxs("div", { children: [_jsx("label", { className: "block text-xs text-gray-500 mb-1", children: label }), _jsx("input", { type: "datetime-local", value: value, onChange: (e) => setter(e.target.value), className: "block w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" })] }, label))) })] }), error && _jsx("p", { className: "text-sm text-red-600", children: error }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx(Button, { variant: "secondary", type: "button", onClick: handleClose, children: "Cancel" }), _jsx(Button, { type: "submit", loading: loading, disabled: !name.trim(), children: "Create Game" })] })] }) }));
}
