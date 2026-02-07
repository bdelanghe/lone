import { z } from "zod";

// Validate UPPERCASE_SNAKE_CASE for error codes
const errorCodeRegex = /^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/;

// Validate JSONPath format (starts with $ and contains valid path syntax)
const jsonPathRegex =
  /^\$(?:\[(?:\d+|'[^']*'|"[^"]*")\]|\.(?:[a-zA-Z_][a-zA-Z0-9_]*|\[(?:\d+|'[^']*'|"[^"]*")\]))*$/;

export const Severity = z.enum(["error", "warning", "info"]);
export type SeverityType = z.infer<typeof Severity>;

export const Finding = z.object({
  code: z.string()
    .min(1)
    .max(100)
    .regex(errorCodeRegex, "Code must be in UPPERCASE_SNAKE_CASE format"),
  path: z.string()
    .min(1)
    .max(500)
    .regex(jsonPathRegex, "Path must be valid JSONPath format starting with $"),
  message: z.string()
    .min(1)
    .max(1000)
    .trim(),
  severity: Severity.default("error"),
});

export type FindingType = z.infer<typeof Finding>;
