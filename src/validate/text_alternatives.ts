import type { SemanticNodeType } from "../contracts/semantic_node.ts";
import type { FindingType } from "../contracts/finding.ts";

export function validateTextAlternatives(
  root: SemanticNodeType,
  path = "$",
): FindingType[] {
  const findings: FindingType[] = [];

  walkTree(root, path, (node, currentPath) => {
    const props = node.props ?? {};
    const role = node.role;

    if (isImageNode(node)) {
      const altProvided = Object.prototype.hasOwnProperty.call(props, "alt");
      const alt = getStringProp(props, "alt");
      const isDecorative =
        props.decorative === true || role === "presentation" || role === "none";

      if (!altProvided && !isDecorative) {
        findings.push({
          code: "MISSING_ALT",
          path: currentPath,
          message: "Image elements must provide alt text.",
          severity: "error",
        });
      } else if (alt === "" && !isDecorative) {
        findings.push({
          code: "EMPTY_ALT_MEANINGFUL",
          path: currentPath,
          message: "Meaningful images must not use empty alt text.",
          severity: "error",
        });
      }
    }

    if (node.type === "svg") {
      if (!hasAccessibleLabel(node, props)) {
        findings.push({
          code: "MISSING_SVG_TEXT_ALTERNATIVE",
          path: currentPath,
          message: "SVG elements must have a title/desc or ARIA label.",
          severity: "error",
        });
      }
    }

    if (node.type === "video" || node.type === "audio") {
      if (!hasMediaAlternative(props, node)) {
        findings.push({
          code: "MISSING_MEDIA_TEXT_ALTERNATIVE",
          path: currentPath,
          message: "Audio and video elements must provide captions or transcripts.",
          severity: "error",
        });
      }
    }

    if (isIconOnlyControl(node, props)) {
      if (!hasAccessibleLabel(node, props)) {
        findings.push({
          code: "ICON_BUTTON_MISSING_LABEL",
          path: currentPath,
          message: "Icon-only controls must include an accessible label.",
          severity: "error",
        });
      }
    }

    if (node.type === "canvas" || node.type === "iframe") {
      const hasFallback = node.children.length > 0 ||
        hasAccessibleLabel(node, props) ||
        Boolean(getStringProp(props, "fallbackText"));
      if (!hasFallback) {
        findings.push({
          code: "MISSING_FALLBACK_CONTENT",
          path: currentPath,
          message: "Canvas and iframe elements must include fallback content.",
          severity: "error",
        });
      }
    }
  });

  return findings;
}

function isImageNode(node: SemanticNodeType): boolean {
  return node.type === "img" || node.role === "img";
}

function isIconOnlyControl(
  node: SemanticNodeType,
  props: Record<string, unknown>,
): boolean {
  if (props.iconOnly !== true) {
    return false;
  }
  return node.type === "button" || node.role === "button" || node.role === "link";
}

function hasAccessibleLabel(
  node: SemanticNodeType,
  props: Record<string, unknown>,
): boolean {
  if (node.name && node.name.trim().length > 0) {
    return true;
  }

  const ariaLabel = getStringProp(props, "aria-label");
  if (ariaLabel && ariaLabel.trim().length > 0) {
    return true;
  }

  const labelledBy = getStringProp(props, "aria-labelledby");
  if (labelledBy && labelledBy.trim().length > 0) {
    return true;
  }

  const title = getStringProp(props, "title");
  if (title && title.trim().length > 0) {
    return true;
  }

  const desc = getStringProp(props, "desc");
  if (desc && desc.trim().length > 0) {
    return true;
  }

  return false;
}

function hasMediaAlternative(
  props: Record<string, unknown>,
  node: SemanticNodeType,
): boolean {
  if (props.captions === true || props.transcript === true) {
    return true;
  }
  if (props.hasCaptions === true || props.hasTranscript === true) {
    return true;
  }
  return hasAccessibleLabel(node, props);
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
