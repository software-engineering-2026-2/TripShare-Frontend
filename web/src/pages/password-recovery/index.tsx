import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import AuthLayout from '../../templates/AuthLayout';
import ActionButton from '../../components/action-button/ActionButton';
import { ErrorState } from '../../components/request-state/RequestState';
import { requestPasswordReset } from '../../resources/auth/passwordRecovery';
import { validateEmail } from '../../resources/auth/validation';
import { routes } from '../../routes/paths';
import '../login/styles.css';

export default function PasswordRecoveryPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const reset = useMutation({ mutationFn: requestPasswordReset, gcTime: 0 });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (reset.isPending) return;
    const error = validateEmail(email);
    setEmailError(error);
    if (error) return;
    try {
      await reset.mutateAsync(email.trim());
    } catch {
      // A mutação exibe um erro genérico, sem expor dados da conta.
    }
  }

  return (
    <AuthLayout labelledBy="password-recovery-title">
      <header className="auth-heading">
        <h1 id="password-recovery-title">Recuperar senha</h1>
        <p>Informe seu e-mail para solicitar as instruções de redefinição.</p>
      </header>
      <p>
        Se você criou sua conta apenas com o Google, recupere o acesso pela sua
        conta Google.
      </p>
      <form
        className="login-form"
        noValidate
        onSubmit={(event) => void submit(event)}
      >
        <div className="login-field">
          <label htmlFor="recovery-email">E-mail</label>
          <input
            className="form-control"
            id="recovery-email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            disabled={reset.isPending}
            value={email}
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? 'recovery-email-error' : undefined}
            onChange={(event) => {
              setEmail(event.target.value);
              setEmailError(undefined);
              reset.reset();
            }}
          />
          {emailError && (
            <p id="recovery-email-error" role="alert">
              {emailError}
            </p>
          )}
        </div>
        <ActionButton
          className="form-button button-primary"
          type="submit"
          pending={reset.isPending}
          pendingLabel="Enviando..."
        >
          Enviar instruções
        </ActionButton>
        {reset.isSuccess && (
          <p role="status">
            Se houver uma conta com senha para este e-mail, você receberá as
            instruções de recuperação. Confira também a pasta de spam.
          </p>
        )}
        {reset.isError && (
          <ErrorState>
            Não foi possível enviar a solicitação. Tente novamente mais tarde.
          </ErrorState>
        )}
      </form>
      <Link to={routes.login}>Voltar ao login</Link>
    </AuthLayout>
  );
}
