import { useState } from 'react';
import { logout } from '../../../services/authService';

export function useLogout() {
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);

    try {
      await logout();
    } catch {
      // Falha na API não deve manter o usuário logado no front:
      // o signOut do Firebase já ocorre dentro de logout().
    } finally {
      window.location.replace('/login');
    }
  }

  return { logout: handleLogout, isPending };
}
