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
  path = "$",
): FindingType[] {
  const findings: FindingType[] = [];

  // Check if current node needs a name
  const typeOrRole = root.role ?? root.type;
  if (INTERACTIVE_TYPES.has(typeOrRole)) {
    if (!root.name || root.name === "") {
      findings.push({
        code: "LONE_NAME_MISSING",
        path,
        message: `Interactive element '${typeOrRole}' must have a name.`,
        severity: "error",
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
