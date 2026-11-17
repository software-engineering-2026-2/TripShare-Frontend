import type { Destination } from '../../../resources/api/trips/contract';
import { formatDestination } from '../../../resources/api/trips/tripValidation';

interface DestinationOptionsProps {
  options: Destination[];
  selected: Destination | null;
  onSelect: (destination: Destination) => void;
}

export default function DestinationOptions({
  options,
  selected,
  onSelect,
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
    </fieldset>
  );
}
