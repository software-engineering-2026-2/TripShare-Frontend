import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EditProfileForm from '../features/profile/components/EditProfileForm';
import {
  useCurrentUserProfile,
  useUpdateCurrentUserProfile,
} from '../features/profile/useCurrentUserProfile';
import { ApiError } from '../services/api';
import '../css/profile-edit.css';

function isUnauthenticated(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 401;
  }

  return error instanceof Error && error.message === 'Usuário não autenticado.';
}

export default function EditProfilePage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useCurrentUserProfile();
  const updateProfile = useUpdateCurrentUserProfile();
  const isOwnProfile = currentUser.data?.id === id;

  useEffect(() => {
    if (currentUser.isPending) {
      return;
    }

    if (currentUser.isError) {
      if (isUnauthenticated(currentUser.error)) {
        navigate('/login', { replace: true });
      }

      return;
    }

    if (currentUser.data && currentUser.data.id !== id) {
      navigate(`/perfil/${currentUser.data.id}`, { replace: true });
    }
  }, [
    currentUser.isPending,
    currentUser.isError,
    currentUser.error,
    currentUser.data,
    id,
    navigate,
  ]);

  return (
    <main className="profile-edit-page">
      <div className="profile-edit__container">
        <header className="profile-edit__header">
          <h1 className="profile-edit__title">Editar perfil</h1>
          <p className="profile-edit__subtitle">
            Atualize suas informações públicas.
          </p>
        </header>

        {currentUser.isPending && (
          <p className="profile-edit__status" role="status">
            Carregando perfil...
          </p>
        )}

        {currentUser.isError && isUnauthenticated(currentUser.error) && (
          <p className="profile-edit__status" role="status">
            Redirecionando para o login...
          </p>
        )}

        {currentUser.isError && !isUnauthenticated(currentUser.error) && (
          <div className="profile-edit__status" role="alert">
            <p>Não foi possível carregar seu perfil.</p>
            <button
              className="form-button profile-edit__secondary-button"
              type="button"
              onClick={() => currentUser.refetch()}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {currentUser.data && !isOwnProfile && (
          <p className="profile-edit__status" role="status">
            Redirecionando para o seu perfil...
          </p>
        )}

        {isOwnProfile && currentUser.data && (
          <section className="profile-edit__card">
            <EditProfileForm
              profile={currentUser.data}
              onSubmit={async (input) => updateProfile.mutateAsync(input)}
              onCancel={() => navigate(`/perfil/${currentUser.data.id}`)}
            />
          </section>
        )}
      </div>
    </main>
  );
}
