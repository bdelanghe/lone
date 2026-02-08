# Lone Roadmap

This roadmap is organized by Beads epics in the canonical `lone-*` issue
universe. Priority ordering reflects execution dependency — P0 epics must
reach stable state before P1 work accelerates.

Source of truth:

- `BEADS_DIR=/Users/bobby/.local/share/beads/io.github/bdelanghe/lone/.beads`
- `bd show <issue-id>`
- `bd epic status` — live completion percentages

Last refreshed: 2026-02-08

---

## Priority Order

```
P0 (critical / unblocking)
  └─ lone-0ng  Project Identity: AX-first semantic safety layer
  └─ lone-org  Lone Semantic Safety Engine: Contract-First Foundation
  └─ lone-65r  Developer Tooling & Workflow Reliability
        └─ lone-a6i  Beads reliability and workflow guardrails

P1 (foundational deliverables)
  └─ lone-pjd  Accessibility validator suite v1
  └─ lone-mmp  Runtime Validation: Two-tier SSR + Client-side DOM validation

P2 (important, depends on P0/P1)
  └─ lone-aei  Light DOM Only: No Shadow DOM (revisit later)
  └─ lone-kaz  Accessibility adapters and external engines
  └─ lone-2il  Accessibility QA, docs, and hardening

P3 (backlog)
  └─ lone-5w2  AX Template Persistence: Save validated structures from engine
```

---

## Epics

### P0 — `lone-0ng` Project Identity: AX-first semantic safety layer

> **Why P0:** Everything else depends on this being clear. The API, naming,
> docs, and examples must consistently reflect that Lone is a validation-only
> semantic safety layer — not a UI kit, not a DOM generator.

Mental model: **SafeHtml** — untrusted DOM in → `Blessed<T>` or `Finding[]` out.

Key deliverables:
- SafeHtml mental model documented
- Subject-as-child authoring pattern enforced
- AX-role naming convention (`lone-heading`, not `lone-h1`)
- Branded `Blessed<T>` type
- Core engine independent of Custom Elements
- Custom elements are validation-only (no behavior, no DOM mutation)

`bd show lone-0ng` for full details.

---

### P0 — `lone-org` Lone Semantic Safety Engine: Contract-First Foundation

> **Why P0:** This is the core API contract. `bless(element)` → `BlessOk|BlessErr`,
> `SemanticNode`, `Finding[]`, Zod schemas, and the POC harness. Everything
> downstream depends on these contracts being stable.

Key deliverables:
1. README positions Lone as semantic safety engine
2. Zod schemas define typed HTMLElement input contracts
3. Bless/reject API returns `SemanticNode` or `Finding[]` deterministically
4. MDN good-semantics fixtures pass (zero findings)
5. MDN bad-semantics fixtures produce stable `Finding.code` failures
6. CI gate fails build on non-empty `Finding[]`

`bd show lone-org` for full details.

---

### P0 — `lone-65r` Developer Tooling & Workflow Reliability

> **Why P0:** Broken tooling (SSH auth, beads bugs, worktree confusion) blocks
> all other work. Must be stable before velocity on P1+ is meaningful.

Contains: `lone-a6i` (Beads reliability and workflow guardrails) as sub-epic.

`bd show lone-65r` for full details.

---

### P1 — `lone-pjd` Accessibility validator suite v1

> **Why P1:** Core project deliverable. Composes individual validators
> (`SemanticNode` in, `Finding[]` out) into a deterministic pipeline.

Key deliverables:
- All child validators passing tests
- `validateAll` with deterministic, de-duplicated findings
- CI integration
- README shows how to run the pipeline

`bd show lone-pjd` for full details.

---

### P1 — `lone-mmp` Runtime Validation: Two-tier SSR + Client-side DOM validation

> **Why P1:** Defines the architectural split between intent (SSR) and
> realization (DOM). Custom elements are the enforcement binding point.

Key deliverables:
- SSR catches composition errors at build time
- Client-side DOM validation fires in lifecycle callbacks (no innerHTML)
- Lifecycle callback map documented (connectedCallback, attributeChangedCallback, disconnectedCallback)

`bd show lone-mmp` for full details.

---

### P2 — `lone-aei` Light DOM Only: No Shadow DOM

> **Why P2:** Architectural constraint that affects all wrapper design.
> Accessibility thrives on legibility — shadow DOM trades legibility for
> encapsulation, which is wrong for a validator.

`bd show lone-aei` for full details.

---

### P2 — `lone-kaz` Accessibility adapters and external engines

> **Why P2:** Normalizes CDP, Puppeteer, Playwright, AOM, axe-core into one
> `SemanticNode`/`Finding` boundary. Depends on `SemanticNode` contract from
> `lone-org` being stable.

`bd show lone-kaz` for full details.

---

### P2 — `lone-2il` Accessibility QA, docs, and hardening

> **Why P2:** Test depth, benchmarks, error quality, and manual testing guides.
> Meaningful only after validators exist.

`bd show lone-2il` for full details.

---

### P3 — `lone-5w2` AX Template Persistence

> **Why P3:** Future enhancement — save validated structures as HTML templates.
> Requires the engine (lone-org) to be complete first.

`bd show lone-5w2` for full details.

---

## Closed Epics

| Epic | Notes |
|------|-------|
| `lone-1ps` Zod-typed content contracts | All 7 children closed |
| `lone-336` Document Molecules work graph model | Complete |
