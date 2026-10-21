import { useState } from 'react';
import NewTripForm from '../features/trips/components/NewTripForm';
import TripList from '../features/trips/components/TripList';
import { useCreateTrip, useTrips } from '../features/trips/useTrips';
import {
  searchDestinations,
  type CreateTripInput,
} from '../services/tripsService';
import '../css/my-trips.css';

export default function MyTripsPage() {
  const { data: trips, isPending, isError, refetch } = useTrips();
  const createTripMutation = useCreateTrip();
  const [isFormOpen, setIsFormOpen] = useState(false);

  async function handleCreateTrip(input: CreateTripInput) {
    await createTripMutation.mutateAsync(input);
    setIsFormOpen(false);
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
            onClick={() => setIsFormOpen(true)}
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
          <TripList trips={trips} onNewTrip={() => setIsFormOpen(true)} />
        )}
      </div>

      {isFormOpen && (
        <div className="my-trips__overlay">
          <section
            className="my-trips__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-trip-title"
          >
            <h2 className="my-trips__modal-title" id="new-trip-title">
              Criar nova viagem
            </h2>
            <NewTripForm
              onSubmit={handleCreateTrip}
              onCancel={() => setIsFormOpen(false)}
              onSearchDestinations={searchDestinations}
            />
          </section>
        </div>
      )}
    </main>
  );
}
