import { useParams } from 'react-router-dom';
import PublicProfileHeader from '../features/profile/components/PublicProfileHeader';
import PublicationsSection from '../features/profile/components/PublicationsSection';
import {
  DEMO_CURRENT_USER_ID,
  demoProfiles,
} from '../features/profile/demoProfiles';
import '../css/public-profile.css';

export default function PublicProfilePage() {
  const { id = '' } = useParams<{ id: string }>();
  const profile = demoProfiles[id];
  const isOwnProfile = id === DEMO_CURRENT_USER_ID;

  return (
    <main className="public-profile-page">
      <div className="public-profile__container">
        {profile ? (
          <div className="public-profile__content">
            <PublicProfileHeader
              profile={profile}
              editHref={isOwnProfile ? `/perfil/${id}/editar` : undefined}
            />
            <PublicationsSection publications={[]} />
          </div>
        ) : (
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
            <p className="public-profile__status">
              Este perfil não foi encontrado.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
