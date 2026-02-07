import { z } from "zod";

const baseSchema = z.object({
  type: z.string().min(1),
  name: z.string().optional(),
  role: z.string().optional(),
  props: z.record(z.unknown()).optional().default({}),
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
