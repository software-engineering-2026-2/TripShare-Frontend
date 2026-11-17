import { ContentPage, PageHeader } from '../../templates/ContentPage';
import { Link } from 'react-router-dom';
import JourneyArt from '../../components/journey-art/JourneyArt';
import './styles.css';

export default function UnavailablePage({
  title,
  backTo,
  backLabel,
}: {
  title: string;
  backTo: string;
  backLabel: string;
}) {
  return (
    <ContentPage className="unavailable-page">
      <div className="unavailable-page__content">
        <JourneyArt />
        <PageHeader title={title} />
        <div>
          <Link className="form-button button-secondary" to={backTo}>
            {backLabel}
          </Link>
        </div>
      </div>
    </ContentPage>
  );
}
