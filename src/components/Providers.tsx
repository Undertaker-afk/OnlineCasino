'use client';

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { User, GameState } from '@/types';
import { createAnonymousUser } from '@/lib/auth';

interface AppState {
  user: User | null;
  gameState: GameState;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AppAction {
  type: string;
  payload?: any;
}

const initialState: AppState = {
  user: null,
  gameState: {
    balance: 1000,
    isPlaying: false,
    isLoading: false,
  },
  isAuthenticated: false,
  isLoading: true,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        gameState: {
          ...state.gameState,
          balance: action.payload?.balance || 1000,
        },
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'UPDATE_BALANCE':
      return {
        ...state,
        user: state.user ? { ...state.user, balance: action.payload } : null,
        gameState: {
          ...state.gameState,
          balance: action.payload,
        },
      };
    case 'SET_GAME_LOADING':
      return {
        ...state,
        gameState: {
          ...state.gameState,
          isLoading: action.payload,
        },
      };
    case 'SET_PLAYING':
      return {
        ...state,
        gameState: {
          ...state.gameState,
          isPlaying: action.payload,
        },
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: (action: AppAction) => void;
  loginAnonymous: () => void;
  logout: () => void;
} | null>(null);

export function Providers({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const loginAnonymous = () => {
    const anonymousUser = createAnonymousUser();
    dispatch({ type: 'SET_USER', payload: anonymousUser });
    localStorage.setItem('casino_user', JSON.stringify(anonymousUser));
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('casino_user');
    localStorage.removeItem('casino_token');
  };

  useEffect(() => {
    // Benutzer aus localStorage laden
    const savedUser = localStorage.getItem('casino_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'SET_USER', payload: user });
      } catch (error) {
        console.error('Fehler beim Laden des Benutzers:', error);
      }
    }
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, loginAnonymous, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp muss innerhalb von Providers verwendet werden');
  }
  return context;
}
