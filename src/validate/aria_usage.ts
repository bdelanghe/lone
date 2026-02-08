import type { SemanticNodeType } from "../contracts/semantic_node.ts";
import type { FindingType } from "../contracts/finding.ts";

type AriaRule = {
  required?: string[];
  allowed?: Record<string, string[]>;
};

const ROLE_REQUIRED_ATTRS: Record<string, AriaRule> = {
  checkbox: {
    required: ["aria-checked"],
    allowed: { "aria-checked": ["true", "false", "mixed"] },
  },
  radio: {
    required: ["aria-checked"],
    allowed: { "aria-checked": ["true", "false"] },
  },
  switch: {
    required: ["aria-checked"],
    allowed: { "aria-checked": ["true", "false"] },
  },
  slider: {
    required: ["aria-valuenow", "aria-valuemin", "aria-valuemax"],
  },
  progressbar: {
    required: ["aria-valuenow", "aria-valuemin", "aria-valuemax"],
  },
  combobox: {
    required: ["aria-expanded"],
    allowed: { "aria-expanded": ["true", "false"] },
  },
  listbox: {
    required: ["aria-expanded"],
    allowed: { "aria-expanded": ["true", "false"] },
  },
};

const REDUNDANT_ROLE_BY_TYPE: Record<string, string[]> = {
  button: ["button"],
  a: ["link"],
  input: ["textbox", "checkbox", "radio", "switch", "combobox", "searchbox"],
  textarea: ["textbox"],
  select: ["listbox", "combobox"],
};

const CONFLICTING_ROLE_BY_TYPE: Record<string, string[]> = {
  button: ["link"],
  a: ["button"],
};

const LIVE_REGION_VALUES = new Set(["off", "polite", "assertive"]);

export function validateARIAUsage(
  root: SemanticNodeType,
  path = "$",
): FindingType[] {
  const findings: FindingType[] = [];
  const idMap = collectIds(root, path);

  walkTree(root, path, (node, currentPath) => {
    const role = node.role;
    if (!role) {
      return;
    }

    checkRequiredAttributes(node, currentPath, findings);
    checkAttributeValues(node, currentPath, findings);
    checkRedundantRole(node, currentPath, findings);
    checkConflictingRole(node, currentPath, findings);
    checkRelationships(node, currentPath, idMap, findings);
    checkLiveRegion(node, currentPath, findings);
  });

  return findings;
}

function checkRequiredAttributes(
  node: SemanticNodeType,
  path: string,
  findings: FindingType[],
) {
  const role = node.role;
  if (!role) {
    return;
  }
  const rule = ROLE_REQUIRED_ATTRS[role];
  if (!rule?.required) {
    return;
  }

  const props = node.props ?? {};
  for (const attr of rule.required) {
    if (!Object.prototype.hasOwnProperty.call(props, attr)) {
      findings.push({
        code: "ARIA_REQUIRED_ATTRIBUTE_MISSING",
        path,
        message: `Role '${role}' requires ${attr}.`,
        severity: "error",
      });
    }
  }
}

function checkAttributeValues(
  node: SemanticNodeType,
  path: string,
  findings: FindingType[],
) {
  const role = node.role;
  if (!role) {
    return;
  }
  const rule = ROLE_REQUIRED_ATTRS[role];
  if (!rule?.allowed) {
    return;
  }

  const props = node.props ?? {};
  for (const [attr, allowed] of Object.entries(rule.allowed)) {
    if (!Object.prototype.hasOwnProperty.call(props, attr)) {
      continue;
    }
    const value = normalizeBooleanish(props[attr]);
    if (value && !allowed.includes(value)) {
      findings.push({
        code: "ARIA_INVALID_ATTRIBUTE_VALUE",
        path,
        message: `Attribute ${attr} on role '${role}' must be one of: ${allowed.join(", ")}.`,
        severity: "error",
      });
    }
  }
}

function checkRedundantRole(
  node: SemanticNodeType,
  path: string,
  findings: FindingType[],
) {
  const role = node.role;
  if (!role) {
    return;
  }
  const redundantRoles = REDUNDANT_ROLE_BY_TYPE[node.type];
  if (redundantRoles?.includes(role)) {
    findings.push({
      code: "REDUNDANT_ROLE",
      path,
      message: `Role '${role}' is redundant on <${node.type}>. Remove the role attribute.`,
      severity: "warning",
    });
  }
}

function checkConflictingRole(
  node: SemanticNodeType,
  path: string,
  findings: FindingType[],
) {
  const role = node.role;
  if (!role) {
    return;
  }
  const conflicts = CONFLICTING_ROLE_BY_TYPE[node.type];
  if (conflicts?.includes(role)) {
    findings.push({
      code: "CONFLICTING_ROLE",
      path,
      message:
        `Role '${role}' conflicts with native <${node.type}> semantics. Remove the role or change the element.`,
      severity: "error",
    });
  }
}

function checkRelationships(
  node: SemanticNodeType,
  path: string,
  idMap: Map<string, string>,
  findings: FindingType[],
) {
  const props = node.props ?? {};
  const labelledBy = getStringProp(props, "aria-labelledby");
  const describedBy = getStringProp(props, "aria-describedby");

  for (const relation of [
    { key: "aria-labelledby", value: labelledBy },
    { key: "aria-describedby", value: describedBy },
  ]) {
    if (!relation.value) {
      continue;
    }
    const ids = relation.value.split(/\s+/).filter((id) => id.length > 0);
    for (const id of ids) {
      if (!idMap.has(id)) {
        findings.push({
          code: "ARIA_RELATIONSHIP_MISSING_TARGET",
          path,
          message:
            `ARIA relationship ${relation.key} references missing id '${id}'. Ensure the referenced id exists.`,
          severity: "error",
        });
      }
    }
  }
}

function checkLiveRegion(
  node: SemanticNodeType,
  path: string,
  findings: FindingType[],
) {
  const props = node.props ?? {};
  const live = normalizeBooleanish(props["aria-live"] ?? props["ariaLive"]);
  if (!live) {
    return;
  }
  if (!LIVE_REGION_VALUES.has(live)) {
    findings.push({
      code: "ARIA_LIVE_INVALID",
      path,
      message: "Aria-live must be off, polite, or assertive.",
      severity: "error",
    });
  }
}

function collectIds(root: SemanticNodeType, path: string): Map<string, string> {
  const ids = new Map<string, string>();
  walkTree(root, path, (node, currentPath) => {
    const id = getStringProp(node.props ?? {}, "id");
    if (id && id.length > 0) {
      ids.set(id, currentPath);
    }
  });
  return ids;
}

function getStringProp(
  props: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = props[key];
  if (typeof value === "string") {
    return value;
  }
  return undefined;
}

function normalizeBooleanish(value: unknown): string | undefined {
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (typeof value === "string") {
    return value.trim().toLowerCase();
  }
  return undefined;
}

function walkTree(
  root: SemanticNodeType,
  path: string,
  visit: (node: SemanticNodeType, path: string) => void,
) {
  visit(root, path);
  root.children.forEach((child, index) => {
    walkTree(child, `${path}.children[${index}]`, visit);
  });
}
