# Molecules: Work Graphs in Beads

This document defines the Beads work-graph model used to structure and execute workflows ("molecules").

## How to read this doc

- Learning path: read sections 1-3 in order.
- Operator path: read sections 2.1-2.4 and 7.2.

## 1) Core Model (Data Plane)

### 1.1 Issues and Dependencies

Definition:
- Work is represented as issues connected by dependency edges.

Rule:
- Execution order is determined only by dependency edges, not naming or list order.

Example:
```bash
bd create "Task A" -t task
bd create "Task B" -t task
bd dep add <B-id> <A-id>    # B depends on A
```

### 1.2 Epics, Children, and Molecules

Definition:
- Epic: parent issue with child issues.
- Molecule: an epic treated as an executable graph.

Rule:
- A molecule is not a separate storage type. It is an execution view over epic + dependencies.

Example:
```bash
bd create "Feature X" -t epic
bd create "Design" -t task --parent <epic-id>
bd create "Implement" -t task --parent <epic-id>
bd dep add <implement-id> <design-id>
```

## 2) Execution Model (Control Plane)

### 2.1 Ready vs Blocked

Definition:
- Ready: issue has no open blockers.
- Blocked: issue has at least one open blocker.

Rule:
- Always pull work from `bd ready`; never assume an issue is runnable from title or position.

Example:
```bash
bd ready
bd blocked
```

### 2.2 Default Parallelism

Definition:
- Sibling children run in parallel unless dependencies constrain them.

Rule:
- If you need sequence, encode it explicitly with dependency edges.

Example:
```bash
# Parallel by default
bd create "Step 1" -t task --parent <epic-id>
bd create "Step 2" -t task --parent <epic-id>

# Force sequence
bd dep add <step2-id> <step1-id>
```

### 2.3 Dependency Semantics

Definition:
- Blocking edge types change readiness.
- Non-blocking edge types add context only.

Rule:
- Use requirement language when adding edges: "B needs A", then `bd dep add B A`.

Blocking edge types:

| Type | Semantics | Typical use |
|------|-----------|-------------|
| `blocks` | B cannot start until A closes | Sequential steps |
| `parent-child` | If parent is blocked, child is blocked | Hierarchy gating |
| `conditional-blocks` | B runs only if A fails | Failure path |
| `waits-for` | B waits for all children of A | Fanout join |

Non-blocking edge types:
- `related`
- `discovered-from`
- `replies-to`

Example:
```bash
# Correct direction: test needs implement
bd dep add <test-id> <implement-id>
```

### 2.4 Multi-Day Execution Loop

Definition:
- Agents execute the graph incrementally across sessions.

Rule:
- Progress requires closure. Blockers must be closed to unblock dependents.

Example:
```bash
bd ready
bd update <id> --status in_progress
# do work
bd close <id> --reason "Done"
```

## 3) Composition: Bonding Work Graphs

### 3.1 Bonding Basics

Definition:
- Bonding adds dependency relationships between work graphs.

Rule:
- Bond when two graphs must execute as one compound workflow.

Example:
```bash
bd mol bond A B                    # B depends on A
bd mol bond A B --type parallel    # no blocking
bd mol bond A B --type conditional # B runs only if A fails
```

### 3.2 Bonding Outcomes by Operand

| Operands | Result |
|----------|--------|
| epic + epic | Adds dependency edge between two graphs |
| proto + epic | Instantiates proto and attaches to epic |
| proto + proto | Creates compound reusable template |

### 3.3 Compound Execution

Definition:
- Agents may continue through bonded graphs as one execution space.

Rule:
- Use bonding to avoid handoff gaps between tightly coupled molecules.

## 4) Patterns (Recipes)

### 4.1 Sequential Pipeline

Use when:
- Work must run strictly step-by-step.

Example:
```bash
bd create "Pipeline" -t epic
bd create "Step 1" -t task --parent <pipeline-id>
bd create "Step 2" -t task --parent <pipeline-id>
bd create "Step 3" -t task --parent <pipeline-id>
bd dep add <step2-id> <step1-id>
bd dep add <step3-id> <step2-id>
```

### 4.2 Parallel Fanout + Gate (`waits-for`)

Use when:
- Multiple branches run in parallel, then join at an aggregate step.

Example:
```bash
bd create "Process files" -t epic
bd create "File A" -t task --parent <epic-id>
bd create "File B" -t task --parent <epic-id>
bd create "File C" -t task --parent <epic-id>
bd create "Aggregate" -t task --parent <epic-id>

bd dep add <aggregate-id> <fileA-id> --type waits-for
bd dep add <aggregate-id> <fileB-id> --type waits-for
bd dep add <aggregate-id> <fileC-id> --type waits-for
```

### 4.3 Dynamic Bonding ("Christmas Ornament")

Use when:
- Child count is discovered at runtime.

Example:
```bash
for polecat in $(gt polecat list); do
  bd mol bond mol-polecat-arm $PATROL_ID --ref arm-$polecat --var name=$polecat
done
```

## 5) Reuse and Phases (Optional)

Definition:
- Optional template/instance lifecycle for reusable workflow patterns.

Rule:
- Most teams can stay on issues + epics + dependencies. Add phases only when reuse pressure is real.

| Phase | Name | Storage | Synced | Purpose |
|------|------|---------|--------|---------|
| Solid | Proto | `.beads/` | Yes | Frozen template |
| Liquid | Mol | `.beads/` | Yes | Persistent active work |
| Vapor | Wisp | `.beads/` (Wisp=true) | No | Ephemeral operations |

Example:
```bash
bd mol pour <proto>        # Proto -> Mol
bd mol wisp <proto>        # Proto -> Wisp
bd mol squash <id>         # Mol/Wisp -> Digest
bd mol burn <id>           # Wisp -> discard
```

## 6) Pitfalls

### 6.1 Temporal Language Inverts Dependencies

Symptom:
- "Phase 1 before Phase 2" leads to reversed edge direction.

Fix:
- Say "Phase 2 needs Phase 1", then run:
```bash
bd dep add <phase2-id> <phase1-id>
```

### 6.2 Assuming Order Equals Sequence

Symptom:
- Numbered steps run in parallel unexpectedly.

Fix:
- Add explicit dependency edges.

### 6.3 Forgetting to Close Work

Symptom:
- Dependents remain blocked forever.

Fix:
```bash
bd close <id> --reason "Done"
```

### 6.4 Orphaned Wisps

Symptom:
- Ephemeral wisps accumulate without cleanup.

Fix:
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
