# Arquitetura do frontend

O TripShare usa React Router para navegação, TanStack Query para dados remotos e Firebase para a identidade. O código está em `web/src`.

| Pasta | Responsabilidade |
| --- | --- |
| `pages/<tela>/` | Entrada em `index.tsx`, componentes e CSS locais, testes em `__tests__/`. |
| `routes/` | Grupos de rotas, caminhos, redirecionamentos e proteção por sessão. |
| `components/` | Peças reutilizadas entre telas, como diálogo, botão em andamento e aviso de erro. |
| `templates/` | Estruturas comuns de autenticação e conteúdo. |
| `providers/` | Sessão, cache do usuário e composição da aplicação. |
| `hooks/` | Hooks de interface compartilhados. |
| `commons/` | Configuração, política de consultas e tokens TripShare Coral. |
| `resources/client/` | Transporte HTTP, integração com a sessão confirmada e SDK Firebase. |
| `resources/api/<domínio>/` | Contratos, operações, consultas e mocks do domínio. |
| `resources/auth/` | Restauração da sessão, login, compensação do cadastro e logout. |

## Onde adicionar uma tela

Crie `pages/<tela>/index.tsx` e registre a URL em `routes/paths.ts` e no grupo apropriado. Mantenha testes, estilos e código exclusivo no diretório da tela. Use os templates de autenticação ou conteúdo para manter uma hierarquia consistente. Compartilhe componentes usados em mais de uma tela.

## Onde adicionar uma requisição

1. Consulte o contrato local em [docs/openapi.yaml](openapi.yaml) (espelho do backend). Autenticação e perfis também estão descritos em [docs/authentication.md](authentication.md). Nunca invente rotas, métodos ou campos fora do contrato.
2. Registre o caminho em `resources/api/paths.ts`, defina o contrato no domínio e mantenha em `services.ts` o método, a entrada e as conversões da resposta.
3. Use `requestAuthenticated` para que o cliente obtenha o Bearer da sessão confirmada. As operações iniciais de autenticação enviam o token provisório explicitamente pelo mesmo transporte. Veja o [fluxo de autenticação](authentication.md).
4. Use TanStack Query para dados remotos. Inclua o UID e os parâmetros na chave e repasse o `signal`. Exiba `LoadingState` na primeira carga e `ErrorState` onde houver recuperação possível. Use `ActionButton` para indicar envio e bloquear cliques enquanto a operação estiver pendente.

O cliente usa `/api` por padrão e aceita `VITE_API_URL` como substituição. Vite e Nginx encaminham o prefixo local para o Spring. O transporte centraliza JSON, query, cancelamento e respostas sem corpo. `ApiError` mantém o status e o corpo de erros HTTP. `ApiTransportError` identifica falhas de conexão, timeout e respostas inválidas. Consultas repetem falhas transitórias até três vezes. Mutações precisam de uma nova ação explícita para tentar de novo.

Em modo real, a lista de viagens mantém os resultados da sessão em memória. Operações pendentes têm `TODO(backend)` no domínio ou na tela. O modo `VITE_USE_MOCKS=true` usa os dados de demonstração para viagens e lugares.

## Sistema visual

Consulte [Design do TripShare](design-system.md) para os tokens, tipografia, templates e regras de movimento. `AppHeader` oferece navegação comum e usa apenas a sessão confirmada para mostrar perfil e saída. Não faz novas consultas à API.
