# Finding Codes and Ordering

## Code Namespace

All Finding codes must use this format:

```
LONE_<DOMAIN>_<RULE>
```

Rules:

- `LONE` is the required project prefix.
- `<DOMAIN>` groups related checks (e.g. `SEMANTIC`, `ARIA`, `TEXT`, `KEYBOARD`,
  `COLOR`, `SR`, `NAME`).
- `<RULE>` is a short, uppercase identifier describing the violation.
- Only uppercase letters, digits, and underscores are allowed.

Examples:

- `LONE_SEMANTIC_HEADING_LEVEL_SKIP`
- `LONE_ARIA_REQUIRED_ATTRIBUTE_MISSING`
- `LONE_TEXT_MISSING_ALT`
- `LONE_KEYBOARD_TABINDEX_OUT_OF_ORDER`
- `LONE_COLOR_INSUFFICIENT_CONTRAST`
- `LONE_SR_CONTENT_HIDDEN`
- `LONE_NAME_MISSING`

## Deterministic Ordering

Findings must be sorted deterministically so CI and tooling are stable across
runs. The canonical ordering is:

1. `severity` (error → warning → info)
2. `code` (lexicographic)
3. `path` (lexicographic)
4. `message` (lexicographic)

Use `compareFindings`/`sortFindings` from `src/contracts/finding.ts`.
