import { assertEquals } from "jsr:@std/assert";

Deno.test("smoke test - toolchain sanity check", () => {
  assertEquals(1 + 1, 2);
});
