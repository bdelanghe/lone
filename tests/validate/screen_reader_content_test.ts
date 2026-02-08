import { assertEquals } from "jsr:@std/assert";
import { validateScreenReaderContent } from "../../src/validate/screen_reader_content.ts";
import type { SemanticNodeType } from "../../src/contracts/semantic_node.ts";

Deno.test("validateScreenReaderContent - flags display none content", () => {
  const node: SemanticNodeType = {
    type: "div",
    props: { display: "none" },
    children: [],
  };

  const findings = validateScreenReaderContent(node);

  assertEquals(findings.length, 1);
  assertEquals(findings[0].code, "CONTENT_HIDDEN_FROM_SR");
});

Deno.test("validateScreenReaderContent - allows visually hidden content with text", () => {
  const node: SemanticNodeType = {
    type: "span",
    props: { class: "sr-only" },
    name: "Hidden label",
    children: [],
  };

  const findings = validateScreenReaderContent(node);

  assertEquals(findings.length, 0);
});

Deno.test("validateScreenReaderContent - flags aria-hidden focusable element", () => {
  const node: SemanticNodeType = {
    type: "button",
    props: { "aria-hidden": true },
    children: [],
  };

  const findings = validateScreenReaderContent(node);

  assertEquals(findings.length, 1);
  assertEquals(findings[0].code, "ARIA_HIDDEN_FOCUSABLE");
});

Deno.test("validateScreenReaderContent - flags hidden interactive element", () => {
  const node: SemanticNodeType = {
    type: "button",
    props: { visibility: "hidden" },
    children: [],
  };

  const findings = validateScreenReaderContent(node);

  assertEquals(findings.length, 2);
  assertEquals(findings[0].code, "CONTENT_HIDDEN_FROM_SR");
  assertEquals(findings[1].code, "INTERACTIVE_HIDDEN");
});

Deno.test("validateScreenReaderContent - warns on sr-only without text", () => {
  const node: SemanticNodeType = {
    type: "span",
    props: { className: "visually-hidden" },
    children: [],
  };

  const findings = validateScreenReaderContent(node);

  assertEquals(findings.length, 1);
  assertEquals(findings[0].code, "SR_ONLY_NO_TEXT");
});
