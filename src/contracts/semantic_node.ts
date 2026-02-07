import { z } from "zod";

export const SemanticNode: z.ZodType<SemanticNodeType> = z.lazy(() =>
  z.object({
    type: z.string().min(1),
    name: z.string().optional(),
    role: z.string().optional(),
    props: z.record(z.unknown()).default({}),
    children: z.array(SemanticNode).default([]),
  })
);

export type SemanticNodeType = {
  type: string;
  name?: string;
  role?: string;
  props: Record<string, unknown>;
  children: SemanticNodeType[];
};
