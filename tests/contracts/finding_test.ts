import { assertEquals, assertThrows } from "jsr:@std/assert";
import { Finding } from "../../src/contracts/finding.ts";
import { ZodError } from "zod";

Deno.test("Finding - parses valid finding", () => {
  const result = Finding.parse({
    code: "MISSING_NAME",
    path: "$.children[0]",
    message: "Element must have a name attribute",
  });

  assertEquals(result.code, "MISSING_NAME");
  assertEquals(result.path, "$.children[0]");
  assertEquals(result.message, "Element must have a name attribute");
});

Deno.test("Finding - rejects empty code", () => {
  assertThrows(
    () => {
      Finding.parse({
        code: "",
        path: "$.root",
        message: "Some message",
      });
    },
    ZodError,
    "String must contain at least 1 character(s)"
  );
});

Deno.test("Finding - rejects empty path", () => {
  assertThrows(
    () => {
      Finding.parse({
        code: "ERROR_CODE",
        path: "",
        message: "Some message",
      });
    },
    ZodError,
    "String must contain at least 1 character(s)"
  );
});

Deno.test("Finding - rejects empty message", () => {
  assertThrows(
    () => {
      Finding.parse({
        code: "ERROR_CODE",
        path: "$.root",
        message: "",
      });
    },
    ZodError,
    "String must contain at least 1 character(s)"
  );
});

Deno.test("Finding - rejects missing fields", () => {
  assertThrows(
    () => {
      Finding.parse({
        code: "ERROR_CODE",
        path: "$.root",
      });
    },
    ZodError
  );
});

Deno.test("Finding - handles complex JSONPath", () => {
  const result = Finding.parse({
    code: "INVALID_ROLE",
    path: "$.children[2].children[0].props['aria-label']",
    message: "Invalid ARIA role for this element type",
  });

  assertEquals(result.path, "$.children[2].children[0].props['aria-label']");
});
