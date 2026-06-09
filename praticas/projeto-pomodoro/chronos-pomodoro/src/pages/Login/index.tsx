import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '../../contexts/AuthContext/useAuthContext';
import styles from './styles.module.css';

export default function Login() {
  // 🌟 Pegando as funções reais conectadas ao Back-end do Docker
  const { signIn, signUp } = useAuthContext();
  
  // Estados dos inputs comuns
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // 🌟 Estado exclusivo para o formulário de cadastro
  const [name, setName] = useState('');

  // Estados de feedback e controle de tela
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [viewMode, setViewMode] = useState<'login' | 'register' | 'recovery'>('login');

  const emailInputRef = useRef<HTMLInputElement>(null);
  const registerNameRef = useRef<HTMLInputElement>(null);

  // UX: Foca automaticamente no campo principal ao mudar de tela
  useEffect(() => {
    if (viewMode === 'login' && emailInputRef.current) {
      emailInputRef.current.focus();
    } else if (viewMode === 'register' && registerNameRef.current) {
      registerNameRef.current.focus();
    }
  }, [viewMode]);

  // UX: Limpa as mensagens de erro/sucesso após 4 segundos automaticamente
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => setFeedbackMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  // 🔑 ENVIO DO LOGIN (Conectado à API)
  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      setFeedbackMessage('⚠️ Por favor, preencha todos os campos.');
      return;
    }

    setFeedbackMessage('⏳ Validando credenciais...');
    
    // Chama a função real da API
    const result = await signIn(email, password);

    if (result.success) {
      setFeedbackMessage('🎉 Login efetuado com sucesso! Entrando...');
    } else {
      setFeedbackMessage(`❌ ${result.error || 'Usuário ou senha incorretos.'}`);
    }
  };

  // 📝 ENVIO DO CADASTRO REAL (Conectado à API)
  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setFeedbackMessage('⚠️ Por favor, preencha todos os campos.');
      return;
    }

    if (password.length < 4) {
      setFeedbackMessage('⚠️ A senha deve ter pelo menos 4 caracteres.');
      return;
    }

    setFeedbackMessage('⏳ Criando sua conta...');

    // Chama a função real da API
    const result = await signUp(name, email, password);

    if (result.success) {
      setFeedbackMessage('🎉 Conta criada com sucesso! Faça seu login.');
      // Limpa os campos e joga o usuário de volta para a tela de login
      setName('');
      setPassword('');
      setViewMode('login');
    } else {
      setFeedbackMessage(`❌ ${result.error || 'Erro ao criar conta.'}`);
    }
  };

  // 🔄 Função para resetar estados ao mudar de modo
  const changeMode = (mode: 'login' | 'register' | 'recovery') => {
    setFeedbackMessage('');
    setEmail('');
    setPassword('');
    setName('');
    setViewMode(mode);
  };

  // ==========================================
  // RENDER: TELA DE CADASTRO REAL
  // ==========================================
  if (viewMode === 'register') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.title}>Criar Conta</h2>
          
          {feedbackMessage && (
            <div className={styles.feedback} aria-live="polite">
              {feedbackMessage}
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="reg-name">Nome Completo:</label>
              <input
                id="reg-name"
                type="text"
                ref={registerNameRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                autoComplete="off"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="reg-email">E-mail:</label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu-email@exemplo.com"
                autoComplete="off"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="reg-password">Senha:</label>
              <input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                autoComplete="new-password"
                required
              />
            </div>

            <button type="submit" className={styles.submitButton}>
              Cadastrar
            </button>
          </form>

          <button className={styles.linkButton} onClick={() => changeMode('login')}>
            Voltar para o Login
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: TELA DE RECUPERAÇÃO SIMULADA
  // ==========================================
  if (viewMode === 'recovery') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.title}>Recuperar Senha</h2>
          <p className={styles.infoText}>Fluxo de recuperação de senha será integrado via rotas de e-mail da API.</p>
          <button className={styles.linkButton} onClick={() => changeMode('login')}>
            Voltar para o Login
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: TELA DE LOGIN REAL
  // ==========================================
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.mainTitle}>Chronos Pomodoro</h1>
        
        {feedbackMessage && (
          <div className={styles.feedback} aria-live="polite">
            {feedbackMessage}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">E-mail ou Usuário:</label>
            <input
              id="email"
              type="email"
              ref={emailInputRef}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: aluno@chronos.com"
              autoComplete="off"
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
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Entrar
          </button>
        </form>

        <div className={styles.actions}>
          <button className={styles.linkButton} onClick={() => changeMode('register')}>
            Não tem conta? Cadastre-se
          </button>
          <button className={styles.linkButton} onClick={() => changeMode('recovery')}>
            Esqueci minha senha
          </button>
        </div>
      </div>
    </div>
  );
}