# Beads Recovery Runbook

Use this when `bd` commands fail, daemon startup is slow/failing, or ready work
looks incorrect.

## 1) Gather Evidence First

```bash
bd version
bd ready --json
bd doctor
```

Optional debug capture:

```bash
BD_DEBUG=1 BD_DEBUG_RPC=1 bd ready 2> bd.ready.rpc.log
```

## 2) Safe Built-In Repair Path

Start with built-in tools before manual SQLite edits:

```bash
bd doctor --fix --source=jsonl --yes
bd doctor --fix --force --source=jsonl --yes
bd migrate --update-repo-id
```

If orphan references are blocking opens:

```bash
bd repair --dry-run
bd repair
```

## 3) Validate

```bash
bd doctor
bd ready --json
```

Checks to confirm:

- No duplicate IDs in `bd ready --json`
- Database/schema and fingerprint pass in `bd doctor`
- Daemon warnings are gone (or explicitly run with `--no-daemon` in
  daemon-hostile environments)

## 4) Worktree Notes

- In git worktrees, `bd init` may be blocked. Prefer `bd doctor --fix ...` and
  `bd migrate --update-repo-id`.
- If daemon startup is blocked by push/upstream config, verify:
  - branch upstream is set (`git push -u origin <branch>`)
  - daemon config is compatible with your workflow

## 5) Naming / Prefix Policy

Project issue prefix is `lone-` (short, stable, explicit). If needed:

```bash
bd rename-prefix lone- --repair
```

## 6) Last Resort

Only after backups and failed built-in repair:

1. back up `.beads/*.db`
2. rebuild from JSONL source-of-truth using doctor fix flow
3. re-run validation
