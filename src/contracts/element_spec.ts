import { z } from "zod";

export const ElementSpec: z.ZodType<ElementSpecType> = z.lazy(() =>
  z.object({
    tag: z.string().min(1),
    attrs: z.record(z.string()).default({}),
    text: z.string().optional(),
    children: z.array(ElementSpec).default([]),
  })
);

export type ElementSpecType = {
  tag: string;
  attrs: Record<string, string>;
  text?: string;
  children: ElementSpecType[];
};
