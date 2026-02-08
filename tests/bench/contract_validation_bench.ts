import { ElementSpec } from "../../src/contracts/element_spec.ts";
import { SemanticNode } from "../../src/contracts/semantic_node.ts";

type ElementSpecInput = {
  tag: string;
  attrs?: Record<string, string>;
  text?: string;
  children?: ElementSpecInput[];
};

type SemanticNodeInput = {
  type: string;
  role?: string;
  name?: string;
  props?: Record<string, unknown>;
  children?: SemanticNodeInput[];
};

function makeElementSpecDeep(depth: number): ElementSpecInput {
  let node: ElementSpecInput = { tag: "span", text: "leaf" };
  for (let i = 0; i < depth; i++) {
    node = { tag: "div", children: [node] };
  }
  return node;
}

function makeElementSpecWide(width: number): ElementSpecInput {
  return {
    tag: "ul",
    children: Array.from({ length: width }, (_, index) => ({
      tag: "li",
      text: `Item ${index}`,
    })),
  };
}

function makeElementSpecLargeText(size: number): ElementSpecInput {
  return {
    tag: "p",
    text: "a".repeat(size),
  };
}

function makeElementSpecManyAttrs(count: number): ElementSpecInput {
  const attrs: Record<string, string> = {};
  for (let i = 0; i < count; i++) {
    attrs[`data-attr-${i}`] = `value-${i}`;
  }
  return { tag: "div", attrs };
}

function makeSemanticNodeDeep(depth: number): SemanticNodeInput {
  let node: SemanticNodeInput = { type: "span", name: "leaf" };
  for (let i = 0; i < depth; i++) {
    node = { type: "section", children: [node] };
  }
  return node;
}

function makeSemanticNodeWide(width: number): SemanticNodeInput {
  return {
    type: "list",
    role: "list",
    children: Array.from({ length: width }, (_, index) => ({
      type: "listitem",
      role: "listitem",
      name: `Item ${index}`,
    })),
  };
}

function makeSemanticNodeLargeName(size: number): SemanticNodeInput {
  return {
    type: "heading",
    role: "heading",
    name: "a".repeat(size),
  };
}

function makeSemanticNodeManyProps(count: number): SemanticNodeInput {
  const props: Record<string, unknown> = {};
  for (let i = 0; i < count; i++) {
    props[`data-prop-${i}`] = `value-${i}`;
  }
  return { type: "section", props };
}

const elementDeep = makeElementSpecDeep(20);
const elementWide = makeElementSpecWide(150);
const elementLargeText = makeElementSpecLargeText(100000);
const elementManyAttrs = makeElementSpecManyAttrs(150);

const semanticDeep = makeSemanticNodeDeep(20);
const semanticWide = makeSemanticNodeWide(150);
const semanticLargeName = makeSemanticNodeLargeName(1000);
const semanticManyProps = makeSemanticNodeManyProps(150);

Deno.bench("ElementSpec.parse - deep nesting (20)", () => {
  ElementSpec.parse(elementDeep);
});

Deno.bench("ElementSpec.parse - wide tree (150 children)", () => {
  ElementSpec.parse(elementWide);
});

Deno.bench("ElementSpec.parse - large text (100KB)", () => {
  ElementSpec.parse(elementLargeText);
});

Deno.bench("ElementSpec.parse - many attrs (150)", () => {
  ElementSpec.parse(elementManyAttrs);
});

Deno.bench("SemanticNode.parse - deep nesting (20)", () => {
  SemanticNode.parse(semanticDeep);
});

Deno.bench("SemanticNode.parse - wide tree (150 children)", () => {
  SemanticNode.parse(semanticWide);
});

Deno.bench("SemanticNode.parse - large name (1K)", () => {
  SemanticNode.parse(semanticLargeName);
});

Deno.bench("SemanticNode.parse - many props (150)", () => {
  SemanticNode.parse(semanticManyProps);
});
