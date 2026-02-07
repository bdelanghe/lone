import { z } from "zod";

export const ValidatorSpec = z.object({
  id: z.string().min(1),
  version: z.string().min(1),
});

export type ValidatorSpecType = z.infer<typeof ValidatorSpec>;
