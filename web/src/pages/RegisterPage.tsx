import RegisterForm from '../features/auth/components/RegisterForm';
import '../css/register.css';

export default function RegisterPage() {
  return (
    <main className="register-page">
      <section className="register-card" aria-labelledby="register-title">
        <RegisterForm />
      </section>
    </main>
  );
}
