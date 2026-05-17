import { TaskContextProvider } from './contexts/TaskContext/TaskContextProvider';
import { MessagesContainer } from './components/MessagesContainer';
import { MainRouter } from './routers/MainRouter';
import { AuthContextProvider } from './contexts/AuthContext/AuthContextProvider';
import { useAuthContext } from './contexts/AuthContext/useAuthContext';
import Login from './pages/Login';

import './styles/theme.css';
import './styles/global.css';

// 1. Criamos um componente interno para gerenciar a renderização condicional baseada no Login
function AppContent() {
  const { state } = useAuthContext();

  // Se NÃO estiver autenticado, a tela exibida obrigatoriamente é o Login
  if (!state.isAuthenticated) {
    return <Login />;
  }

  // Se estiver autenticado, libera o sistema do Chronos Pomodoro normalmente
  return (
    <TaskContextProvider>
      <MessagesContainer>
        <MainRouter />
      </MessagesContainer>
    </TaskContextProvider>
  );
}

// 2. O App global apenas envelopa tudo com o Provider de Autenticação
export function App() {
  return (
    <AuthContextProvider>
      <AppContent />
    </AuthContextProvider>
  );
}