# Agent Instructions

This project uses **bd** (beads) for issue tracking. Run `bd onboard` to get started.

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

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
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
