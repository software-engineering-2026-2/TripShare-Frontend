# AGENTS.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## Design Choices


## 🎨 Paleta de Cores Oficial — *Copacabana Ocean*

A identidade visual oficial do projeto utiliza o tema **Copacabana Ocean**, inspirado na orla e no mar do Rio de Janeiro, combinando tons de azul oceânico com superfícies claras e frescas.

### Tokens Principais (CSS Variables em `web/src/index.css`)

Os estilos são escritos em CSS puro: variáveis globais em `web/src/index.css` e um arquivo por tela em `web/src/css/`. O projeto não usa Tailwind nem biblioteca de componentes. Use a variável da tabela em vez do hex solto. Quando a variável ainda não existir, crie-a em `web/src/index.css` com o prefixo `--color-` e o hex da tabela.

| Token | Variável CSS | Hex | Uso Principal |
| :--- | :--- | :--- | :--- |
| **Primary** | `--color-primary` | `#0077B6` | Botões principais, ícones de destaque, links ativos e badges |
| **Primary Foreground** | `--color-on-primary` | `#FFFFFF` | Texto e ícones sobre elementos `--color-primary` |
| **Brand Gradient (From)** | ainda não existe | `#0096C7` | Início do gradiente de ações de destaque (ex.: *Distribuir Viagem*, *Gerar Roteiro*) |
| **Brand Gradient (To)** | `--color-primary-hover` (mesmo hex) | `#023E8A` | Fim do gradiente de ações de destaque |
| **Background** | ainda não existe | `#F8FDFF` | Fundo geral das páginas (branco gelo suave) |
| **Foreground** | `--color-text` | `#0A2540` | Texto principal e títulos (azul-marinho profundo) |
| **Card / Popover** | `--color-surface` | `#FFFFFF` | Superfície de cartões, modais e popovers |
| **Secondary / Muted** | `--color-surface-muted` | `#EBF5F8` | Fundos secundários, áreas agrupadas e containers sutis |
| **Muted Foreground** | `--color-text-muted` | `#4A6B82` | Textos de apoio, legendas, horários e metadados |
| **Accent** | ainda não existe | `#E0F0F6` | Estado de hover em botões secundários, menus e itens selecionáveis |
| **Border** | `--color-border` | `#D8E8F0` | Divisórias, bordas de cartões e contornos |
| **Input** | `--color-border-strong` | `#C5DCE8` | Bordas de campos de formulário e seletores |
| **Ring** | `--color-focus-ring`, `--color-focus-ring-soft`, `--color-focus-ring-strong` | `#0077B6` (com transparência) | Anel de foco de acessibilidade (`focus-visible`) |
| **Destructive** | `--color-danger` (fundo: `--color-danger-bg`) | `#C13515` | Alertas de conflito de horário e ações de exclusão |

Não use `--accent`, `--accent-bg` nem `--accent-border` de `web/src/index.css`: são sobras do template do Vite (`#AA3BFF`) e não fazem parte da paleta.

### Cores Semânticas dos Turnos do Roteiro

Os turnos do cronograma diário e os pins do mapa mantêm cores semânticas fixas para rápida identificação visual. Essas variáveis ainda não existem no código; ao criá-las, use os nomes abaixo em `web/src/index.css`:

| Turno | Horário | Variável CSS | Hex | Texto (`onColor`) |
| :--- | :--- | :--- | :--- | :--- |
| **Manhã** | `06:00 – 12:00` | `--color-shift-manha` | `#F5B301` | `#3D2C00` |
| **Tarde** | `12:00 – 18:00` | `--color-shift-tarde` | `#F2711C` | `#FFFFFF` |
| **Noite** | `18:00 – 00:00` | `--color-shift-noite` | `#38BDF8` | `#06304A` |
| **Madrugada** | `00:00 – 06:00` | `--color-shift-madrugada` | `#7C3AED` | `#FFFFFF` |



## Project Instructions

### Language

- Respond and write project documentation in Brazilian Portuguese.
- Keep explanations concise, with clear steps for practical tasks.
- Preserve the names of commands, APIs, files, and technical identifiers.
- Follow existing conventions for naming and code comments.
- Keep third-party skills in their original language.

### Workflow

- Work on the current `US<N>` branch, where `N` is the user story number associated with the stage file.
- Preserve existing changes made by the user.
- Before editing, check whether the file already exists and whether relevant local conventions apply.
- Prefer small, straightforward changes consistent with the project's conventions.
- At the start of every task, check the repository's `docs/` directory.
- Read `docs/README.md`, when available, to identify relevant documentation.
- Before planning or editing files, read the documents relevant to the task,
  including applicable requirements, business rules, and architectural decisions.
- Follow links to additional documents when needed to understand the task.
- Treat proposals and open questions as unconfirmed; do not assume they are
  approved requirements.
- If documentation conflicts with the implementation or the user's request,
  report the discrepancy and clarify it when necessary.
- Update affected documentation when an approved change alters the documented
  behavior.

### File Editing

- Use clear English names for new files and directories.
- Avoid refactoring outside the requested scope.
- Do not remove code, files, or configuration without a clear need.
- Add comments only when they help explain a non-obvious decision.

### Verification

- When changing code, run the available tests, lint checks, or validation commands relevant to the changes.
- If automated validation is not possible, explain what was checked manually.
- Report any limitations encountered during execution.

### Delivery

- Summarize the changes made.
- Reference modified files using clear paths.
- Suggest next steps only when they are useful

## Skills

- At the start of every task, inspect the skills available in
  `.agents/skills/`, relative to the repository root.
- Review each skill's `name` and `description` to identify which skills
  apply to the task and the project's stack.
- Before performing work covered by a skill, read its full `SKILL.md`
  and follow the applicable instructions.
- Load referenced documents, scripts, and templates only when needed.
- Briefly state which skills you are using and why.
- If no skill applies, proceed using the repository's instructions.
- Reassess applicable skills if the task's scope changes.
- If a required skill is missing or unreadable, report the limitation
  and do not claim to have followed it.