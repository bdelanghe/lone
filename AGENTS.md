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

## Claim Before Work

Always claim an issue before starting implementation work. Always assign issues
to yourself when you start work (`--claim` does this atomically).

```bash
# Find ready work (no blockers, not already claimed)
bd ready --json

# Atomically claim an issue from the ready queue (sets assignee=self, status=in_progress)
bd update <id> --claim --json               # Fails if already claimed

# Find stale issues (not updated recently)
bd stale --days 30 --json                    # Default: 30 days
bd stale --days 90 --status in_progress --json  # Find abandoned claims
bd stale --limit 20 --json                   # Limit results
```

## List Filters

Use list filters to triage by ownership, severity, and scope.

```bash
# Filter by status, priority, type
bd list --status open --priority 1 --json
bd list --assignee <your-assignee-id> --json
bd list --type bug --json
bd list --id bd-123,bd-456 --json
bd list --spec "docs/specs/" --json
```

## Issue Lifecycle

- `open`: ready to be worked on
- `in_progress`: actively being worked on
- `blocked`: waiting on dependencies
- `deferred`: intentionally postponed
- `closed`: completed

Special states:

- `tombstone`: deleted-issue marker used for anti-resurrection sync safety
- `pinned`: persistent issue flag (not a status), typically used for
  anchors/hooks and long-lived control items

## Priorities

- `0`: critical (security/data loss/broken builds)
- `1`: high (major features/important bugs)
- `2`: medium (default)
- `3`: low (polish/optimizations)
- `4`: backlog

## Dependency Semantics

Common dependency types:

- `blocks`: hard execution dependency
- `parent-child`: structural hierarchy
- `related`: soft relationship
- `discovered-from`: provenance link for discovered work

Note: `blocks` is the primary scheduling edge for ready-queue execution.

## JSON Output For Agents

Use `--json` for agent-safe parsing.

```bash
bd show <id> --json
bd ready --json
bd create "Issue" -p 1 --json
```

## Session Workflow

```bash
# 1. Find work
bd ready --json

# 2. Claim it (assigns to self + in_progress)
bd update <id> --claim --json

# 3. Do the work

# 4. Close
bd close <id> --reason "Implemented and tested" --json
```

## Contract Specs (`spec_id`)

For long-lived contracts, always attach a stable spec reference with
`--spec-id`. Use quoted titles/descriptions in commands.

```bash
# Basic creation
bd create "Issue title" -t bug|feature|task -p 0-4 -d "Description" --json

# Contract-first creation (recommended for long-lived work)
bd create "Implement auth" -t feature -p 1 --spec-id "docs/specs/auth.md" --json

# Create with explicit ID (parallel workers)
bd create "Issue title" --id worker1-100 -p 1 --json

# Labels
bd create "Issue title" -t bug -p 1 --labels bug,critical --json

# Description from file/stdin
bd create "Issue title" --body-file description.md -p 1 --json
echo "Description text" | bd create "Issue title" --body-file - --json

# Parent/child hierarchy
bd create "Auth System" -t epic -p 1 --json
bd create "Login UI" -p 1 --parent <epic-id> --json

# Discovered work linkage
bd create "Found bug" -t bug -p 1 --deps discovered-from:<parent-id> --json

# External references
bd create "Fix login" -t bug -p 1 --external-ref "gh-123" --json
```

## Issue State

Use state dimensions for long-lived operational context (for example: patrol,
mode, health).

Common dimensions:

- `patrol`: `active`, `muted`, `suspended`
- `mode`: `normal`, `degraded`, `maintenance`
- `health`: `healthy`, `warning`, `failing`
- `status`: `idle`, `working`, `blocked`

What `set-state` does:

1. Creates an event bead with reason (source of truth)
2. Removes old `<dimension>:*` label if one exists
3. Adds new `<dimension>:<value>` label (cache)

```bash
# Query current state value
bd state <id> <dimension>                    # Output: value
bd state witness-abc patrol                  # Output: active
bd state --json witness-abc patrol           # {"issue_id":"...","dimension":"patrol","value":"active"}

# List all state dimensions on an issue
bd state list <id> --json
bd state list witness-abc                    # patrol: active, mode: normal, health: healthy

# Set state (creates event + updates label atomically)
bd set-state <id> <dimension>=<value> --reason "explanation" --json
bd set-state witness-abc patrol=muted --reason "Investigating stuck polecat"
bd set-state witness-abc mode=degraded --reason "High error rate"
```

## Maintenance & Cleanup

Run destructive cleanup commands with `--dry-run` first.

```bash
# Clean up closed issues (bulk deletion)
bd admin cleanup --dry-run --json
bd admin cleanup --force --json
bd admin cleanup --older-than 30 --force --json
bd admin cleanup --older-than 90 --cascade --force --json

# Optional hard-delete mode (bypasses tombstone TTL safety)
bd admin cleanup --older-than 90 --hard --force --json
```

## Orphans & Duplicates

```bash
# Scan current repo for orphaned issues (referenced in commits but still open)
bd orphans
bd orphans --json
bd orphans --details

# Cross-repo scan against an external beads DB
bd --db ~/my-beads-repo/.beads/beads.db orphans --json

# Find and merge duplicate groups
bd duplicates
bd duplicates --dry-run
bd duplicates --auto-merge

# Mark a specific issue as duplicate of canonical
bd duplicate <source-id> --of <target-id> --json
```

`bd merge` is a git merge-driver for JSONL conflicts, not duplicate
consolidation.

## Compaction & Restore

```bash
# Agent-driven compaction
bd admin compact --analyze --json
bd admin compact --analyze --tier 1 --limit 10 --json
bd admin compact --apply --id bd-42 --summary summary.txt
bd admin compact --apply --id bd-42 --summary - < summary.txt
bd admin compact --stats --json

# Legacy AI-powered compaction (requires ANTHROPIC_API_KEY)
bd admin compact --auto --dry-run --all
bd admin compact --auto --all --tier 1

# Restore compacted issue from git history
bd restore <id> --json
```

## Molecular Chemistry

Beads uses a chemistry metaphor for template-based workflows.

Phase transitions:

- Solid: Proto (`bd formula list`)
- Liquid: Mol (`bd mol pour`)
- Vapor: Wisp (`bd mol wisp`, ephemeral and not exported to JSONL)

```bash
# List available formulas/templates
bd formula list --json

# Show molecule/proto structure
bd mol show <molecule-or-proto-id> --json

# Extract proto from ad-hoc epic
bd mol distill <epic-id> --json

# Pour: instantiate proto as persistent mol
bd mol pour <proto-id> --var key=value --json
bd mol pour <proto-id> --var key=value --dry-run
bd mol pour <proto-id> --var key=value --assignee <your-assignee-id> --json
bd mol pour <proto-id> --attach <other-proto> --json

# Wisp: instantiate proto as ephemeral molecule
bd mol wisp <proto-id> --var key=value --json
bd mol wisp list --json
bd mol wisp list --all --json
bd mol wisp gc --json
bd mol wisp gc --age 24h --json
bd mol wisp gc --dry-run

# Bonding: combine proto/mol workflows
bd mol bond <A> <B> --json
bd mol bond <A> <B> --type sequential --json
bd mol bond <A> <B> --type parallel --json
bd mol bond <A> <B> --type conditional --json
bd mol bond <proto> <mol> --pour --json
bd mol bond <proto> <mol> --ephemeral --json
bd mol bond <proto> <mol> --ref arm-{{name}} --var name=ace --json
bd mol bond <A> <B> --dry-run

# Squash: compress wisp execution to digest
bd mol squash <ephemeral-id> --json
bd mol squash <ephemeral-id> --summary "Work completed" --json
bd mol squash <ephemeral-id> --dry-run
bd mol squash <ephemeral-id> --keep-children --json

# Burn: delete wisp without digest (destructive)
bd mol burn <ephemeral-id> --json
bd mol burn <ephemeral-id> --dry-run
bd mol burn <ephemeral-id> --force --json
```

Note: some `bd mol` write operations may need `--no-daemon` in direct DB mode.

## Sync Branch Workflow

Check current sync mode first:

```bash
bd sync --status
```

Sync branch setup and migration:

```bash
bd migrate sync beads-sync
bd migrate sync beads-sync --dry-run
bd migrate sync beads-sync --force
bd migrate sync beads-sync --orphan
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
- `docs/BEADS_MAINTENANCE.md` — orphan cleanup, epic closure, priority
  rebalancing

## Beads Recovery

If `bd` fails with SQLite schema/version errors (for example,
`no such column:
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

## Running Tests

This project uses the devcontainer CLI for consistent container-based execution.

### Quick Commands

```bash
devcontainer up --workspace-folder .
devcontainer exec --workspace-folder . deno test -A --fail-fast tests
deno task test:docker  # shortcut
```

### First-Time Setup

Install the devcontainer CLI once:

```bash
npm install -g @devcontainers/cli
```

If using direnv interactively:

```bash
direnv allow
```

### Cache Persistence

Deno and npm caches use a named Docker volume (`xdg-cache`). No host-side cache
directory needed. To reset: `docker volume rm lone_xdg-cache`

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
