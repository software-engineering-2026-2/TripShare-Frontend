import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import EditProfileForm from '../features/profile/components/EditProfileForm';
import {
  DEMO_CURRENT_PROFILE,
  DEMO_CURRENT_USER_ID,
} from '../features/profile/demoProfiles';
import type {
  EditableProfile,
  UpdateProfileInput,
} from '../features/profile/profileTypes';
import '../css/profile-edit.css';

export default function EditProfilePage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<EditableProfile>(DEMO_CURRENT_PROFILE);

  async function handleSubmit(input: UpdateProfileInput) {
    const updated = { ...profile, ...input };
    setProfile(updated);

    return updated;
  }

  if (id !== DEMO_CURRENT_USER_ID) {
    return <Navigate to={`/perfil/${DEMO_CURRENT_USER_ID}`} replace />;
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
          <EditProfileForm
            profile={profile}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/perfil/${DEMO_CURRENT_USER_ID}`)}
          />
        </section>
      </div>
    </main>
  );
}
