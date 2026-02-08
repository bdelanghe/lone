import { assertEquals } from "jsr:@std/assert";
import { bless, type Element, validate } from "../../src/engine/mod.ts";

Deno.test("validate - returns backend unconfigured finding", async () => {
  const subject = {} as unknown as Element;
  const result = await validate(subject);

  assertEquals(result.findings.length, 1);
  assertEquals(result.findings[0].code, "LONE_ENGINE_BACKEND_UNCONFIGURED");
  assertEquals(result.findings[0].severity, "error");
});

Deno.test("bless - returns not ok when backend is unconfigured", async () => {
  const subject = {} as unknown as Element;
  const result = await bless(subject);

  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.findings.length, 1);
    assertEquals(
      result.findings[0].code,
      "LONE_ENGINE_BACKEND_UNCONFIGURED",
    );
  }
});
