import { test, expect } from "vitest";
import { TelemetryLog, _normalizeConsoleTelemetry, _normalizeNavigationTelemetry, _normalizeNetworkTelemetry, _normalizeVisitorTelemetry } from "../src/telemetryLog";
import { timestamp } from "../src/utils";
import type { NetworkTelemetry } from "../src/types";
import { HTTPMethods } from "../dist/types";

test("add() adds telemetry to log", () => {
  const tl = new TelemetryLog();
  tl.add("con", {
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
  tl.add("net", {
    type: "fetch",
    startedOn: timestamp(),
    method: "GET",
    url: "https://example.com/"
  });
  tl.add("vis", {
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
  expect(tl.get("con")).toStrictEqual([
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
  expect(tl.get("net")).toStrictEqual([
    expect.objectContaining({
      type: "fetch",
      startedOn: expect.any(String),
      method: "GET",
      url: "https://example.com/"
    })
  ]);
  expect(tl.get("vis")).toStrictEqual([
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
    tl.add("con", {
      timestamp: timestamp(),
      severity: "log",
      message: `test-message-${i}`
    });
  }
  expect(tl.count()).toBe(30);
  expect(tl.get("con")).toStrictEqual(
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
  tl.add("net", nt);

  nt.completedOn = timestamp();
  nt.statusCode = 404;
  nt.statusText = "NOT FOUND";
  expect(tl.get("net")).toStrictEqual([
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
  tl.add("con", {
    timestamp: timestamp(),
    severity: "log",
    message: "test-message"
  });
  expect(tl.count()).toBe(1);
  tl.clear();
  expect(tl.count()).toBe(0);
  expect(tl.get("con")).toStrictEqual([]);
});

test("clone() creates a copy of the log that can be added separately", () => {
  const tl1 = new TelemetryLog();
  tl1.add("con", {
    timestamp: timestamp(),
    severity: "log",
    message: "test-message-1"
  });

  const tl2 = tl1.clone();
  tl2.add("con", {
    timestamp: timestamp(),
    severity: "log",
    message: "test-message-2"
  });

  expect(tl1.count()).toBe(1);
  expect(tl1.get("con")).toStrictEqual([
    {
      timestamp: expect.any(String),
      severity: "log",
      message: "test-message-1"
    }
  ]);

  expect(tl2.count()).toBe(2);
  expect(tl2.get("con")).toStrictEqual([
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

test("_normalizeConsoleTelemetry() with normal object", () => {
  const normalized = _normalizeConsoleTelemetry({
    timestamp: timestamp(),
    severity: "log" as const,
    message: "This is a normal console message"
  });

  expect(normalized).toStrictEqual({
    timestamp: expect.any(String),
    severity: "log",
    message: "This is a normal console message"
  });
});

test("_normalizeConsoleTelemetry() truncates long message", () => {
  const normalized = _normalizeConsoleTelemetry({
    timestamp: timestamp(),
    severity: "error" as const,
    message: "x".repeat(15000)
  });

  expect(normalized.message.length).toBe(10000);
});

test("_normalizeNavigationTelemetry() with normal object", () => {
  const normalized = _normalizeNavigationTelemetry({
    on: timestamp(),
    type: "pushState",
    from: "https://example.com/page1",
    to: "https://example.com/page2"
  });

  expect(normalized).toStrictEqual({
    on: expect.any(String),
    type: "pushState",
    from: "https://example.com/page1",
    to: "https://example.com/page2"
  });
});

test("_normalizeNavigationTelemetry() truncates long URLs", () => {
  const normalized = _normalizeNavigationTelemetry({
    on: timestamp(),
    type: "replaceState",
    from: "https://example.com/" + "a".repeat(2000),
    to: "https://example.com/" + "b".repeat(2000)
  });

  expect(normalized.from.length).toBe(1000);
  expect(normalized.to.length).toBe(1000);
});

test("_normalizeNetworkTelemetry() with normal object", () => {
  const normalized = _normalizeNetworkTelemetry({
    type: "xhr",
    startedOn: timestamp(),
    method: "POST",
    url: "https://api.example.com/users"
  });

  expect(normalized).toStrictEqual({
    type: "xhr",
    startedOn: expect.any(String),
    method: "POST",
    url: "https://api.example.com/users"
  });
});

test("_normalizeNetworkTelemetry() truncates long URL", () => {
  const normalized = _normalizeNetworkTelemetry({
    type: "fetch",
    startedOn: timestamp(),
    method: "GET",
    url: "https://api.example.com/" + "path".repeat(500)
  });

  expect(normalized.url.length).toBe(1000);
});

test("_normalizeVisitorTelemetry() with normal object", () => {
  const normalized = _normalizeVisitorTelemetry({
    timestamp: timestamp(),
    action: "click",
    element: {
      tag: "BUTTON",
      attributes: {
        "class": "btn btn-primary",
        "id": "submit-button",
        "data-test": "submit"
      },
      value: {
        length: 5,
        pattern: "numeric"
      }
    }
  });

  expect(normalized).toStrictEqual({
    timestamp: expect.any(String),
    action: "click",
    element: {
      tag: "BUTTON",
      attributes: {
        "class": "btn btn-primary",
        "id": "submit-button",
        "data-test": "submit"
      },
      value: {
        length: 5,
        pattern: "numeric"
      }
    }
  });
});

test("_normalizeVisitorTelemetry() truncates attributes", () => {
  const attributes: { [key: string]: string } = {};
  for (let i = 0; i < 30; i++) {
    attributes[`attr-${i}`] = "value".repeat(200);
  }

  const normalized = _normalizeVisitorTelemetry({
    timestamp: timestamp(),
    action: "change",
    element: {
      tag: "INPUT",
      attributes: attributes,
      value: {
        length: 100,
        pattern: "characters"
      }
    }
  });

  const normalizedAttributeKeys = Object.keys(normalized.element.attributes);
  expect(normalizedAttributeKeys.length).toBe(20);

  for (const value of Object.values(normalized.element.attributes)) {
    expect(value.length).toEqual(500);
  }
})