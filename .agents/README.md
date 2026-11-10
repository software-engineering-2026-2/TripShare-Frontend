# TripShare Frontend Agent Skills

This directory contains reusable instructions for agents working on TripShare-Frontend. The seven skills below cover contribution workflows, interface design, React performance, server state, and Firebase Authentication.

Start with the repository's [AGENTS.md](../AGENTS.md) for working conventions and the [documentation index](../docs/README.md) for product context. This README helps select skills; each skill's `SKILL.md` contains its full instructions.

## How to use the skills

1. At the start of a task, inspect the available skills in `skills/` and review their `name` and `description` metadata.
2. Select the skills relevant to the task and the project's actual stack.
3. Before performing the corresponding work, read each selected skill's full `SKILL.md`.
4. Load supporting rules, references, and scripts only as needed. Follow any explicit reading requirements in the selected skill.
5. Briefly state which skills are being used and why. Reassess the selection if the task changes scope.

If no skill applies, continue using the repository instructions. If a required skill or reference cannot be read, report the limitation. Skill discovery and invocation syntax depend on the agent tool; verify that it can access `.agents/skills/` instead of assuming a universal slash command.

## Team contribution skills

| Skill | When to use | What it covers |
| --- | --- | --- |
| [conventional-commit](skills/conventional-commit/SKILL.md) | Before creating a Git commit. | Branch eligibility, coherent commit scope, Conventional Commits with Portuguese descriptions, relevant code checks, and explicit file staging. |
| [create-pr](skills/create-pr/SKILL.md) | When asked to create or open a pull request. | The `task → REF<N> → development → main` contribution flow, base-branch selection, commit review, task-sheet lookup, reviewer selection, validation, PR titles and descriptions, and GitHub CLI operations. It does not cover reviewing, approving, or merging PRs. |

These skills describe the team's contribution conventions. Read them when the corresponding Git operation is requested; the presence of a skill does not itself request a commit or pull request.

## Design and implementation skills

| Skill | When to use | What it covers | Supporting material |
| --- | --- | --- | --- |
| [frontend-design](skills/frontend-design/SKILL.md) | Building new interfaces or reshaping existing screens. | Visual direction, typography, color, layout, interaction, interface copy, and design critique. | License terms are included in the skill directory. |
| [web-design-guidelines](skills/web-design-guidelines/SKILL.md) | Reviewing UI, accessibility, usability, or design compliance. | Fetching the current Web Interface Guidelines, reviewing selected files, and reporting findings with file and line references. | The guideline source URL and retrieval instructions are in `SKILL.md`; the review requires network access. |
| [vercel-react-best-practices](skills/vercel-react-best-practices/SKILL.md) | Writing, reviewing, or optimizing React code. | Avoiding request waterfalls, bundle optimization, rendering, re-renders, client data fetching, JavaScript performance, and framework-specific server patterns. | Individual examples in `rules/` and a compiled guide in the skill's `AGENTS.md`. |
| [tanstack-query-best-practices](skills/tanstack-query-best-practices/SKILL.md) | Creating or changing TanStack Query queries, mutations, or caching. | Query keys, freshness, invalidation, optimistic updates, errors, prefetching, pagination, parallel queries, persistence, and SSR patterns. | Individual rule explanations and examples in `rules/`. |
| [firebase-auth-basics](skills/firebase-auth-basics/SKILL.md) | Working on Firebase sign-in, identity management, or authenticated access. | Firebase Authentication concepts, provider setup, client integration, tokens, and security-rule guidance. | Platform-specific guides and security rules in `references/`; use the web client reference for this frontend. |

## Applying skills to this repository

- The frontend in `web/` uses React, TypeScript, Vite, React Router, TanStack Query, and Firebase. Check [package.json](../web/package.json) for the current dependencies and scripts.
- Apply React guidance that fits the current architecture. Next.js, React Server Components, and SSR examples in external skills are conditional references, not instructions to migrate the application.
- Follow the Copacabana Ocean palette and CSS conventions in [AGENTS.md](../AGENTS.md). General design guidance should be adapted to the established project identity.
- Use TanStack Query guidance for server-state tasks; a different fetching library mentioned by another skill is not a reason to replace the existing stack.
- Firebase references also cover mobile platforms and Firebase services beyond Authentication. Read only the material relevant to the requested integration.
- If instructions disagree about a task-relevant detail, identify the discrepancy before making a decision based on it. In particular, the root instructions mention `US<N>` branches while the contribution skills describe `task/REF<N>-T<NN>-...`; confirm the intended workflow when a branch or contribution operation depends on this distinction.

## Directory layout

```text
.agents/
├── README.md
└── skills/
    ├── conventional-commit/
    ├── create-pr/
    ├── firebase-auth-basics/
    ├── frontend-design/
    ├── tanstack-query-best-practices/
    ├── vercel-react-best-practices/
    └── web-design-guidelines/
```

Each skill directory contains a `SKILL.md` with metadata and instructions. Some also include `rules/`, `references/`, a compiled guide, or license files.

The existing `skills/README.md` contains legacy Claude-specific setup notes and `.claude/skills/` paths. Use this index for the current `.agents/skills/` locations.

## Prerequisites

- **Implementation tasks:** the project's Node.js environment and installed dependencies. Available validation scripts are defined in `web/package.json`.
- **Commit tasks:** Git with the contributor's identity configured.
- **Pull request tasks:** authenticated GitHub CLI access to the repository and access to the task spreadsheet referenced by `create-pr`.
- **UI guideline reviews:** network access to fetch the guideline source specified by the skill.
- **Firebase setup tasks:** access to the relevant Firebase project and any tooling required by the selected workflow.

Read the selected skill for exact commands and checks. Merely reading this index does not require installing tools or contacting external services.

## Sources and maintenance

The external skill sources and hashes are recorded in [skills-lock.json](../skills-lock.json):

| Skill | Recorded source |
| --- | --- |
| `firebase-auth-basics` | `firebase/agent-skills` |
| `frontend-design` | `anthropics/skills` |
| `tanstack-query-best-practices` | `deckardger/tanstack-agent-skills` |
| `vercel-react-best-practices` | `vercel-labs/agent-skills` |
| `web-design-guidelines` | `vercel-labs/agent-skills` |

- Keep this index aligned with the installed skill directories and their descriptions.
- Keep third-party skills in their original language and preserve their license files.
- Record project-specific adaptations in repository instructions rather than duplicating entire external guides.
- Review skill and lockfile changes together when updating external skills.
- Update team skills when contribution conventions change, and reconcile conflicting instructions in the same change.
