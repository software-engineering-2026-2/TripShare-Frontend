import type { EditableProfile, PublicProfile } from './profileTypes';

// Dados estáticos de demonstração usados apenas para visualizar a interface.
// Não são respostas de API nem devem ser tratados como dados reais.
export const DEMO_CURRENT_USER_ID = 'ana-souza';

export const demoProfiles: Record<string, PublicProfile> = {
  [DEMO_CURRENT_USER_ID]: {
    id: DEMO_CURRENT_USER_ID,
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

const { id, name, bio, hometown } = demoProfiles[DEMO_CURRENT_USER_ID];

export const DEMO_CURRENT_PROFILE: EditableProfile = {
  id,
  name,
  phone: '+5583999999999',
  bio,
  hometown,
};
