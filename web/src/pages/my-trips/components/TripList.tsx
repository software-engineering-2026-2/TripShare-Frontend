import { routes } from '../../../routes/paths';
import { Link } from 'react-router-dom';
import type { Trip } from '../../../resources/api/trips/contract';
import {
  formatDayCount,
  formatDestination,
  formatTripPeriod,
} from '../../../resources/api/trips/tripValidation';

interface TripListProps {
  trips: Trip[];
  sessionOnly?: boolean;
  onNewTrip: () => void;
  onEditTrip: (trip: Trip) => void;
  onDeleteTrip: (trip: Trip) => void;
}

export default function TripList({
  trips,
  sessionOnly = false,
  onNewTrip,
  onEditTrip,
  onDeleteTrip,
}: TripListProps) {
  if (trips.length === 0) {
    return (
      <div className="trip-list__empty">
        <p className="trip-list__empty-title">
          {sessionOnly
            ? 'Nenhuma viagem nesta sessão'
            : 'Você ainda não tem viagens'}
        </p>
        <p className="trip-list__empty-text">
          Crie a primeira para começar a montar seu roteiro.
        </p>
        <button
          className="form-button button-primary"
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
        <li className="trip-card card-surface" key={trip.id}>
          <div className="trip-card__destination">
            <span>{trip.destination.country}</span>
            <strong>{trip.destination.city}</strong>
            <svg viewBox="0 0 280 100" fill="none" aria-hidden="true">
              <path
                d="M-10 84C80-40 110 160 200 50S260 14 300 20"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="6 8"
              />
              <circle cx="200" cy="50" r="8" fill="currentColor" />
            </svg>
          </div>
          <div className="trip-card__body">
            <div className="trip-card__header">
              <h2 className="trip-card__title">{trip.title}</h2>
            </div>
            <p className="trip-card__info">
              {formatDestination(trip.destination)}
            </p>
            <div className="trip-card__period">
              <p className="trip-card__info">
                {formatTripPeriod(trip.startDate, trip.endDate)}
              </p>
              <span className="trip-card__duration">
                {formatDayCount(trip.durationDays)}
              </span>
            </div>
            <div className="trip-card__footer">
              <Link
                className="trip-card__explore-link"
                to={routes.trip(trip.id)}
                aria-label={`Explorar viagem ${trip.title}`}
              >
                Explorar viagem <span aria-hidden="true">↗</span>
              </Link>
              <div className="trip-card__actions">
                <button
                  className="form-button button-secondary trip-card__edit-button"
                  type="button"
                  aria-label={`Editar viagem ${trip.title}`}
                  onClick={() => onEditTrip(trip)}
                >
                  Editar
                </button>
                <button
                  className="form-button button-secondary trip-card__delete-button"
                  type="button"
                  aria-label={`Excluir viagem ${trip.title}`}
                  onClick={() => onDeleteTrip(trip)}
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
