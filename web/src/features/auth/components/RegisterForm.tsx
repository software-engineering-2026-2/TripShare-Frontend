import { useState } from 'react';
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validatePhone,
  validateUsername,
} from '../registerValidation';
import EmailAlreadyRegisteredNotice from './EmailAlreadyRegisteredNotice';

type RegisterField =
  'username' | 'email' | 'phone' | 'password' | 'passwordConfirmation';

type RegisterValues = Record<RegisterField, string>;
type RegisterErrors = Partial<Record<RegisterField, string>>;

const initialValues: RegisterValues = {
  username: '',
  email: '',
  phone: '',
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

export default function RegisterForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [emailAlreadyRegistered, setEmailAlreadyRegistered] = useState(false);

  function handleChange(field: RegisterField, value: string) {
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

  function handleSubmit() {
    const nextErrors = (Object.keys(values) as RegisterField[]).reduce(
      (currentErrors, field) =>
        withFieldError(currentErrors, field, getFieldError(field, values)),
      {} as RegisterErrors,
    );

    setErrors(nextErrors);
    // TODO: quando POST /auth/register retornar e-mail já cadastrado,
    // chamar setEmailAlreadyRegistered(true)
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
          event.preventDefault();
          handleSubmit();
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
              aria-invalid={Boolean(errors.email) || emailAlreadyRegistered}
              aria-describedby={errors.email || emailAlreadyRegistered ? 'email-error' : undefined}
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
            {emailAlreadyRegistered && !errors.email && (
              <EmailAlreadyRegisteredNotice />
            )}
          </div>

          <div className="register-field">
            <label className="register-field__label" htmlFor="phone">
              Telefone
            </label>
            <input
              className="form-control register-field__input"
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="(00) 00000-0000"
              required
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
        </div>

        <button className="form-button register-form__submit" type="submit">
          Cadastrar
        </button>
      </form>
    </>
  );
}
