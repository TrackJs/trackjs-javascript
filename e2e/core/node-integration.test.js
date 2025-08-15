/**
 * Test integration with the NodeJS environment with plain JavaScript.
 * Focused on sending objects that typescript would not allow
 */

import { test, expect, beforeEach } from "vitest";
import { TrackJS, timestamp } from "@trackjs/core";
import { MockTransport } from "./mocks/transport";

beforeEach(() => {
  TrackJS.destroy();
});

test("TrackJS basic functionality", () => {
  const transport = new MockTransport();

  TrackJS.initialize({
    token: "test-token",
    transport
  });

  TrackJS.addMetadata({
    "foo": "bar"
  });

  TrackJS.addTelemetry("con", {
    timestamp: timestamp(),
    severity: "info",
    message: "test message"
  });

  const networkTelemetry = {
    type: "fetch",
    startedOn: timestamp(),
    method: "POST",
    url: "https://example.com/path"
  };
  TrackJS.addTelemetry("net", networkTelemetry);
  networkTelemetry.completedOn = timestamp();
  networkTelemetry.statusCode = 403;
  networkTelemetry.statusText = "Forbidden";

  TrackJS.track(new Error("oops"), {
    entry: "catch",
    metadata: {
      "bar": "baz"
    }
  });

  expect(transport.sentRequests.length).toBe(1);
  expect(JSON.parse(transport.sentRequests[0].data)).toMatchObject({
    entry: "catch",
    message: "oops",
    stack: expect.any(String),
    metadata: [
      { key: "foo", value: "bar"},
      { key: "bar", value: "baz" }
    ],
    console: [
      {
        timestamp: expect.any(String),
        severity: "info",
        message: "test message",
      }
    ],
    network: [
      {
        type: "fetch",
        startedOn: expect.any(String),
        method: "POST",
        url: "https://example.com/path",
        completedOn: expect.any(String),
        statusCode: 403,
        statusText: "Forbidden"
      }
    ]
  });
});

test("TrackJS with missing token", () => {
  expect(() => TrackJS.initialize()).toThrowError("TrackJS token is required");
});

test("TrackJS double initialized", () => {
  expect(() => TrackJS.initialize({ token: "test-token" })).not.toThrowError();
  expect(() => TrackJS.initialize({ token: "test-token" })).toThrowError("TrackJS is already initialized");
});

test("TrackJS.addMetadata with non-strings", () => {
  const transport = new MockTransport();
  TrackJS.initialize({ token: "test-token", transport });
  TrackJS.addMetadata({
    [Symbol("test")]: { "foo": "bar" },
    42: false
  });
  TrackJS.track("test");
  expect(JSON.parse(transport.sentRequests[0].data)).toMatchObject({
    metadata: [
      { key: "42", value: "false" }
    ]
  });
});

test("TrackJS.addTelemetry with invalid shape", () => {
  const transport = new MockTransport();
  TrackJS.initialize({ token: "test-token", transport });

  // add console with wrong type key
  expect(() => {
    TrackJS.addTelemetry("net", {
      timestamp: timestamp(),
      severity: "log",
      message: "test message"
    });
  }).toThrow();

  // add garbage to console
  expect(() => {
    TrackJS.addTelemetry("con", {
      foo: "bar"
    });
  }).toThrow();

  TrackJS.track("test");
  expect(JSON.parse(transport.sentRequests[0].data)).toMatchObject({
    console: [],
    network: []
  });
});
