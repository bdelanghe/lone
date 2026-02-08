import { z } from "zod";

// Validate LONE_<DOMAIN>_<RULE> in uppercase snake case
const errorCodeRegex = /^LONE_[A-Z0-9]+(?:_[A-Z0-9]+)+$/;

// Validate JSONPath format (starts with $ and contains valid path syntax)
const jsonPathRegex =
  /^\$(?:\[(?:\d+|'[^']*'|"[^"]*")\]|\.(?:[a-zA-Z_][a-zA-Z0-9_]*|\[(?:\d+|'[^']*'|"[^"]*")\]))*$/;

export const Severity = z.enum(["error", "warning", "info"]);
export type SeverityType = z.infer<typeof Severity>;

const severityOrder: Record<SeverityType, number> = {
  error: 0,
  warning: 1,
  info: 2,
};

export const Finding = z.object({
  code: z.string()
    .min(1)
    .max(100)
    .regex(
      errorCodeRegex,
      "Code must be in LONE_<DOMAIN>_<RULE> uppercase format",
    ),
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

export function compareFindings(a: FindingType, b: FindingType): number {
  const severityCmp = severityOrder[a.severity] - severityOrder[b.severity];
  if (severityCmp !== 0) return severityCmp;

  const codeCmp = a.code.localeCompare(b.code);
  if (codeCmp !== 0) return codeCmp;

  const pathCmp = a.path.localeCompare(b.path);
  if (pathCmp !== 0) return pathCmp;

  return a.message.localeCompare(b.message);
}

export function sortFindings(findings: FindingType[]): FindingType[] {
  return [...findings].sort(compareFindings);
}
