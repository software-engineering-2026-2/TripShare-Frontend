import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { useMutation } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { routes } from './paths';
import { useSession } from '../providers/session';
import { logout, restoreSession } from '../resources/auth/flow';
import {
  ErrorState,
  LoadingState,
} from '../components/request-state/RequestState';
import ActionButton from '../components/action-button/ActionButton';
import { ContentPage } from '../templates/ContentPage';

export default function AuthEntry({
  registration = false,
  children,
}: {
  registration?: boolean;
  children: (user: User | null) => ReactNode;
}) {
  const session = useSession();
  const action = useMutation({
    mutationFn: (name: 'restore' | 'logout') =>
      name === 'restore' ? restoreSession() : logout(),
  });

  if (session.status === 'restoring')
    return (
      <ContentPage>
        <LoadingState>Carregando sessão...</LoadingState>
      </ContentPage>
    );
  if (session.status === 'authenticated')
    return <Navigate to={routes.trips} replace />;
  if (session.status === 'pending' && !registration)
    return <Navigate to={routes.register} replace />;
  if (session.status === 'error' && session.user)
    return (
      <ContentPage>
        <ErrorState
          onRetry={
            action.isPending ? undefined : () => action.mutate('restore')
          }
        >
          {action.isError && action.variables === 'logout'
            ? 'Não foi possível sair. Tente novamente.'
            : session.error}
        </ErrorState>
        <div>
          <ActionButton
            className="form-button button-secondary"
            type="button"
            onClick={() => action.mutate('logout')}
            pending={action.isPending && action.variables === 'logout'}
            disabled={action.isPending}
            pendingLabel="Saindo..."
          >
            Usar outra conta
          </ActionButton>
        </div>
      </ContentPage>
    );
  return children(session.user);
}
