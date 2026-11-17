import type { User } from 'firebase/auth';
import AuthLayout from '../../templates/AuthLayout';
import RegisterForm from './components/RegisterForm';
import './styles.css';

export default function RegisterPage({ user }: { user: User | null }) {
  return (
    <AuthLayout labelledBy="register-title" wide>
      <RegisterForm user={user} />
    </AuthLayout>
  );
}
