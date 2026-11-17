/** Ilustração decorativa de um percurso, sem representar um mapa geográfico. */
export default function JourneyArt({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`journey-art ${className}`}
      viewBox="0 0 480 360"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle className="journey-art__sun" cx="365" cy="94" r="49" />
      <g className="journey-art__contours" strokeWidth="1.5">
        <path d="M-30 270C50 130 100 320 206 190S324 20 520 160" />
        <path d="M-30 289C50 149 100 339 206 209S324 39 520 179" />
        <path d="M-30 308C50 168 100 358 206 228S324 58 520 198" />
        <path d="M-30 327C50 187 100 377 206 247S324 77 520 217" />
        <path d="M-30 346C50 206 100 396 206 266S324 96 520 236" />
        <path d="M-30 365C50 225 100 415 206 285S324 115 520 255" />
      </g>
      <path
        className="journey-art__route"
        d="M88 242C40 131 226 70 258 166S416 287 383 150"
        strokeWidth="3"
        strokeDasharray="7 10"
        strokeLinecap="round"
      />
      <circle
        className="journey-art__start"
        cx="88"
        cy="242"
        r="12"
        strokeWidth="6"
      />
      <g className="journey-art__pin">
        <path d="M383 82c-20 0-36 16-36 36 0 27 36 53 36 53s36-26 36-53c0-20-16-36-36-36Z" />
        <circle cx="383" cy="117" r="11" fill="var(--color-surface)" />
      </g>
      <path
        className="journey-art__spark"
        d="M142 63v30m-15-15h30M285 299v20m-10-10h20"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
