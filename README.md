# TripShare Frontend

Interface web do **TripShare**, plataforma para planejar viagens por destino, período, interesses e tempo disponível por dia, organizar atividades, consultar deslocamentos e compartilhar roteiros com a comunidade (votação, avaliação e ranking).

Este repositório contém apenas o front-end. O back-end (Go) fica em repositório separado.

## 🎨 Paleta de Cores Oficial — *Copacabana Ocean*

A identidade visual oficial do projeto utiliza o tema **Copacabana Ocean**, inspirado na orla e no mar do Rio de Janeiro, combinando tons de azul oceânico com superfícies claras e frescas.

### Tokens Principais (CSS Variables em `app/globals.css`)

| Token | Variável CSS | Hex | Uso Principal |
| :--- | :--- | :--- | :--- |
| **Primary** | `--primary` | `#0077B6` | Botões principais, ícones de destaque, links ativos e badges |
| **Primary Foreground** | `--primary-foreground` | `#FFFFFF` | Texto e ícones sobre elementos `--primary` |
| **Brand Gradient (From)** | `--brand-from` | `#0096C7` | Início do gradiente de ações de destaque (ex.: *Distribuir Viagem*, *Gerar Roteiro*) |
| **Brand Gradient (To)** | `--brand-to` | `#023E8A` | Fim do gradiente de ações de destaque |
| **Background** | `--background` | `#F8FDFF` | Fundo geral das páginas (branco gelo suave) |
| **Foreground** | `--foreground` | `#0A2540` | Texto principal e títulos (azul-marinho profundo) |
| **Card / Popover** | `--card` / `--popover` | `#FFFFFF` | Superfície de cartões, modais e popovers |
| **Secondary / Muted** | `--secondary` / `--muted` | `#EBF5F8` | Fundos secundários, áreas agrupadas e containers sutis |
| **Muted Foreground** | `--muted-foreground` | `#4A6B82` | Textos de apoio, legendas, horários e metadados |
| **Accent** | `--accent` | `#E0F0F6` | Estado de hover em botões secundários, menus e itens selecionáveis |
| **Border** | `--border` | `#D8E8F0` | Divisórias, bordas de cartões e contornos |
| **Input** | `--input` | `#C5DCE8` | Bordas de campos de formulário e seletores |
| **Ring** | `--ring` | `#0077B6` | Anel de foco de acessibilidade (`focus-visible`) |
| **Destructive** | `--destructive` | `#C13515` | Alertas de conflito de horário e ações de exclusão |

### Cores Semânticas dos Turnos do Roteiro

Os turnos do cronograma diário e os pins do mapa mantêm cores semânticas fixas para rápida identificação visual:

| Turno | Horário | Variável CSS | Hex | Texto (`onColor`) |
| :--- | :--- | :--- | :--- | :--- |
| **Manhã** | `06:00 – 12:00` | `--color-shift-manha` | `#F5B301` | `#3D2C00` |
| **Tarde** | `12:00 – 18:00` | `--color-shift-tarde` | `#F2711C` | `#FFFFFF` |
| **Noite** | `18:00 – 00:00` | `--color-shift-noite` | `#38BDF8` | `#06304A` |
| **Madrugada** | `00:00 – 06:00` | `--color-shift-madrugada` | `#7C3AED` | `#FFFFFF` |


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
