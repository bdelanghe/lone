import { z } from "zod";

// Validate HTML tag format: lowercase alphanumeric + hyphens (for custom elements)
const tagRegex = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

// Validate attribute names: lowercase alphanumeric + hyphens, colons (for namespaced attrs)
const attrNameRegex = /^[a-z:][a-z0-9:_-]*$/;

// Prevent XSS: reject dangerous attribute names
const dangerousAttrs = [
  "onerror",
  "onload",
  "onclick",
  "onmouseover",
  "onfocus",
  "onblur",
  "onchange",
  "onsubmit",
];

const baseSchema = z.object({
  tag: z.string()
    .min(1)
    .max(100)
    .regex(tagRegex, "Tag must be lowercase alphanumeric with optional hyphens")
    .refine(
      (tag) => tag !== "script" && tag !== "iframe",
      "Script and iframe tags are not allowed for security reasons",
    ),
  attrs: z.record(
    z.string().regex(
      attrNameRegex,
      "Attribute names must be lowercase alphanumeric",
    ),
    z.string().max(10000),
  )
    .optional()
    .default({})
    .refine(
      (attrs) =>
        !Object.keys(attrs).some((key) =>
          dangerousAttrs.includes(key.toLowerCase())
        ),
      "Event handler attributes are not allowed for security reasons",
    ),
  text: z.string().max(100000).optional(),
});

type ElementSpecBase = z.infer<typeof baseSchema>;

export type ElementSpecType = ElementSpecBase & {
  children: ElementSpecType[];
};

export const ElementSpec: z.ZodType<ElementSpecType> = z.lazy(() =>
  baseSchema.extend({
    children: z.array(ElementSpec).optional().default([]),
  }).refine(
    (node) => !(node.text && node.children && node.children.length > 0),
    "Element cannot have both text content and children",
  )
) as z.ZodType<ElementSpecType>;
