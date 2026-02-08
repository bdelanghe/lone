import type { SemanticNodeType } from "../contracts/semantic_node.ts";

export type ElementLike = {
  tagName?: string;
  children?: ArrayLike<ElementLike>;
  attributes?: ArrayLike<{ name: string; value: string }>;
  getAttribute?: (name: string) => string | null;
  textContent?: string | null;
};

function isElementLike(value: unknown): value is ElementLike {
  return typeof value === "object" && value !== null &&
    "tagName" in (value as { tagName?: unknown });
}

function parseAttributeValue(name: string, value: string): unknown {
  if (name === "aria-level") {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? value : parsed;
  }

  if (value === "") return true;
  return value;
}

function collectAttributes(element: ElementLike): Record<string, unknown> {
  const props: Record<string, unknown> = {};

  if (element.attributes) {
    for (const attr of Array.from(element.attributes)) {
      props[attr.name] = parseAttributeValue(attr.name, attr.value);
    }
  } else if (element.getAttribute) {
    const role = element.getAttribute("role");
    if (role) props.role = role;
    const ariaLabel = element.getAttribute("aria-label");
    if (ariaLabel) props["aria-label"] = ariaLabel;
  }

  return props;
}

const TAG_ROLE_MAP: Record<string, string> = {
  a: "link",
  button: "button",
  h1: "heading",
  h2: "heading",
  h3: "heading",
  h4: "heading",
  h5: "heading",
  h6: "heading",
  ul: "list",
  ol: "list",
  li: "listitem",
  nav: "navigation",
  main: "main",
};

function deriveName(props: Record<string, unknown>): string | undefined {
  const ariaLabel = props["aria-label"];
  if (typeof ariaLabel === "string" && ariaLabel.trim().length > 0) {
    return ariaLabel.trim();
  }

  const title = props["title"];
  if (typeof title === "string" && title.trim().length > 0) {
    return title.trim();
  }

  const alt = props["alt"];
  if (typeof alt === "string" && alt.trim().length > 0) {
    return alt.trim();
  }

  return undefined;
}

export function domToSemanticNode(
  element: unknown,
): SemanticNodeType | null {
  if (!isElementLike(element) || !element.tagName) return null;

  const props = collectAttributes(element);
  const roleAttr = typeof props.role === "string" ? props.role.trim() : "";
  const tagName = element.tagName.toLowerCase();
  const role = roleAttr.length > 0 ? roleAttr : TAG_ROLE_MAP[tagName];

  const node: SemanticNodeType = {
    type: tagName,
    name: deriveName(props),
    role,
    props,
    children: [],
  };

  const children = element.children ? Array.from(element.children) : [];
  for (const child of children) {
    const childNode = domToSemanticNode(child);
    if (childNode) node.children.push(childNode);
  }

  return node;
}
