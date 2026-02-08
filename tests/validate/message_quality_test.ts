import { assert } from "jsr:@std/assert";
import type { FindingType } from "../../src/contracts/finding.ts";
import type { SemanticNodeType } from "../../src/contracts/semantic_node.ts";
import { validateSemanticHTML } from "../../src/validate/semantic_html.ts";
import { validateNameRequired } from "../../src/validate/nameable.ts";
import { validateKeyboardAccessible } from "../../src/validate/keyboard_accessible.ts";
import { validateTextAlternatives } from "../../src/validate/text_alternatives.ts";
import { validateARIAUsage } from "../../src/validate/aria_usage.ts";
import { validateScreenReaderContent } from "../../src/validate/screen_reader_content.ts";
import { validateColorContrast } from "../../src/validate/color_contrast.ts";

const actionRegex =
  /(must|should|use|add|provide|include|remove|ensure|avoid|requires|increase)/i;

const exampleRequiredCodes = new Set([
  "ARIA_INVALID_ATTRIBUTE_VALUE",
]);

function assertMessageQuality(finding: FindingType) {
  assert(finding.message === finding.message.trim());
  assert(/^[A-Z]/.test(finding.message));
  assert(/\.$/.test(finding.message));
  assert(actionRegex.test(finding.message));

  if (exampleRequiredCodes.has(finding.code)) {
    assert(/one of:/i.test(finding.message));
  }
}

function findByCode(findings: FindingType[], code: string): FindingType {
  const found = findings.find((finding) => finding.code === code);
  assert(found, `Expected finding ${code}`);
  return found;
}

function n(
  type: string,
  options: {
    role?: string;
    name?: string;
    props?: Record<string, unknown>;
    children?: SemanticNodeType[];
  } = {},
): SemanticNodeType {
  return {
    type,
    role: options.role,
    name: options.name,
    props: options.props ?? {},
    children: options.children ?? [],
  };
}

Deno.test("Finding messages - semantic HTML rules are actionable", () => {
  const root = n("div", {
    children: [
      n("h1", { role: "heading" }),
      n("h3", { role: "heading" }),
      n("a", { props: { onclick: true } }),
      n("a"),
      n("button", { props: { href: "/docs" } }),
      n("ul", { children: [n("div")] }),
      n("table", {
        children: [
          n("tr", { children: [n("th", { props: { scope: "col" } })] }),
          n("tr"),
          n("tr"),
          n("tr"),
        ],
      }),
      n("table", { children: [n("tr", { children: [n("th")] })] }),
      n("table", { children: [n("tr", { children: [n("td")] })] }),
      n("input", { props: { id: "email" } }),
    ],
  });

  const findings = validateSemanticHTML(root);

  [
    "HEADING_LEVEL_SKIP",
    "LINK_WITH_ONCLICK",
    "LINK_WITHOUT_HREF",
    "BUTTON_WITH_HREF",
    "INVALID_LIST_CHILD",
    "TH_MISSING_SCOPE",
    "TABLE_MISSING_THEAD_TBODY",
    "TABLE_MISSING_HEADERS",
    "FORM_CONTROL_UNLABELED",
  ].forEach((code) => assertMessageQuality(findByCode(findings, code)));
});

Deno.test("Finding messages - heading warnings include h1 guidance", () => {
  const findings = validateSemanticHTML(
    n("div", { children: [n("h2", { role: "heading" })] }),
  );

  assertMessageQuality(findByCode(findings, "MISSING_H1"));
});

Deno.test("Finding messages - name required rules are actionable", () => {
  const findings = validateNameRequired(n("button"));

  assertMessageQuality(findByCode(findings, "MISSING_NAME"));
});

Deno.test("Finding messages - keyboard accessibility rules are actionable", () => {
  const root = n("div", {
    children: [
      n("button", { props: { tabIndex: -1 } }),
      n("div", { role: "button", props: { focusable: false } }),
      n("div", { role: "button", props: { keyboardHandlers: ["enter"] } }),
      n("div", { role: "dialog", props: { keyboardHandlers: ["enter"] } }),
      n("div", { role: "menu", props: { keyboardHandlers: ["enter"] } }),
      n("div", { role: "button", props: { tabIndex: 3 } }),
      n("div", { role: "button", props: { tabIndex: 2 } }),
      n("div", {
        role: "button",
        props: { keyboardTrap: true, keyboardHandlers: ["enter"] },
      }),
      n("div", { role: "button", props: { focusVisible: false } }),
    ],
  });

  const findings = validateKeyboardAccessible(root);

  [
    "NEGATIVE_TABINDEX",
    "NOT_FOCUSABLE",
    "MISSING_TABINDEX",
    "MISSING_KEYBOARD_HANDLER",
    "MISSING_ESCAPE_HANDLER",
    "MISSING_ARROW_KEY_SUPPORT",
    "TABINDEX_OUT_OF_ORDER",
    "KEYBOARD_TRAP",
    "MISSING_FOCUS_INDICATOR",
  ].forEach((code) => assertMessageQuality(findByCode(findings, code)));
});

Deno.test("Finding messages - text alternatives rules are actionable", () => {
  const root = n("div", {
    children: [
      n("img"),
      n("img", { props: { alt: "" } }),
      n("svg"),
      n("video"),
      n("button", { props: { iconOnly: true } }),
      n("canvas"),
    ],
  });

  const findings = validateTextAlternatives(root);

  [
    "MISSING_ALT",
    "EMPTY_ALT_MEANINGFUL",
    "MISSING_SVG_TEXT_ALTERNATIVE",
    "MISSING_MEDIA_TEXT_ALTERNATIVE",
    "ICON_BUTTON_MISSING_LABEL",
    "MISSING_FALLBACK_CONTENT",
  ].forEach((code) => assertMessageQuality(findByCode(findings, code)));
});

Deno.test("Finding messages - ARIA usage rules are actionable", () => {
  const root = n("div", {
    children: [
      n("div", { role: "checkbox" }),
      n("div", { role: "checkbox", props: { "aria-checked": "maybe" } }),
      n("button", { role: "button" }),
      n("button", { role: "link" }),
      n("div", { role: "textbox", props: { "aria-labelledby": "missing-id" } }),
      n("div", { role: "status", props: { "aria-live": "nope" } }),
    ],
  });

  const findings = validateARIAUsage(root);

  [
    "ARIA_REQUIRED_ATTRIBUTE_MISSING",
    "ARIA_INVALID_ATTRIBUTE_VALUE",
    "REDUNDANT_ROLE",
    "CONFLICTING_ROLE",
    "ARIA_RELATIONSHIP_MISSING_TARGET",
    "ARIA_LIVE_INVALID",
  ].forEach((code) => assertMessageQuality(findByCode(findings, code)));
});

Deno.test("Finding messages - screen reader content rules are actionable", () => {
  const root = n("div", {
    children: [
      n("div", { props: { display: "none" } }),
      n("button", { props: { display: "none" } }),
      n("button", { props: { "aria-hidden": true, tabIndex: 0 } }),
      n("div", { props: { className: "sr-only" } }),
    ],
  });

  const findings = validateScreenReaderContent(root);

  [
    "CONTENT_HIDDEN_FROM_SR",
    "INTERACTIVE_HIDDEN",
    "ARIA_HIDDEN_FOCUSABLE",
    "SR_ONLY_NO_TEXT",
  ].forEach((code) => assertMessageQuality(findByCode(findings, code)));
});

Deno.test("Finding messages - color contrast rules are actionable", () => {
  const root = n("div", {
    props: { color: "#111111", backgroundColor: "#121212" },
  });

  const findings = validateColorContrast(root);

  assertMessageQuality(findByCode(findings, "INSUFFICIENT_CONTRAST"));
});
