import { describe, test, expect, beforeEach, vi } from "vitest";
import { Client } from "../src/client";
import { timestamp } from "../src/utils";
import { MockTransport } from "./mocks/transport";
import type { Options } from "../src/types";
import { ConsoleTelemetry } from "../dist/types";

let transport: MockTransport;
let defaultOptions: Options;

beforeEach(() => {
  transport = new MockTransport();
  defaultOptions = {
    agent: "test",
    agentVersion: "1.2.3",
    application: 'test-app',
    correlationId: 'test-correlation-id',
    dependencies: {
      "foo": "1.2.3"
    },
    errorURL: 'https://test.trackjs.com/capture',
    metadata: {},
    onError: () => true,
    originalUrl: "original-url",
    referrerUrl: "referrer-url",
    serializer: [],
    sessionId: 'test-session',
    token: 'test-token',
    transport,
    userAgent: "test-agent",
    userId: 'test-user',
    version: '0.0.0',
    viewportHeight: 100,
    viewportWidth: 200
  };
});

describe("onError()", () => {

  test("handler can change payloads", async () => {
    const client = new Client(defaultOptions);
    client.onError((payload) => {
      payload.message = "changed message";
      return true;
    });

    expect(await client.track(new Error("original message"))).toBe(true);

    expect(transport.sentRequests.length).toBe(1);
    expect(JSON.parse(transport.sentRequests[0]!.data as string)).toMatchObject({
      message: "changed message"
    });
  });

  test("handler can prevent payloads", async () => {
    const client = new Client(defaultOptions);
    client.onError((payload) => {
      return false;
    });

    expect(await client.track(new Error("original message"))).toBe(false);

    expect(transport.sentRequests.length).toBe(0);
  });

  test("handlers are not called after prevented", async () => {
    const client = new Client(defaultOptions);
    const handler1 = vi.fn().mockImplementation(() => false);
    client.onError(handler1);
    const handler2 = vi.fn().mockImplementation(() => true);
    client.onError(handler2);

    expect(await client.track(new Error("original message"))).toBe(false);

    expect(handler1).toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });

});

describe("onTelemetry()", () => {

  test("handler can change telemetry", () => {
    const client = new Client(defaultOptions);
    client.onTelemetry((type, telemetry) => {
      if (type === "con") {
        (telemetry as ConsoleTelemetry).message = "changed message";
      }
      return true;
    });
    client.addTelemetry("con", {
      timestamp: timestamp(),
      severity: "log",
      message: "original message"
    });
    const payload = client._createPayload(new Error("test"), { entry: "direct", metadata: {} });
    expect(payload).toMatchObject({
      console: [
        {
          timestamp: expect.any(String),
          severity: "log",
          message: "changed message"
        }
      ]
    })
  });

  test("handler can prevent telemetry", () => {
    const client = new Client(defaultOptions);
    client.onTelemetry((type, telemetry) => {
      return false;
    });
    client.addTelemetry("con", {
      timestamp: timestamp(),
      severity: "log",
      message: "original message"
    });
    const payload = client._createPayload(new Error("test"), { entry: "direct", metadata: {} });
    expect(payload).toMatchObject({
      console: []
    })
  });

  test("handlers are not called after prevented", () => {
    const client = new Client(defaultOptions);
    const handler1 = vi.fn().mockImplementation(() => false);
    client.onTelemetry(handler1);
    const handler2 = vi.fn().mockImplementation(() => true);
    client.onTelemetry(handler2);

    client.addTelemetry("con", {
      timestamp: timestamp(),
      severity: "log",
      message: "original message"
    });

    expect(handler1).toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });

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
          "foo": "1.2.3"
        },
        originalUrl: "original-url",
        referrer: "referrer-url",
        userAgent: "test-agent",
        viewportHeight: 100,
        viewportWidth: 200,
      },

      metadata: [],
      console: [],
      nav: [],
      network: [],
      visitor: [],

      agentPlatform: "test",
      version: "1.2.3",
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
    client.addTelemetry("con", {
      timestamp: timestamp(),
      severity: "warn",
      message: "test warning"
    });
    client.addTelemetry("net", {
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
    client.addTelemetry("vis", {
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

    expect(transport.sentRequests).toHaveLength(1);
    const request = transport.sentRequests[0];

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

    expect(transport.sentRequests).toHaveLength(1);
    const request = transport.sentRequests[0];
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

    expect(transport.sentRequests).toHaveLength(1);
    const request = transport.sentRequests[0];
    expect(request).toBeDefined();
    const sentData = JSON.parse(request!.data as string);

    expect(sentData.message).toBe('{"custom":"object"}');
    expect(sentData.stack).toBeDefined();
  });

  test("uses Error directly when provided", async () => {
    const client = new Client(defaultOptions);
    const error = new Error("Real error");

    await client.track(error);

    expect(transport.sentRequests).toHaveLength(1);
    const request = transport.sentRequests[0];
    expect(request).toBeDefined();
    const sentData = JSON.parse(request!.data as string);

    expect(sentData.message).toBe("Real error");
    expect(sentData.stack).toEqual(error.stack);
  });
});