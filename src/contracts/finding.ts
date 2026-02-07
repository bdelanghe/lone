import { z } from "zod";

export const Finding = z.object({
  code: z.string().min(1),
  path: z.string().min(1),
  message: z.string().min(1),
});

export type FindingType = z.infer<typeof Finding>;
