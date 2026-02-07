import { z } from "zod";

const baseSchema = z.object({
  tag: z.string().min(1),
  attrs: z.record(z.string()).optional().default({}),
  text: z.string().optional(),
});

type ElementSpecBase = z.infer<typeof baseSchema>;

export type ElementSpecType = ElementSpecBase & {
  children: ElementSpecType[];
};

export const ElementSpec: z.ZodType<ElementSpecType> = z.lazy(() =>
  baseSchema.extend({
    children: z.array(ElementSpec).optional().default([]),
  })
) as z.ZodType<ElementSpecType>;
