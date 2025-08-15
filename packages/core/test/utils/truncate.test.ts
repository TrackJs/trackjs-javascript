import { expect, test } from "vitest";
import { truncate } from "../../src/utils";

test("throws when non-string is provided", () => {
  expect(() => truncate(false as unknown as string, 1)).toThrow("Value must be a string");
  expect(() => truncate({} as unknown as string, 1)).toThrow("Value must be a string");
  expect(() => truncate(12345 as unknown as string, 1)).toThrow("Value must be a string");
});

test("returns string shorter than length", () => {
  expect(truncate("1234567890", 10)).toBe("1234567890");
  expect(truncate("a".repeat(1000), 1000)).toBe("a".repeat(1000));
});

test("returns truncated string longer than length", () => {
  expect(truncate("1234567890", 8)).toBe("1234567…");
  expect(truncate("a".repeat(1000), 100)).toBe(`${"a".repeat(99)}…`);
});