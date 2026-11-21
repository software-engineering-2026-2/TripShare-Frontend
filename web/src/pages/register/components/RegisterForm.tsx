import GoogleMark from '../../../components/google-mark/GoogleMark';
import { useMutation } from '@tanstack/react-query';
import { useMountedRef } from '../../../hooks/useMountedRef';
import ActionButton from '../../../components/action-button/ActionButton';
import { ErrorState } from '../../../components/request-state/RequestState';
import { routes } from '../../../routes/paths';
import { FirebaseError } from 'firebase/app';
import type { User } from 'firebase/auth';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { ApiError, ApiTransportError } from '../../../resources/client/http';
import {
  AuthFlowError,
  completeRegistration,
  logout,
  register,
} from '../../../resources/auth/flow';
import type { RegisterProfileInput } from '../../../resources/api/auth/contract';
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordConfirmation,
  validateUsername,
} from '../../../resources/auth/validation';
import EmailAlreadyRegisteredNotice from './EmailAlreadyRegisteredNotice';

type RegisterField =
  'username' | 'name' | 'email' | 'password' | 'passwordConfirmation';

type RegisterValues = Record<RegisterField, string>;
type RegisterErrors = Partial<Record<RegisterField, string>>;

const initialValues: RegisterValues = {
  username: '',
  name: '',
  email: '',
  password: '',
  passwordConfirmation: '',
};

function getFieldError(
  field: RegisterField,
  values: RegisterValues,
): string | undefined {
  switch (field) {
    case 'username':
      return validateUsername(values.username);
    case 'name':
      return validateName(values.name);
    case 'email':
      return validateEmail(values.email);
    case 'password':
      return validatePassword(values.password);
    case 'passwordConfirmation':
      return validatePasswordConfirmation(
        values.passwordConfirmation,
        values.password,
      );
  }
}

function withFieldError(
  errors: RegisterErrors,
  field: RegisterField,
  error: string | undefined,
): RegisterErrors {
  const nextErrors = { ...errors };

  if (error) {
    nextErrors[field] = error;
  } else {
    delete nextErrors[field];
  }

  return nextErrors;
}

function buildProfileInput(values: RegisterValues): RegisterProfileInput {
  return {
    username: values.username.trim(),
    name: values.name.trim(),
  };
}

function getSubmitErrorMessage(error: unknown): string {
  if (error instanceof AuthFlowError) return error.message;
  if (error instanceof ApiError) {
    if (error.status === 400) {
      return 'Dados inválidos. Revise os campos e tente novamente.';
    }

    if (error.status === 401) {
      return 'Não foi possível validar sua autenticação. Tente novamente.';
    }

    if (error.status === 403) {
      return 'Seu perfil está suspenso.';
    }

    return 'Não foi possível concluir o cadastro. Tente novamente.';
  }

  if (error instanceof FirebaseError) {
    if (error.code === 'auth/invalid-email') {
      return 'Informe um e-mail válido.';
    }

    if (error.code === 'auth/weak-password') {
      return 'A senha é muito fraca. Escolha uma senha mais forte.';
    }

    if (
      error.code === 'auth/email-already-in-use' ||
      error.code === 'auth/invalid-credential' ||
      error.code === 'auth/wrong-password'
    ) {
      return 'Este e-mail já está cadastrado. Faça login ou use outro e-mail.';
    }

    if (error.code === 'auth/network-request-failed') {
      return 'Falha de conexão. Verifique sua internet e tente novamente.';
    }

    return 'Não foi possível criar a conta. Tente novamente.';
  }

  if (error instanceof ApiTransportError) return error.message;

  if (error instanceof TypeError) {
    return 'Falha de conexão. Verifique sua internet e tente novamente.';
  }

  return 'Não foi possível concluir o cadastro. Tente novamente.';
}

export default function RegisterForm({
  user: initialUser = null,
}: {
  user?: User | null;
}) {
  const [registrationUser] = useState(initialUser);
  const user = initialUser ? registrationUser : null;
  const [values, setValues] = useState(() => ({
    ...initialValues,
    email: user?.email ?? '',
    name: user?.displayName ?? '',
  }));
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  const [acceptanceError, setAcceptanceError] = useState(false);
  const termsUrl = import.meta.env.VITE_TERMS_OF_USE_URL;
  const privacyUrl = import.meta.env.VITE_PRIVACY_POLICY_URL;
  const policiesAvailable = Boolean(termsUrl && privacyUrl);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [emailAlreadyRegistered, setEmailAlreadyRegistered] = useState(false);
  const [usernameConflict, setUsernameConflict] = useState(false);
  const usernameError =
    errors.username ||
    (usernameConflict
      ? 'Nome de usuário ou e-mail já cadastrado. Escolha outro nome de usuário ou entre na sua conta.'
      : undefined);
  const navigate = useNavigate();
  const mounted = useMountedRef();
  const registration = useMutation({
    mutationFn: () =>
      user
        ? completeRegistration(user.uid, buildProfileInput(values))
        : register(
            values.email.trim(),
            values.password,
            buildProfileInput(values),
          ),
  });
  const exit = useMutation({ mutationFn: logout });
  const isSubmitting = registration.isPending || exit.isPending;
  const submitError = exit.error
    ? 'Não foi possível sair. Tente novamente.'
    : !emailAlreadyRegistered &&
      registration.error &&
      !(
        registration.error instanceof ApiError &&
        registration.error.status === 409
      ) &&
      getSubmitErrorMessage(registration.error);

  function validateField(field: RegisterField, nextValues: RegisterValues) {
    if (user && ['email', 'password', 'passwordConfirmation'].includes(field))
      return undefined;
    return getFieldError(field, nextValues);
  }

  function handleChange(field: RegisterField, value: string) {
    if (field === 'username' || field === 'email') setUsernameConflict(false);
    if (field === 'email') {
      setEmailAlreadyRegistered(false);
    }
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);

    setErrors((currentErrors) => {
      const fieldsToValidate: RegisterField[] = [];

      if (currentErrors[field]) {
        fieldsToValidate.push(field);
      }

      if (field === 'password' && currentErrors.passwordConfirmation) {
        fieldsToValidate.push('passwordConfirmation');
      }

      if (fieldsToValidate.length === 0) {
        return currentErrors;
      }

      return fieldsToValidate.reduce(
        (nextErrors, fieldToValidate) =>
          withFieldError(
            nextErrors,
            fieldToValidate,
            validateField(fieldToValidate, nextValues),
          ),
        currentErrors,
      );
    });
  }

  function handleBlur(field: RegisterField) {
    setErrors((currentErrors) =>
      withFieldError(currentErrors, field, validateField(field, values)),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextErrors = (Object.keys(values) as RegisterField[]).reduce(
      (currentErrors, field) =>
        withFieldError(currentErrors, field, validateField(field, values)),
      {} as RegisterErrors,
    );

    setErrors(nextErrors);
    setAcceptanceError(!acceptedPolicies);

    if (
      !policiesAvailable ||
      !acceptedPolicies ||
      Object.keys(nextErrors).length > 0
    ) {
      return;
    }

    exit.reset();
    setEmailAlreadyRegistered(false);
    setUsernameConflict(false);
    try {
      await registration.mutateAsync();
      if (!mounted.current) return;
      toast.success('Cadastro realizado com sucesso!', { duration: 5000 });
      navigate(routes.trips, { replace: true });
    } catch (error) {
      if (
        mounted.current &&
        error instanceof ApiError &&
        error.status === 409
      ) {
        setUsernameConflict(true);
      }
      if (
        mounted.current &&
        error instanceof FirebaseError &&
        error.code === 'auth/email-already-in-use'
      ) {
        setEmailAlreadyRegistered(true);
      }
    }
  }

  async function handleSwitchAccount() {
    if (isSubmitting) return;
    registration.reset();
    try {
      await exit.mutateAsync();
      if (mounted.current) navigate(routes.login, { replace: true });
    } catch {
      // O formulário exibe o erro da mutação.
    }
  }

  return (
    <>
      <header className="auth-heading">
        <h1 className="register-form__title" id="register-title">
          {user
            ? 'Complete seu cadastro no TripShare'
            : 'Crie sua conta no TripShare'}
        </h1>
        <p className="register-form__subtitle">
          {user
            ? 'Sua conta já está conectada. Complete seu perfil para continuar.'
            : 'Preencha seus dados para começar'}
        </p>
      </header>

      {!user && (
        <div className="register-social">
          <button
            className="form-button button-secondary"
            type="button"
            disabled
          >
            <GoogleMark />
            Continuar com o Google
          </button>

          <div className="auth-divider">ou preencha com e-mail</div>
        </div>
      )}

      <form
        className="register-form"
        noValidate
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <fieldset className="register-form__fields" disabled={isSubmitting}>
          <fieldset className="register-group">
            <legend>Dados pessoais</legend>
            <div className="register-group__fields">
              <div className="register-field">
                <label className="register-field__label" htmlFor="username">
                  Nome de usuário
                </label>
                <input
                  className="form-control register-field__input"
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Escolha um nome de usuário"
                  maxLength={50}
                  required
                  aria-invalid={Boolean(usernameError)}
                  aria-describedby={
                    usernameError ? 'username-error' : undefined
                  }
                  value={values.username}
                  onChange={(event) =>
                    handleChange('username', event.target.value)
                  }
                  onBlur={() => handleBlur('username')}
                />
                {usernameError && (
                  <p
                    className="register-field__error"
                    id="username-error"
                    role="alert"
                  >
                    {usernameError}
                  </p>
                )}
              </div>

              <div className="register-field">
                <label className="register-field__label" htmlFor="name">
                  Nome de exibição
                </label>
                <input
                  className="form-control register-field__input"
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Seu nome de exibição"
                  maxLength={120}
                  required
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  value={values.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                  onBlur={() => handleBlur('name')}
                />
                {errors.name && (
                  <p
                    className="register-field__error"
                    id="name-error"
                    role="alert"
                  >
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="register-field">
                <label className="register-field__label" htmlFor="email">
                  E-mail
                </label>
                <input
                  className="form-control register-field__input"
                  id="email"
                  name="email"
                  type="email"
                  readOnly={Boolean(user)}
                  autoComplete="email"
                  placeholder="seu@email.com"
                  required
                  aria-invalid={Boolean(errors.email) || emailAlreadyRegistered}
                  aria-describedby={
                    errors.email || emailAlreadyRegistered
                      ? 'email-error'
                      : undefined
                  }
                  value={values.email}
                  onChange={(event) =>
                    handleChange('email', event.target.value)
                  }
                  onBlur={() => handleBlur('email')}
                />
                {errors.email && (
                  <p
                    className="register-field__error"
                    id="email-error"
                    role="alert"
                  >
                    {errors.email}
                  </p>
                )}
                {emailAlreadyRegistered && !errors.email && (
                  <EmailAlreadyRegisteredNotice />
                )}
              </div>
            </div>
          </fieldset>
          {!user && (
            <fieldset className="register-group">
              <legend>Senha de acesso</legend>
              <div className="register-group__fields">
                {!user && (
                  <div className="register-field">
                    <label className="register-field__label" htmlFor="password">
                      Senha
                    </label>
                    <input
                      className="form-control register-field__input"
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Escolha uma senha"
                      required
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={
                        errors.password ? 'password-error' : undefined
                      }
                      value={values.password}
                      onChange={(event) =>
                        handleChange('password', event.target.value)
                      }
                      onBlur={() => handleBlur('password')}
                    />
                    {errors.password && (
                      <p
                        className="register-field__error"
                        id="password-error"
                        role="alert"
                      >
                        {errors.password}
                      </p>
                    )}
                  </div>
                )}

                {!user && (
                  <div className="register-field">
                    <label
                      className="register-field__label"
                      htmlFor="password-confirmation"
                    >
                      Confirmação de senha
                    </label>
                    <input
                      className="form-control register-field__input"
                      id="password-confirmation"
                      name="passwordConfirmation"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Repita sua senha"
                      required
                      aria-invalid={Boolean(errors.passwordConfirmation)}
                      aria-describedby={
                        errors.passwordConfirmation
                          ? 'password-confirmation-error'
                          : undefined
                      }
                      value={values.passwordConfirmation}
                      onChange={(event) =>
                        handleChange('passwordConfirmation', event.target.value)
                      }
                      onBlur={() => handleBlur('passwordConfirmation')}
                    />
                    {errors.passwordConfirmation && (
                      <p
                        className="register-field__error"
                        id="password-confirmation-error"
                        role="alert"
                      >
                        {errors.passwordConfirmation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </fieldset>
          )}
          <div className="register-consent">
            <div className="register-consent__control">
              <input
                id="accept-policies"
                type="checkbox"
                required
                checked={acceptedPolicies}
                disabled={!policiesAvailable}
                aria-invalid={acceptanceError}
                aria-describedby={
                  acceptanceError ? 'accept-policies-error' : undefined
                }
                onChange={(event) => {
                  setAcceptedPolicies(event.target.checked);
                  setAcceptanceError(false);
                }}
              />
              <label htmlFor="accept-policies">
                Li e aceito os{' '}
                <a href={termsUrl} target="_blank" rel="noopener noreferrer">
                  Termos de Uso
                </a>{' '}
                e a{' '}
                <a href={privacyUrl} target="_blank" rel="noopener noreferrer">
                  Política de Privacidade
                </a>
                .
              </label>
            </div>
            {acceptanceError && (
              <p
                id="accept-policies-error"
                className="register-field__error"
                role="alert"
              >
                Aceite os Termos de Uso e a Política de Privacidade para
                continuar.
              </p>
            )}
            {!policiesAvailable && (
              <p className="register-field__error" role="alert">
                Os documentos legais estão indisponíveis. Tente novamente mais
                tarde.
              </p>
            )}
          </div>
        </fieldset>

        {submitError && <ErrorState>{submitError}</ErrorState>}

        <ActionButton
          className="form-button button-primary"
          type="submit"
          pending={registration.isPending}
          pendingLabel="Cadastrando..."
          disabled={exit.isPending}
        >
          Cadastrar
        </ActionButton>
      </form>
      {user ? (
        <button
          className="form-button button-secondary"
          type="button"
          disabled={isSubmitting}
          onClick={() => void handleSwitchAccount()}
        >
          Usar outra conta
        </button>
      ) : (
        <p>
          Já tem uma conta? <Link to={routes.login}>Entrar</Link>
        </p>
      )}
    </>
  );
}
