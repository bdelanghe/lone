import { z } from "zod";

// Common ARIA roles (not exhaustive, but covers most use cases)
// See: https://www.w3.org/TR/wai-aria-1.2/#role_definitions
const ARIA_ROLES = [
  "alert", "alertdialog", "application", "article", "banner", "button",
  "cell", "checkbox", "columnheader", "combobox", "complementary",
  "contentinfo", "definition", "dialog", "directory", "document",
  "feed", "figure", "form", "grid", "gridcell", "group", "heading",
  "img", "link", "list", "listbox", "listitem", "log", "main",
  "marquee", "math", "menu", "menubar", "menuitem", "menuitemcheckbox",
  "menuitemradio", "navigation", "none", "note", "option", "presentation",
  "progressbar", "radio", "radiogroup", "region", "row", "rowgroup",
  "rowheader", "scrollbar", "search", "searchbox", "separator", "slider",
  "spinbutton", "status", "switch", "tab", "table", "tablist", "tabpanel",
  "term", "textbox", "timer", "toolbar", "tooltip", "tree", "treegrid",
  "treeitem",
] as const;

// Validate type format: alphanumeric with optional underscores/hyphens
const typeRegex = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

const baseSchema = z.object({
  type: z.string()
    .min(1)
    .max(100)
    .regex(typeRegex, "Type must be alphanumeric with optional underscores/hyphens"),
  name: z.string()
    .max(1000)
    .optional()
    .refine(
      (name) => !name || name.trim().length > 0,
      "Name cannot be empty or whitespace-only"
    )
    .transform((name) => name?.trim()),
  role: z.string()
    .max(100)
    .trim()
    .optional()
    .refine(
      (role) => !role || ARIA_ROLES.includes(role as typeof ARIA_ROLES[number]),
      `Role must be a valid ARIA role (e.g., ${ARIA_ROLES.slice(0, 5).join(", ")})`
    ),
  props: z.record(z.unknown())
    .optional()
    .default({}),
});

type SemanticNodeBase = z.infer<typeof baseSchema>;

export type SemanticNodeType = SemanticNodeBase & {
  children: SemanticNodeType[];
};

export const SemanticNode: z.ZodType<SemanticNodeType> = z.lazy(() =>
  baseSchema.extend({
    children: z.array(SemanticNode).optional().default([]),
  })
) as z.ZodType<SemanticNodeType>;
