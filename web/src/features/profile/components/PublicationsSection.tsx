// Estrutura visual da seção de publicações. O back-end ainda não expõe um
// endpoint para listar publicações de um usuário; a página passa uma lista
// vazia até o contrato existir, sem exibir dados fictícios.
export interface ProfilePublication {
  id: string;
  title: string;
  summary?: string;
}

interface PublicationsSectionProps {
  publications: ProfilePublication[];
}

export default function PublicationsSection({
  publications,
}: PublicationsSectionProps) {
  return (
    <section
      className="public-profile__publications"
      aria-labelledby="publications-title"
    >
      <h2 className="public-profile__section-title" id="publications-title">
        Publicações
      </h2>

      {publications.length === 0 ? (
        <p className="public-profile__empty">
          Este usuário ainda não possui publicações.
        </p>
      ) : (
        <ul className="publication-list">
          {publications.map((publication) => (
            <li className="publication-card" key={publication.id}>
              <h3 className="publication-card__title">{publication.title}</h3>
              {publication.summary && (
                <p className="publication-card__summary">
                  {publication.summary}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
