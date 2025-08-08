import { test, expect } from "vitest";
import { TelemetryLog } from "../src/telemetry";
import { timestamp } from "../src/utils";
import type { NetworkTelemetry } from "../src/types";

test("add() adds telemetry to log", () => {
  const tl = new TelemetryLog();
  tl.add("console", {
    timestamp: timestamp(),
    severity: "log",
    message: "test message"
  });
  tl.add("nav", {
    on: timestamp(),
    type: "replaceState",
    from: "location1",
    to: "location2"
  });
  tl.add("network", {
    type: "fetch",
    startedOn: timestamp(),
    method: "GET",
    url: "https://example.com/"
  });
  tl.add("visitor", {
    timestamp: timestamp(),
    action: "click",
    element: {
      tag: "DIV",
      attributes: {
        "class": "btn"
      },
      value: {
        length: 10,
        pattern: "numeric"
      }
    }
  });
  expect(tl.get("console")).toStrictEqual([
    expect.objectContaining({
      timestamp: expect.any(String),
      severity: "log",
      message: "test message"
    })
  ]);
  expect(tl.get("nav")).toStrictEqual([
    expect.objectContaining({
      on: expect.any(String),
      type: "replaceState",
      from: "location1",
      to: "location2"
    })
  ]);
  expect(tl.get("network")).toStrictEqual([
    expect.objectContaining({
      type: "fetch",
      startedOn: expect.any(String),
      method: "GET",
      url: "https://example.com/"
    })
  ]);
  expect(tl.get("visitor")).toStrictEqual([
    expect.objectContaining({
      timestamp: expect.any(String),
      action: "click",
      element: {
        tag: "DIV",
        attributes: {
          "class": "btn"
        },
        value: {
          length: 10,
          pattern: "numeric"
        }
      }
    })
  ]);
});

test("add() rolls oldest items from overflowing log", () => {
  const tl = new TelemetryLog();
  for (let i = 0; i < 40; i++) {
    tl.add("console", {
      timestamp: timestamp(),
      severity: "log",
      message: `test-message-${i}`
    });
  }
  expect(tl.count()).toBe(30);
  expect(tl.get("console")).toStrictEqual(
    expect.arrayContaining([
      expect.objectContaining({
        message: "test-message-10"
      }),
      expect.objectContaining({
        message: "test-message-39"
      })
    ])
  )
});

test("add() allows logged objects to be updated", () => {
  const tl = new TelemetryLog();
  const nt: NetworkTelemetry = {
    startedOn: timestamp(),
    type: "fetch",
    method: "GET",
    url: "https://example.com/foo"
  };
  tl.add("network", nt);

  nt.completedOn = timestamp();
  nt.statusCode = 404;
  nt.statusText = "NOT FOUND";
  expect(tl.get("network")).toStrictEqual([
    {
      startedOn: expect.any(String),
      type: "fetch",
      method: "GET",
      url: "https://example.com/foo",
      completedOn: expect.any(String),
      statusCode: 404,
      statusText: "NOT FOUND"
    }
  ])
});

test("clear() empties the log", () => {
  const tl = new TelemetryLog();
  tl.add("console", {
    timestamp: timestamp(),
    severity: "log",
    message: "test-message"
  });
  expect(tl.count()).toBe(1);
  tl.clear();
  expect(tl.count()).toBe(0);
  expect(tl.get("console")).toStrictEqual([]);
});

test("clone() creates a copy of the log that can be added separately", () => {
  const tl1 = new TelemetryLog();
  tl1.add("console", {
    timestamp: timestamp(),
    severity: "log",
    message: "test-message-1"
  });

  const tl2 = tl1.clone();
  tl2.add("console", {
    timestamp: timestamp(),
    severity: "log",
    message: "test-message-2"
  });

  expect(tl1.count()).toBe(1);
  expect(tl1.get("console")).toStrictEqual([
    {
      timestamp: expect.any(String),
      severity: "log",
      message: "test-message-1"
    }
  ]);

  expect(tl2.count()).toBe(2);
  expect(tl2.get("console")).toStrictEqual([
    {
      timestamp: expect.any(String),
      severity: "log",
      message: "test-message-1"
    },
    {
      timestamp: expect.any(String),
      severity: "log",
      message: "test-message-2"
    }
  ]);

})