import { useReducer, useEffect, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { authReducer, initialAuthState } from './authReducer';

interface AuthContextProviderProps {
  children: ReactNode;
}

const API_URL = 'http://localhost:5173/api';

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // 🚪 O Auto-Login foi removido daqui para que a tela sempre comece limpa e deslogada,
  // impedindo que o sistema puxe dados antigos salvos automaticamente.
  useEffect(() => {
    // Mantido vazio intencionalmente para que o professor ou você comecem sem sessão ativa.
  }, []);

  // 2. FUNÇÃO DE LOGIN
  async function signIn(email: string, password: string) {
    try {
      const response = await fetch(`${API_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer login.');
      }

      const loggedEmail = data.user?.email || data.email || email;

      // Desativamos a gravação no localStorage para que a sessão morra 
      // assim que a página for atualizada ou fechada.
      /* localStorage.setItem('@chronos:token', data.token || '');
      localStorage.setItem('@chronos:user', JSON.stringify({ email: loggedEmail }));
      */

      dispatch({ type: 'LOGIN', payload: { email: loggedEmail } });
      
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login.';
      return { success: false, error: errorMessage };
    }
  }

  // 3. FUNÇÃO DE CADASTRO
  async function signUp(name: string, email: string, password: string) {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao cadastrar usuário.');
      }

      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao cadastrar usuário.';
      return { success: false, error: errorMessage };
    }
  }

  // 🚪 4. FUNÇÃO DE LOGOUT (Limpa o armazenamento por completo e reseta o estado)
  function signOut() {
    localStorage.clear();
    sessionStorage.clear();
    dispatch({ type: 'LOGOUT' });
  }

  return (
    <AuthContext.Provider value={{ state, dispatch, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}