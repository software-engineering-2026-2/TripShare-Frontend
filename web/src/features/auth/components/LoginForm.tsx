
import { useState, type FormEvent } from 'react';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Preencha o e-mail e a senha.');
      return;
    }

    setLoading(true);

    try {
      await onSubmit(email.trim(), password);
    } catch {
      setError('Não foi possível entrar. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-field">
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          placeholder="seu@email.com"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div className="login-field">
        <div className="login-password-label">
          <label htmlFor="password">Senha</label>
          <a href="/recuperar-senha">Esqueceu?</a>
        </div>

        <input
          id="password"
          type="password"
          placeholder="Digite sua senha"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>

      {error && <p className="login-error" role="alert">{error}</p>}

      <button className="login-submit" type="submit" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>

      <p className="login-register">
        Não tem uma conta? <a href="/cadastro">Criar conta gratuita</a>
      </p>
    </form>
  );
}
