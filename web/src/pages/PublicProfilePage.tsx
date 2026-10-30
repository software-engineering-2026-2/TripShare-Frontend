import { useParams } from 'react-router-dom';
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
          <div className="public-profile__state">
            <span className="public-profile__spinner" aria-hidden="true" />
            <p className="public-profile__status" role="status">
              Carregando perfil...
            </p>
          </div>
        )}

        {isError && (
          <div className="public-profile__state" role="alert">
            <span className="public-profile__state-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path
                  d="M12 8v5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="16.5" r="1.1" fill="currentColor" />
                <circle
                  cx="12"
                  cy="12"
                  r="8.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>
            </span>
            <p className="public-profile__status">{getErrorMessage(error)}</p>
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
          <div className="public-profile__content">
            <PublicProfileHeader
              profile={profile}
              editHref={isOwnProfile ? `/perfil/${id}/editar` : undefined}
            />
            <PublicationsSection publications={[]} />
          </div>
        )}
      </div>
    </main>
  );
}
