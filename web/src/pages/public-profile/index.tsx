import { useParams } from 'react-router-dom';
import { isUuid, routes } from '../../routes/paths';
import { ApiError } from '../../resources/client/http';
import {
  useCurrentProfile,
  usePublicProfile,
} from '../../resources/api/users/queries';
import {
  ErrorState,
  LoadingState,
} from '../../components/request-state/RequestState';
import { ContentPage } from '../../templates/ContentPage';
import PublicProfileHeader from './components/PublicProfileHeader';
import PublicationsSection from './components/PublicationsSection';
import './styles.css';

export default function PublicProfilePage() {
  const { id = '' } = useParams<{ id: string }>();
  const validId = isUuid(id);
  const query = usePublicProfile(id, validId);
  const currentProfile = useCurrentProfile(validId && Boolean(query.data));
  const profile = query.data ? { ...query.data, id } : undefined;
  const isOwnProfile = currentProfile.data?.id === id;
  const notFound =
    !validId || (query.error instanceof ApiError && query.error.status === 404);

  return (
    <ContentPage className="public-profile-page">
      {notFound && <ErrorState>Este perfil não foi encontrado.</ErrorState>}
      {validId && query.isLoading && (
        <LoadingState>Carregando perfil...</LoadingState>
      )}
      {!notFound && query.isError && (
        <ErrorState onRetry={() => void query.refetch()}>
          Não foi possível carregar este perfil.
        </ErrorState>
      )}
      {profile && !notFound && (
        <div className="public-profile__content">
          <PublicProfileHeader
            profile={profile}
            editHref={isOwnProfile ? routes.editProfile(id) : undefined}
          />
          {/* TODO(backend): consulta das publicações por perfil ainda indisponível. */}
          <PublicationsSection publications={[]} unavailable />
        </div>
      )}
    </ContentPage>
  );
}
