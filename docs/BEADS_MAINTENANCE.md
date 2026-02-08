# Beads Maintenance Guide

Periodic hygiene tasks to keep the issue graph healthy. Run these when issues
feel disorganized or after a burst of new work.

---

## 1. Find orphaned issues (no parent epic)

Issues without a `parent-child` dependency to any epic drift out of the work
graph. Find them:

```bash
bd list --status=open --json > /tmp/issues.json

# Non-epic issues with no parent-child dependency
jq -r '
  .[] |
  . as $issue |
  ((.dependencies // []) | map(select(.type == "parent-child")) | length) as $n |
  select($n == 0 and $issue.issue_type != "epic") |
  "\($issue.id) [\($issue.issue_type)] \($issue.title)"
' /tmp/issues.json
```

Do the same for closed issues (`--status=closed`). Assign orphans to an
appropriate epic:

```bash
bd dep add <issue-id> <epic-id> --type parent-child
```

---

## 2. Close eligible epics

When all children of an epic are closed, close the epic:

```bash
bd epic status | jq '.[] | select(.eligible_for_close) | {id: .epic.id, title: .epic.title}'
bd close <epic-id> --reason "All children closed."
```

---

## 3. Rebalance epic priorities

Priority should reflect dependency order — epics that block other epics belong
at a higher priority. General rules for this project:

| Priority | When to use                                             |
| -------- | ------------------------------------------------------- |
| P0       | Blocks all other work (identity, core API, dev tooling) |
| P1       | Core deliverables that depend on P0 being stable        |
| P2       | Important but secondary — depends on P1                 |
| P3       | Backlog / future enhancements                           |

```bash
bd update <epic-id> --priority=0   # P0: critical
bd update <epic-id> --priority=1   # P1: foundational
bd update <epic-id> --priority=2   # P2: secondary
bd update <epic-id> --priority=3   # P3: backlog
```

---

## 4. Sync and push

Always sync after bulk changes:

```bash
bd sync
git add .beads/
git commit -m "chore: beads maintenance — assign orphans, rebalance priorities"
git push
```

---

## 5. Update the roadmap

After priority changes, refresh `docs/ROADMAP.md` to reflect the new order. The
roadmap is the human-readable view of the priority graph — keep it in sync.

See: `docs/ROADMAP.md`
