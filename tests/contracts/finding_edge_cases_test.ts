import { assertEquals, assertThrows } from "jsr:@std/assert";
import { Finding } from "../../src/contracts/finding.ts";
import { ZodError } from "zod";

// Edge case: error code format validation
Deno.test("Finding - rejects lowercase error code", () => {
  assertThrows(
    () => {
      Finding.parse({
        code: "missing_name",
        path: "$.root",
        message: "Name is required",
      });
    },
    ZodError,
    "Code must be in UPPERCASE_SNAKE_CASE",
  );
});

Deno.test("Finding - rejects mixed case error code", () => {
  assertThrows(
    () => {
      Finding.parse({
        code: "Missing_Name",
        path: "$.root",
        message: "Name is required",
      });
    },
    ZodError,
    "Code must be in UPPERCASE_SNAKE_CASE",
  );
});

Deno.test("Finding - rejects error code with hyphens", () => {
  assertThrows(
    () => {
      Finding.parse({
        code: "MISSING-NAME",
        path: "$.root",
        message: "Name is required",
      });
    },
    ZodError,
    "Code must be in UPPERCASE_SNAKE_CASE",
  );
});

Deno.test("Finding - accepts single word error code", () => {
  const result = Finding.parse({
    code: "ERROR",
    path: "$.root",
    message: "An error occurred",
  });

  assertEquals(result.code, "ERROR");
});

Deno.test("Finding - accepts error code with numbers", () => {
  const result = Finding.parse({
    code: "ERROR_123_ABC",
    path: "$.root",
    message: "Error with numbers",
  });

  assertEquals(result.code, "ERROR_123_ABC");
});

// Edge case: JSONPath validation
Deno.test("Finding - rejects path not starting with $", () => {
  assertThrows(
    () => {
      Finding.parse({
        code: "INVALID_PATH",
        path: "root.child",
        message: "Invalid path",
      });
    },
    ZodError,
    "Path must be valid JSONPath format starting with $",
  );
});

Deno.test("Finding - accepts simple JSONPath", () => {
  const result = Finding.parse({
    code: "ERROR",
    path: "$.root",
    message: "Error at root",
  });

  assertEquals(result.path, "$.root");
});

Deno.test("Finding - accepts array index in path", () => {
  const result = Finding.parse({
    code: "ERROR",
    path: "$.children[0]",
    message: "Error in first child",
  });

  assertEquals(result.path, "$.children[0]");
});

Deno.test("Finding - accepts nested property access", () => {
  const result = Finding.parse({
    code: "ERROR",
    path: "$.root.child.grandchild",
    message: "Deeply nested error",
  });

  assertEquals(result.path, "$.root.child.grandchild");
});

Deno.test("Finding - accepts quoted property names", () => {
  const result = Finding.parse({
    code: "ERROR",
    path: "$['property-with-dashes']",
    message: "Property with special chars",
  });

  assertEquals(result.path, "$['property-with-dashes']");
});

// Edge case: message validation
Deno.test("Finding - trims message whitespace", () => {
  const result = Finding.parse({
    code: "ERROR",
    path: "$.root",
    message: "  Trimmed message  ",
  });

  assertEquals(result.message, "Trimmed message");
});

Deno.test("Finding - rejects excessively long message", () => {
  assertThrows(
    () => {
      Finding.parse({
        code: "ERROR",
        path: "$.root",
        message: "a".repeat(1001),
      });
    },
    ZodError,
  );
});

Deno.test("Finding - accepts message at max length", () => {
  const result = Finding.parse({
    code: "ERROR",
    path: "$.root",
    message: "a".repeat(1000),
  });

  assertEquals(result.message.length, 1000);
});

// Edge case: severity field
Deno.test("Finding - defaults severity to error", () => {
  const result = Finding.parse({
    code: "ERROR",
    path: "$.root",
    message: "An error occurred",
  });

  assertEquals(result.severity, "error");
});

Deno.test("Finding - accepts warning severity", () => {
  const result = Finding.parse({
    code: "DEPRECATED_USAGE",
    path: "$.root",
    message: "This usage is deprecated",
    severity: "warning",
  });

  assertEquals(result.severity, "warning");
});

Deno.test("Finding - accepts info severity", () => {
  const result = Finding.parse({
    code: "SUGGESTION",
    path: "$.root",
    message: "Consider using a different approach",
    severity: "info",
  });

  assertEquals(result.severity, "info");
});

Deno.test("Finding - rejects invalid severity", () => {
  assertThrows(
    () => {
      Finding.parse({
        code: "ERROR",
        path: "$.root",
        message: "An error occurred",
        severity: "critical",
      });
    },
    ZodError,
  );
});

// Edge case: length limits
Deno.test("Finding - rejects excessively long code", () => {
  assertThrows(
    () => {
      Finding.parse({
        code: "A".repeat(101),
        path: "$.root",
        message: "Error",
      });
    },
    ZodError,
  );
});

Deno.test("Finding - rejects excessively long path", () => {
  assertThrows(
    () => {
      Finding.parse({
        code: "ERROR",
        path: "$." + "a".repeat(499), // 499 + "$." = 501 chars (exceeds 500)
        message: "Error",
      });
    },
    ZodError,
  );
});

// Edge case: special characters in message
Deno.test("Finding - handles Unicode in message", () => {
  const result = Finding.parse({
    code: "INVALID_CHAR",
    path: "$.root",
    message: "Invalid character: → • ★ 中文",
  });

  assertEquals(result.message, "Invalid character: → • ★ 中文");
});

Deno.test("Finding - handles newlines in message", () => {
  const result = Finding.parse({
    code: "MULTILINE_ERROR",
    path: "$.root",
    message: "Line 1\nLine 2\nLine 3",
  });

  assertEquals(result.message, "Line 1\nLine 2\nLine 3");
});
