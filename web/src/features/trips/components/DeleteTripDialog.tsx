import { useState } from 'react';
import type { Trip, TripDeletionSummary } from '../../../services/tripsService';
import { getTripAccessErrorMessage } from '../tripAccessError';
import {
  formatFavoriteCount,
  formatItineraryCount,
  formatPublicationCount,
} from '../tripValidation';

interface DeleteTripDialogProps {
  trip: Trip;
  summary?: TripDeletionSummary;
  isLoadingSummary: boolean;
  // Erro da busca do resumo; null quando não houve.
  summaryError: unknown;
  onRetrySummary: () => void;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default function DeleteTripDialog({
  trip,
  summary,
  isLoadingSummary,
  summaryError,
  onRetrySummary,
  onConfirm,
  onCancel,
}: DeleteTripDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  // 403/404 no DELETE: excluir de novo não adianta.
  const [isAccessDenied, setIsAccessDenied] = useState(false);
  const summaryAccessErrorMessage = getTripAccessErrorMessage(
    summaryError,
    'excluir',
  );

  async function handleConfirm() {
    setIsDeleting(true);
    setError('');

    try {
      await onConfirm();
    } catch (deleteError) {
      const accessErrorMessage = getTripAccessErrorMessage(
        deleteError,
        'excluir',
      );
      setIsAccessDenied(Boolean(accessErrorMessage));
      setError(
        accessErrorMessage ??
          'Não foi possível excluir a viagem. Tente novamente.',
      );
      setIsDeleting(false);
    }
  }

  return (
    <div className="my-trips__overlay">
      <section
        className="my-trips__modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-trip-title"
        aria-describedby="delete-trip-description"
      >
        <h2 className="my-trips__modal-title" id="delete-trip-title">
          Excluir {trip.title}?
        </h2>

        <div className="trip-delete" id="delete-trip-description">
          {isLoadingSummary && (
            <p className="trip-delete__status">
              Verificando o que será removido...
            </p>
          )}

          {summaryAccessErrorMessage && (
            <p className="trip-delete__status" role="alert">
              {summaryAccessErrorMessage}
            </p>
          )}

          {Boolean(summaryError) && !summaryAccessErrorMessage && (
            <div className="trip-delete__status" role="alert">
              <p>Não foi possível verificar o que será removido.</p>
              <button
                className="form-button my-trips__secondary-button"
                type="button"
                onClick={onRetrySummary}
              >
                Tentar novamente
              </button>
            </div>
          )}

          {summary && <DeletionSummary summary={summary} />}

          {summary && (
            <p className="trip-delete__warning">
              Esta ação não pode ser desfeita.
            </p>
          )}
        </div>

        {error && (
          <p className="new-trip-field__error" role="alert">
            {error}
          </p>
        )}

        <div className="new-trip-form__actions trip-delete__actions">
          <button
            className="form-button my-trips__secondary-button"
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            autoFocus
          >
            Cancelar
          </button>
          <button
            className="form-button trip-delete__confirm"
            type="button"
            onClick={handleConfirm}
            disabled={!summary || isDeleting || isAccessDenied}
          >
            {isDeleting ? 'Excluindo...' : 'Excluir viagem'}
          </button>
        </div>
      </section>
    </div>
  );
}

function DeletionSummary({ summary }: { summary: TripDeletionSummary }) {
  const { itineraryCount, publishedItineraryCount, favoriteCount } = summary;

  if (itineraryCount + publishedItineraryCount + favoriteCount === 0) {
    return <p>Esta viagem não tem roteiros, publicações nem favoritos.</p>;
  }

  return (
    <>
      <p>Também serão removidos:</p>
      <ul className="trip-delete__list">
        <li>{formatItineraryCount(itineraryCount)}</li>
        <li>{formatPublicationCount(publishedItineraryCount)}</li>
        <li>{formatFavoriteCount(favoriteCount)}</li>
      </ul>
    </>
  );
}
