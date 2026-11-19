import GoogleMark from '../../components/google-mark/GoogleMark';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ApiError, ApiTransportError } from '../../resources/client/http';
import { login, loginWithGoogle } from '../../resources/auth/flow';
import { routes } from '../../routes/paths';
import AuthLayout from '../../templates/AuthLayout';
import ActionButton from '../../components/action-button/ActionButton';
import { ErrorState } from '../../components/request-state/RequestState';
import { useMountedRef } from '../../hooks/useMountedRef';
import LoginForm from './components/LoginForm';
import './styles.css';

type LoginInput =
  | { provider: 'password'; email: string; password: string }
  | { provider: 'google' };

export default function LoginPage() {
  const navigate = useNavigate();
  const mounted = useMountedRef();
  const action = useMutation({
    gcTime: 0,
    mutationFn: (input: LoginInput) =>
      input.provider === 'google'
        ? loginWithGoogle()
        : login(input.email, input.password),
  });
  const usingGoogle = action.variables?.provider === 'google';
  const error = action.error;
  const message =
    error instanceof ApiError && error.status === 403
      ? 'Seu perfil está suspenso.'
      : usingGoogle
        ? 'Não foi possível entrar com o Google. Tente novamente.'
        : error instanceof ApiError || error instanceof ApiTransportError
          ? 'Não foi possível consultar seu perfil. Tente novamente.'
          : 'Não foi possível entrar. Verifique suas credenciais.';

  async function submit(input: LoginInput) {
    if (action.isPending) return;
    try {
      const profile = await action.mutateAsync(input);
      if (mounted.current)
        navigate(profile ? routes.trips : routes.register, { replace: true });
    } catch {
      // A mutação mantém o erro até a próxima tentativa.
    }
  }

  return (
    <AuthLayout labelledBy="login-title">
      <header className="auth-heading">
        <h1 id="login-title">Entrar na conta</h1>
        <p>Digite suas credenciais para continuar.</p>
      </header>

      <ActionButton
        className="form-button button-secondary login-google"
        type="button"
        onClick={() => void submit({ provider: 'google' })}
        pending={action.isPending && usingGoogle}
        pendingLabel="Conectando..."
        disabled={action.isPending}
      >
        <GoogleMark />
        Continuar com o Google
      </ActionButton>
      {error && usingGoogle && <ErrorState>{message}</ErrorState>}

      <div className="auth-divider">ou com e-mail</div>

      <LoginForm
        onSubmit={(email, password) =>
          void submit({ provider: 'password', email, password })
        }
        pending={action.isPending && !usingGoogle}
        disabled={action.isPending}
        submitError={error && !usingGoogle ? message : undefined}
      />
    </AuthLayout>
  );
}
