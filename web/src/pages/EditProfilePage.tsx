import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EditProfileForm from '../features/profile/components/EditProfileForm';
import type {
  EditableProfile,
  UpdateProfileInput,
} from '../features/profile/profileTypes';
import { getUserById, updateCurrentUser } from '../services/userService';
import '../css/profile-edit.css';

export default function EditProfilePage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<EditableProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setIsLoading(true);
      setHasError(false);

      try {
        const user = await getUserById(id);
        if (isMounted) {
          setProfile({
            id: user.id,
            name: user.name,
            phone: user.phone,
            bio: user.bio,
            hometown: user.hometown,
          });
        }
      } catch {
        if (isMounted) {
          setProfile(null);
          setHasError(true);
        }
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

  async function handleSubmit(input: UpdateProfileInput) {
    const updated = await updateCurrentUser(input);
    const nextProfile: EditableProfile = {
      id: updated.id,
      name: updated.name,
      phone: updated.phone,
      bio: updated.bio,
      hometown: updated.hometown,
    };
    setProfile(nextProfile);

    return nextProfile;
  }

  return (
    <main className="profile-edit-page">
      <div className="profile-edit__container">
        <header className="profile-edit__header">
          <h1 className="profile-edit__title">Editar perfil</h1>
          <p className="profile-edit__subtitle">
            Atualize suas informações públicas.
          </p>
        </header>

        <section className="profile-edit__card">
          {isLoading && <p>Carregando perfil...</p>}
          {!isLoading && hasError && (
            <p role="alert">Não foi possível carregar este perfil.</p>
          )}
          {!isLoading && profile && (
            <EditProfileForm
              profile={profile}
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/perfil/${id}`)}
            />
          )}
        </section>
      </div>
    </main>
  );
}
