import { useIsMutating } from '@tanstack/react-query';
import { tripQueryKeys } from '../../resources/api/trips/tripQueryKeys';
import Modal from '../../components/modal/Modal';
import { ContentPage, PageHeader } from '../../templates/ContentPage';
import {
  ErrorState,
  LoadingState,
} from '../../components/request-state/RequestState';
import { useState } from 'react';
import { USE_MOCKS } from '../../commons/config/env';
import DeleteTripDialog from './components/DeleteTripDialog';
import TripForm from './components/TripForm';
import TripList from './components/TripList';
import {
  useTripActions,
  useTripDeletionPreview,
  useTrips,
} from '../../resources/api/trips/useTrips';
import { searchDestinations } from '../../resources/api/trips/services';
import type {
  CreateTripInput,
  Trip,
  UpdateTripInput,
} from '../../resources/api/trips/contract';
import './styles.css';
import JourneyArt from '../../components/journey-art/JourneyArt';

export default function MyTripsPage() {
  const { data: trips, isLoading, isError, refetch } = useTrips();
  const tripsActions = useTripActions();
  const isSavingTrip = useIsMutating({ mutationKey: tripQueryKeys.save }) > 0;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [deletingTrip, setDeletingTrip] = useState<Trip | null>(null);
  const [previewPage, setPreviewPage] = useState(0);
  const deletionPreview = useTripDeletionPreview(deletingTrip?.id, previewPage);

  function openDeleteDialog(trip: Trip) {
    setPreviewPage(0);
    setDeletingTrip(trip);
  }

  async function handleCreateTrip(input: CreateTripInput) {
    await tripsActions.create(input);
    setIsFormOpen(false);
  }

  async function handleUpdateTrip(input: UpdateTripInput) {
    if (!editingTrip) return;
    await tripsActions.update(editingTrip.id, input);
    closeForm();
  }

  function openNewTripForm() {
    setEditingTrip(null);
    setIsFormOpen(true);
  }

  function openEditTripForm(trip: Trip) {
    setEditingTrip(trip);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingTrip(null);
  }

  async function handleDeleteTrip() {
    if (!deletingTrip) return;
    await tripsActions.remove(deletingTrip.id);
    setDeletingTrip(null);
  }

  return (
    <ContentPage className="my-trips-page" wide>
      <div className="my-trips__hero">
        <PageHeader
          title="Minhas Viagens"
          description="Tire os planos do papel. Seu próximo roteiro começa por aqui."
          action={
            <button
              className="form-button button-primary"
              type="button"
              onClick={openNewTripForm}
            >
              <span aria-hidden="true">+</span> Nova viagem
            </button>
          }
        />
        <JourneyArt className="my-trips__art" />
      </div>

      <div className="my-trips__collection-heading">
        <h2>Seus planos de viagem</h2>
        {trips && (
          <span>
            {trips.length} {trips.length === 1 ? 'viagem' : 'viagens'}
          </span>
        )}
      </div>

      {!USE_MOCKS && (
        <p className="my-trips__subtitle">
          Aqui aparecem as viagens criadas ou editadas nesta sessão da página.
        </p>
      )}

      {isLoading && <LoadingState>Carregando viagens...</LoadingState>}
      {isError && (
        <ErrorState onRetry={() => void refetch()}>
          Não foi possível carregar suas viagens.
        </ErrorState>
      )}

      {trips && (
        <TripList
          trips={trips}
          onNewTrip={openNewTripForm}
          onEditTrip={openEditTripForm}
          onDeleteTrip={openDeleteDialog}
          sessionOnly={!USE_MOCKS}
        />
      )}

      {isFormOpen && (
        <Modal
          titleId="trip-form-title"
          onClose={closeForm}
          allowClose={!isSavingTrip}
        >
          <h2 className="my-trips__modal-title" id="trip-form-title">
            {editingTrip ? 'Editar viagem' : 'Criar nova viagem'}
          </h2>
          <TripForm
            key={editingTrip?.id ?? 'new'}
            {...(editingTrip
              ? { trip: editingTrip, onSubmit: handleUpdateTrip }
              : { onSubmit: handleCreateTrip })}
            onCancel={closeForm}
            onSearchDestinations={searchDestinations}
          />
        </Modal>
      )}

      {deletingTrip && (
        <DeleteTripDialog
          key={deletingTrip.id}
          trip={deletingTrip}
          preview={deletionPreview.data}
          isLoadingPreview={
            deletionPreview.isPending || deletionPreview.isFetching
          }
          previewError={deletionPreview.error}
          onRetryPreview={() => deletionPreview.refetch()}
          onPageChange={setPreviewPage}
          onConfirm={handleDeleteTrip}
          onCancel={() => setDeletingTrip(null)}
        />
      )}
    </ContentPage>
  );
}
