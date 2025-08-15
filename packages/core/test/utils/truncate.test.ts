import { expect, test } from "vitest";
import { truncate } from "../../src/utils/truncate";

test("returns strings shorter then length unchanged", () => {
  expect(truncate("a normal string", 15)).toBe("a normal string");
});

test("appends ellipsis and length to long string", () => {
  expect(truncate("a too long string", 15)).toBe("a too long …{2}");
});

test("appends ellipsis and length 999+ to long string", () => {
  expect(truncate("a".repeat(10000), 500)).toBe(`${"a".repeat(493)}…{999+}`);
});
