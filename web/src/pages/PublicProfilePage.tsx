import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PublicProfileHeader from '../features/profile/components/PublicProfileHeader';
import PublicationsSection from '../features/profile/components/PublicationsSection';
import type { PublicProfile } from '../features/profile/profileTypes';
import { ApiError } from '../services/api';
import { getCurrentUserProfile } from '../services/authService';
import { getUserById } from '../services/userService';
import '../css/public-profile.css';

export default function PublicProfilePage() {
  const { id = '' } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setIsLoading(true);
      setNotFound(false);
      setHasError(false);
      setIsOwnProfile(false);

      try {
        const user = await getUserById(id);
        if (isMounted) {
          setProfile({
            id: user.id,
            username: user.username,
            name: user.name,
            bio: user.bio,
            hometown: user.hometown,
          });

          try {
            const currentUser = await getCurrentUserProfile();
            if (isMounted) {
              setIsOwnProfile(currentUser.id === user.id);
            }
          } catch {
            // Perfil público continua disponível para visitantes.
          }
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setProfile(null);
        setNotFound(error instanceof ApiError && error.status === 404);
        setHasError(!(error instanceof ApiError && error.status === 404));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <main className="public-profile-page">
      <div className="public-profile__container">
        {isLoading && (
          <p className="public-profile__status">Carregando perfil...</p>
        )}

        {!isLoading && profile ? (
          <div className="public-profile__content">
            <PublicProfileHeader
              profile={profile}
              editHref={isOwnProfile ? `/perfil/${id}/editar` : undefined}
            />
            <PublicationsSection publications={[]} />
          </div>
        ) : !isLoading && (notFound || hasError) ? (
          <div className="public-profile__state">
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
            <p className="public-profile__status">
              {notFound
                ? 'Este perfil não foi encontrado.'
                : 'Não foi possível carregar este perfil.'}
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
