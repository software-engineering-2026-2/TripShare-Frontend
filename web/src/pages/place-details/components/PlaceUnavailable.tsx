// Dados de uma atividade do roteiro, enviados pela navegação ao abrir os
// detalhes do local a partir dela.
export interface SavedActivity {
  name: string;
  notes?: string | null;
}

interface PlaceUnavailableProps {
  savedActivity?: SavedActivity | null;
  message?: string;
}

export default function PlaceUnavailable({
  savedActivity,
  message = 'Este local foi removido do catálogo e seus detalhes não estão mais disponíveis.',
}: PlaceUnavailableProps) {
  return (
    <article className="place-details" aria-labelledby="place-unavailable">
      <header className="place-details__header">
        <h1 className="place-details__name" id="place-unavailable">
          Local indisponível
        </h1>
        <p className="place-details__text">{message}</p>
      </header>

      {savedActivity && (
        <section className="place-details__section">
          <h2 className="place-details__section-title">
            Atividade salva no seu roteiro
          </h2>
          <dl className="place-details__info-list">
            <div className="place-details__info-row">
              <dt>Nome</dt>
              <dd>{savedActivity.name}</dd>
            </div>
            <div className="place-details__info-row">
              <dt>Observações</dt>
              <dd
                className={
                  savedActivity.notes
                    ? undefined
                    : 'place-details__not-informed'
                }
              >
                {savedActivity.notes || 'Sem observações'}
              </dd>
            </div>
          </dl>
          <p className="place-details__unverified" role="note">
            Dados não verificados: estas informações foram salvas no seu roteiro
            e não puderam ser confirmadas no catálogo.
          </p>
        </section>
      )}
    </article>
  );
}
