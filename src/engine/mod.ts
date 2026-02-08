import type { FindingType } from "../contracts/finding.ts";

export type Element = typeof globalThis extends { Element: infer E }
  ? E
  : unknown;

export type BlessPolicy = {
  profile: "mdn" | "wcag-lite" | "project";
  allowCodes?: string[];
  denyCodes?: string[];
  failOn?: "error" | "warn";
};

export type Blessed<T extends Element> = T & { __loneBlessed: true };

export type BlessResult<T extends Element> =
  | { ok: true; value: Blessed<T>; findings: FindingType[] }
  | { ok: false; findings: FindingType[] };

const backendMissingFinding: FindingType = {
  code: "LONE_ENGINE_BACKEND_UNCONFIGURED",
  path: "$",
  message:
    "No validation backend configured. Choose an engine in F.3 before calling bless/validate.",
  severity: "error",
};

function blessValue<T extends Element>(subject: T): Blessed<T> {
  return subject as Blessed<T>;
}

export async function validate<T extends Element>(
  _subject: T,
  _policy?: BlessPolicy,
): Promise<{ findings: FindingType[] }> {
  return { findings: [backendMissingFinding] };
}

export async function bless<T extends Element>(
  subject: T,
  policy?: BlessPolicy,
): Promise<BlessResult<T>> {
  const { findings } = await validate(subject, policy);

  if (findings.length > 0) {
    return { ok: false, findings };
  }

  return { ok: true, value: blessValue(subject), findings };
}
