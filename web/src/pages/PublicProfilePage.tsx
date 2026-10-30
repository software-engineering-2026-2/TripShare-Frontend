import { Link, useParams } from 'react-router-dom';
import PublicProfileHeader from '../features/profile/components/PublicProfileHeader';
import PublicationsSection from '../features/profile/components/PublicationsSection';
import { useCurrentUserProfile } from '../features/profile/useCurrentUserProfile';
import { usePublicProfile } from '../features/profile/usePublicProfile';
import { ApiError } from '../services/api';
import '../css/public-profile.css';

function getErrorStatus(error: unknown): number | null {
  return error instanceof ApiError ? error.status : null;
}

function getErrorMessage(error: unknown): string {
  const status = getErrorStatus(error);

  if (status === 404) {
    return 'Este perfil não foi encontrado.';
  }

  if (status === 403) {
    return 'Este perfil está suspenso.';
  }

  return 'Não foi possível carregar o perfil.';
}

export default function PublicProfilePage() {
  const { id = '' } = useParams<{ id: string }>();
  const {
    data: profile,
    isPending,
    isError,
    error,
    refetch,
  } = usePublicProfile(id);
  const currentUser = useCurrentUserProfile();
  const status = getErrorStatus(error);
  const canRetry = status !== 404 && status !== 403;
  const isOwnProfile = currentUser.data?.id === id;

  return (
    <main className="public-profile-page">
      <div className="public-profile__container">
        {isPending && (
          <p className="public-profile__status" role="status">
            Carregando perfil...
          </p>
        )}

        {isError && (
          <div className="public-profile__status" role="alert">
            <p>{getErrorMessage(error)}</p>
            {canRetry && (
              <button
                className="form-button public-profile__retry"
                type="button"
                onClick={() => refetch()}
              >
                Tentar novamente
              </button>
            )}
          </div>
        )}

        {profile && (
          <article className="public-profile__content">
            {isOwnProfile && (
              <div className="public-profile__actions">
                <Link
                  className="form-button public-profile__edit-button"
                  to={`/perfil/${id}/editar`}
                >
                  Editar perfil
                </Link>
              </div>
            )}
            <PublicProfileHeader profile={profile} />
            <PublicationsSection publications={[]} />
          </article>
        )}
      </div>
    </main>
  );
}
