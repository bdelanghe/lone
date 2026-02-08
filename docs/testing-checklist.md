# Accessibility Testing Checklist

This checklist mirrors the MDN accessibility testing guidance and maps each
item to automated validators or manual testing guides.

## Checklist Items

| # | Item | Type | Coverage |
|---|------|------|----------|
| 1 | Semantic HTML validation | Automated | `validateSemanticHTML` (`tests/validate/semantic_html_test.ts`, `tests/validate/semantic_html_mdn_test.ts`) |
| 2 | CSS-off content testing | Manual | `docs/testing/css-off-testing.md` |
| 3 | Keyboard accessibility | Automated | `validateKeyboardAccessible` (`tests/validate/keyboard_accessible_test.ts`) |
| 4 | Text alternatives | Automated | `validateTextAlternatives` (`tests/validate/text_alternatives_test.ts`) |
| 5 | Color contrast | Automated | `validateColorContrast` (`tests/validate/color_contrast_test.ts`) |
| 6 | Screen reader visible content | Automated | `validateScreenReaderContent` (`tests/validate/screen_reader_content_test.ts`) |
| 7 | JavaScript-free functionality | Manual | `docs/testing/javascript-disabled-testing.md` |
| 8 | ARIA usage | Automated | `validateARIAUsage` (`tests/validate/aria_usage_test.ts`) |
| 9 | Auditing tool integration | Automated | `lone-tbz` (axe-core integration) |
| 10 | Screen reader testing | Manual | `docs/testing/screen-reader-testing.md` |
| 11 | Accessibility statement | Manual | `docs/accessibility-statement-template.md` |

## Notes

- Automated checks live under `src/validate/` with corresponding tests in
  `tests/validate/`.
- Manual checks are documented in `docs/testing/`.
- The MDN good-semantics example is captured in
  `examples/mdn-good-semantics/` and validated in
  `tests/validate/semantic_html_mdn_test.ts`.
