import { Link } from 'react-router-dom';
import type { PublicProfile } from '../../../resources/api/users/profile-types';
import JourneyArt from '../../../components/journey-art/JourneyArt';

interface PublicProfileHeaderProps {
  profile: PublicProfile;
  editHref?: string;
}

function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

  return initials || '?';
}

export default function PublicProfileHeader({
  profile,
  editHref,
}: PublicProfileHeaderProps) {
  const initials = getInitials(profile.name);

  return (
    <header className="public-profile__header">
      <div className="public-profile__cover" aria-hidden="true">
        <JourneyArt />
      </div>

      <div className="public-profile__body">
        <div className="public-profile__identity">
          <div className="public-profile__avatar" aria-hidden="true">
            {initials}
          </div>

          <div className="public-profile__identity-text">
            <h1 className="public-profile__name">{profile.name}</h1>
            <p className="public-profile__username">@{profile.username}</p>

            {profile.hometown && (
              <p className="public-profile__hometown">
                <svg
                  className="public-profile__icon"
                  viewBox="0 0 24 24"
                  focusable="false"
                  aria-hidden="true"
                >
                  <path
                    d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="10"
                    r="2.6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                </svg>
                <span className="public-profile__sr-only">
                  Cidade de origem:{' '}
                </span>
                {profile.hometown}
              </p>
            )}
          </div>

          {editHref && (
            <Link className="public-profile__edit-button" to={editHref}>
              <svg
                className="public-profile__icon"
                viewBox="0 0 24 24"
                focusable="false"
                aria-hidden="true"
              >
                <path
                  d="m4 16.5-.8 4.3 4.3-.8L18.7 8.8a2.3 2.3 0 0 0-3.3-3.3z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
                <path
                  d="m14.2 6.7 3.3 3.3"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
              Editar perfil
            </Link>
          )}
        </div>

        {profile.bio && (
          <div className="public-profile__bio-block">
            <h2 className="public-profile__bio-title">Sobre</h2>
            <p className="public-profile__bio">{profile.bio}</p>
          </div>
        )}
      </div>
    </header>
  );
}
