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



## Project Instructions
## Idioma

- Responda preferencialmente em portugues do Brasil.
- Mantenha explicacoes objetivas, com passos claros quando houver uma tarefa pratica.

## Fluxo de trabalho

- considere a branch atual US<N> em que N é o número da US referente ao arquivo da Etapa.
- Preserve mudancas existentes feitas pelo usuario.
- Antes de editar, verifique se o arquivo ja existe e se ha convencoes locais relevantes.
- Prefira mudancas pequenas, diretas e alinhadas ao padrao do projeto.

## Edicao de arquivos

- Use nomes de arquivos e diretorios claros em Inglês.
- Evite refatoracoes fora do escopo solicitado.
- Nao remova codigo, arquivos ou configuracoes sem necessidade clara.
- Inclua comentarios apenas quando ajudarem a entender uma decisao nao obvia.

## Verificacao

- Quando houver codigo, execute testes, lint ou comandos de validacao disponiveis.
- Se nao for possivel validar automaticamente, explique o que foi verificado manualmente.
- Informe qualquer limitacao encontrada durante a execucao.

## Entrega

- Resuma as alteracoes feitas.
- Cite arquivos alterados usando caminhos claros.
- Sugira proximos passos apenas quando forem realmente uteis.
