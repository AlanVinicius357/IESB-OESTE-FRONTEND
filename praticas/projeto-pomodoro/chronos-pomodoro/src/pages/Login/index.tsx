import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '../../contexts/AuthContext/useAuthContext';
import styles from './styles.module.css';

export default function Login() {
  const { dispatch } = useAuthContext();
  
  // Estados dos inputs controlados
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Estados de feedback e controle de tela simulada (Modo de Visualização)
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [viewMode, setViewMode] = useState<'login' | 'register' | 'recovery'>('login');

  const emailInputRef = useRef<HTMLInputElement>(null);

  // UX: Foca automaticamente no campo de usuário ao carregar a tela de login
  useEffect(() => {
    if (viewMode === 'login' && emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [viewMode]);

  // UX: Limpa as mensagens de erro/sucesso após 4 segundos automaticamente
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => setFeedbackMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  // Credenciais mockadas (fixas no front-end conforme o enunciado)
  const MOCK_USER = "aluno@chronos.com";
  const MOCK_PASSWORD = "123";

  // Tipagem moderna do evento do formulário que resolve os avisos do TypeScript
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      setFeedbackMessage('⚠️ Por favor, preencha todos os campos.');
      return;
    }

    // Validação simulada
    if (email === MOCK_USER && password === MOCK_PASSWORD) {
      setFeedbackMessage('🎉 Login efetuado com sucesso! Entrando...');
      
      // Pequeno delay para o usuário ler o feedback de sucesso antes de mudar de tela
      setTimeout(() => {
        dispatch({ type: 'LOGIN', payload: { email } });
      }, 1500);
    } else {
      setFeedbackMessage('❌ Usuário ou senha incorretos.');
    }
  };

  // Renderização Condicional: Tela de Cadastro Simulada
  if (viewMode === 'register') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.title}>Criar Conta</h2>
          <p className={styles.infoText}>Fluxo de cadastro ainda será implementado em etapas futuras.</p>
          <button className={styles.linkButton} onClick={() => setViewMode('login')}>
            Voltar para o Login
          </button>
        </div>
      </div>
    );
  }

  // Renderização Condicional: Tela de Recuperação Simulada
  if (viewMode === 'recovery') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.title}>Recuperar Senha</h2>
          <p className={styles.infoText}>Fluxo de recuperação de senha ainda será implementado em etapas futuras.</p>
          <button className={styles.linkButton} onClick={() => setViewMode('login')}>
            Voltar para o Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.mainTitle}>Chronos Pomodoro</h1>
        
        {/* Feedback visual básico para acessibilidade e UX */}
        {feedbackMessage && (
          <div className={styles.feedback} aria-live="polite">
            {feedbackMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">E-mail ou Usuário:</label>
            <input
              id="email"
              type="email"
              ref={emailInputRef}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: aluno@chronos.com"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Senha:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              required
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Entrar
          </button>
        </form>

        <div className={styles.actions}>
          <button className={styles.linkButton} onClick={() => setViewMode('register')}>
            Não tem conta? Cadastre-se
          </button>
          <button className={styles.linkButton} onClick={() => setViewMode('recovery')}>
            Esqueci minha senha
          </button>
        </div>
      </div>
    </div>
  );
}