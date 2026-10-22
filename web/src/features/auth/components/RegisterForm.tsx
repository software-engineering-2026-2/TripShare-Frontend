import { FirebaseError } from 'firebase/app';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiError } from '../../../services/api';
import { register, type RegisterProfileInput } from '../../../services/authService';
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordConfirmation,
  validatePhone,
  validateUsername,
} from '../registerValidation';

type RegisterField =
  | 'username'
  | 'name'
  | 'email'
  | 'phone'
  | 'password'
  | 'passwordConfirmation'
  | 'bio'
  | 'hometown';

type RegisterValues = Record<RegisterField, string>;
type RegisterErrors = Partial<Record<RegisterField, string>>;

const initialValues: RegisterValues = {
  username: '',
  name: '',
  email: '',
  phone: '',
  password: '',
  passwordConfirmation: '',
  bio: '',
  hometown: '',
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
    case 'phone':
      return validatePhone(values.phone);
    case 'password':
      return validatePassword(values.password);
    case 'passwordConfirmation':
      return validatePasswordConfirmation(
        values.passwordConfirmation,
        values.password,
      );
    case 'bio':
    case 'hometown':
      return undefined;
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
  const profile: RegisterProfileInput = {
    username: values.username.trim(),
    name: values.name.trim(),
  };

  const phone = values.phone.trim();
  const bio = values.bio.trim();
  const hometown = values.hometown.trim();

  if (phone) {
    profile.phone = phone;
  }

  if (bio) {
    profile.bio = bio;
  }

  if (hometown) {
    profile.hometown = hometown;
  }

  return profile;
}

function getSubmitErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 400) {
      return 'Dados inválidos. Revise os campos e tente novamente.';
    }

    if (error.status === 401) {
      return 'Não foi possível validar sua autenticação. Tente novamente.';
    }

    if (error.status === 409) {
      return 'Este nome de usuário já está em uso ou esta conta já foi cadastrada.';
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

  if (error instanceof TypeError) {
    return 'Falha de conexão. Verifique sua internet e tente novamente.';
  }

  return 'Não foi possível concluir o cadastro. Tente novamente.';
}

export default function RegisterForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  function handleChange(field: RegisterField, value: string) {
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
            getFieldError(fieldToValidate, nextValues),
          ),
        currentErrors,
      );
    });
  }

  function handleBlur(field: RegisterField) {
    setErrors((currentErrors) =>
      withFieldError(currentErrors, field, getFieldError(field, values)),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextErrors = (Object.keys(values) as RegisterField[]).reduce(
      (currentErrors, field) =>
        withFieldError(currentErrors, field, getFieldError(field, values)),
      {} as RegisterErrors,
    );

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await register(values.email.trim(), values.password, buildProfileInput(values));
      navigate('/login');
    } catch (error) {
      setSubmitError(getSubmitErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <p className="register-brand">tripshare</p>

      <header className="register-form__header">
        <h1 className="register-form__title" id="register-title">
          Crie sua conta no TripShare
        </h1>
        <p className="register-form__subtitle">
          Preencha seus dados para começar
        </p>
      </header>

      <div className="register-social">
        <button className="form-button register-google" type="button">
          <svg
            aria-hidden="true"
            focusable="false"
            height="18"
            viewBox="0 0 24 24"
            width="18"
          >
            <path
              fill="#4285F4"
              d="M21.35 12.2c0-.68-.06-1.33-.17-1.95H12v3.69h5.25a4.49 4.49 0 0 1-1.95 2.95v2.45h3.16c1.85-1.7 2.89-4.21 2.89-7.14Z"
            />
            <path
              fill="#34A853"
              d="M12 21.6c2.63 0 4.84-.87 6.46-2.36l-3.16-2.45c-.88.59-2 .94-3.3.94-2.54 0-4.69-1.71-5.46-4.02H3.28v2.52A9.74 9.74 0 0 0 12 21.6Z"
            />
            <path
              fill="#FBBC05"
              d="M6.54 13.71a5.85 5.85 0 0 1 0-3.42V7.77H3.28a9.74 9.74 0 0 0 0 8.46l3.26-2.52Z"
            />
            <path
              fill="#EA4335"
              d="M12 6.27c1.43 0 2.71.49 3.72 1.45l2.79-2.79A9.36 9.36 0 0 0 12 2.4a9.74 9.74 0 0 0-8.72 5.37l3.26 2.52C7.31 7.98 9.46 6.27 12 6.27Z"
            />
          </svg>
          Continuar com o Google
        </button>

        <div className="register-separator">ou preencha com e-mail</div>
      </div>

      <form
        className="register-form"
        noValidate
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <div className="register-form__fields">
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
              aria-invalid={Boolean(errors.username)}
              aria-describedby={errors.username ? 'username-error' : undefined}
              value={values.username}
              onChange={(event) => handleChange('username', event.target.value)}
              onBlur={() => handleBlur('username')}
            />
            {errors.username && (
              <p
                className="register-field__error"
                id="username-error"
                role="alert"
              >
                {errors.username}
              </p>
            )}
          </div>

          <div className="register-field">
            <label className="register-field__label" htmlFor="name">
              Nome completo
            </label>
            <input
              className="form-control register-field__input"
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Seu nome completo"
              maxLength={120}
              required
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'name-error' : undefined}
              value={values.name}
              onChange={(event) => handleChange('name', event.target.value)}
              onBlur={() => handleBlur('name')}
            />
            {errors.name && (
              <p className="register-field__error" id="name-error" role="alert">
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
              autoComplete="email"
              placeholder="seu@email.com"
              required
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              value={values.email}
              onChange={(event) => handleChange('email', event.target.value)}
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
          </div>

          <div className="register-field">
            <label className="register-field__label" htmlFor="phone">
              Telefone (opcional)
            </label>
            <input
              className="form-control register-field__input"
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="(00) 00000-0000"
              maxLength={32}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
              value={values.phone}
              onChange={(event) => handleChange('phone', event.target.value)}
              onBlur={() => handleBlur('phone')}
            />
            {errors.phone && (
              <p
                className="register-field__error"
                id="phone-error"
                role="alert"
              >
                {errors.phone}
              </p>
            )}
          </div>

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
              placeholder="Mínimo 8 caracteres e 1 símbolo"
              required
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
              value={values.password}
              onChange={(event) => handleChange('password', event.target.value)}
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

          <div className="register-field">
            <label className="register-field__label" htmlFor="bio">
              Bio (opcional)
            </label>
            <textarea
              className="form-control register-field__input register-field__textarea"
              id="bio"
              name="bio"
              rows={3}
              autoComplete="off"
              placeholder="Conte um pouco sobre você"
              aria-invalid={Boolean(errors.bio)}
              aria-describedby={errors.bio ? 'bio-error' : undefined}
              value={values.bio}
              onChange={(event) => handleChange('bio', event.target.value)}
            />
            {errors.bio && (
              <p className="register-field__error" id="bio-error" role="alert">
                {errors.bio}
              </p>
            )}
          </div>

          <div className="register-field">
            <label className="register-field__label" htmlFor="hometown">
              Cidade natal (opcional)
            </label>
            <input
              className="form-control register-field__input"
              id="hometown"
              name="hometown"
              type="text"
              autoComplete="off"
              placeholder="Ex.: Campina Grande, PB"
              aria-invalid={Boolean(errors.hometown)}
              aria-describedby={
                errors.hometown ? 'hometown-error' : undefined
              }
              value={values.hometown}
              onChange={(event) => handleChange('hometown', event.target.value)}
            />
            {errors.hometown && (
              <p
                className="register-field__error"
                id="hometown-error"
                role="alert"
              >
                {errors.hometown}
              </p>
            )}
          </div>
        </div>

        {submitError && (
          <p className="register-form__error" role="alert">
            {submitError}
          </p>
        )}

        <button
          className="form-button register-form__submit"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </>
  );
}
