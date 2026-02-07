# Beads Worktree Policy

Reference:
https://github.com/steveyegge/beads/blob/main/docs/WORKTREES.md#fully-separate-beads-repository

## Canonical model

- `beads.db` is local cache/state and must not be committed to code branches or PRs.
- `.beads/issues.jsonl` is the portable ledger and should sync through the dedicated sync branch (for this repo: `beads-sync`).
- Keep normal code branches clean from runtime Beads artifacts (`*.db`, `*.db-wal`, `*.db-shm`, `*.db-journal`, locks, pid files).
- `BEADS_NO_DAEMON=1` is the default in worktree shells to avoid daemon branch confusion.

## What can be reviewed in PRs

- Allowed when intentional: `.beads/config.yaml`, `.beads/README.md`.
- Not allowed: `.beads/*.db*` and other runtime files.

## Worktree behavior

- Preferred: one repo-level Beads state shared across worktrees.
- Cross-machine transport is via Git sync branch + JSONL, not SQLite database files.
- Use isolated per-worktree `BEADS_DIR` only when you explicitly want separate issue universes.

## Pre-PR quick checks

```bash
# Should return nothing:
git diff --name-only origin/main...HEAD | rg '^\.beads/.*\.db'
git diff --name-only origin/main...HEAD | rg '^\.beads/.*\.(db-wal|db-shm|db-journal)$'

# Sync branch should be configured:
bd config get sync.branch
```
