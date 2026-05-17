import { useReducer, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { authReducer, initialAuthState } from './authReducer';

interface AuthContextProviderProps {
  children: ReactNode;
}

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}