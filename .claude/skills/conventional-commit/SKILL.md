---
name: conventional-commit
description: Use antes de qualquer git commit no TripShare, quando o usuário pedir "commita", "faz o commit", "commit this" ou similar. Define a branch correta para commitar e o formato Conventional Commits em português adotado pela equipe. Vale para todo commit, de qualquer tamanho.
---

# Commits no TripShare

O time segue **Conventional Commits 1.0.0** com descrições em **português**, conforme o documento "Padrões de contribuição" da equipe. Os commits também servem de evidência individual de contribuição na avaliação da disciplina, então cada um deve representar **uma alteração coerente** e ser legível por quem revisa.

## Passo 1: conferir a branch

```bash
git branch --show-current
git status --short
```

| Branch atual                          | Pode commitar?                                                       |
| ------------------------------------- | -------------------------------------------------------------------- |
| `task/REF<N>-T<NN>-<descricao-curta>` | Sim. É onde o trabalho das tasks acontece.                           |
| `chore/...`, `fix/...`, `docs/...`    | Sim, para ajustes fora de uma task (ex.: `chore/ignore-env-file`). Convenção da equipe, não prevista no documento. |
| `main`                                | **Nunca.** Só recebe PR de `development` ao final da etapa.          |
| `development`                         | **Não.** Só recebe PR de `REF<N>`.                                   |
| `REF<N>` (ex.: `REF01`, `REF02`)      | **Não.** Só recebe PR das branches de task.                          |

Se estiver numa branch protegida, pare e proponha criar a branch da task a partir da `REF<N>` correspondente:

```bash
git switch REF02 && git pull
git switch -c task/REF02-T04-acao-sair-logout
```

Se a `REF<N>` ainda não existir, ela deve ser criada a partir de `development` (`git switch -c REF<N> origin/development`). Confirme com o usuário antes de publicá-la, porque a branch é compartilhada com o time.

O `T<NN>` é a posição da subtask dentro do requisito na planilha de tasks (ex.: "Adicionar a ação Sair" é a 4ª subtask do RF-02, logo `T04`). A descrição vai em minúsculas, com hífens e sem acentos.

## Passo 2: escrever a mensagem

```
<tipo>[(escopo)][!]: <descrição>

[corpo opcional]

[rodapés opcionais]
```

- **Tipo** (obrigatório, minúsculo): `feat` para funcionalidades e `fix` para correções. O documento também cita `docs`, `test`, `refactor`, `perf`, `style`, `build`, `ci` e `chore`; a lista não é exaustiva, mas prefira esses tipos e não invente outros sem combinar com o time.
- **Escopo** (opcional): a área afetada, como `auth`, `trips`, `api`, `css`.
- **Descrição** (obrigatória): em português, com o verbo no **infinitivo** (`adicionar`, `integrar`, `corrigir`, `remover`), como nos exemplos do documento de padrões, começando em minúscula e sem ponto final. Mantenha identificadores de código e rotas como estão (`POST /auth/logout`, `UserMenu`). Procure ficar em até 72 caracteres.
- **Corpo** (opcional): separado por uma linha em branco. Explique o **porquê**, não o que o diff já mostra.
- **Rodapés** (opcionais): também separados do corpo por uma linha em branco (ex.: `BREAKING CHANGE: ...`).
- **Quebra de compatibilidade:** use `!` antes dos dois-pontos e/ou o rodapé `BREAKING CHANGE: <explicação>`, em maiúsculas.

### Exemplos

```
feat(trips): adicionar cadastro de viagens
fix(auth): corrigir validação do token
docs: documentar execução local
test(trips): cobrir cancelamento de viagem
feat: integrar cadastro com POST /auth/register
feat: adicionar ação Sair no menu do usuário integrada a POST /auth/logout
fix: remover import não utilizado
refactor: centraliza cores e extrai classes-base de formulários
style: ajusta paleta de cores da página de cadastro
ci: workflow de lint, teste, build e docker
chore: ignorar .env e remover do versionamento
```

Commits antigos no presente (`adiciona`, `integra`) não precisam ser reescritos; os novos usam o infinitivo.

### Com escopo e quebra de compatibilidade

```
feat(api)!: alterar formato de criação de viagens

BREAKING CHANGE: substituir origin e destination por route.
```

### Escolha do tipo

| Alteração                                         | Tipo       |
| ------------------------------------------------- | ---------- |
| Nova tela, componente, rota ou integração         | `feat`     |
| Correção de bug                                   | `fix`      |
| Só testes                                         | `test`     |
| Reorganização sem mudar comportamento             | `refactor` |
| Ajuste visual/CSS ou formatação, sem lógica       | `style`    |
| README, AGENTS.md, documentação                   | `docs`     |
| Dependências, Vite, TypeScript, Docker            | `build`    |
| Workflows do GitHub Actions                       | `ci`       |
| `.gitignore`, configs e manutenção em geral       | `chore`    |

## Passo 3: validar e commitar

Se o commit envolve código em `web/`, rode as mesmas verificações do CI antes de commitar:

```bash
cd web && npm run lint && npm run typecheck && npm run test
```

Adicione os arquivos pelo nome (evite `git add -A`) e commite com HEREDOC:

```bash
git add web/src/features/auth/components/UserMenu.tsx web/src/features/auth/hooks/useLogout.ts
git commit -m "$(cat <<'EOF'
feat: adicionar ação Sair no menu do usuário integrada a POST /auth/logout
EOF
)"
```

## Regras do projeto

- **Nunca versione `web/.env`.** Ele está no `.gitignore` e contém chaves locais. O modelo versionado é o `web/.env.example`.
- **Não misture assuntos:** se o diff tem uma feature e um ajuste de paleta sem relação, separe em dois commits.
- **Não use prefixos fora do padrão**, como `setup/REF-FE00 - feat: ...` ou `update: ...`, que aparecem no histórico antigo. A referência da task fica no nome da branch e no PR, não na mensagem do commit.

## Sinais de que algo está errado

| Situação                                              | O que fazer                                                       |
| ----------------------------------------------------- | ----------------------------------------------------------------- |
| Está em `main`, `development` ou `REF<N>`             | Parar e criar/trocar para a branch da task                        |
| Descrição em inglês ("add color palette")             | Reescrever em português                                           |
| Tipo vago ou não combinado (`update`, `setup`, `wip`)  | Usar um dos tipos da tabela                                       |
| Descrição genérica ("ajustes", "correções")           | Dizer o que mudou de fato                                         |
| `web/.env` aparece no `git status` como staged        | Tirar do stage com `git restore --staged web/.env`                |
| Lint/testes falhando                                  | Corrigir antes, ou avisar o usuário e só commitar se ele confirmar |
