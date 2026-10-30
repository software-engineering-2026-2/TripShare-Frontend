// Estrutura visual da seção de publicações. O back-end ainda não expõe um
// endpoint para listar publicações de um usuário; a página passa uma lista
// vazia até o contrato existir, sem exibir dados fictícios.
export interface ProfilePublication {
  id: string;
  title: string;
  summary?: string;
  imageUrl?: string;
}

interface PublicationsSectionProps {
  publications: ProfilePublication[];
}

function EmptyIllustration() {
  return (
    <svg
      className="public-profile__empty-art"
      viewBox="0 0 200 150"
      focusable="false"
      aria-hidden="true"
    >
      <rect
        x="24"
        y="30"
        width="152"
        height="94"
        rx="14"
        fill="var(--color-surface)"
        stroke="var(--color-border-strong)"
        strokeWidth="1.5"
      />
      <path d="M24 54h152" stroke="var(--color-border)" strokeWidth="1.5" />
      <circle cx="40" cy="42" r="3" fill="var(--color-border-strong)" />
      <circle cx="51" cy="42" r="3" fill="var(--color-border-strong)" />
      <path
        d="M58 112c18-26 30-24 44-44s30-16 48-8"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="6 7"
        opacity="0.75"
      />
      <path
        d="M150 52c-8 0-14 6-14 14 0 10 14 22 14 22s14-12 14-22c0-8-6-14-14-14z"
        fill="var(--color-primary)"
        opacity="0.12"
      />
      <path
        d="M150 55c-6.1 0-11 4.9-11 11 0 7.8 11 18 11 18s11-10.2 11-18c0-6.1-4.9-11-11-11z"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="150" cy="66" r="3.5" fill="var(--color-primary)" />
      <path
        d="M52 95c8-7 16-7 24 0M52 106c8-7 16-7 24 0"
        fill="none"
        stroke="var(--color-border-strong)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M172 24 166 36l-3-5-5-3z"
        fill="var(--color-primary)"
        opacity="0.7"
      />
    </svg>
  );
}

export default function PublicationsSection({
  publications,
}: PublicationsSectionProps) {
  return (
    <section
      className="public-profile__publications"
      aria-labelledby="publications-title"
    >
      <div className="public-profile__section-heading">
        <div>
          <h2 className="public-profile__section-title" id="publications-title">
            Publicações
          </h2>
          <p className="public-profile__section-description">
            Viagens e roteiros compartilhados por este perfil.
          </p>
        </div>
      </div>

      {publications.length === 0 ? (
        <div className="public-profile__empty">
          <div className="public-profile__empty-visual">
            <EmptyIllustration />
          </div>
          <div className="public-profile__empty-copy">
            <p className="public-profile__empty-title">
              Este usuário ainda não possui publicações.
            </p>
            <p className="public-profile__empty-text">
              Quando uma viagem for compartilhada, ela aparecerá aqui.
            </p>
          </div>
        </div>
      ) : (
        <ul className="publication-list">
          {publications.map((publication) => (
            <li className="publication-card" key={publication.id}>
              <div className="publication-card__media">
                {publication.imageUrl ? (
                  <img
                    className="publication-card__image"
                    src={publication.imageUrl}
                    alt=""
                    loading="lazy"
                  />
                ) : (
                  <svg
                    className="publication-card__placeholder"
                    viewBox="0 0 24 24"
                    focusable="false"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 17.5 9 11l4 4 3-3 5 5.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="16.5"
                      cy="7.5"
                      r="2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                  </svg>
                )}
              </div>

              <div className="publication-card__body">
                <h3 className="publication-card__title">{publication.title}</h3>
                {publication.summary && (
                  <p className="publication-card__summary">
                    {publication.summary}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
