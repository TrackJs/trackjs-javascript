import { test, expect } from "vitest";
import { Metadata } from "../src/metadata";

test("constructor() creates empty", () => {
  const m = new Metadata();
  expect(m.get()).toStrictEqual([]);
});

test("constructor({...}) creates with initial values", () => {
  const m = new Metadata({ foo: "bar" });
  expect(m.get()).toStrictEqual([
    { key: "foo", value: "bar" }
  ]);
});

test("add() adds and updates values", () => {
  const m = new Metadata();
  m.add({ "foo": "bar" });
  m.add({
    "foo": "bar",
    "bar": "baz"
  });
  expect(m.get()).toEqual([
    { key: "foo", value: "bar" },
    { key: "bar", value: "baz" }
  ]);
});

test("add() with non-string values", () => {
  const m = new Metadata();
  m.add({
    4: ({ foo: "bar" } as unknown) as string
  });
  expect(m.get()).toEqual([
    { key: "4", value: "[object Object]" }
  ]);
});

test("add() truncates keys and values that exceed maximum length", () => {
  const m = new Metadata();
  const longKey = "k".repeat(500);
  const longValue = "v".repeat(500);

  m.add({
    [longKey]: longValue
  });

  expect(m.get()).toEqual([
    { key: `${"k".repeat(490)}…{10}`, value: `${"v".repeat(490)}…{10}` }
  ]);
});

test("remove() removes values", () => {
  const m = new Metadata();
  m.add({
    "foo": "bar",
    "bar": "baz"
  });
  m.remove({
    "foo": null,
    "todd": null
  });
  expect(m.get()).toEqual([
    { key: "bar", value: "baz" }
  ]);
});

test("clone() creates metadata with identical values", () => {
  const meta1 = new Metadata({ foo: "bar" });
  const meta2 = meta1.clone();
  const result1 = meta1.get();
  const result2 = meta2.get();
  expect(result1).toStrictEqual(result2);
  expect(result1).not.toBe(result2);
});
test("clone() instance can be changed separately", () => {
  const meta1 = new Metadata({ foo: "bar" });
  const meta2 = meta1.clone();
  meta2.add({ "bar": "baz" });
  expect(meta1.get()).toStrictEqual([
    { key: "foo", value: "bar" }
  ]);
  expect(meta2.get()).toStrictEqual([
    { key: "foo", value: "bar" },
    { key: "bar", value: "baz" }
  ]);
});
