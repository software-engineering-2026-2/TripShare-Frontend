import Modal from '../../../components/modal/Modal';
import ActionButton from '../../../components/action-button/ActionButton';
import {
  ErrorState,
  LoadingState,
} from '../../../components/request-state/RequestState';
import { useMutation } from '@tanstack/react-query';
import type {
  Trip,
  TripDeletionPreview,
} from '../../../resources/api/trips/contract';
import { getTripAccessErrorMessage } from '../../../resources/api/trips/tripAccessError';
import {
  formatFavoriteCount,
  formatItineraryCount,
} from '../../../resources/api/trips/tripValidation';

interface DeleteTripDialogProps {
  trip: Trip;
  preview?: TripDeletionPreview;
  isLoadingPreview: boolean;
  // Erro da busca do resumo; null quando não houve.
  previewError: unknown;
  onRetryPreview: () => void;
  onPageChange: (page: number) => void;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default function DeleteTripDialog({
  trip,
  preview,
  isLoadingPreview,
  previewError,
  onRetryPreview,
  onPageChange,
  onConfirm,
  onCancel,
}: DeleteTripDialogProps) {
  const deletion = useMutation({ mutationFn: onConfirm });
  const isDeleting = deletion.isPending;
  const accessError = getTripAccessErrorMessage(deletion.error, 'excluir');
  const error =
    deletion.error &&
    (accessError ?? 'Não foi possível excluir a viagem. Tente novamente.');
  const previewAccessErrorMessage = getTripAccessErrorMessage(
    previewError,
    'excluir',
  );

  return (
    <Modal
      role="alertdialog"
      titleId="delete-trip-title"
      descriptionId="delete-trip-description"
      allowClose={!isDeleting}
      onClose={onCancel}
    >
      <h2 className="my-trips__modal-title" id="delete-trip-title">
        Excluir {trip.title}?
      </h2>

      <div className="trip-delete" id="delete-trip-description">
        {isLoadingPreview && (
          <LoadingState>Verificando o que será removido...</LoadingState>
        )}
        {previewAccessErrorMessage && (
          <ErrorState>{previewAccessErrorMessage}</ErrorState>
        )}
        {Boolean(previewError) && !previewAccessErrorMessage && (
          <ErrorState onRetry={onRetryPreview}>
            Não foi possível verificar o que será removido.
          </ErrorState>
        )}

        {preview && (
          <DeletionPreview
            preview={preview}
            onPageChange={onPageChange}
            isDeleting={isDeleting}
          />
        )}

        {preview && (
          <p className="trip-delete__warning">
            Esta ação não pode ser desfeita.
          </p>
        )}
      </div>

      {error && <ErrorState>{error}</ErrorState>}

      <div className="new-trip-form__actions trip-delete__actions">
        <button
          className="form-button button-secondary"
          type="button"
          onClick={onCancel}
          disabled={isDeleting}
          data-initial-focus
        >
          Cancelar
        </button>
        <ActionButton
          pending={isDeleting}
          pendingLabel="Excluindo..."
          className="form-button trip-delete__confirm"
          type="button"
          onClick={() => deletion.mutate()}
          disabled={
            !preview ||
            isLoadingPreview ||
            Boolean(previewError) ||
            isDeleting ||
            Boolean(accessError)
          }
        >
          Excluir viagem
        </ActionButton>
      </div>
    </Modal>
  );
}

function DeletionPreview({
  preview,
  onPageChange,
  isDeleting,
}: {
  preview: TripDeletionPreview;
  onPageChange: (page: number) => void;
  isDeleting: boolean;
}) {
  if (preview.totalElements === 0) {
    return <p>Esta viagem não tem roteiros, publicações nem favoritos.</p>;
  }

  return (
    <>
      <p>
        Serão removidos {formatItineraryCount(preview.totalElements)} e seus
        vínculos.
      </p>
      <ul className="trip-delete__list">
        {preview.content.map((itinerary) => (
          <li key={itinerary.id}>
            {itinerary.title} · {itinerary.published ? 'Público' : 'Privado'} ·{' '}
            {formatFavoriteCount(itinerary.favoriteCount)}
            {itinerary.inRanking && ' · Visível no ranking'}
          </li>
        ))}
      </ul>

      {preview.totalPages > 1 && (
        <nav
          className="new-trip-form__actions"
          aria-label="Paginação da prévia"
        >
          <button
            type="button"
            className="form-button button-secondary"
            disabled={preview.page === 0 || isDeleting}
            onClick={() => onPageChange(preview.page - 1)}
          >
            Anterior
          </button>
          <span>
            Página {preview.page + 1} de {preview.totalPages}
          </span>
          <button
            type="button"
            className="form-button button-secondary"
            disabled={preview.last || isDeleting}
            onClick={() => onPageChange(preview.page + 1)}
          >
            Próxima
          </button>
        </nav>
      )}
    </>
  );
}
