// Dados falsos para visualizar a tela de pontos turísticos sem back-end (ativados com VITE_USE_MOCKS=true)
// Apagar quando a API estiver pronta
import type { OpeningHours, Place } from './placesService';

const PHOTOS_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb';

function hours(
  weekdays: number[],
  opensAt: string,
  closesAt: string,
  closesNextDay = false,
): OpeningHours[] {
  return weekdays.map((weekday) => ({
    weekday,
    opensAt,
    closesAt,
    closesNextDay,
  }));
}

const EVERY_DAY = [1, 2, 3, 4, 5, 6, 7];
const TUESDAY_TO_SUNDAY = [2, 3, 4, 5, 6, 7];

const places: Place[] = [
  {
    id: '1',
    name: 'Cristo Redentor',
    categories: ['LANDMARK'],
    neighborhood: 'Cosme Velho',
    photo: {
      url: `${PHOTOS_URL}/4/4f/Christ_the_Redeemer_-_Cristo_Redentor.jpg/500px-Christ_the_Redeemer_-_Cristo_Redentor.jpg`,
      altText: 'Estátua do Cristo Redentor no alto do Corcovado',
    },
    openingHours: hours(EVERY_DAY, '08:00', '19:00'),
  },
  {
    id: '2',
    name: 'Museu do Amanhã',
    categories: ['MUSEUM'],
    neighborhood: 'Centro',
    photo: {
      url: `${PHOTOS_URL}/6/63/Museu_do_Amanh%C3%A3_rio.jpg/500px-Museu_do_Amanh%C3%A3_rio.jpg`,
      altText: 'Fachada do Museu do Amanhã na Praça Mauá',
    },
    openingHours: hours(TUESDAY_TO_SUNDAY, '10:00', '18:00'),
  },
  {
    id: '3',
    name: 'Confeitaria Colombo',
    categories: ['CAFE', 'RESTAURANT'],
    neighborhood: 'Centro',
    photo: {
      url: `${PHOTOS_URL}/a/a6/ConfeitariaColombo1.jpg/500px-ConfeitariaColombo1.jpg`,
      altText: 'Salão interno da Confeitaria Colombo',
    },
    openingHours: [
      ...hours([1, 2, 3, 4, 5], '09:00', '18:00'),
      ...hours([6], '09:00', '17:00'),
    ],
  },
  {
    id: '4',
    name: 'Escadaria Selarón',
    categories: ['LANDMARK'],
    neighborhood: 'Lapa',
    photo: {
      url: `${PHOTOS_URL}/f/fc/Escadaria_Selar%C3%B3n_-_Rio_de_Janeiro_-_20240417062601.jpg/500px-Escadaria_Selar%C3%B3n_-_Rio_de_Janeiro_-_20240417062601.jpg`,
      altText: 'Degraus coloridos da Escadaria Selarón',
    },
    openingHours: hours(EVERY_DAY, '00:00', '00:00', true),
  },
  {
    id: '5',
    name: 'Praia de Ipanema',
    categories: ['BEACH'],
    neighborhood: 'Ipanema',
    photo: {
      url: `${PHOTOS_URL}/5/57/Ipaneman_beach_Rio_de_Janeirossa.jpg/500px-Ipaneman_beach_Rio_de_Janeirossa.jpg`,
      altText: 'Faixa de areia da Praia de Ipanema',
    },
    openingHours: [],
  },
  {
    id: '6',
    name: 'Parque Lage',
    categories: ['TRAIL', 'LANDMARK'],
    neighborhood: 'Jardim Botânico',
    photo: {
      url: `${PHOTOS_URL}/0/01/Parque_Lage%2C_Rio_de_Janeiro_Project_2345_01.jpg/500px-Parque_Lage%2C_Rio_de_Janeiro_Project_2345_01.jpg`,
      altText: 'Palacete do Parque Lage com o Corcovado ao fundo',
    },
    openingHours: hours(EVERY_DAY, '08:00', '17:00'),
  },
  {
    id: '7',
    name: 'Museu de Arte do Rio (MAR)',
    categories: ['MUSEUM'],
    neighborhood: 'Centro',
    photo: {
      url: `${PHOTOS_URL}/4/46/Pra%C3%A7a_Mau%C3%A1_11_2015_Rio_708.JPG/500px-Pra%C3%A7a_Mau%C3%A1_11_2015_Rio_708.JPG`,
      altText: 'Prédio do Museu de Arte do Rio na Praça Mauá',
    },
    openingHours: hours([2, 3, 4, 5, 6, 7], '10:00', '17:00'),
  },
  {
    id: '8',
    name: 'Aprazível',
    categories: ['RESTAURANT'],
    neighborhood: 'Santa Teresa',
    photo: null,
    openingHours: [
      ...hours([3, 4, 5, 6], '12:00', '16:00'),
      ...hours([3, 4, 5, 6], '19:00', '00:30', true),
      ...hours([7], '12:00', '18:00'),
    ],
  },
];

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockGetPlaces(): Promise<Place[]> {
  await wait(400);
  return [...places];
}
