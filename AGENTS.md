# AGENTS.md

Instruções oficiais para qualquer agente de IA trabalhando no `TripShare-Frontend`. Responda e escreva documentação em **português do Brasil**, preservando nomes de comandos, APIs, arquivos e identificadores técnicos.

## 0. Preflight (antes de começar qualquer tarefa)

Antes de planejar ou editar qualquer arquivo, verifique se sua branch está sincronizada com `origin/development`:
1. Rode `git fetch origin`.
2. Verifique `git rev-list --count HEAD..origin/development`.
3. Se o resultado for maior que `0`:
   - Se `git status --porcelain` estiver limpo, avise o usuário e rode `git merge origin/development`.
   - Se houver alterações locais não commitadas, **pare e avise o usuário** que `origin/development` avançou antes de continuar.

## 1. Fontes da Verdade (leia antes de codar)

| Arquivo | Quando ler |
| --- | --- |
| `docs/especificacao-do-projeto.md` | **Sempre** — contém os 15 Requisitos Funcionais do Plano B (`RF-01`–`RF-05`, `RF-08`–`RF-17`). |
| `docs/openapi.yaml` | **Sempre** antes de criar ou alterar qualquer serviço, tipo HTTP ou mock (espelho somente-leitura do backend). |
| `docs/frontend-architecture.md` | Ao adicionar telas, rotas, serviços ou queries TanStack Query. |
| `docs/authentication.md` | Ao alterar cadastro, login, sessão Firebase ou compensação. |
| `docs/design-system.md` | Ao criar ou alterar telas, componentes ou CSS. |

## 2. Regras Inegociáveis

- **NUNCA invente rotas ou campos da API:** Antes de escrever qualquer chamada HTTP, tipo ou mock, consulte `docs/openapi.yaml` (e `docs/authentication.md` para auth/perfil).
  - Se uma rota ainda **não existir** ou estiver marcada como planejada no `docs/openapi.yaml`, crie um mock isolado em `web/src/resources/api/<domínio>/`, marque com `// TODO(backend)` e **NUNCA** altere `docs/openapi.yaml` por conta própria (o contrato é atualizado em conjunto com o backend).
- **Escopo Fechado (Plano B):** Implemente APENAS o que pertence aos 15 RFs de `docs/especificacao-do-projeto.md`. **NUNCA** implemente comunidade (publicação pública, feed social, curtidas, comentários, avaliações, votos, ranking, favoritos, seguir usuários, cópia de roteiros, notificações, denúncias ou moderação).
- **Simplicidade e Mudanças Cirúrgicas:** Escreva o mínimo de código necessário. Coloque código novo em arquivos novos e mexa o mínimo possível em arquivos compartilhados (rotas, cabeçalho, tela da viagem). Não refatore fora do escopo.
- **Não assuma — pergunte:** Se houver conflito entre contrato, requisitos ou código, reporte antes de decidir sozinho.

## 3. Identidade Visual — TripShare Coral

A identidade atual é **TripShare Coral** (`--color-primary: #FF645C`), substituindo a antiga paleta Copacabana Ocean.
- Use CSS puro (sem Tailwind nem biblioteca de componentes), com tokens em `web/src/commons/styles/global.css` e CSS local em `web/src/pages/<tela>/styles.css`.
- Títulos usam Bricolage Grotesque e corpo usa DM Sans (`web/public/fonts/`).
- Use `--color-on-primary` (escuro) sobre coral e `--color-link` para links em superfícies claras.
- Preserve as cores semânticas dos turnos (`--color-shift-manha`, `--color-shift-tarde`, `--color-shift-noite`, `--color-shift-madrugada`).
- Reutilize `Brand`, `JourneyArt`, `AppHeader`, `AuthLayout` e `ContentPage`. Mantenha foco visível, rótulos, alvos >= 44 px e respeito a `prefers-reduced-motion`.

## 4. Fluxo de Git

- Crie sua branch a partir de `development` e abra PR direto para `development` (não usamos mais branches `US<N>` nem `REF<N>`).
- Use nomes claros em inglês para novos arquivos e diretórios.
- **NUNCA** execute `git push` sem autorização explícita do usuário.

## 5. Skills Disponíveis (`.agents/skills/`)

Use apenas quando aplicável à tarefa (leia o `SKILL.md` antes):
- `conventional-commit` — padrão de commits do time.
- `firebase-auth-basics` — autenticação Firebase no cliente web.
- `tanstack-query-best-practices` — queries, mutations e cache.
- `web-design-guidelines` — revisão de acessibilidade e interface.

## 6. Verificação Obrigatória

Antes de concluir qualquer alteração de código, rode dentro de `web/`:
```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Se algum comando não puder ser executado, informe explicitamente a limitação. Na entrega, resuma as alterações e liste os arquivos modificados.
