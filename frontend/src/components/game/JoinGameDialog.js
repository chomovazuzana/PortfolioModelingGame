import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
export function JoinGameDialog({ open, onClose, onJoin, loading, error }) {
    const [gameCode, setGameCode] = useState('');
    function handleSubmit(e) {
        e.preventDefault();
        if (gameCode.trim()) {
            onJoin(gameCode.trim().toUpperCase());
        }
    }
    return (_jsx(Dialog, { open: open, onClose: onClose, title: "Join a Game", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "gameCode", className: "block text-sm font-medium text-gray-700", children: "Game Code" }), _jsx("input", { id: "gameCode", type: "text", value: gameCode, onChange: (e) => setGameCode(e.target.value), placeholder: "Enter 6-character code", maxLength: 6, className: "mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase placeholder:normal-case focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500", autoFocus: true })] }), error && _jsx("p", { className: "text-sm text-red-600", children: error }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx(Button, { variant: "secondary", type: "button", onClick: onClose, children: "Cancel" }), _jsx(Button, { type: "submit", loading: loading, disabled: !gameCode.trim(), children: "Join Game" })] })] }) }));
}
