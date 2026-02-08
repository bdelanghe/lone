# Agent Instructions

This project uses **bd** (beads) for issue tracking. Run `bd onboard` to get
started.

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

## Companion Tools

Use these in addition to `bd` when useful:

```bash
bdui start --open     # Browser UI for issues/board/epics
bv --robot-triage     # Structured next-work recommendations for agents
```

Install notes:

```bash
brew install dicklesworthstone/tap/bv
npm install -g beads-ui --prefix "$HOME/.npm-global"
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

## Beads Docs

Before DB/sync/worktree changes, check:

- TROUBLESHOOTING.md
- WORKTREES.md
- ARCHITECTURE.md
- CLI_REFERENCE.md
- FAQ.md

Local quick note:

- `docs/BEADS_ARCHITECTURE_NOTES.md`
- `docs/BEADS_CLI_QUICK_NOTES.md`
- `docs/MOLECULES.md`

## Beads Recovery

If `bd` fails with SQLite schema/version errors (for example, `no such column:
i.spec_id` or `Unable to read database version`), run:

```bash
./scripts/bd-repair
bd doctor
```

This repairs common legacy DB mismatches in-place so `bd ready` and `bd create`
work again.

Before changing beads state, consult the upstream docs first:

- `docs/BEADS_RECOVERY_RUNBOOK.md` (project runbook)
- Troubleshooting/FAQ in the beads docs (daemon, worktrees, corruption, doctor)

Preferred recovery order (least destructive first):

```bash
bd doctor --fix --source=jsonl --yes
bd doctor --fix --force --source=jsonl --yes
bd migrate --update-repo-id
bd repair --dry-run
bd repair
```

Only after collecting evidence and backing up DB files should you do stronger
actions (rebuild/move DB files).

## Agent Confusion = Development Issue

**CRITICAL:** When you (as an agent) get confused, encounter unclear tooling,
missing documentation, or run into environment issues, this is a **DEVELOPMENT
ISSUE** that must be tracked with beads. Create an issue immediately:

```bash
bd create --title="Brief description of confusion" \
  --description="What happened, what was unclear, what you expected" \
  --type=bug --priority=1
```

Examples of confusion that require beads issues:

- Command not found (e.g., deno not in PATH when you try to run tests)
- Unclear how to run tests, build, or other development tasks
- Missing or incomplete documentation
- Environment setup problems
- Confusing error messages or workflows

**These problems should NEVER happen.** When they do, file an issue so we can
fix the developer experience for all future agents.

## Starting Development

```bash
./scripts/shell
```

This is the single entry point. It will:
- Build the `semantic-test` image automatically if missing
- Mount the workspace, git bare repo (worktree support), and Deno cache
- Mount `BEADS_DIR` so `bd` works inside the container
- Drop you into bash with `deno`, `bd`, `bdui`, `claude`, and `codex` available

From inside the container, all scripts are container-aware (`IN_DEV_CONTAINER=1`)
and run directly without re-launching Docker.

To rebuild the image after Dockerfile changes:

```bash
docker build -t semantic-test -f .devcontainer/Dockerfile .
```

## Running Tests

```bash
test                  # Canonical way - run all tests in docker (shows last 30 lines)
./scripts/test        # Explicit path (works everywhere)
deno task test:docker # Via deno tasks (optional)
```

Works from host or inside the container (`scripts/test` detects which context).

If using direnv interactively:

```bash
direnv allow
```

### XDG Cache Persistence

The test wrapper mounts `.xdg/cache`, `.xdg/config`, and `.xdg/data` into the
container. This persists Deno's downloaded modules and npm artifacts across
runs.

**Benefits:**

- Fast: downloads cached between test runs
- Reproducible: state is explicit and repo-local
- Cleanable: `rm -rf .xdg` nukes all cached state

The `.xdg/` directory is in `.gitignore` - it's ephemeral build state.

### Later: Devcontainer Migration

When agents run inside the devcontainer, you'll just use:

```bash
deno test -A
```

The `scripts/test` wrapper remains as compatibility for host-based execution.

## Epic Workflow (Feature Branch + PR)

Treat each epic as its own feature branch. Complete all child work for the epic
before closing it, then open a PR into `main` for review and merge.

Minimum steps:

1. Ensure all epic child issues are closed (or explicitly deferred with a
   follow-up issue).
2. Run required quality gates (docker tests at minimum).
3. Push the epic branch.
4. Create a PR into `main` with a clear summary and linked beads issues.

## Blocked Epic Items

If an epic item is blocked by another epic, move the blocked issue to the epic
that owns the blocking issue, so ownership matches the dependency graph.

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT
complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs
   follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**

- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

<!-- BEGIN BEADS INTEGRATION -->

## Issue Tracking with bd (beads)

**IMPORTANT**: This project uses **bd (beads)** for ALL issue tracking. Do NOT
use markdown TODOs, task lists, or other tracking methods.

### Why bd?

- Dependency-aware: Track blockers and relationships between issues
- Git-friendly: Auto-syncs to JSONL for version control
- Agent-optimized: JSON output, ready work detection, discovered-from links
- Prevents duplicate tracking systems and confusion

### Quick Start

**Check for ready work:**

```bash
bd ready --json
```

**Create new issues:**

```bash
bd create "Issue title" --description="Detailed context" -t bug|feature|task -p 0-4 --json
bd create "Issue title" --description="What this issue is about" -p 1 --deps discovered-from:bd-123 --json
```

**Claim and update:**

```bash
bd update bd-42 --status in_progress --json
bd update bd-42 --priority 1 --json
```

**Complete work:**

```bash
bd close bd-42 --reason "Completed" --json
```

### Issue Types

- `bug` - Something broken
- `feature` - New functionality
- `task` - Work item (tests, docs, refactoring)
- `epic` - Large feature with subtasks
- `chore` - Maintenance (dependencies, tooling)

### Priorities

- `0` - Critical (security, data loss, broken builds)
- `1` - High (major features, important bugs)
- `2` - Medium (default, nice-to-have)
- `3` - Low (polish, optimization)
- `4` - Backlog (future ideas)

### Workflow for AI Agents

1. **Check ready work**: `bd ready` shows unblocked issues
2. **Claim your task**: `bd update <id> --status in_progress`
3. **Work on it**: Implement, test, document
4. **Discover new work?** Create linked issue:
   - `bd create "Found bug" --description="Details about what was found" -p 1 --deps discovered-from:<parent-id>`
5. **Complete**: `bd close <id> --reason "Done"`

### Auto-Sync

bd automatically syncs with git:

- Exports to `.beads/issues.jsonl` after changes (5s debounce)
- Imports from JSONL when newer (e.g., after `git pull`)
- No manual export/import needed!

### Important Rules

- ✅ Use bd for ALL task tracking
- ✅ Always use `--json` flag for programmatic use
- ✅ Link discovered work with `discovered-from` dependencies
- ✅ Check `bd ready` before asking "what should I work on?"
- ❌ Do NOT create markdown TODO lists
- ❌ Do NOT use external issue trackers
- ❌ Do NOT duplicate tracking systems

For more details, see README.md and docs/QUICKSTART.md.

<!-- END BEADS INTEGRATION -->
