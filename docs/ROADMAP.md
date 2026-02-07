# Lone Roadmap

This roadmap is organized by Beads epics in the canonical `lone-*` issue
universe.

Source of truth:

- `BEADS_DIR=/Users/bobby/.local/share/beads/io.github/bdelanghe/lone/.beads`
- `bd show <issue-id>`

Last refreshed: 2026-02-07

## Epic Index

| Epic | Status | Priority | Labels | Children |
| --- | --- | --- | --- | ---: |
| `lone-2il` | open | P3 | epic | 9 |
| `lone-336` | closed | P1 | beads, docs, molecule | 2 |
| `lone-a6i` | open | P3 | epic | 4 |
| `lone-ba1` | open | P2 | epic | 1 |
| `lone-kaz` | open | P3 | epic | 5 |
| `lone-pjd` | open | P3 | epic | 8 |

## Epics

### `lone-2il` Accessibility QA, docs, and hardening (open)

Design notes:
Harden quality through test depth, benchmarking, and documentation that
codifies manual accessibility checks alongside automated validation.

Acceptance criteria:
1) Performance and error-quality tasks merged with tests.
2) Manual testing guides published under `docs/`.
3) QA checklist is reproducible by contributors.
4) CI/commands referenced in docs are current and executable.

Spec: `docs/ROADMAP.md`

Child issues:

- `lone-3z5` [open] task: Doc: JavaScript-disabled testing guide
- `lone-4e9` [open] task: Example: recreate MDN good-semantics.html with our elements
- `lone-7xv` [open] task: Doc: Screen reader testing guide
- `lone-adu` [open] task: Doc: CSS-off content testing guide
- `lone-ba1` [open] epic: Create MDN accessibility testing checklist doc and automated tests
- `lone-bbf` [open] task: Add validation error message quality tests
- `lone-n4c` [open] task: Doc: Accessibility statement template
- `lone-vyi` [open] task: Add property-based tests for contract validation
- `lone-wnq` [open] task: Add validation performance benchmarks

### `lone-336` Document Molecules work graph model (closed)

Child issues:

- `lone-808` [closed] task: Author Molecules: Work Graphs in Beads doc
- `lone-ozl` [closed] task: Reference molecules workflow doc from AGENTS guidance

### `lone-a6i` Beads reliability and workflow guardrails (open)

Design notes:
Enforce a single canonical Beads universe (shared `BEADS_DIR` + sync branch)
and add guardrails for worktrees, daemon behavior, and recovery workflows.

Acceptance criteria:
1) Worktree confusion bugs resolved with documented runbook.
2) Sync branch flow works from clean clone to push.
3) Recovery path is validated for schema/daemon failures.
4) Agent docs prevent accidental local DB divergence.

Spec: `docs/ROADMAP.md`

Child issues:

- `lone-a6i.1` [open] bug: beads-sync worktree missing bd-repair recovery path
- `lone-a6i.2` [open] bug: Stale git index.lock blocks commit in main worktree
- `lone-sam` [open] bug: bd doctor false-positive dirty tree with external BEADS_DIR
- `lone-xfu` [open] bug: Worktree shows different issue set when direnv/BEADS_DIR not loaded

### `lone-ba1` Create MDN accessibility testing checklist doc and automated tests (open)

Design notes:
Translate the MDN accessibility checklist into a maintainable split of
automated validators/tests and manual testing docs, with explicit ownership
per checklist item.

Acceptance criteria:
1) Child tasks fully cover all checklist items.
2) Automated checks are implemented where feasible and wired to CI.
3) Manual-only checks have clear procedures in `docs/`.
4) Checklist docs and tests stay aligned with validator outputs.

Spec: `docs/ROADMAP.md`

Child issues:

- `lone-ba1.1` [open] task: Seed child task for MDN checklist epic

### `lone-kaz` Accessibility adapters and external engines (open)

Design notes:
Normalize external accessibility sources (CDP, Puppeteer, Playwright, AOM,
axe) into one deterministic `SemanticNode`/`Finding` contract boundary with
adapter-specific fixtures.

Acceptance criteria:
1) Adapter tasks complete for targeted engines.
2) Fixture-based tests prove stable normalization into `SemanticNode`.
3) Cross-adapter comparisons document expected differences.
4) Public adapter API is documented and versioned.

Spec: `docs/ROADMAP.md`

Child issues:

- `lone-931` [open] feature: Add runtime types for custom elements while keeping ElementSpec validation
- `lone-cyc` [open] task: Puppeteer SerializedAXNode Zod schema + adapter to SemanticNode
- `lone-h5h` [open] feature: Integrate Accessibility Object Model (AOM) APIs for tree introspection
- `lone-ni6` [open] task: Playwright ARIA snapshot Zod schema + adapter to SemanticNode
- `lone-tbz` [open] feature: Integrate axe-core for automated accessibility testing

### `lone-pjd` Accessibility validator suite v1 (open)

Design notes:
Use a contract-first validator pipeline: each validator consumes
`SemanticNode` and emits stable `Finding` objects; compose via `validateAll`
with deterministic ordering and de-duplication.

Acceptance criteria:
1) All child validator tasks merged and passing tests.
2) `validateAll` returns deterministic, de-duplicated findings with stable path ordering.
3) CI includes validator suite and integration coverage.
4) README/docs show how to run the full validator pipeline.

Spec: `docs/ROADMAP.md`

Child issues:

- `lone-1wt` [open] task: Validator: Keyboard accessibility checker
- `lone-4co` [open] feature: Create validator runner that combines all validators
- `lone-blx` [open] task: Validator: Color contrast checker
- `lone-dx4` [open] task: Test semantic HTML validator with MDN good-semantics.html example
- `lone-fnx` [open] task: Integration test: validate complete accessible document
- `lone-rjo` [open] task: Validator: Screen reader visible content checker
- `lone-wke` [open] task: Validator: ARIA usage validator
- `lone-z5w` [open] task: Validator: Text alternatives for non-text content
