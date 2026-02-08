import type { SemanticNodeType } from "../contracts/semantic_node.ts";
import type { FindingType } from "../contracts/finding.ts";

const INTERACTIVE_ROLES = new Set([
  "button",
  "link",
  "textbox",
  "checkbox",
  "radio",
  "combobox",
  "searchbox",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "option",
  "switch",
  "slider",
  "tab",
]);

export function validateScreenReaderContent(
  root: SemanticNodeType,
  path = "$",
): FindingType[] {
  const findings: FindingType[] = [];

  walkTree(root, path, (node, currentPath) => {
    const props = node.props ?? {};
    const hidden = isHidden(props);
    const ariaHidden = isAriaHidden(props);
    const interactive = isInteractive(node);
    const srOnly = hasSrOnlyClass(props);

    if (hidden && !ariaHidden) {
      findings.push({
        code: "LONE_SR_CONTENT_HIDDEN",
        path: currentPath,
        message:
          "Content is hidden from screen readers via display/visibility. Avoid hiding meaningful content or use aria-hidden intentionally.",
        severity: "error",
      });
    }

    if (interactive && hidden) {
      findings.push({
        code: "LONE_SR_INTERACTIVE_HIDDEN",
        path: currentPath,
        message: "Interactive elements should not be hidden from users.",
        severity: "error",
      });
    }

    if (ariaHidden && isFocusable(props, interactive)) {
      findings.push({
        code: "LONE_SR_ARIA_HIDDEN_FOCUSABLE",
        path: currentPath,
        message: "Focusable elements must not be aria-hidden.",
        severity: "error",
      });
    }

    if (srOnly && !hasMeaningfulText(node)) {
      findings.push({
        code: "LONE_SR_ONLY_NO_TEXT",
        path: currentPath,
        message: "Visually hidden content should include meaningful text.",
        severity: "warning",
      });
    }
  });

  return findings;
}

function isHidden(props: Record<string, unknown>): boolean {
  const display = getStringProp(props, "display");
  const visibility = getStringProp(props, "visibility");
  if (props.hidden === true) {
    return true;
  }
  if (display === "none" || visibility === "hidden") {
    return true;
  }
  return false;
}

function isAriaHidden(props: Record<string, unknown>): boolean {
  return props["aria-hidden"] === true || props["aria-hidden"] === "true";
}

function isInteractive(node: SemanticNodeType): boolean {
  return INTERACTIVE_ROLES.has(node.role ?? node.type);
}

function hasSrOnlyClass(props: Record<string, unknown>): boolean {
  const className = getStringProp(props, "class") ??
    getStringProp(props, "className") ?? "";
  const classes = className.split(/\s+/).filter((value) => value.length > 0);
  return classes.includes("sr-only") || classes.includes("visually-hidden");
}

function hasMeaningfulText(node: SemanticNodeType): boolean {
  if (node.name && node.name.trim().length > 0) {
    return true;
  }
  return node.children.some((child) =>
    child.name && child.name.trim().length > 0
  );
}

function isFocusable(
  props: Record<string, unknown>,
  interactive: boolean,
): boolean {
  if (props.disabled === true || props["aria-disabled"] === true) {
    return false;
  }
  const tabIndex = getTabIndex(props);
  if (tabIndex !== null) {
    return tabIndex >= 0;
  }
  if (props.focusable === false) {
    return false;
  }
  if (props.focusable === true) {
    return true;
  }
  return interactive;
}

function getTabIndex(props: Record<string, unknown>): number | null {
  const raw = props.tabIndex ?? props.tabindex;
  if (raw === undefined || raw === null) {
    return null;
  }
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw;
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.length === 0) {
      return null;
    }
    const value = Number(trimmed);
    return Number.isFinite(value) ? value : null;
  }
  return null;
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
