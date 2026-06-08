import { useReducer, useEffect, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { authReducer, initialAuthState } from './authReducer';

interface AuthContextProviderProps {
  children: ReactNode;
}

// 🌐 URL configurada para usar o Proxy do Vite e evitar bloqueio de CORS
const API_URL = 'http://localhost:5173/api';

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // 🔄 1. AUTO-LOGIN: Mantém a sessão ativa caso a página seja recarregada
  useEffect(() => {
    const storedToken = localStorage.getItem('@chronos:token');
    const storedUser = localStorage.getItem('@chronos:user');

    if (storedToken && storedUser) {
      dispatch({ 
        type: 'LOGIN', 
        payload: JSON.parse(storedUser) 
      });
    }
  }, []);

  // 🔑 2. FUNÇÃO DE LOGIN (Com tratamento flexível de resposta da API)
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

      // 🔍 Mapeia de onde veio o e-mail (caso a API mude o padrão do objeto)
      const loggedEmail = data.user?.email || data.email || email;

      // Armazena com segurança os dados da sessão no navegador
      localStorage.setItem('@chronos:token', data.token || '');
      localStorage.setItem('@chronos:user', JSON.stringify({ email: loggedEmail }));

      // Atualiza o estado global para liberar o painel Pomodoro
      dispatch({ type: 'LOGIN', payload: { email: loggedEmail } });
      
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login.';
      return { success: false, error: errorMessage };
    }
  }

  // 📝 3. FUNÇÃO DE CADASTRO
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

  // 🚪 4. FUNÇÃO DE LOGOUT (Limpa o armazenamento e reseta o estado)
  function signOut() {
    localStorage.removeItem('@chronos:token');
    localStorage.removeItem('@chronos:user');
    dispatch({ type: 'LOGOUT' });
  }

  return (
    <AuthContext.Provider value={{ state, dispatch, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}