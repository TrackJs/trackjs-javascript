import { TrackJS, uuid } from "@trackjs/core";
import { test, expect } from "vitest";

test('TrackJS.install({...}) with minimum options', () => {
  expect(() => {
    TrackJS.install({
      token: uuid()
    });
  }).not.toThrow();
  expect(TrackJS.isInstalled()).toBe(true);
});



