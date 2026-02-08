import { assertEquals } from "jsr:@std/assert";
import { validateTextAlternatives } from "../../src/validate/text_alternatives.ts";
import type { SemanticNodeType } from "../../src/contracts/semantic_node.ts";

Deno.test("validateTextAlternatives - flags img without alt", () => {
  const node: SemanticNodeType = {
    type: "img",
    props: {},
    children: [],
  };

  const findings = validateTextAlternatives(node);

  assertEquals(findings.length, 1);
  assertEquals(findings[0].code, "MISSING_ALT");
});

Deno.test("validateTextAlternatives - flags empty alt on meaningful image", () => {
  const node: SemanticNodeType = {
    type: "img",
    props: { alt: "" },
    children: [],
  };

  const findings = validateTextAlternatives(node);

  assertEquals(findings.length, 1);
  assertEquals(findings[0].code, "EMPTY_ALT_MEANINGFUL");
});

Deno.test("validateTextAlternatives - allows decorative image with empty alt", () => {
  const node: SemanticNodeType = {
    type: "img",
    role: "presentation",
    props: { alt: "" },
    children: [],
  };

  const findings = validateTextAlternatives(node);

  assertEquals(findings.length, 0);
});

Deno.test("validateTextAlternatives - flags svg without label", () => {
  const node: SemanticNodeType = {
    type: "svg",
    props: {},
    children: [],
  };

  const findings = validateTextAlternatives(node);

  assertEquals(findings.length, 1);
  assertEquals(findings[0].code, "MISSING_SVG_TEXT_ALTERNATIVE");
});

Deno.test("validateTextAlternatives - passes svg with title", () => {
  const node: SemanticNodeType = {
    type: "svg",
    props: { title: "Logo" },
    children: [],
  };

  const findings = validateTextAlternatives(node);

  assertEquals(findings.length, 0);
});

Deno.test("validateTextAlternatives - flags icon-only button without label", () => {
  const node: SemanticNodeType = {
    type: "button",
    props: { iconOnly: true },
    children: [],
  };

  const findings = validateTextAlternatives(node);

  assertEquals(findings.length, 1);
  assertEquals(findings[0].code, "ICON_BUTTON_MISSING_LABEL");
});

Deno.test("validateTextAlternatives - passes icon-only button with aria-label", () => {
  const node: SemanticNodeType = {
    type: "button",
    props: { iconOnly: true, "aria-label": "Search" },
    children: [],
  };

  const findings = validateTextAlternatives(node);

  assertEquals(findings.length, 0);
});

Deno.test("validateTextAlternatives - flags canvas without fallback", () => {
  const node: SemanticNodeType = {
    type: "canvas",
    props: {},
    children: [],
  };

  const findings = validateTextAlternatives(node);

  assertEquals(findings.length, 1);
  assertEquals(findings[0].code, "MISSING_FALLBACK_CONTENT");
});

Deno.test("validateTextAlternatives - passes canvas with fallback child", () => {
  const node: SemanticNodeType = {
    type: "canvas",
    props: {},
    children: [
      {
        type: "text",
        name: "Chart data",
        props: {},
        children: [],
      },
    ],
  };

  const findings = validateTextAlternatives(node);

  assertEquals(findings.length, 0);
});

Deno.test("validateTextAlternatives - flags media without captions", () => {
  const node: SemanticNodeType = {
    type: "video",
    props: {},
    children: [],
  };

  const findings = validateTextAlternatives(node);

  assertEquals(findings.length, 1);
  assertEquals(findings[0].code, "MISSING_MEDIA_TEXT_ALTERNATIVE");
});

Deno.test("validateTextAlternatives - passes media with transcript", () => {
  const node: SemanticNodeType = {
    type: "audio",
    props: { transcript: true },
    children: [],
  };

  const findings = validateTextAlternatives(node);

  assertEquals(findings.length, 0);
});
