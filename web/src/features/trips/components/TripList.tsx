import type { Trip } from '../../../services/tripsService';
import {
  formatDayCount,
  formatDestination,
  formatTripPeriod,
  getTripDays,
} from '../tripValidation';

interface TripListProps {
  trips: Trip[];
  onNewTrip: () => void;
}

export default function TripList({ trips, onNewTrip }: TripListProps) {
  if (trips.length === 0) {
    return (
      <div className="trip-list__empty">
        <p className="trip-list__empty-title">Você ainda não tem viagens</p>
        <p className="trip-list__empty-text">
          Crie a primeira para começar a montar seu roteiro.
        </p>
        <button
          className="form-button my-trips__primary-button"
          type="button"
          onClick={onNewTrip}
        >
          Criar nova viagem
        </button>
      </div>
    );
  }

  return (
    <ul className="trip-list">
      {trips.map((trip) => (
        <li className="trip-card" key={trip.id}>
          <h2 className="trip-card__title">{trip.title}</h2>
          <p className="trip-card__info">
            {formatDestination(trip.destination)}
          </p>
          <p className="trip-card__info">
            {formatTripPeriod(trip.startDate, trip.endDate)}
          </p>
          <p className="trip-card__info">
            {formatDayCount(getTripDays(trip.startDate, trip.endDate))}
          </p>
        </li>
      ))}
    </ul>
  );
}
