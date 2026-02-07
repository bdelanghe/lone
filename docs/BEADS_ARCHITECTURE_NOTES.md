# Beads Architecture Notes

Source: https://github.com/steveyegge/beads/blob/main/docs/ARCHITECTURE.md

## Core Model

1. CLI layer (`bd ...`) reads/writes local storage.
2. SQLite (`.beads/beads.db`) is the fast working DB.
3. JSONL (`.beads/issues.jsonl`) is git-distributed issue state.
4. Git remote propagates JSONL across clones/worktrees.

## Operational Notes

- Prefer built-in `bd` repair/sync commands before manual DB edits.
- `bd doctor` is the primary health/sync report.
- Daemon failures should degrade to direct mode; use `--no-daemon` for recovery.
- In worktree/sync-branch setups, verify paths with `bd where` and `bd worktree info`.

## Recovery Sequence (docs-first)

```bash
bd doctor --fix --source=jsonl --yes
bd doctor --fix --force --source=jsonl --yes
bd migrate --update-repo-id
bd repair --dry-run
bd repair
```
