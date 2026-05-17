import { useContext } from 'react';
import { AuthContext } from './AuthContext';
import type { AuthContextType } from './AuthContext';

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuthContext deve ser usado dentro de um AuthContextProvider');
  }
  
  return context;
}