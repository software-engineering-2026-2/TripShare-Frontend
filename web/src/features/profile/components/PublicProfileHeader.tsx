import type { PublicProfile } from '../../../services/usersService';

interface PublicProfileHeaderProps {
  profile: PublicProfile;
}

export default function PublicProfileHeader({
  profile,
}: PublicProfileHeaderProps) {
  return (
    <header className="public-profile__header">
      <p className="public-profile__username">@{profile.username}</p>
      <h1 className="public-profile__name">{profile.name}</h1>
      {profile.bio && <p className="public-profile__bio">{profile.bio}</p>}
      {profile.hometown && (
        <p className="public-profile__hometown">
          <span className="public-profile__hometown-label">Cidade natal:</span>{' '}
          {profile.hometown}
        </p>
      )}
    </header>
  );
}
