import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useReducer, useCallback, } from 'react';
import { api } from '../services/api';
function gameReducer(state, action) {
    switch (action.type) {
        case 'SET_PLAY_STATE':
            return { ...state, playState: action.playState };
        case 'SET_YEAR_RESULT':
            return { ...state, yearResult: action.yearResult, isSubmitting: false, showResult: true };
        case 'SHOW_RESULT':
            return { ...state, showResult: true };
        case 'DISMISS_RESULT':
            return { ...state, showResult: false };
        case 'SET_SUBMITTING':
            return { ...state, isSubmitting: action.isSubmitting };
    }
}
const GameContext = createContext(null);
export function GameProvider({ gameId, children }) {
    const [state, dispatch] = useReducer(gameReducer, {
        playState: null,
        yearResult: null,
        isSubmitting: false,
        showResult: false,
    });
    const refreshPlayState = useCallback(async () => {
        const playState = await api.getPlayState(gameId);
        dispatch({ type: 'SET_PLAY_STATE', playState });
    }, [gameId]);
    const submitAllocation = useCallback(async (allocation) => {
        dispatch({ type: 'SET_SUBMITTING', isSubmitting: true });
        try {
            const yearResult = await api.submitAllocation(gameId, allocation);
            dispatch({ type: 'SET_YEAR_RESULT', yearResult });
        }
        catch (err) {
            dispatch({ type: 'SET_SUBMITTING', isSubmitting: false });
            throw err;
        }
    }, [gameId]);
    const dismissResult = useCallback(() => {
        dispatch({ type: 'DISMISS_RESULT' });
    }, []);
    return (_jsx(GameContext.Provider, { value: {
            ...state,
            refreshPlayState,
            submitAllocation,
            dismissResult,
        }, children: children }));
}
export function useGameContext() {
    const ctx = useContext(GameContext);
    if (!ctx) {
        throw new Error('useGameContext must be used within a GameProvider');
    }
    return ctx;
}
