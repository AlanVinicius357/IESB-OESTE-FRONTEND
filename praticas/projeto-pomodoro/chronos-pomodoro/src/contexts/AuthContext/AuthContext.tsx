import { createContext, type Dispatch } from 'react';
import type { AuthState } from './authReducer';
import type { AuthAction } from './authActions';

interface AuthContextType {
  state: AuthState;
  dispatch: Dispatch<AuthAction>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);