// Desenho ilustrativo do Rio de Janeiro usado enquanto não há um mapa real integrado.
const COAST =
  'M -1500 620 C 0 620, 200 612, 300 608 C 380 604, 440 612, 520 604 C 570 598, 600 606, 625 585 C 660 556, 700 548, 720 520 C 735 495, 735 470, 760 450 C 800 420, 840 400, 850 370 C 860 340, 830 300, 800 270 C 770 240, 740 210, 720 180 C 700 150, 680 120, 660 90 C 650 70, 655 20, 650 -1500 L 2500 -1500 L 2500 2500 L -1500 2500 Z';

const MAJOR_ROADS = [
  'M 230 598 C 330 594, 430 600, 520 592 C 570 588, 600 592, 618 574 C 650 546, 690 540, 708 512',
  'M 708 512 C 724 488, 724 462, 748 442',
  'M 640 60 C 620 120, 600 160, 590 200 C 600 250, 660 270, 720 300 C 760 320, 790 360, 760 420',
  'M 120 140 C 260 150, 420 140, 640 110',
  'M 590 200 C 560 260, 520 330, 520 400 C 520 460, 600 470, 655 470',
  'M 200 520 C 260 500, 340 520, 420 525 C 470 528, 520 520, 560 500',
];

const MINOR_ROADS = [
  'M 420 160 L 470 260 L 520 300',
  'M 500 140 L 520 220 L 560 250',
  'M 560 300 L 640 330 L 700 380',
  'M 600 400 L 680 420',
  'M 560 430 L 620 520',
  'M 480 520 L 500 590',
  'M 400 530 L 410 600',
  'M 330 540 L 340 600',
  'M 260 430 L 330 470 L 380 520',
  'M 180 220 L 300 240 L 380 230',
  'M 300 160 L 320 260',
  'M 220 300 L 280 360 L 300 420',
];

const NEIGHBORHOODS = [
  { name: 'Centro', x: 520, y: 135 },
  { name: 'Santa Teresa', x: 455, y: 245 },
  { name: 'Botafogo', x: 640, y: 360 },
  { name: 'Copacabana', x: 640, y: 505 },
  { name: 'Ipanema', x: 470, y: 548 },
  { name: 'Leblon', x: 325, y: 555 },
  { name: 'Tijuca', x: 230, y: 250 },
  { name: 'Gávea', x: 245, y: 500 },
];

interface RioMapBaseProps {
  zoomedIn: boolean;
}

export default function RioMapBase({ zoomedIn }: RioMapBaseProps) {
  const streetsOpacity = { opacity: zoomedIn ? 1 : 0 };
  const cityOpacity = { opacity: zoomedIn ? 0 : 0.9 };

  return (
    <g className="rio-map">
      <defs>
        <pattern
          id="rio-map-streets"
          width="26"
          height="26"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(18)"
        >
          <path
            d="M 26 0 L 0 0 0 26"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.4"
          />
        </pattern>
        <pattern
          id="rio-map-waves"
          width="40"
          height="18"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 0 9 Q 10 4 20 9 T 40 9"
            fill="none"
            stroke="#a9d2ea"
            strokeWidth="1"
          />
        </pattern>
      </defs>

      <rect x="-1500" y="-1500" width="4000" height="4000" fill="#f3efe6" />
      <rect
        className="rio-map__fade"
        x="-1500"
        y="-1500"
        width="4000"
        height="4000"
        fill="url(#rio-map-streets)"
        style={{ opacity: zoomedIn ? 0.9 : 0 }}
      />

      <g fill="#d3e8c8">
        <path d="M 150 260 C 200 190, 330 200, 420 250 C 470 280, 480 340, 440 380 C 400 420, 300 400, 240 380 C 170 360, 110 320, 150 260 Z" />
        <path d="M 290 400 C 320 380, 360 380, 380 400 C 390 430, 350 450, 320 445 C 290 440, 275 420, 290 400 Z" />
        <path d="M 700 280 C 740 290, 770 310, 790 340 L 770 350 C 740 330, 715 310, 695 295 Z" />
        <circle cx="815" cy="338" r="22" />
        <path d="M 660 410 C 690 400, 720 410, 715 440 C 700 450, 670 440, 660 410 Z" />
      </g>

      <path d={COAST} fill="#bfddf0" />
      <path d={COAST} fill="url(#rio-map-waves)" opacity="0.6" />
      <ellipse cx="420" cy="482" rx="52" ry="36" fill="#bfddf0" />

      <g fill="none" strokeLinecap="round">
        {MINOR_ROADS.map((d) => (
          <path
            className="rio-map__fade"
            key={d}
            d={d}
            stroke="#ffffff"
            strokeWidth="5"
            style={streetsOpacity}
          />
        ))}
        {MAJOR_ROADS.map((d) => (
          <g key={d}>
            <path d={d} stroke="#e4dccb" strokeWidth={zoomedIn ? 11 : 8} />
            <path d={d} stroke="#ffffff" strokeWidth={zoomedIn ? 8 : 5} />
          </g>
        ))}
      </g>

      <g
        className="rio-map__fade"
        fontSize="9"
        fill="#9a8f7a"
        fontWeight="500"
        style={streetsOpacity}
        aria-hidden="true"
      >
        <text x="300" y="138">
          Av. Presidente Vargas
        </text>
        <text x="420" y="590">
          Av. Vieira Souto
        </text>
        <text x="728" y="470" transform="rotate(-55 728 470)">
          Av. Atlântica
        </text>
        <text x="610" y="285" transform="rotate(25 610 285)">
          Aterro do Flamengo
        </text>
        <text x="450" y="495" fill="#6e9bb8">
          Lagoa
        </text>
      </g>

      <g
        className="rio-map__fade"
        fontSize="13"
        fontWeight="600"
        letterSpacing="2"
        fill="#8b806b"
        textAnchor="middle"
        style={cityOpacity}
        aria-hidden="true"
      >
        {NEIGHBORHOODS.map((neighborhood) => (
          <text key={neighborhood.name} x={neighborhood.x} y={neighborhood.y}>
            {neighborhood.name.toUpperCase()}
          </text>
        ))}
      </g>

      <g
        fontSize="14"
        fontStyle="italic"
        fill="#6e9bb8"
        textAnchor="middle"
        aria-hidden="true"
      >
        <text x="470" y="665">
          Oceano Atlântico
        </text>
        <text x="920" y="200" transform="rotate(-70 920 200)">
          Baía de Guanabara
        </text>
      </g>
    </g>
  );
}
