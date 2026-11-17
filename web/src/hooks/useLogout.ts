import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { routes } from '../routes/paths';
import { logout } from '../resources/auth/flow';

export function useLogout() {
  const navigate = useNavigate();
  const action = useMutation({
    mutationFn: logout,
    onSuccess: () => navigate(routes.login, { replace: true }),
    onError: () => toast.error('Não foi possível sair. Tente novamente.'),
  });
  return { logout: () => action.mutate(), isPending: action.isPending };
}
