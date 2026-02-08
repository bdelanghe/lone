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

const NATIVE_INTERACTIVE_TYPES = new Set([
  "a",
  "button",
  "input",
  "select",
  "textarea",
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

const WIDGET_ROLES = new Set([
  "listbox",
  "menu",
  "menubar",
  "tablist",
  "radiogroup",
  "tree",
  "treegrid",
  "grid",
  "toolbar",
  "slider",
  "spinbutton",
]);

const KEY_REQUIRED_BY_ROLE = new Map<string, string[]>([
  ["button", ["enter", "space"]],
  ["link", ["enter"]],
  ["checkbox", ["space"]],
  ["radio", ["space"]],
  ["switch", ["space"]],
  ["tab", ["enter", "space"]],
  ["menuitem", ["enter", "space"]],
  ["menuitemcheckbox", ["enter", "space"]],
  ["menuitemradio", ["enter", "space"]],
  ["option", ["enter", "space"]],
]);

export type FocusTarget = {
  path: string;
  node: SemanticNodeType;
  tabIndex: number;
};

export function validateKeyboardAccessible(
  root: SemanticNodeType,
  path = "$",
): FindingType[] {
  const findings: FindingType[] = [];

  findings.push(...validateFocusable(root, path));
  findings.push(...validateFocusIndicators(root, path));
  findings.push(...validateKeyboardHandlers(root, path));
  findings.push(...validateFocusOrder(root, path));
  findings.push(...validateKeyboardTraps(root, path));

  return findings;
}

export function simulateTabNavigation(
  root: SemanticNodeType,
  path = "$",
): FocusTarget[] {
  const focusables = collectFocusableInDocOrder(root, path);
  const positive = focusables
    .filter((item) => item.tabIndex > 0)
    .sort((a, b) => a.tabIndex - b.tabIndex || a.docIndex - b.docIndex);
  const rest = focusables.filter((item) => item.tabIndex === 0);

  return [...positive, ...rest].map((item) => ({
    path: item.path,
    node: item.node,
    tabIndex: item.tabIndex,
  }));
}

export function validateFocusOrder(
  root: SemanticNodeType,
  path = "$",
): FindingType[] {
  const findings: FindingType[] = [];
  const focusables = collectFocusableInDocOrder(root, path);
  const positiveTabOrder = focusables.filter((item) => item.tabIndex > 0);

  for (let i = 1; i < positiveTabOrder.length; i++) {
    const prev = positiveTabOrder[i - 1];
    const curr = positiveTabOrder[i];
    if (curr.tabIndex < prev.tabIndex) {
      findings.push({
        code: "LONE_KEYBOARD_TABINDEX_OUT_OF_ORDER",
        path: curr.path,
        message:
          "Positive tabindex values must increase in document order for logical tabbing.",
        severity: "warning",
      });
    }
  }

  return findings;
}

export function validateKeyboardTraps(
  root: SemanticNodeType,
  path = "$",
): FindingType[] {
  const findings: FindingType[] = [];

  walkTree(root, path, (node, currentPath) => {
    const props = node.props ?? {};
    const hasTrap = props.keyboardTrap === true || props.focusTrap === true;

    if (hasTrap) {
      const handlers = getKeyboardHandlers(props);
      if (!handlers.has("escape") && props.escapeCloses !== true) {
        findings.push({
          code: "LONE_KEYBOARD_TRAP",
          path: currentPath,
          message:
            "Focusable element traps keyboard focus without an Escape exit. Add an Escape handler.",
          severity: "error",
        });
      }
    }
  });

  return findings;
}

function validateFocusable(
  root: SemanticNodeType,
  path: string,
): FindingType[] {
  const findings: FindingType[] = [];

  walkTree(root, path, (node, currentPath) => {
    const tabIndex = getTabIndex(node.props);
    const interactive = isInteractive(node);

    if (interactive) {
      if (tabIndex !== null && tabIndex < 0) {
        findings.push({
          code: "LONE_KEYBOARD_NEGATIVE_TABINDEX",
          path: currentPath,
          message:
            "Interactive element has tabindex < 0 and is not reachable by Tab. Use tabindex=0 or remove the negative value.",
          severity: "error",
        });
      }

      if (!isFocusable(node)) {
        findings.push({
          code: "LONE_KEYBOARD_NOT_FOCUSABLE",
          path: currentPath,
          message: "Interactive element must be focusable for keyboard access.",
          severity: "error",
        });
      }

      const needsTabIndex = !isNativeInteractive(node) && tabIndex === null;
      if (needsTabIndex) {
        findings.push({
          code: "LONE_KEYBOARD_MISSING_TABINDEX",
          path: currentPath,
          message:
            "Custom interactive element must define tabindex to be keyboard focusable.",
          severity: "error",
        });
      }
    }
  });

  return findings;
}

function validateFocusIndicators(
  root: SemanticNodeType,
  path: string,
): FindingType[] {
  const findings: FindingType[] = [];

  walkTree(root, path, (node, currentPath) => {
    if (isFocusable(node) && node.props?.focusVisible === false) {
      findings.push({
        code: "LONE_KEYBOARD_MISSING_FOCUS_INDICATOR",
        path: currentPath,
        message: "Focusable element should provide a visible focus indicator.",
        severity: "warning",
      });
    }
  });

  return findings;
}

function validateKeyboardHandlers(
  root: SemanticNodeType,
  path: string,
): FindingType[] {
  const findings: FindingType[] = [];

  walkTree(root, path, (node, currentPath) => {
    const role = node.role ?? node.type;
    const handlers = getKeyboardHandlers(node.props ?? {});
    const handlersProvided = handlers.size > 0;
    const customInteractive = isCustomInteractive(node);

    const required = KEY_REQUIRED_BY_ROLE.get(role);
    if (required && (customInteractive || handlersProvided)) {
      const missing = required.filter((key) => !handlers.has(key));
      if (missing.length > 0) {
        findings.push({
          code: "LONE_KEYBOARD_MISSING_KEYBOARD_HANDLER",
          path: currentPath,
          message:
            `Missing keyboard activation keys: ${missing.join(", ")}. Add handlers for these keys.`,
          severity: "error",
        });
      }
    }

    if (role === "dialog" || node.props?.["aria-modal"] === true) {
      if (!handlers.has("escape") && node.props?.escapeCloses !== true) {
        if (!customInteractive && !handlersProvided) {
          return;
        }
        findings.push({
          code: "LONE_KEYBOARD_MISSING_ESCAPE_HANDLER",
          path: currentPath,
          message: "Modal dialog should close on Escape key.",
          severity: "error",
        });
      }
    }

    if (WIDGET_ROLES.has(role)) {
      const hasArrow =
        handlers.has("arrowup") ||
        handlers.has("arrowdown") ||
        handlers.has("arrowleft") ||
        handlers.has("arrowright");
      if (!hasArrow && (customInteractive || handlersProvided)) {
        findings.push({
          code: "LONE_KEYBOARD_MISSING_ARROW_KEY_SUPPORT",
          path: currentPath,
          message: "Widget should support arrow key navigation.",
          severity: "warning",
        });
      }
    }
  });

  return findings;
}

function collectFocusableInDocOrder(
  root: SemanticNodeType,
  path: string,
): Array<{
  path: string;
  node: SemanticNodeType;
  tabIndex: number;
  docIndex: number;
}> {
  const focusables: Array<{
    path: string;
    node: SemanticNodeType;
    tabIndex: number;
    docIndex: number;
  }> = [];
  let docIndex = 0;

  walkTree(root, path, (node, currentPath) => {
    if (isFocusable(node)) {
      const tabIndex = getTabIndex(node.props) ?? 0;
      focusables.push({
        path: currentPath,
        node,
        tabIndex,
        docIndex,
      });
      docIndex += 1;
    }
  });

  return focusables;
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

function isInteractive(node: SemanticNodeType): boolean {
  return INTERACTIVE_ROLES.has(node.role ?? node.type);
}

function isNativeInteractive(node: SemanticNodeType): boolean {
  return NATIVE_INTERACTIVE_TYPES.has(node.type);
}

function isCustomInteractive(node: SemanticNodeType): boolean {
  return isInteractive(node) && !isNativeInteractive(node);
}

function getTabIndex(props?: Record<string, unknown>): number | null {
  if (!props) {
    return null;
  }

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

function isDisabled(node: SemanticNodeType): boolean {
  const props = node.props ?? {};
  if (props.disabled === true || props["aria-disabled"] === true) {
    return true;
  }
  if (props.disabled === "true" || props["aria-disabled"] === "true") {
    return true;
  }
  return false;
}

function isFocusable(node: SemanticNodeType): boolean {
  if (isDisabled(node)) {
    return false;
  }

  const props = node.props ?? {};
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

  return isInteractive(node);
}

function getKeyboardHandlers(props: Record<string, unknown>): Set<string> {
  const raw = props.keyboardHandlers ?? props.keyHandlers ?? [];
  const handlers: string[] = [];

  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (typeof item === "string") {
        handlers.push(item);
      }
    }
  } else if (typeof raw === "string") {
    handlers.push(...raw.split(","));
  }

  return new Set(handlers.map(normalizeKey).filter((key) => key.length > 0));
}

function normalizeKey(key: string): string {
  const normalized = key.trim().toLowerCase();
  if (normalized === " " || normalized === "spacebar") {
    return "space";
  }
  return normalized;
}
