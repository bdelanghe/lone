# Lone Roadmap

This roadmap is intentionally short and focused. The only goal is to reach a
proof-of-concept (POC) for the semantic blessing engine, then trim the backlog.

Last refreshed: 2026-02-08

---

## North Star

Lone is a semantic blessing engine for DOM subtrees: it turns untrusted element
trees into `Blessed<T>` or structured `Finding[]`, delegating most rule coverage
while enforcing a stable contract boundary for downstream UI frameworks.

---

## POC Execution Queue (Unblocked)

1. `F.1` Ship `Finding` schema + deterministic ordering + code namespace rules.
2. `F.2` Ship `bless()` + branded `Blessed<T>`.
3. `F.3` Ship one backend: `axe-core` in JSDOM OR DOM-only extraction.
4. `F.4` Ship MDN fixture runner with 2 good + 2 bad tests.

These four steps are the only near-term roadmap items. Everything else is
explicitly deferred until the POC exists.

Backend choice for v0: DOM-only extraction (zod contracts as the core engine).

---

## Post-POC

Once the POC is complete:

- Trim or close duplicate validator issues.
- Rebalance priorities (infra vs architecture).
- Re-open scope decisions only with concrete user-facing requirements.

---

## Notes

- Lone does not re-implement axe-core or WCAG rule coverage.
- Lone does not require custom elements in v0.
- Adapters beyond the chosen backend are deferred.
