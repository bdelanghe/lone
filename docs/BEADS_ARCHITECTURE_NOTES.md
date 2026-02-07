# Beads Architecture Notes

Source: https://github.com/steveyegge/beads/blob/main/docs/ARCHITECTURE.md

## Core Model (keep this mental model)

1. CLI layer (`bd ...`) writes/reads through local storage.
2. Local SQLite (`.beads/beads.db`) is the fast working copy.
3. JSONL (`.beads/issues.jsonl`) is git-tracked source for distribution.
4. Git remote distributes JSONL across clones/worktrees.

## Practical Implications

- Prefer querying via local SQLite for speed; trust `bd sync` to bridge to JSONL.
- If daemon is unavailable, CLI should fall back to direct DB mode.
- Sync correctness depends on JSONL import/export metadata and timestamps.
- Worktree setups can differ; verify with `bd where`, `bd worktree info`, and `bd doctor`.

## Recovery Priorities

1. Confirm health and divergence: `bd doctor`.
2. Use built-ins first:
   - `bd doctor --fix --source=jsonl --yes`
   - `bd doctor --fix --force --source=jsonl --yes`
   - `bd migrate --update-repo-id`
   - `bd repair` (for orphaned refs)
3. Validate with `bd ready --json` + `bd doctor`.

## Daemon Notes

- One daemon per workspace.
- Socket/daemon issues should not block work: use `--no-daemon` temporarily.
- If daemon startup fails, check upstream config, sync mode, and `bd doctor` warnings before manual DB changes.
