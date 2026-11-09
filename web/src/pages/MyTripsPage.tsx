import { useState } from 'react';
import DeleteTripDialog from '../features/trips/components/DeleteTripDialog';
import TripForm from '../features/trips/components/TripForm';
import TripList from '../features/trips/components/TripList';
import {
  useCreateTrip,
  useDeleteTrip,
  useTripDeletionSummary,
  useTrips,
  useUpdateTrip,
} from '../features/trips/useTrips';
import {
  searchDestinations,
  type CreateTripInput,
  type Trip,
  type UpdateTripInput,
} from '../services/tripsService';
import '../css/my-trips.css';

export default function MyTripsPage() {
  const { data: trips, isPending, isError, refetch } = useTrips();
  const createTripMutation = useCreateTrip();
  const updateTripMutation = useUpdateTrip();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [deletingTrip, setDeletingTrip] = useState<Trip | null>(null);
  const deletionSummary = useTripDeletionSummary(deletingTrip?.id);
  const deleteTripMutation = useDeleteTrip();

  async function handleCreateTrip(input: CreateTripInput) {
    await createTripMutation.mutateAsync(input);
    setIsFormOpen(false);
  }

  async function handleUpdateTrip(input: UpdateTripInput) {
    if (!editingTrip) return;
    await updateTripMutation.mutateAsync({ id: editingTrip.id, input });
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
    await deleteTripMutation.mutateAsync(deletingTrip.id);
    setDeletingTrip(null);
  }

  return (
    <main className="my-trips-page">
      <div className="my-trips__container">
        <header className="my-trips__header">
          <div>
            <h1 className="my-trips__title">Minhas Viagens</h1>
            <p className="my-trips__subtitle">
              Escolha uma viagem para montar o roteiro
            </p>
          </div>
          <button
            className="form-button my-trips__primary-button"
            type="button"
            onClick={openNewTripForm}
          >
            Nova viagem
          </button>
        </header>

        {isPending && <p className="my-trips__status">Carregando viagens...</p>}

        {isError && (
          <div className="my-trips__status" role="alert">
            <p>Não foi possível carregar suas viagens.</p>
            <button
              className="form-button my-trips__secondary-button"
              type="button"
              onClick={() => refetch()}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {trips && (
          <TripList
            trips={trips}
            onNewTrip={openNewTripForm}
            onEditTrip={openEditTripForm}
            onDeleteTrip={setDeletingTrip}
          />
        )}
      </div>

      {isFormOpen && (
        <div className="my-trips__overlay">
          <section
            className="my-trips__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="trip-form-title"
          >
            <h2 className="my-trips__modal-title" id="trip-form-title">
              {editingTrip ? 'Editar viagem' : 'Criar nova viagem'}
            </h2>
            <TripForm
              key={editingTrip?.id ?? 'new'}
              trip={editingTrip ?? undefined}
              onSubmit={editingTrip ? handleUpdateTrip : handleCreateTrip}
              onCancel={closeForm}
              onSearchDestinations={searchDestinations}
            />
          </section>
        </div>
      )}

      {deletingTrip && (
        <DeleteTripDialog
          key={deletingTrip.id}
          trip={deletingTrip}
          summary={deletionSummary.data}
          isLoadingSummary={deletionSummary.isPending}
          isSummaryError={deletionSummary.isError}
          onRetrySummary={() => deletionSummary.refetch()}
          onConfirm={handleDeleteTrip}
          onCancel={() => setDeletingTrip(null)}
        />
      )}
    </main>
  );
}
