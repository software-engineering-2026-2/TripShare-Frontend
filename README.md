# TripShare Frontend

Interface web do **TripShare**, plataforma para planejar viagens por destino, período, interesses e tempo disponível por dia, organizar atividades, consultar deslocamentos e compartilhar roteiros com a comunidade (votação, avaliação e ranking).

Este repositório contém apenas o front-end. O backend Java/Spring Boot fica no repositório TripShare-Backend.

## Identidade visual — TripShare Coral

A cor principal é **`#FF645C`**, acompanhada de branco, grafite, amarelo e verde suave. O visual usa títulos Bricolage Grotesque, texto DM Sans e ilustrações de percursos. As fontes são locais, com licenças em `web/public/fonts/`.

Os tokens ficam em `web/src/commons/styles/global.css`. Cada tela tem seu CSS em `web/src/pages/<tela>/styles.css`. Consulte o [sistema visual](docs/design-system.md) para cores, composição, movimento e acessibilidade.

## Tecnologias

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) (build e servidor de desenvolvimento)
- [React Router](https://reactrouter.com/) (rotas)
- [TanStack Query](https://tanstack.com/query) (chamadas à API e cache)
- [Firebase](https://firebase.google.com/) (configuração em andamento)
- ESLint e Prettier (qualidade e formatação)
- Vitest e Testing Library (testes)
- Docker e Nginx (empacotamento e servidor)

## Pré-requisitos

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) **22 ou superior** (o Vite exige 20.19+ ou 22.12+; o Docker e o CI usam a versão 22)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (apenas para rodar via container)

Confira a versão do Node com:

```bash
node -v
```

## Como rodar

### Localmente (recomendado para desenvolver)

```bash
git clone <url-do-repositorio>
cd TripShare-Frontend/web
npm install
cp .env.example .env     # no PowerShell: Copy-Item .env.example .env
npm run dev
```

Abra `http://localhost:5173` no navegador.

### Com Docker

Na raiz do repositório:

```bash
docker compose --env-file web/.env up --build
```

Abra `http://localhost:3000`. Para parar:

```bash
docker compose down
```

> As variáveis `VITE_*` são embutidas no código na hora do **build**. Se mudar algum valor, execute o mesmo comando novamente para reconstruir a imagem.

## Variáveis de ambiente

Copie `web/.env.example` para `web/.env` e preencha os valores. O arquivo `.env` **nunca** deve ser enviado ao repositório.

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | Base de API no navegador. O padrão `/api` usa o proxy da mesma origem. Uma URL absoluta requer CORS no servidor de destino. |
| `API_PROXY_TARGET` | Origem da API para o Vite (dev e preview). Padrão `http://localhost:8080`. |
| `DOCKER_API_PROXY_TARGET` | Origem da API para o Nginx no Compose. Padrão `http://host.docker.internal:8080`. |
| `VITE_USE_MOCKS` | Use `true` para demonstrar viagens e lugares com dados fictícios. O padrão é `false`. |
| `VITE_FIREBASE_API_KEY` | Chave de API do projeto Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Domínio de autenticação do Firebase |
| `VITE_FIREBASE_PROJECT_ID` | ID do projeto Firebase |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket de armazenamento do Firebase |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ID do remetente de mensagens |
| `VITE_FIREBASE_APP_ID` | ID do aplicativo web |

Peça os valores públicos do aplicativo web a quem configurou o projeto Firebase. No Docker, o Compose passa os valores `VITE_*` como argumentos de build. Os proxies removem `/api` ao encaminhar ao backend e preservam o caminho e a query da operação. Se um `web/.env` antigo ainda aponta diretamente para `http://localhost:8080`, configure `VITE_API_URL=/api` para ativar o proxy.

No modo real, “Minhas Viagens” mostra as respostas da sessão da página, pois o backend ainda não oferece lista nem leitura de viagem por ID. Para criar uma viagem, informe o UUID de um destino cadastrado no ambiente. O seed de demonstração do backend inclui o destino `20000000-0000-0000-0000-000000000001` quando aplicado. O modo de demonstração usa a busca por nome e os destinos fictícios.


## Scripts

Execute dentro da pasta `web`:

| Comando | O que faz |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Verifica os tipos e gera a versão de produção em `dist/` |
| `npm run preview` | Serve localmente a versão de produção |
| `npm run lint` | Roda o ESLint |
| `npm run typecheck` | Verifica os tipos do TypeScript |
| `npm run format` | Formata o código com Prettier |
| `npm run test` | Roda os testes com Vitest |

## Estrutura do projeto

Em `web/src`, cada tela agrupa seus componentes, estilos e testes. As rotas ficam em `routes`, e componentes e layouts compartilhados em `components` e `templates`. Os contratos e operações HTTP ficam em `resources/api`, apoiados por um cliente comum em `resources/client`.

Veja onde adicionar código e como usar o cliente na [arquitetura do frontend](docs/frontend-architecture.md).

## Convenções

- **Commits:** seguem o padrão [Conventional Commits](https://www.conventionalcommits.org/), como `feat:`, `fix:`, `docs:`, `chore:` e `ci:`.
- **Formatação:** rode `npm run format` antes de commitar.
- **Qualidade:** `npm run lint` e `npm run build` precisam passar antes de abrir um Pull Request.
- **Segredos:** nunca versionar `.env` nem chaves de API.

## Integração com o back-end

As operações de viagens seguem o OpenAPI do backend. Para autenticação e perfis, consulte a documentação complementar daquele repositório. Os tipos TypeScript dos contratos ficam ao lado dos serviços.

## Status

Projeto em fase de setup (task FE-00).

- [x] Scaffold React com Vite e TypeScript
- [x] Lint, formatação e ferramentas de teste
- [x] Estrutura de pastas e READMEs
- [x] Docker (Dockerfile, Nginx e Compose)
- [ ] CI (lint, testes, build e Docker)
- [ ] Firebase
- [ ] Geração de tipos a partir do OpenAPI
- [ ] Chamada de teste ao `/health` do back-end
