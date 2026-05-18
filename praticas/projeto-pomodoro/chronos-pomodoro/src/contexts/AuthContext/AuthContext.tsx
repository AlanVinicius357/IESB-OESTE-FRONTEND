import { createContext, type Dispatch } from 'react';
import type { AuthState } from './authReducer';
import type { AuthAction } from './authActions';

export interface AuthContextType {
  state: AuthState;
  dispatch: Dispatch<AuthAction>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);