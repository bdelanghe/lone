import type { SemanticNodeType } from "../contracts/semantic_node.ts";
import type { FindingType } from "../contracts/finding.ts";

type RGB = { r: number; g: number; b: number };

type ContrastTarget = {
  isLargeText: boolean;
  isNonText: boolean;
  foreground: RGB;
  background: RGB;
};

export function validateColorContrast(
  root: SemanticNodeType,
  path = "$",
): FindingType[] {
  const findings: FindingType[] = [];

  walkTree(root, path, (node, currentPath) => {
    const target = extractContrastTarget(node);
    if (!target) {
      return;
    }

    const ratio = contrastRatio(target.foreground, target.background);
    const { minRatio, label } = requiredRatio(target);

    if (ratio < minRatio) {
      findings.push({
        code: "LONE_COLOR_INSUFFICIENT_CONTRAST",
        path: currentPath,
        message:
          `${label} contrast ratio ${ratio.toFixed(2)}:1 is below ${minRatio}:1. Increase contrast to at least ${minRatio}:1.`,
        severity: "error",
      });
    }
  });

  return findings;
}

function extractContrastTarget(node: SemanticNodeType): ContrastTarget | null {
  const props = node.props ?? {};
  const fg = parseColor(props.color ?? props.textColor);
  const bg = parseColor(props.backgroundColor ?? props.background);

  if (!fg || !bg) {
    return null;
  }

  const isNonText = props.nonText === true || props.contrastType === "non-text";
  const isLargeText =
    props.largeText === true ||
    isLargeFont(props.fontSize, props.fontWeight);

  return {
    isLargeText,
    isNonText,
    foreground: fg,
    background: bg,
  };
}

function requiredRatio(target: ContrastTarget): { minRatio: number; label: string } {
  if (target.isNonText) {
    return { minRatio: 3, label: "Non-text" };
  }
  if (target.isLargeText) {
    return { minRatio: 3, label: "Large text" };
  }
  return { minRatio: 4.5, label: "Text" };
}

function isLargeFont(
  fontSize: unknown,
  fontWeight: unknown,
): boolean {
  const sizePx = parseFontSize(fontSize);
  if (!sizePx) {
    return false;
  }

  const bold = isBold(fontWeight);
  if (bold) {
    return sizePx >= 18.66;
  }
  return sizePx >= 24;
}

function parseFontSize(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const trimmed = value.trim().toLowerCase();
    if (trimmed.endsWith("px")) {
      const parsed = Number(trimmed.replace("px", ""));
      return Number.isFinite(parsed) ? parsed : null;
    }
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function isBold(value: unknown): boolean {
  if (typeof value === "number") {
    return value >= 700;
  }
  if (typeof value === "string") {
    const trimmed = value.trim().toLowerCase();
    if (trimmed === "bold" || trimmed === "bolder") {
      return true;
    }
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) && parsed >= 700;
  }
  return false;
}

function parseColor(value: unknown): RGB | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim().toLowerCase();
  if (trimmed.startsWith("#")) {
    return parseHexColor(trimmed);
  }

  if (trimmed.startsWith("rgb")) {
    return parseRgbColor(trimmed);
  }

  return null;
}

function parseHexColor(value: string): RGB | null {
  const hex = value.replace("#", "");
  if (hex.length === 3) {
    const r = Number.parseInt(hex[0] + hex[0], 16);
    const g = Number.parseInt(hex[1] + hex[1], 16);
    const b = Number.parseInt(hex[2] + hex[2], 16);
    return { r, g, b };
  }
  if (hex.length === 6) {
    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

function parseRgbColor(value: string): RGB | null {
  const match = value.match(/rgba?\(([^)]+)\)/);
  if (!match) {
    return null;
  }
  const parts = match[1].split(",").map((part) => part.trim());
  if (parts.length < 3) {
    return null;
  }
  const r = Number(parts[0]);
  const g = Number(parts[1]);
  const b = Number(parts[2]);
  if (![r, g, b].every((v) => Number.isFinite(v))) {
    return null;
  }
  return { r, g, b };
}

function contrastRatio(foreground: RGB, background: RGB): number {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(color: RGB): number {
  const [r, g, b] = [color.r, color.g, color.b].map((channel) => {
    const normalized = channel / 255;
    if (normalized <= 0.03928) {
      return normalized / 12.92;
    }
    return Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
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
