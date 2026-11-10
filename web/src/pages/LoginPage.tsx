
import { Link, useNavigate } from 'react-router-dom';
import LoginForm from '../features/auth/components/LoginForm';
import '../css/login.css';
// import { login, getCurrentUserProfile } from '../services/authService';
import { login } from '../services/authService';

export default function LoginPage() {
  const navigate = useNavigate();

  async function handleLogin(email: string, password: string) {
    await login(email, password);
    //await getCurrentUserProfile();

    //console.log(
    //'Usuário autenticado:',
    //auth.currentUser?.email,
    //);

    navigate('/minhas-viagens');
  }

  return (
    <main className="login-page">
      <section className="login-banner">
        <Link className="login-brand" to="/">tripshare</Link>

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

          <button className="login-google" type="button" disabled>
            <span aria-hidden="true" className="google-symbol">G</span>
            Continuar com o Google
          </button>

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
