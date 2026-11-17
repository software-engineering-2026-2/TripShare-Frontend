import { useNavigate, useParams } from 'react-router-dom';
import { isUuid, routes } from '../../routes/paths';
import {
  ErrorState,
  LoadingState,
} from '../../components/request-state/RequestState';
import { ContentPage, PageHeader } from '../../templates/ContentPage';
import {
  useCurrentProfile,
  useRefreshProfile,
} from '../../resources/api/users/queries';
import { updateCurrentUser } from '../../resources/api/users/services';
import type { UpdateProfileInput } from '../../resources/api/users/profile-types';
import EditProfileForm from './components/EditProfileForm';
import './styles.css';
import JourneyArt from '../../components/journey-art/JourneyArt';

export default function EditProfilePage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const validId = isUuid(id);
  const query = useCurrentProfile(validId);
  const refreshProfile = useRefreshProfile();
  const profile = query.data?.id === id ? query.data : undefined;

  async function handleSubmit(input: UpdateProfileInput) {
    const updated = await updateCurrentUser(input);
    refreshProfile(updated);
    return updated;
  }

  return (
    <ContentPage className="profile-edit-page">
      <PageHeader
        title="Editar perfil"
        description="Atualize suas informações públicas."
      />
      <div className="profile-edit__layout">
        <aside className="profile-edit__aside">
          <JourneyArt />
          <h2>Seu jeito de viajar.</h2>
          <p>Conte de onde você vem e o que gosta de descobrir pelo caminho.</p>
        </aside>
        <section className="profile-edit__card card-surface">
          {!validId && <ErrorState>Este perfil não foi encontrado.</ErrorState>}
          {validId && query.isLoading && (
            <LoadingState>Carregando perfil...</LoadingState>
          )}
          {validId && query.isError && (
            <ErrorState onRetry={() => void query.refetch()}>
              Não foi possível carregar este perfil.
            </ErrorState>
          )}
          {validId && query.data && !profile && (
            <ErrorState>Você só pode editar o seu próprio perfil.</ErrorState>
          )}
          {validId && profile && (
            <EditProfileForm
              key={profile.id}
              profile={profile}
              onSubmit={handleSubmit}
              onCancel={() => navigate(routes.profile(id))}
            />
          )}
        </section>
      </div>
    </ContentPage>
  );
}
