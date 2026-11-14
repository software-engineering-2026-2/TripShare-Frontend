import type { Destination } from '../../../services/tripsService';
import { formatDestination } from '../tripValidation';

interface DestinationOptionsProps {
  options: Destination[];
  selected: Destination | null;
  onSelect: (destination: Destination) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function DestinationOptions({
  options,
  selected,
  onSelect,
  page,
  totalPages,
  onPageChange,
}: DestinationOptionsProps) {
  return (
    <fieldset className="destination-options">
      <legend className="destination-options__title">
        Qual destino você quis dizer?
      </legend>

      {options.map((option) => {
        const label = formatDestination(option);

        return (
          <label className="destination-options__option" key={label}>
            <input
              type="radio"
              name="destination-option"
              checked={selected === option}
              onChange={() => onSelect(option)}
            />
            {label}
          </label>
        );
      })}

      {totalPages > 1 && (
        <nav aria-label="Paginação de destinos">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
          >
            Anterior
          </button>
          <span>
            Página {page + 1} de {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange(page + 1)}
          >
            Próxima
          </button>
        </nav>
      )}
    </fieldset>
  );
}
