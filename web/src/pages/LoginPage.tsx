
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../features/auth/components/LoginForm';
import '../css/login.css';
import { ApiError } from '../services/api';
import {
  getCurrentUserProfile,
  login,
  loginWithGoogle,
} from '../services/authService';

export default function LoginPage() {
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  async function handleLogin(email: string, password: string) {
    await login(email, password);
    //await getCurrentUserProfile();

    //console.log(
    //'Usuário autenticado:',
    //auth.currentUser?.email,
    //);
  }

  async function handleGoogleLogin() {
    setGoogleError('');
    setGoogleLoading(true);

    try {
      await loginWithGoogle();
      await getCurrentUserProfile();
      navigate('/minhas-viagens', { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        navigate('/cadastro', { replace: true });
        return;
      }

      setGoogleError('Não foi possível entrar com o Google. Tente novamente.');
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-banner">
        <a className="login-brand" href="/">tripshare</a>

        <div className="login-banner-content">
          <h1>
            Roteiros fáceis
            <br />
            Crie e compartilhe
          </h1>

          <p>
            Acesse o site para criar, gerenciar roteiros
            <br />
            inteligentes e roteiros da comunidade.
          </p>
        </div>
      </section>

      <section className="login-content">
        <div className="login-container">
          <header className="login-header">
            <h2>Entrar na conta</h2>
            <p>Digite suas credenciais para continuar</p>
          </header>

          <button
            className="login-google"
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            <span aria-hidden="true" className="google-symbol">G</span>
            {googleLoading ? 'Conectando...' : 'Continuar com o Google'}
          </button>
          {googleError && <p className="login-error" role="alert">{googleError}</p>}

          <div className="login-divider">
            <span />
            <p>ou com e-mail</p>
            <span />
          </div>

          <LoginForm onSubmit={handleLogin} />
        </div>
      </section>
    </main>
  );
}
