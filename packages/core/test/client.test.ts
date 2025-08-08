import { describe, test, expect, beforeEach, vi } from "vitest";
import { Client } from "../src/client";
import { MockTransport } from "./mocks/transport";
import type { Options } from "../src/types";
import { timestamp } from "../src/utils";

let mockTransport: MockTransport;
let defaultOptions: Options;

beforeEach(() => {
  mockTransport = new MockTransport();
  defaultOptions = {
    application: 'test-app',
    correlationId: 'test-correlation-id',
    errorURL: 'https://test.trackjs.com/capture',
    metadata: {},
    onError: () => true,
    serializer: [],
    sessionId: 'test-session',
    token: 'test-token',
    transport: mockTransport,
    userId: 'test-user',
    version: '0.0.0'
  };
});

describe("_createPayload()", () => {
  test("creates correct payload structure", () => {
    const client = new Client(defaultOptions);
    const error = new Error("Test error");
    const payload = client._createPayload(error, {
      entry: "test-entry",
      metadata: {}
    });

    expect(payload).toStrictEqual({
      timestamp: payload.timestamp, // Dynamic value, use actual
      entry: "test-entry",
      message: "Test error",
      stack: payload.stack, // Dynamic stack trace, use actual
      bindStack: undefined,
      bindTime: undefined,
      url: '',

      customer: {
        application: "test-app",
        correlationId: "test-correlation-id",
        sessionId: "test-session",
        token: "test-token",
        userId: "test-user",
        version: "0.0.0"
      },

      environment: {
        age: 0,
        dependencies: {
          "foo": "bar"
        },
        originalUrl: "",
        referrer: "",
        userAgent: 'node/22.0 (osx x64 123)',
        viewportHeight: -1,
        viewportWidth: -1
      },

      metadata: [],
      console: [],
      nav: [],
      network: [],
      visitor: [],

      agentPlatform: "",
      version: '0.0.0',
      throttled: 0
    });
  });

  test("merges metadata correctly", () => {
    const client = new Client({
      ...defaultOptions,
      metadata: {
        "global": "value1",
        "override": "original"
      }
    });

    const error = new Error("Test error");
    const payload = client._createPayload(error, {
      entry: "direct",
      metadata: {
        "local": "value2",
        "override": "new"
      }
    });

    expect(payload.metadata).toEqual([
      { key: "global", value: "value1" },
      { key: "override", value: "new" },
      { key: "local", value: "value2" }
    ]);
  });

  test("includes telemetry", () => {
    const client = new Client(defaultOptions);
    client.addTelemetry("console", {
      timestamp: timestamp(),
      severity: "warn",
      message: "test warning"
    });
    client.addTelemetry("network", {
      type: "fetch",
      startedOn: timestamp(),
      method: "PUT",
      url: "https://example.com/thing"
    });
    client.addTelemetry("nav", {
      on: timestamp(),
      type: "dunno",
      from: "location1",
      to: "location2"
    });
    client.addTelemetry("visitor", {
      timestamp: timestamp(),
      action: "click",
      element: {
        tag: "BUTTON",
        attributes: {
          class: "primary"
        },
        value: {
          length: 20,
          pattern: "alpha"
        }
      }
    })
    expect(client._createPayload(new Error("oops"), { entry: "direct", metadata: {} })).toMatchObject({
      console: [
        {
          timestamp: expect.any(String),
          severity: "warn",
          message: "test warning"
        }
      ],
      nav: [
        {
          on: expect.any(String),
          type: "dunno",
          from: "location1",
          to: "location2"
        }
      ],
      network: [
        {
          type: "fetch",
          startedOn: expect.any(String),
          method: "PUT",
          url: "https://example.com/thing"
        }
      ],
      visitor: [
        {
          timestamp: expect.any(String),
          action: "click",
          element: {
            tag: "BUTTON",
            attributes: {
              class: "primary"
            },
            value: {
              length: 20,
              pattern: "alpha"
            }
          }
        }
      ]
    })
  });
});

describe("_send()", () => {
  test("sends payload to transport", async () => {
    const client = new Client(defaultOptions);
    const payload = client._createPayload(new Error("Test"), {
      entry: "direct",
      metadata: {}
    });

    await client._send(payload);

    expect(mockTransport.sentRequests).toHaveLength(1);
    const request = mockTransport.sentRequests[0];

    expect(request).toBeDefined();
    expect(request!.method).toBe("POST");
    expect(request!.url).toBe("https://test.trackjs.com/capture?token=test-token&v=core-0.0.0");
    expect(request!.headers).toEqual({
      "User-Agent": "todo something"
    });

    const sentData = JSON.parse(request!.data as string);
    expect(sentData.message).toBe("Test");
  });

});

describe("track()", () => {
  test("sends payload to transport", async () => {
    const client = new Client(defaultOptions);

    await client.track("String error", {
      entry: "test-entry",
      metadata: { custom: "value" }
    });

    expect(mockTransport.sentRequests).toHaveLength(1);
    const request = mockTransport.sentRequests[0];
    expect(request).toBeDefined();
    const sentData = JSON.parse(request!.data as string);

    expect(sentData.message).toBe('"String error"');
    expect(sentData.stack).toBeDefined();
    expect(sentData.entry).toBe('test-entry');
    expect(sentData.metadata).toContainEqual({ key: "custom", value: "value" });
  });

  test("converts non-Error objects to Error", async () => {
    const client = new Client(defaultOptions);

    await client.track({ custom: "object" });

    expect(mockTransport.sentRequests).toHaveLength(1);
    const request = mockTransport.sentRequests[0];
    expect(request).toBeDefined();
    const sentData = JSON.parse(request!.data as string);

    expect(sentData.message).toBe('{"custom":"object"}');
    expect(sentData.stack).toBeDefined();
  });

  test("uses Error directly when provided", async () => {
    const client = new Client(defaultOptions);
    const error = new Error("Real error");

    await client.track(error);

    expect(mockTransport.sentRequests).toHaveLength(1);
    const request = mockTransport.sentRequests[0];
    expect(request).toBeDefined();
    const sentData = JSON.parse(request!.data as string);

    expect(sentData.message).toBe("Real error");
    expect(sentData.stack).toEqual(error.stack);
  });
});