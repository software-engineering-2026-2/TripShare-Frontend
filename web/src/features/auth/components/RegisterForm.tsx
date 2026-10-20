export default function RegisterForm() {
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
        <button className="register-google" type="button">
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
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="register-form__fields">
          <div className="register-field">
            <label className="register-field__label" htmlFor="username">
              Nome de usuário
            </label>
            <input
              className="register-field__input"
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="Escolha um nome de usuário"
            />
          </div>

          <div className="register-field">
            <label className="register-field__label" htmlFor="email">
              E-mail
            </label>
            <input
              className="register-field__input"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
            />
          </div>

          <div className="register-field">
            <label className="register-field__label" htmlFor="phone">
              Telefone
            </label>
            <input
              className="register-field__input"
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="register-field">
            <label className="register-field__label" htmlFor="password">
              Senha
            </label>
            <input
              className="register-field__input"
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres e 1 símbolo"
            />
          </div>

          <div className="register-field">
            <label
              className="register-field__label"
              htmlFor="password-confirmation"
            >
              Confirmação de senha
            </label>
            <input
              className="register-field__input"
              id="password-confirmation"
              name="passwordConfirmation"
              type="password"
              autoComplete="new-password"
              placeholder="Repita sua senha"
            />
          </div>
        </div>

        <button className="register-form__submit" type="submit">
          Cadastrar
        </button>
      </form>
    </>
  );
}
