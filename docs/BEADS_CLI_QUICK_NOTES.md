# Beads CLI Quick Notes

Reference: https://github.com/steveyegge/beads/blob/main/docs/CLI_REFERENCE.md

## Most-used commands

```bash
bd ready --json
bd show <id> --json
bd update <id> --status in_progress --json
bd close <id> --reason "Completed" --json
bd sync
bd doctor
```

## Recovery/health commands

```bash
bd doctor --fix --source=jsonl --yes
bd doctor --fix --force --source=jsonl --yes
bd migrate --update-repo-id
bd repair --dry-run
bd repair
```

## Daemon/worktree checks

```bash
bd daemon list
bd where
bd worktree info
bd --no-daemon ready --json
```

## Notes

- Prefer `--json` for machine-safe parsing.
- Prefer built-in repair paths before manual SQLite edits.
