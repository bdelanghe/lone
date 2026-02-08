# Lone - Semantic Page Elements

Lone builds real web pages from semantic parts using typed custom HTML
elements.

The goal is simple: compose pages with custom elements while preserving the
meaningful structure that assistive technology relies on.

## What Lone Is

- A small library of custom elements (Web Components) that wrap native HTML.
- A contract + validator layer that checks page structure.
- A TDD-first workflow: contracts first, implementation second.

Lone is not a design system and not a CSS framework. It is a semantic
construction kit.

## Core Idea

Custom elements can control composition, but they must not destroy semantics.

Rule of thumb:

- Prefer native elements inside (`button`, `a`, `input`, `nav`, `main`, etc.).
- Custom elements act as typed wrappers + validators, not reimplementations of
  controls.

## Contracts (Project Spine)

Lone treats page structure as data first:

- `SemanticNode`: a portable tree of named semantic parts.
- `Finding`: validator output with stable `code`, `path`, and `message`.
- `ValidatorSpec`: explicit validator contract and metadata.

Everything starts as:

1. Contract (`zod` schema)
2. Failing test
3. Minimal implementation

## Repository Layout

```text
src/contracts/   # Zod contracts (source of truth)
src/validate/    # semantic invariants and validators
src/elements/    # custom element layer (thin/early)
src/adapters/    # AX/CDP and other tree adapters
tests/           # contract + validator + adapter tests
```

## Development

Lone development runs in a pinned container setup. Primary flow:

1. Build the test image once.
2. Run tests via `./scripts/test` (pass paths for targeted runs).
3. Keep changes contract-first and TDD-first.
4. Run quality gates before commit.

```bash
docker build -t semantic-test -f .devcontainer/Dockerfile .
./scripts/test
./scripts/test tests/validate/keyboard_accessible_test.ts
deno task ci # requires local deno or a devcontainer
```

Optional via Deno task:
`bdui` serves the UI at `http://127.0.0.1:3000`.

## Pre-PR quick checks

```bash
deno task test:docker
```

Container cache directories are mounted through `.xdg/` for repeatable and fast
local runs.

## Plan (Near Term)

1. Tighten core contracts and edge-case tests for `SemanticNode`,
`ElementSpec`, `Finding`, and `ValidatorSpec`.
2. Complete adapter parity: finish CDP coverage and add Puppeteer +
Playwright semantic-node adapters.
3. Build a first custom-elements semantic page example (MDN "good semantics"
style) and validate it end-to-end with Lone validators.
4. Implement the first typed custom element wrappers in `src/elements/`
using the existing contracts as the source of truth.
5. Decide long-term node typing strategy (standard DOM types vs custom
`ElementSpec`) and document the decision.

## Status

Early. Current milestone is a stable contract set and validator suite that can
support the first real custom-element page builds.

## Beads / Worktrees

Beads policy and worktree sync rules:

- `docs/BEADS_WORKTREE_POLICY.md`
- `AGENTS.md`

Quick setup command for task worktrees with Beads health checks:

```bash
worktree-new "short task summary"
# or:
./scripts/worktree-new "short task summary"
```

This helper also enforces Beads defaults for linked worktrees
(`no-daemon=true`, `auto-start-daemon=false`, `sync.branch=beads-sync`) and
runs `bd` health checks.
