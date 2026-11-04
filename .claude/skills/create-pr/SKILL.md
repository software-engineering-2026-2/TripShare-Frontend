---
name: create-pr
description: Cria um Pull Request no GitHub seguindo o fluxo de contribuição do TripShare (task → REF<N> → development → main), com título em Conventional Commits, corpo no padrão da equipe e revisor tirado da planilha de tasks. Use quando o usuário disser "criar PR", "abrir PR", "abre um PR", "create PR", "open PR" ou "me ajuda com o PR". Não use para revisar, aprovar ou mergear PRs.
---

# Criar PR no TripShare

Repositório: `software-engineering-2026-2/TripShare-Frontend`. O fluxo de integração, definido no documento "Padrões de contribuição", é:

```
task/REF<N>-T<NN>-<descricao>  →  REF<N>  →  development  →  main (só ao final da etapa)
```

## Passo 1: coletar o contexto

```bash
git branch --show-current
git fetch origin
git log --oneline origin/<base>..HEAD
git diff --stat origin/<base>...HEAD
```

### Definir a base pela branch de origem

| Branch de origem                   | Base do PR                                                                |
| ---------------------------------- | ------------------------------------------------------------------------- |
| `task/REF<N>-T<NN>-...`            | `REF<N>` (ex.: `task/REF02-T04-acao-sair-logout` → `REF02`)                |
| `REF<N>`                           | `development`, quando todas as tasks da referência estiverem integradas   |
| `development`                      | `main`, **só ao final da etapa**. Confirme com o usuário antes de abrir    |
| `chore/...`, `fix/...`, `docs/...` | `development` (convenção da equipe para ajustes fora de uma task; o documento não prevê essas branches). Se o usuário pedir `main`, lembre que o padrão não prevê PR direto para `main` e confirme |

Nunca abra PR de uma task direto para `development` ou `main` (como aconteceu no #14).

### Conferir os commits

O documento exige que os commits do PR sigam o padrão. Confira as mensagens listadas pelo `git log` acima com a skill `conventional-commit`. Se alguma estiver fora do padrão (em inglês, sem tipo, com tipo inventado), avise o usuário antes de abrir o PR e sugira corrigir com `git commit --amend` (último commit) ou um rebase, se a branch ainda não foi revisada.

### Verificar dependências entre tasks

Se `git log origin/REF<N>..HEAD` mostrar commits de **outra task ainda não mergeada**, o PR depende dela. Mesmo assim, a base continua sendo `REF<N>`: o documento de padrões manda abrir o PR da task para a `REF<N>` correspondente, sem exceção. Adicione no topo do corpo o aviso de dependência (veja o #16), dizendo:

- que o merge só deve ser feito depois da outra PR;
- que, até lá, o diff também mostra os commits da outra task;
- qual commit revisar para ver só esta task.

### Consultar a planilha de tasks

A planilha é pública e pode ser lida em CSV:

```bash
curl -sL "https://docs.google.com/spreadsheets/d/1OFr3qFPQGlfouZ0DKPH4TAkghJlATdXhmQ9UufZ2nA8/export?format=csv&gid=0"
```

Colunas: `requisito funcional, subtask, milestone, responsavel, revisor, prazo, andamento`. O `T<NN>` da branch é a posição da subtask dentro do requisito (ex.: a 4ª linha do RF-02 é a `REF02-T04`). Use a planilha para:

- confirmar o texto da subtask e o requisito (RF-0X) que ela atende;
- descobrir o **revisor** da subtask.

Atenção: a numeração da `REF<N>` nem sempre é igual à do RF. "Minhas viagens" é o RF-04 na planilha, mas a branch é `REF05`. Na dúvida, confirme com o usuário.

## Passo 2: validar localmente

O CI roda lint, testes, build e o build do Docker em cada PR. Rode antes:

```bash
cd web && npm run lint && npm run typecheck && npm run test && npm run build
```

Anote o resultado (e o número de testes) para a seção de validação. Se algo falhar, avise o usuário antes de abrir o PR.

## Passo 3: montar o título

Use o mesmo formato dos commits (veja a skill `conventional-commit`): `<tipo>[(escopo)]: <descrição em português>`.

- Bom: `feat: adiciona ação Sair no menu do usuário integrada a POST /auth/logout`
- Bom: `chore: ignora .env e remove do versionamento`
- Ruim: `Task/ref01 t01 integrar rota cadastro`, que é o título gerado automaticamente pelo GitHub a partir da branch. Nunca use esse.

Se a branch tem um único commit, o título pode ser a própria mensagem dele.

## Passo 4: montar o corpo

Escreva em português, com frases diretas. Use o modelo abaixo e remova as seções opcionais que não se aplicam:

````markdown
Implementa <o que foi feito> para a REF<N>-T<NN> (RF-0X: "<texto da subtask na planilha>").

> **Depende da PR #<número>. Faça o merge desta PR só depois da #<número>.** <Por que depende, aviso de que o diff inclui os commits da outra task até ela ser mergeada e qual commit revisar.>  ← só se houver dependência

### O que foi feito

**<Grupo 1, ex.: Menu do usuário>**

- <Alteração, explicando o porquê quando não for óbvio.>

**<Grupo 2, ex.: Testes>**

- <...>

### Arquivos

**Novos:**

- `web/src/...`

**Alterados:**

- `web/src/...`

### Pontos de atenção  ← opcional

- **<Tema>:** <pendências de contrato com o back-end, conflitos previstos com outras PRs, decisões provisórias.>

### Como validar

```bash
cd web
npm run lint && npm run typecheck && npm run test && npm run build
```

<Resultado: o que passou, quantos testes, e o que não foi testado manualmente e por quê.>

### Fora do escopo

- <O que ficou para outras tasks, citando a REF/T ou a dependência do back-end, quando houver.>
````

Para PRs de integração, a primeira linha deve identificar a referência ou a etapa, como pede a conferência antes do merge:

- **`REF<N>` → `development`:** `Integra a REF<N> (RF-0X: "<nome do requisito>") em development.` Em "O que foi feito", liste as tasks incluídas com o número de cada PR (ex.: `- REF02-T01: tela de login (#11)`) e diga se alguma subtask do requisito na planilha ficou de fora.
- **`development` → `main`:** `Consolida a entrega da <etapa/milestone, ex.: Semana 1> na main.` Liste as `REF<N>` integradas, com o PR de cada uma, e confirme que a etapa está concluída.

Para tarefas sem task associada (`chore/...`), troque a primeira linha por uma frase dizendo o problema resolvido e acrescente, se fizer sentido, uma seção `### Impacto para o time` (veja o #17).

**Não inclua** a linha "🤖 Generated with Claude Code" nem qualquer outra atribuição de IA.

## Passo 5: criar o PR

Se a branch ainda não estiver no remoto, rode `git push -u origin HEAD` primeiro.

```bash
gh pr create \
  --base REF02 \
  --title "feat: adiciona ação Sair no menu do usuário integrada a POST /auth/logout" \
  --reviewer <login-do-revisor> \
  --label frontend --label auth \
  --body "$(cat <<'EOF'
<corpo do Passo 4>
EOF
)"
```

- Use `--draft` se o usuário disser que o PR ainda não está pronto para revisão.
- **Revisor:** use o da planilha. Logins conhecidos:

  | Planilha               | GitHub                |
  | ---------------------- | --------------------- |
  | Arthur Correia         | `correiaarthur`       |
  | Arthur Magalhães       | `arthurmsf`           |
  | Catão (Artur Catão)    | `arturcatao`          |
  | Letícia                | `leticialunaz`        |
  | Júlia                  | `juliacruzandrade`    |
  | Araújo (Lucas Araújo)  | `lucasaraujomedeiros` |
  | Lucas Cunha            | `Lucas-Cunhaa`        |
  | João Neto              | `joaoneto9`           |
  | Alvaro                 | `alviinz` (confirmar) |

  Se o nome não estiver na tabela ou o revisor for o próprio autor, pergunte ao usuário.
- **Labels:** sempre `frontend`, mais a da área: `auth` (cadastro, login, sessão), `viagem` (viagens), `perfil`, `preferências`, `documentation`, `bug`.

Ao final, mostre a URL do PR.

## Passo 6: lembretes ao usuário

Depois de criar o PR, avise:

> "PR criado. Lembre que ele precisa de pelo menos **um Approve** de outra pessoa antes do merge (comentário não conta, e a sua própria revisão também não). Isso vale também para os PRs para `REF<N>`, `development` e `main`. Atualize o **andamento** da subtask na planilha para `pr feito`."

Se o revisor pedir alterações (*Request changes*), resolva todas antes do merge e, depois de enviar as correções, solicite uma nova revisão:

```bash
gh pr edit <número> --add-reviewer <login-do-revisor>
```

## Conferência antes do merge (do documento da equipe)

- O PR aponta para a branch correta e identifica a task, a referência ou a etapa.
- Os commits seguem o padrão, e a descrição explica as alterações e a validação feita.
- Há pelo menos uma aprovação de outra pessoa, e os pedidos de alteração foram resolvidos.
- Se o destino for `main`, a etapa está concluída e a origem é `development`.

## Erros comuns

- **`gh: command not found`:** instalar com `brew install gh` e autenticar com `gh auth login`.
- **Nenhum commit à frente da base:** "Não há commits novos em relação a `<base>`. Verifique se você está na branch correta."
- **Base `REF<N>` não existe no remoto:** ela deve ser criada a partir de `development` (`git switch -c REF<N> origin/development && git push -u origin REF<N>`). Confirme com o usuário antes, porque afeta o time todo.
- **`web/.env` aparece no diff:** não abra o PR. Remova o arquivo do versionamento com `git rm --cached web/.env`.
