import type { SemanticNodeType } from "../contracts/semantic_node.ts";
import type { FindingType } from "../contracts/finding.ts";

const INTERACTIVE_TYPES = new Set([
  "button",
  "link",
  "textbox",
  "checkbox",
  "radio",
]);

/**
 * Validates that interactive elements have non-empty names.
 * Walks the tree recursively and returns findings for elements that require names.
 */
export function validateNameRequired(
  root: SemanticNodeType,
  path = "$"
): FindingType[] {
  const findings: FindingType[] = [];

  // Check if current node needs a name
  if (INTERACTIVE_TYPES.has(root.type)) {
    if (!root.name || root.name === "") {
      findings.push({
        code: "missing-name",
        path,
        message: `Interactive element '${root.type}' must have a name`,
      });
    }
  }

  // Recursively check children
  root.children.forEach((child, index) => {
    const childPath = `${path}.children[${index}]`;
    findings.push(...validateNameRequired(child, childPath));
  });

  return findings;
}
