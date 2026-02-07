# Molecules: Work Graphs in Beads

This document defines the work-graph model Beads uses to structure and execute workflows ("molecules").

## How to read this doc

- If you are learning the model: read sections 1-3 in order.
- If you are running work right now: jump to section 2.3 (dependency semantics) and section 7.2 (commands).

## 1) Core Model (Data Plane)

### 1.1 Issues and Dependencies

Work is modeled as issues connected by dependencies. No special workflow type is required.

### 1.2 Epics, Children, and Molecules

- Epic: parent issue with children.
- Molecule: an epic used with execution intent, where agents traverse and close child work.

Templates/protos are optional (see section 5).

## 2) Execution Model (Control Plane)

### 2.1 Ready vs Blocked

- Ready work: issues with no open blockers (`bd ready`).
- Blocked work: issues waiting on blockers (`bd blocked`).

### 2.2 Default Parallelism

Children are parallel by default. Only explicit dependencies create sequence.

```bash
# These run in parallel (no deps between them)
bd create "Task A" -t task
bd create "Task B" -t task
bd create "Task C" -t task

# Make B wait for A (B depends on A)
bd dep add <B-id> <A-id>
```

### 2.3 Dependency Semantics

Blocking dependency types:

| Type | Semantics | Use case |
|------|-----------|----------|
| `blocks` | B cannot start until A closes | Sequential execution |
| `parent-child` | If parent is blocked, children are blocked | Hierarchy (children still parallel by default) |
| `conditional-blocks` | B runs only if A fails | Error handling |
| `waits-for` | B waits for all of A's children | Fanout gate |

Non-blocking link types:

- `related`
- `discovered-from`
- `replies-to`

These link issues without changing execution readiness.

### 2.4 Multi-Day Execution Loop

Agent loop:

1. Find ready work (`bd ready`).
2. Claim it (`bd update <id> --status in_progress`).
3. Do the work.
4. Close it (`bd close <id>`).
5. Repeat until the molecule is complete.

If blocked by another molecule, the agent can either wait or continue into the blocking molecule (compound execution via bonding).

## 3) Composition: Bonding Work Graphs

A bond creates a dependency relationship between two work graphs.

```bash
bd mol bond A B                    # B depends on A (sequential default)
bd mol bond A B --type parallel    # Organizational link, no blocking
bd mol bond A B --type conditional # B runs only if A fails
```

Bonding enables compound execution: agents can traverse multiple bonded graphs as one logical workflow.

### 3.1 What Bonding Does

| Operands | Result |
|----------|--------|
| epic + epic | Adds dependency edge between work graphs |
| proto + epic | Spawns proto into issues and attaches to epic |
| proto + proto | Creates a compound template |

## 4) Patterns (Recipes)

### 4.1 Sequential Pipeline

```bash
bd create "Pipeline" -t epic
bd create "Step 1" -t task --parent <pipeline-id>
bd create "Step 2" -t task --parent <pipeline-id>
bd create "Step 3" -t task --parent <pipeline-id>
bd dep add <step2-id> <step1-id>
bd dep add <step3-id> <step2-id>
```

### 4.2 Parallel Fanout with Gate (`waits-for`)

```bash
bd create "Process files" -t epic
bd create "File A" -t task --parent <epic-id>
bd create "File B" -t task --parent <epic-id>
bd create "File C" -t task --parent <epic-id>
bd create "Aggregate" -t task --parent <epic-id>

# Aggregate waits for all fanout children
bd dep add <aggregate-id> <fileA-id> --type waits-for
bd dep add <aggregate-id> <fileB-id> --type waits-for
bd dep add <aggregate-id> <fileC-id> --type waits-for
```

### 4.3 Dynamic Bonding ("Christmas Ornament")

Use this when child count is discovered at runtime.

```bash
for polecat in $(gt polecat list); do
  bd mol bond mol-polecat-arm $PATROL_ID --ref arm-$polecat --var name=$polecat
done
```

## 5) Reuse and Phases (Optional)

Most teams only need issues, epics, and dependencies. Use phases/templates when you need reusable workflow blueprints.

| Phase | Name | Storage | Synced | Purpose |
|------|------|---------|--------|---------|
| Solid | Proto | `.beads/` | Yes | Frozen template |
| Liquid | Mol | `.beads/` | Yes | Persistent active work |
| Vapor | Wisp | `.beads/` (Wisp=true) | No | Ephemeral operations |

```bash
bd mol pour <proto>        # Proto -> Mol
bd mol wisp <proto>        # Proto -> Wisp
bd mol squash <id>         # Mol/Wisp -> Digest
bd mol burn <id>           # Wisp -> discard
```

## 6) Pitfalls

### 6.1 Temporal Language Inverts Dependencies

Wrong: "Phase 1 before Phase 2" -> `bd dep add phase1 phase2`

Right: "Phase 2 needs Phase 1" -> `bd dep add phase2 phase1`

Verify with `bd blocked`.

### 6.2 Assuming Order Equals Sequence

Numbered names do not sequence execution. Dependencies do.

### 6.3 Forgetting to Close Work

Blocked work remains blocked until blockers close.

```bash
bd close <id> --reason "Done"
```

### 6.4 Orphaned Wisps

```bash
bd mol wisp list
bd mol squash <id>
bd mol burn <id>
bd mol wisp gc
```

## 7) Reference

### 7.1 Layer Cake

Formulas (optional) -> Protos (optional) -> Molecules -> Epics -> Issues (storage)

### 7.2 Command Quick Reference

```bash
bd ready
bd blocked
bd update <id> --status in_progress
bd close <id>

bd dep add <issue-id> <depends-on-id>
bd dep tree <id>

bd mol pour <proto> --var k=v
bd mol wisp <proto>
bd mol bond A B
bd mol squash <id>
bd mol burn <id>
```

### 7.3 Related Docs

- `docs/BEADS_CLI_QUICK_NOTES.md`
- `docs/BEADS_ARCHITECTURE_NOTES.md`
- `docs/BEADS_RECOVERY_RUNBOOK.md`
- [Upstream MOLECULES.md](https://raw.githubusercontent.com/steveyegge/beads/refs/heads/main/docs/MOLECULES.md)
