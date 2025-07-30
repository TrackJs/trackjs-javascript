import { TrackJS } from "@trackjs/core";
import { test, expect } from "vitest";

test('TrackJS.install({...})', () => {

  expect(() => {
    TrackJS.install({});
  }).not.toThrow();
  expect(TrackJS.isInstalled()).toBe(true);

});



