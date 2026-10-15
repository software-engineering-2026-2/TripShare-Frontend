# TripShare Frontend

Interface web do **TripShare**, plataforma para planejar viagens por destino, período, interesses e tempo disponível por dia, organizar atividades, consultar deslocamentos e compartilhar roteiros com a comunidade (votação, avaliação e ranking).

Este repositório contém apenas o front-end. O back-end (Go) fica em repositório separado.

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
docker compose up --build
```

Abra `http://localhost:3000`. Para parar:

```bash
docker compose down
```

> As variáveis `VITE_*` são embutidas no código na hora do **build**. Se mudar algum valor, rode `docker compose up --build` novamente.

## Variáveis de ambiente

Copie `web/.env.example` para `web/.env` e preencha os valores. O arquivo `.env` **nunca** deve ser enviado ao repositório.

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL base da API do back-end (padrão de desenvolvimento: `http://localhost:8080`) |
| `VITE_FIREBASE_API_KEY` | Chave de API do projeto Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Domínio de autenticação do Firebase |
| `VITE_FIREBASE_PROJECT_ID` | ID do projeto Firebase |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket de armazenamento do Firebase |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ID do remetente de mensagens |
| `VITE_FIREBASE_APP_ID` | ID do aplicativo web |

Peça os valores reais a quem configurou o projeto Firebase.

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

```
TripShare-Frontend/
├── docker-compose.yaml
├── README.md
└── web/
    ├── Dockerfile
    ├── nginx.conf
    ├── .env.example
    └── src/
        ├── app/          # Configuração global: providers, rotas e layout base
        ├── pages/        # Uma tela completa por rota
        ├── features/     # Código agrupado por área (auth, trips, itineraries, community...)
        ├── components/   # Componentes visuais genéricos e reutilizáveis
        ├── services/     # Comunicação com a API do back-end
        ├── hooks/        # Hooks customizados reutilizáveis
        └── lib/          # Configuração de bibliotecas e utilitários
```

Cada pasta de `src/` tem um `README.md` explicando o que vai nela.

**Regra prática:** se um componente só aparece em uma área específica (por exemplo, o cartão de roteiro do ranking), ele fica dentro de `features/`. Se qualquer tela pode usá-lo (por exemplo, um botão), fica em `components/`.

## Convenções

- **Commits:** seguem o padrão [Conventional Commits](https://www.conventionalcommits.org/), como `feat:`, `fix:`, `docs:`, `chore:` e `ci:`.
- **Formatação:** rode `npm run format` antes de commitar.
- **Qualidade:** `npm run lint` e `npm run build` precisam passar antes de abrir um Pull Request.
- **Segredos:** nunca versionar `.env` nem chaves de API.

## Integração com o back-end

O contrato da API será descrito em OpenAPI, mantido pelo back-end. Quando o arquivo estiver disponível, os tipos do front serão gerados a partir dele, de modo que mudanças no contrato quebrem a compilação e não a produção.

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
