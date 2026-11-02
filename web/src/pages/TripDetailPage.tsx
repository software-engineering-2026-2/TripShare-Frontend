import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DayItinerary from '../features/trips/components/DayItinerary';
import TripMap from '../features/trips/components/TripMap';
import {
  formatDayLabel,
  optimizeOrder,
  scheduleInOrder,
} from '../features/trips/itinerary';
import {
  formatDayCount,
  formatDestination,
  formatTripPeriod,
  getTripDays,
} from '../features/trips/tripValidation';
import { useTrip, useTripActivities } from '../features/trips/useTrips';
import '../css/my-trips.css';
import '../css/trip-detail.css';

export default function TripDetailPage() {
  const { tripId = '' } = useParams();
  const tripQuery = useTrip(tripId);
  const activitiesQuery = useTripActivities(tripId);
  const [selectedDay, setSelectedDay] = useState(1);

  const trip = tripQuery.data;
  const tripActivities = activitiesQuery.data;

  const schedule = useMemo(() => {
    if (!tripActivities) return null;

    const { lodging, activities } = tripActivities;
    const dayActivities = activities.filter(
      (activity) => activity.dayNumber === selectedDay,
    );
    const ordered = optimizeOrder(dayActivities, lodging.mapPosition);
    return scheduleInOrder(ordered, lodging.mapPosition);
  }, [tripActivities, selectedDay]);

  const isPending = tripQuery.isPending || activitiesQuery.isPending;
  const isError = tripQuery.isError || activitiesQuery.isError;

  return (
    <main className="trip-detail-page">
      <div className="trip-detail__container">
        <Link className="trip-detail__back-link" to="/minhas-viagens">
          ← Voltar para Minhas Viagens
        </Link>

        {isPending && !isError && (
          <p className="trip-detail__status">Carregando viagem...</p>
        )}

        {isError && (
          <div className="trip-detail__status" role="alert">
            <p>Não foi possível carregar a viagem.</p>
            <button
              className="form-button my-trips__secondary-button"
              type="button"
              onClick={() => {
                tripQuery.refetch();
                activitiesQuery.refetch();
              }}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {trip && tripActivities && schedule && (
          <>
            <header className="trip-detail__header">
              <h1 className="trip-detail__title">{trip.title}</h1>
              <p className="trip-detail__subtitle">
                {formatDestination(trip.destination)} ·{' '}
                {formatTripPeriod(trip.startDate, trip.endDate)} ·{' '}
                {formatDayCount(getTripDays(trip.startDate, trip.endDate))}
              </p>
            </header>

            {tripActivities.activities.length === 0 ? (
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
                    { length: getTripDays(trip.startDate, trip.endDate) },
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
            )}
          </>
        )}
      </div>
    </main>
  );
}
