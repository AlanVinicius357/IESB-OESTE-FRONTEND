import type { AuthAction } from './authActions';

export interface AuthState {
  isAuthenticated: boolean;
  user: { email: string } | null;
}

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
};

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    default:
      return state;
  }
}