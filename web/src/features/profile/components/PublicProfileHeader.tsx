import { Link } from 'react-router-dom';
import type { PublicProfile } from '../profileTypes';

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
        <svg
          className="public-profile__cover-mark"
          viewBox="0 0 64 64"
          focusable="false"
        >
          <circle
            cx="32"
            cy="32"
            r="21"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M32 15v6M32 43v6M15 32h6M43 32h6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M39.5 24.5 35 34.6 24.5 39.5 29 29.4z"
            fill="currentColor"
            opacity="0.85"
          />
        </svg>

        <svg
          className="public-profile__cover-waves"
          viewBox="0 0 1200 160"
          preserveAspectRatio="none"
          focusable="false"
        >
          <path
            d="M0 96c120 28 240 40 360 24s240-52 360-40 240 56 360 44 120-16 120-16v52H0z"
            fill="currentColor"
            opacity="0.12"
          />
          <path
            d="M0 122c150 20 300 28 450 12s300-40 450-24 300 36 300 36v14H0z"
            fill="currentColor"
            opacity="0.18"
          />
        </svg>
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
              <p
                className="public-profile__hometown"
                aria-label={`Cidade natal: ${profile.hometown}`}
              >
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
