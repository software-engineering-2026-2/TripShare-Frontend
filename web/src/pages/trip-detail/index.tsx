import { ContentPage, PageHeader } from '../../templates/ContentPage';
import {
  ErrorState,
  LoadingState,
} from '../../components/request-state/RequestState';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { isUuid, routes } from '../../routes/paths';
import { USE_MOCKS } from '../../commons/config/env';
import DayItinerary from './components/DayItinerary';
import TripMap from './components/TripMap';
import {
  formatDayLabel,
  optimizeOrder,
  scheduleInOrder,
} from '../../resources/api/trips/itinerary';
import {
  formatDayCount,
  formatDestination,
  formatTripPeriod,
} from '../../resources/api/trips/tripValidation';
import { useTrip, useTripActivities } from '../../resources/api/trips/useTrips';
import './styles.css';

export default function TripDetailPage() {
  const { tripId = '' } = useParams();
  const validId = USE_MOCKS || isUuid(tripId);
  const tripQuery = useTrip(validId ? tripId : '');
  const activitiesQuery = useTripActivities(validId ? tripId : '');
  const trip = validId ? tripQuery.data : null;
  const tripActivities = activitiesQuery.data;
  const [selectedDay, setSelectedDay] = useState(1);

  const schedule = useMemo(() => {
    if (!tripActivities) return null;

    const { lodging, activities } = tripActivities;
    const dayActivities = activities.filter(
      (activity) => activity.dayNumber === selectedDay,
    );
    const ordered = optimizeOrder(dayActivities, lodging.mapPosition);
    return scheduleInOrder(ordered, lodging.mapPosition);
  }, [tripActivities, selectedDay]);

  const isPending =
    validId &&
    (tripQuery.isLoading || (USE_MOCKS && activitiesQuery.isLoading));
  const isError = tripQuery.isError || activitiesQuery.isError;

  return (
    <ContentPage className="trip-detail-page" wide>
      <Link className="trip-detail__back-link" to={routes.trips}>
        ← Voltar para Minhas Viagens
      </Link>

      {isPending && !isError && (
        <LoadingState>Carregando viagem...</LoadingState>
      )}
      {isError && (
        <ErrorState
          onRetry={() => {
            if (tripQuery.isError) void tripQuery.refetch();
            if (USE_MOCKS && activitiesQuery.isError)
              void activitiesQuery.refetch();
          }}
        >
          Não foi possível carregar a viagem.
        </ErrorState>
      )}

      {!isPending && !isError && !trip && (
        <p role="status">Esta viagem não está disponível nesta sessão.</p>
      )}

      {trip && (
        <>
          <PageHeader
            title={trip.title}
            description={
              <>
                {formatDestination(trip.destination)} ·{' '}
                {formatTripPeriod(trip.startDate, trip.endDate)} ·{' '}
                {formatDayCount(trip.durationDays)}
              </>
            }
            action={
              <Link
                className="form-button button-primary"
                to={routes.tripPlaces(trip.id)}
              >
                Explorar lugares
              </Link>
            }
          />

          {!USE_MOCKS ? (
            // TODO(backend): GET /trips/{id}/activities ainda não está disponível.
            <p role="status">O roteiro desta viagem ainda está indisponível.</p>
          ) : tripActivities && schedule ? (
            tripActivities.activities.length === 0 ? (
              <div className="trip-detail__empty">
                <p className="trip-detail__empty-title">
                  Esta viagem ainda não tem lugares para visitar
                </p>
                <p className="trip-detail__empty-text">
                  Adicione lugares para ver o roteiro e o mapa com a melhor
                  sequência de visita.
                </p>
              </div>
            ) : (
              <>
                <nav className="trip-detail__days" aria-label="Dias da viagem">
                  {Array.from(
                    { length: trip.durationDays },
                    (_, index) => index + 1,
                  ).map((dayNumber) => (
                    <button
                      className="trip-detail__day-button"
                      key={dayNumber}
                      type="button"
                      aria-pressed={dayNumber === selectedDay}
                      onClick={() => setSelectedDay(dayNumber)}
                    >
                      {formatDayLabel(trip.startDate, dayNumber)}
                    </button>
                  ))}
                </nav>

                <div className="trip-detail__content">
                  <section
                    className="trip-detail__panel"
                    aria-labelledby="day-itinerary-title"
                  >
                    <h2
                      className="trip-detail__panel-title"
                      id="day-itinerary-title"
                    >
                      Roteiro do {formatDayLabel(trip.startDate, selectedDay)}
                    </h2>
                    <p className="trip-detail__panel-subtitle">
                      Melhor sequência para visitar os lugares deste dia.
                    </p>

                    {schedule.items.length > 0 ? (
                      <DayItinerary schedule={schedule} />
                    ) : (
                      <p className="trip-detail__day-empty">
                        Nenhum lugar para visitar neste dia.
                      </p>
                    )}
                  </section>

                  <section className="trip-detail__map" aria-label="Mapa">
                    <TripMap
                      destination={trip.destination.city}
                      lodging={tripActivities.lodging}
                      schedule={schedule}
                    />
                  </section>
                </div>
              </>
            )
          ) : null}
        </>
      )}
    </ContentPage>
  );
}
