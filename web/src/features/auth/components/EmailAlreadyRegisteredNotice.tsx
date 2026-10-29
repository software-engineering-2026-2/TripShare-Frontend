export default function EmailAlreadyRegisteredNotice() {
  return (
    <div className="register-field__error" id="email-error" role="alert">
      <p>Este e-mail já está cadastrado.</p>
      <p>
        <a href="/login">Entrar</a> ou{' '}
        <a href="/recuperar-senha">Esqueci a senha</a>
      </p>
    </div>
  );
}