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

## Running Tests

This project uses a single canonical test wrapper for consistent docker-based execution.

### Quick Commands

```bash
test                  # Canonical way - run all tests in docker (shows last 30 lines)
./scripts/test        # Explicit path (works everywhere)
deno task test:docker # Via deno tasks (optional)
```

**Why this works:**
- `scripts/test` is the single source of truth for docker test invocation
- `.envrc` adds `scripts/` to PATH (so `test` just works when direnv is active)
- Mounts `.xdg/` directories for Deno/npm cache persistence across runs

### First-Time Setup

Build the test container once:

```bash
docker build -t semantic-test -f .devcontainer/Dockerfile .
```

If using direnv interactively:

```bash
direnv allow
```

### XDG Cache Persistence

The test wrapper mounts `.xdg/cache`, `.xdg/config`, and `.xdg/data` into the
container. This persists Deno's downloaded modules and npm artifacts across runs.

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
