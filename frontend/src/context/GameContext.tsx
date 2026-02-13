import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react';
import type { PlayState, YearResult, SubmitAllocationRequest } from '../shared/types';
import { api } from '../services/api';

interface GameState {
  playState: PlayState | null;
  yearResult: YearResult | null;
  isSubmitting: boolean;
  showResult: boolean;
}

type GameAction =
  | { type: 'SET_PLAY_STATE'; playState: PlayState }
  | { type: 'SET_YEAR_RESULT'; yearResult: YearResult }
  | { type: 'SHOW_RESULT' }
  | { type: 'DISMISS_RESULT' }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean };

function gameReducer(state: GameState, action: GameAction): GameState {
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

interface GameContextValue extends GameState {
  refreshPlayState: () => Promise<void>;
  submitAllocation: (allocation: SubmitAllocationRequest) => Promise<void>;
  dismissResult: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

interface GameProviderProps {
  gameId: string;
  children: ReactNode;
}

export function GameProvider({ gameId, children }: GameProviderProps) {
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

  const submitAllocation = useCallback(async (allocation: SubmitAllocationRequest) => {
    dispatch({ type: 'SET_SUBMITTING', isSubmitting: true });
    try {
      const yearResult = await api.submitAllocation(gameId, allocation);
      dispatch({ type: 'SET_YEAR_RESULT', yearResult });
    } catch (err) {
      dispatch({ type: 'SET_SUBMITTING', isSubmitting: false });
      throw err;
    }
  }, [gameId]);

  const dismissResult = useCallback(() => {
    dispatch({ type: 'DISMISS_RESULT' });
  }, []);

  return (
    <GameContext.Provider
      value={{
        ...state,
        refreshPlayState,
        submitAllocation,
        dismissResult,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return ctx;
}
