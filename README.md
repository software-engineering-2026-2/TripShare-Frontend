# TripShare Frontend

Interface web do **TripShare**, plataforma para planejar viagens por destino e período e organizar atividades.

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

### Com dados de demonstração (sem back-end)

Para testar as telas sem subir o back-end, ligue os dados fictícios em `web/.env`:

```
VITE_USE_MOCKS=true
```

Reinicie o `npm run dev`, porque o Vite só lê o `.env` ao iniciar. Nesse modo, as telas de viagens e de locais não pedem login:

| Tela | Endereço |
|---|---|
| Minhas viagens (criar, editar e excluir) | `http://localhost:5173/minhas-viagens` |
| Detalhe de uma viagem | `http://localhost:5173/minhas-viagens/1` |
| Pontos turísticos da viagem | `http://localhost:5173/minhas-viagens/1/explorar` |
| Detalhes de um local | `http://localhost:5173/locais/1?tripId=1` |

- Viagens de exemplo: `1` e `2`. Locais de exemplo: `1` a `6`.
- O perfil (`/perfil/...`) continua exigindo login de verdade.
- Os dados ficam só na memória: o que for criado ou editado some ao recarregar a página.
- Para voltar a usar o back-end, configure `VITE_USE_MOCKS=false` e reinicie o `npm run dev`.

### Com o back-end local

1. Configure o Firebase (seção abaixo).
2. Suba o back-end conforme o README do `TripShare-Backend`, com o Docker Desktop aberto.
3. Em `web/.env`, use `VITE_API_URL=/api`, `VITE_USE_MOCKS=false` e os valores `VITE_FIREBASE_*`.
4. Rode `npm run dev`. O Vite encaminha `/api` para `http://localhost:8080`.

Se a porta 5432 já estiver ocupada por um PostgreSQL instalado no Windows, o back-end se conecta a ele e falha com erro de senha. Nesse caso, antes de subir o back-end, rode `$env:POSTGRES_PORT = "5433"` no mesmo terminal.

### Configurar o Firebase

O front e o back usam o **mesmo** projeto Firebase. Se as chaves vierem de projetos diferentes, o back-end recusa o login. Para os passos 1 e 2 é preciso ser proprietário ou editor do projeto; se a opção não aparecer, peça acesso a quem criou o projeto.

1. **Configuração pública do front:** no [console do Firebase](https://console.firebase.google.com), abra o projeto do TripShare → ⚙️ **Configurações do projeto** → aba **Geral** → **Seus apps** → app **Web** (`</>`) → **Configuração do SDK** → **Configuração**. Copie os valores para o `web/.env`, sem aspas:

   | Campo no console | Variável em `web/.env` |
   |---|---|
   | `apiKey` | `VITE_FIREBASE_API_KEY` |
   | `authDomain` | `VITE_FIREBASE_AUTH_DOMAIN` |
   | `projectId` | `VITE_FIREBASE_PROJECT_ID` |
   | `storageBucket` | `VITE_FIREBASE_STORAGE_BUCKET` |
   | `messagingSenderId` | `VITE_FIREBASE_MESSAGING_SENDER_ID` |
   | `appId` | `VITE_FIREBASE_APP_ID` |

2. **Chave privada do back-end:** em ⚙️ **Configurações do projeto** → aba **Contas de serviço** → **Gerar nova chave privada**. Salve o arquivo baixado como `.secrets/firebase.json` na raiz do `TripShare-Backend`. No PowerShell:

   ```powershell
   cd TripShare-Backend
   mkdir .secrets
   Move-Item "$HOME\Downloads\NOME-DO-ARQUIVO.json" .secrets\firebase.json
   ```

   Esse arquivo dá acesso de administrador ao projeto: nunca envie ao repositório nem ao grupo do time. A pasta `.secrets/` já está no `.gitignore` do back-end.

3. **Métodos de login:** em **Authentication** → **Método de login**, ative **Google** e **E-mail/senha**. Em **Authentication** → **Configurações** → **Domínios autorizados**, confirme que `localhost` está na lista.

A chave da API do Foursquare (`.secrets/foursquare.txt` no back-end) é separada do Firebase. Sem ela, o back-end sobe, mas a busca de locais externos não funciona. Peça a quem fez a integração.

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

O contrato da API está espelhado localmente em [docs/openapi.yaml](docs/openapi.yaml). Para fluxos de autenticação e sessão, consulte [docs/authentication.md](docs/authentication.md).

## Documentação

| Documento | Conteúdo |
| --- | --- |
| [Especificação do projeto](docs/especificacao-do-projeto.md) | 15 Requisitos Funcionais do Plano B (`RF-01`–`RF-05`, `RF-08`–`RF-17`). |
| [Contrato da API (OpenAPI)](docs/openapi.yaml) | Espelho somente-leitura do contrato do backend. |
| [Arquitetura do frontend](docs/frontend-architecture.md) | Estrutura de pastas, rotas, cliente HTTP e TanStack Query. |
| [Autenticação](docs/authentication.md) | Cadastro sequencial, compensação, login e sessão Firebase. |
| [Sistema visual](docs/design-system.md) | Paleta TripShare Coral, tipografia, composição e acessibilidade. |
