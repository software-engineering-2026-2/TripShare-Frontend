import { LoadingState } from '../components/request-state/RequestState';
import { ContentPage } from '../templates/ContentPage';
import { Navigate, Outlet } from 'react-router-dom';
import { routes } from './paths';
import { useSession } from '../providers/session';
import { USE_MOCKS } from '../commons/config/env';

export default function RequireSession({
  allowDemo = false,
}: {
  allowDemo?: boolean;
}) {
  const { status, uid } = useSession();
  if (allowDemo && USE_MOCKS) return <Outlet key={uid} />;
  if (status === 'restoring' || status === 'authenticating')
    return (
      <ContentPage>
        <LoadingState>Carregando sessão...</LoadingState>
      </ContentPage>
    );
  if (status === 'pending') return <Navigate to={routes.register} replace />;
  return status === 'authenticated' ? (
    <Outlet key={uid} />
  ) : (
    <Navigate to={routes.login} replace />
  );
}
