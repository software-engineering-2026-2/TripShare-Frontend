import type { EditableProfile, PublicProfile } from './profileTypes';

// Dados estáticos de demonstração usados apenas para visualizar a interface.
// Não são respostas de API nem devem ser tratados como dados reais.
export const DEMO_CURRENT_USER_ID = 'ana-souza';

export const demoProfiles: Record<string, PublicProfile> = {
  'ana-souza': {
    id: 'ana-souza',
    username: 'ana.souza',
    name: 'Ana Souza',
    bio: 'Viajo pelo Brasil em busca de praias, cafés e trilhas.',
    hometown: 'Campina Grande',
  },
  'bruno-lima': {
    id: 'bruno-lima',
    username: 'bruno.lima',
    name: 'Bruno Lima',
    bio: 'Mochileiro nas horas vagas e fotógrafo amador.',
    hometown: 'Recife',
  },
};

export const DEMO_CURRENT_PROFILE: EditableProfile = {
  id: DEMO_CURRENT_USER_ID,
  name: 'Ana Souza',
  phone: '+5583999999999',
  bio: 'Viajo pelo Brasil em busca de praias, cafés e trilhas.',
  hometown: 'Campina Grande',
};
