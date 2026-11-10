# Skills do Claude Code no TripShare

Esta pasta guarda as skills que o [Claude Code](https://docs.claude.com/en/docs/claude-code) usa neste repositório. Uma skill é um arquivo `SKILL.md` com instruções que o Claude carrega sozinho quando o pedido combina com a `description` do cabeçalho. Por exemplo, ao ouvir "commita isso", ele segue a `conventional-commit`. Também dá para chamar uma skill pelo nome: `/conventional-commit` ou `/create-pr`.

As regras das skills da equipe vêm do documento **"Padrões de contribuição"** e do histórico de commits e PRs do repositório. As skills externas vêm de repositórios públicos no GitHub, e os ajustes delas para o TripShare ficam na seção **Skills** do `AGENTS.md`.

## Skills da equipe

| Skill | Quando é usada | O que faz |
| --- | --- | --- |
| [`conventional-commit`](conventional-commit/SKILL.md) | Antes de qualquer `git commit` | Impede commit em `main`, `development` e `REF<N>`. Monta a mensagem em Conventional Commits, em português. Roda lint, typecheck e testes antes de commitar. |
| [`create-pr`](create-pr/SKILL.md) | "Abrir PR", "criar PR" | Escolhe a base pelo fluxo `task → REF<N> → development → main`. Confere os commits, valida o projeto, monta título e corpo no padrão da equipe e cria o PR com revisor (tirado da planilha) e labels. |

## Skills externas

| Skill | Origem | Quando é usada |
| --- | --- | --- |
| [`frontend-design`](frontend-design/SKILL.md) | [anthropics/skills](https://github.com/anthropics/skills) | Criar ou redesenhar telas |
| [`web-design-guidelines`](web-design-guidelines/SKILL.md) | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | Revisar acessibilidade e UX de uma tela |
| [`vercel-react-best-practices`](vercel-react-best-practices/SKILL.md) | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | Escrever ou revisar componentes React |
| [`tanstack-query-best-practices`](tanstack-query-best-practices/SKILL.md) | [deckardger/tanstack-agent-skills](https://github.com/deckardger/tanstack-agent-skills) | Criar ou alterar queries e mutations |
| [`firebase-auth-basics`](firebase-auth-basics/SKILL.md) | [firebase/agent-skills](https://github.com/firebase/agent-skills) | Mexer no login com Firebase |

Elas foram instaladas com a CLI [`skills`](https://skills.sh), que registra a origem e o hash de cada uma em `skills-lock.json`, na raiz do repositório. Não edite os arquivos dessas pastas: a atualização sobrescreve tudo. Para atualizar:

```bash
npx skills update
```

Revise o diff antes de commitar a atualização. As skills rodam com as mesmas permissões do agente.

## Requisitos

### 1. Claude Code

Abra o Claude Code na **raiz do repositório** (`TripShare-Frontend/`). As skills de projeto só são carregadas a partir de `.claude/skills/` do diretório de trabalho. Para conferir, digite `/` no prompt: as skills das duas tabelas acima devem aparecer na lista.

O Claude Code lê o `CLAUDE.md`, não o `AGENTS.md`. Por isso o `CLAUDE.md` da raiz só importa o `AGENTS.md` (`@AGENTS.md`): as regras ficam num lugar só e valem para qualquer agente.

### 2. GitHub CLI (`gh`), usada pela `create-pr`

A `create-pr` cria o PR, adiciona revisor e labels e pede nova revisão, tudo pelo `gh`.

**Instalação**

```bash
# macOS
brew install gh

# Ubuntu/Debian
sudo apt install gh

# Windows
winget install --id GitHub.cli
```

Para outros sistemas, veja https://cli.github.com/. Confira a instalação com `gh --version`.

**Autenticação**

```bash
gh auth login
```

Responda às perguntas assim:

1. **Where do you use GitHub?** `GitHub.com`
2. **Preferred protocol for Git operations?** `SSH`, porque o `origin` do repositório usa SSH (`git@github.com:software-engineering-2026-2/TripShare-Frontend.git`). Se você clonou por HTTPS, escolha `HTTPS` e aceite autenticar o Git com as credenciais do GitHub.
3. **Upload your SSH public key?** Escolha sua chave, se ela ainda não estiver no GitHub.
4. **How would you like to authenticate?** `Login with a web browser`

O login padrão já pede os escopos necessários: `repo` (criar PR, adicionar revisor e labels) e `read:org` (o repositório pertence à organização `software-engineering-2026-2`).

**Verificação**

```bash
gh auth status
```

A saída deve mostrar `Logged in to github.com account <seu-login>`, com `repo` e `read:org` entre os escopos. Se faltar algum, rode `gh auth refresh -s repo,read:org`.

Para confirmar que o `gh` enxerga o repositório:

```bash
gh repo view software-engineering-2026-2/TripShare-Frontend --json name,viewerPermission
```

`viewerPermission` precisa ser `WRITE`, `MAINTAIN` ou `ADMIN`. Com `READ`, você não consegue criar branches no repositório nem adicionar revisores e labels: peça acesso a quem administra a organização.

**Mais de uma conta no GitHub**

Se você usa mais de uma conta, confira se a conta ativa no `gh` é a mesma que colabora no repositório. Para listar as contas use `gh auth status` e para trocar use `gh auth switch`. A conta da chave SSH usada pelo `git push` também precisa ser essa, senão o PR sai com um autor e os commits são enviados por outro.

### 3. Git

A `conventional-commit` usa só o Git. Configure seu nome e e-mail, porque eles aparecem nos commits que contam como evidência de contribuição:

```bash
git config user.name   # deve mostrar seu nome
git config user.email  # deve ser um e-mail associado à sua conta do GitHub
```

### 4. Node.js e dependências do projeto

As duas skills de Git rodam as verificações do CI antes de commitar e de abrir o PR. É preciso ter o **Node.js 22** (a mesma versão do CI) e as dependências instaladas:

```bash
cd web
npm ci
```

Comandos usados: `npm run lint`, `npm run typecheck`, `npm run test` e `npm run build`.

### 5. Acesso à planilha de tasks

A `create-pr` lê a planilha de tasks com o `curl`, sem login, para descobrir a subtask e o revisor. Ela lista as páginas da planilha (uma por semana) e lê cada uma em CSV, então novas semanas são encontradas sem ajuste na skill. Para isso, a planilha precisa continuar com acesso **"Qualquer pessoa com o link pode ver"**. O `curl` já vem no macOS e na maioria das distribuições Linux.

A skill só **lê** a planilha. A atualização do andamento (ex.: para `pr feito`) continua sendo manual.

## Checklist rápido

```bash
gh --version && gh auth status        # gh instalado e autenticado
git config user.name                  # nome configurado
node --version                        # v22.x
(cd web && npm ci)                    # dependências instaladas
```

## Mantendo as skills

- Cada skill fica em `.claude/skills/<nome>/SKILL.md`. O cabeçalho precisa ter `name` e `description`, e é a `description` que faz o Claude decidir quando usar a skill.
- Se o documento "Padrões de contribuição" mudar, atualize as skills na mesma PR, para que as regras não fiquem divergentes.
- A tabela de nomes da planilha → logins do GitHub fica na `create-pr`. Atualize-a quando alguém entrar no time ou trocar de login.
