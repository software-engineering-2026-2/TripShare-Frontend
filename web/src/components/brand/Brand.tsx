import { Link } from 'react-router-dom';
import { routes } from '../../routes/paths';

export default function Brand({ to = routes.root }: { to?: string }) {
  return (
    <Link className="brand" to={to} aria-label="tripshare">
      <svg
        className="brand__mark"
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
      >
        <rect width="40" height="40" rx="13" fill="currentColor" />
        <path
          d="M11 12h18M20 12v17M12 25l8 5 8-5"
          stroke="var(--color-text)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>
        tripshare<span className="brand__dot">.</span>
      </span>
    </Link>
  );
}
