# Lone - Semantic Blessing Engine

Lone is a semantic blessing engine for DOM subtrees. It turns untrusted element
trees into `Blessed<T>` or structured `Finding[]`, delegating most rule coverage
to existing tools while enforcing a stable contract boundary for downstream UI
frameworks.

## What Lone Is

- A small library that validates DOM subtrees and returns deterministic
  `Finding[]` or a branded `Blessed<T>`.
- A contract boundary for semantic safety (think SafeHtml for DOM).
- A TDD-first, contract-first workflow: schema, tests, minimal implementation.

## What Lone Is Not

- Not a design system or CSS framework.
- Not a re-implementation of axe-core or WCAG coverage.
- Not a requirement for custom elements or DOM mutation.
- Not a universal adapter for every accessibility engine in v0.

## Consumer Story

A developer has a UI system that produces DOM. They want a type-level and CI
level guarantee that a specific subtree is semantically safe before it is
embedded, cached, or published.

```ts
const result = await lone.bless(rootEl, policy);

if (result.ok) {
  renderBlessed(result.value);
  cacheBlessed(result.value);
  publishBlessed(result.value);
} else {
  reportFindings(result.findings);
}
```

## Minimal Public API (v0)

```ts
export type BlessPolicy = {
  profile: "mdn" | "wcag-lite" | "project";
  allowCodes?: string[];
  denyCodes?: string[];
  failOn?: "error" | "warn";
};

export type BlessResult<T extends Element> =
  | { ok: true; value: Blessed<T>; findings: Finding[] }
  | { ok: false; findings: Finding[] };

export type Blessed<T extends Element> = T & { __loneBlessed: true };

export async function bless<T extends Element>(
  subject: T,
  policy?: BlessPolicy,
): Promise<BlessResult<T>>;

export async function validate<T extends Element>(
  subject: T,
  policy?: BlessPolicy,
): Promise<{ findings: Finding[] }>;
```

## POC Execution Queue

The fastest path to proof-of-concept is:

1. Ship `Finding` schema + deterministic ordering + code namespace rules.
2. Ship `bless()` + branded `Blessed<T>`.
3. Ship one backend: `axe-core` in JSDOM or DOM-only extraction (pick one).
4. Ship MDN fixture runner with 2 good + 2 bad tests.

Everything else is downstream of these four steps.

## Repository Layout

```text
src/contracts/   # Schema/contracts (source of truth)
src/engine/      # Bless/validate pipeline
src/adapters/    # Backends (axe-core, DOM extraction)
src/validate/    # Lone-specific authoring constraint checks
tests/           # Contract + pipeline tests
```

## Development

Lone development runs in a pinned container setup. Primary flow:

1. Start the dev container.
2. Run tests (pass paths for targeted runs).
3. Keep changes contract-first and TDD-first.
4. Run quality gates before commit.

```bash
devcontainer up --workspace-folder .
devcontainer exec --workspace-folder . deno test -A --fail-fast tests
devcontainer exec --workspace-folder . deno test -A --fail-fast tests/validate/keyboard_accessible_test.ts
devcontainer exec --workspace-folder . deno task ci
```

Optional via Deno task:
`bdui` serves the UI at `http://127.0.0.1:3000`.

## Pre-PR Quick Checks

```bash
deno task test:docker
```

## Git Push In Restricted Environments

If SSH pushes hang and you cannot write to global git config, use the GitHub CLI
credential helper directly with HTTPS:

```bash
git -c credential.helper='!gh auth git-credential' \
  push https://github.com/bdelanghe/lone.git HEAD:your-branch
```

This avoids modifying global git config and works in docker-only setups.

Container home/state (including Deno/npm caches and Claude Code state) is stored in a named Docker volume (`vscode-home`) so it persists across container recreation.

## Status

Focused on the POC execution queue (see above). Backlog trimming happens only
after the POC is shipped.

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
