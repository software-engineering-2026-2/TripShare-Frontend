import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { routes } from '../../../routes/paths';
import ActionButton from '../../../components/action-button/ActionButton';
import { ErrorState } from '../../../components/request-state/RequestState';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  pending: boolean;
  disabled: boolean;
  submitError?: string;
}

export default function LoginForm({
  onSubmit,
  pending,
  disabled,
  submitError,
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) return;
    if (!email.trim() || !password) {
      setValidationError('Preencha o e-mail e a senha.');
      return;
    }
    setValidationError('');
    onSubmit(email.trim(), password);
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-field">
        <label htmlFor="email">E-mail</label>
        <input
          className="form-control"
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
          <Link to={routes.passwordRecovery}>Esqueceu?</Link>
        </div>
        <input
          className="form-control"
          id="password"
          type="password"
          placeholder="Digite sua senha"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>
      {(validationError || submitError) && (
        <ErrorState>{validationError || submitError}</ErrorState>
      )}
      <ActionButton
        className="form-button button-primary"
        type="submit"
        disabled={disabled}
        pending={pending}
        pendingLabel="Entrando..."
      >
        Entrar
      </ActionButton>
      <p className="login-register">
        Não tem uma conta?{' '}
        <Link to={routes.register}>Criar conta gratuita</Link>
      </p>
    </form>
  );
}
