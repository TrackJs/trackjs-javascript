import { TrackJS, timestamp, userAgent } from "@trackjs/core";
import { describe, test, expect, beforeEach, vi } from "vitest";
import { MockTransport } from "./mocks/transport";
import type { NetworkTelemetry, Transport, TransportRequest, TransportResponse } from "@trackjs/core";

let transport: MockTransport;

beforeEach(() => {
  TrackJS.destroy();
  transport = new MockTransport();
});

describe("TrackJS.install({...}", () => {

  test('with minimum options', () => {
    TrackJS.initialize({
      token: "test-token",
    });
    expect(TrackJS.isInitialized()).toBe(true);
  });

  test('with initial metadata', async () => {
    TrackJS.initialize({
      token: "test-token",
      metadata: {
        "foo": "bar"
      },
      transport
    });

    await TrackJS.track("test");
    expect(transport.sentRequests).toHaveLength(1);
    expect(transport.getRequestData(0)).toMatchObject({
      customer: expect.objectContaining({
        token: "test-token"
      }),
      metadata: [
        { key: "foo", value: "bar" }
      ]
    })
  });

  test('with onError Handler', async () => {
    const handler = vi.fn().mockImplementation(() => false);

    TrackJS.initialize({
      token: "test-token",
      transport,
      onError: handler
    });

    await TrackJS.track("test222");

    expect(handler).toHaveBeenCalled();
    console.log(transport.sentRequests);
    expect(transport.sentRequests).toHaveLength(0);
  });

  test('with environment info', async () => {
    TrackJS.initialize({
      token: 'test token',
      transport,
      dependencies: {
        "foo": "1.2.3"
      },
      originalUrl: "original-url",
      referrerUrl: "referrer-url",
      userAgent: userAgent("Node", "12.1", "windows", "x64", "11.2"),
    });

    await TrackJS.track(new Error('test'));

    expect(transport.sentRequests).toHaveLength(1);
    expect(JSON.parse(transport.sentRequests[0]?.data as string)).toMatchObject({
      environment: expect.objectContaining({
        originalUrl: "original-url",
        referrer: "referrer-url",
        dependencies: {
          "foo": "1.2.3"
        },
        userAgent: "Node/12.1 (windows x64 11.2)"
      }),
    });
  })

});

describe("TrackJS.track(...)", () => {

  test('can track errors after install', async () => {
    TrackJS.initialize({
      token: 'test-token',
      transport
    });

    await TrackJS.track('String error');
    await TrackJS.track(new Error('Error'));
    await TrackJS.track({ custom: 'object' });

    expect(transport.sentRequests).toHaveLength(3);
    expect(transport.getRequestData(0)).toMatchObject({
      message: '"String error"',
      stack: expect.any(String)
    });
    expect(transport.getRequestData(1)).toMatchObject({
      message: 'Error',
      stack: expect.any(String)
    });
    expect(transport.getRequestData(2)).toMatchObject({
      message: '{"custom":"object"}',
      stack: expect.any(String)
    });
  });

  test('TrackJS.track() with custom metadata', async () => {
    TrackJS.initialize({
      token: 'test token',
      transport
    });

    await TrackJS.track(new Error('Oops'), { metadata: { "bar": "baz" }});

    expect(transport.sentRequests).toHaveLength(1);
    expect(transport.getRequestData(0)).toMatchObject({
      metadata: [
        { key: "bar", value: "baz" }
      ]
    });
  })

});

test('TrackJS.addTelemetry(...) sends telemetry', async () => {
  const transport = new MockTransport();

  TrackJS.initialize({
    token: 'test token',
    transport
  });

  TrackJS.addTelemetry("con", {
    timestamp: timestamp(),
    severity: "info",
    message: "test message"
  });

  let networkTelemetry: NetworkTelemetry = {
    type: "fetch",
    method: "POST",
    url: "https://example.com/path",
    startedOn: timestamp()
  };

  TrackJS.addTelemetry("net", networkTelemetry);

  networkTelemetry.completedOn = timestamp();
  networkTelemetry.statusCode = 404;
  networkTelemetry.statusText = "NOT FOUND";

  await TrackJS.track(new Error('Oops'));

  expect(transport.sentRequests).toHaveLength(1);
  expect(JSON.parse(transport.sentRequests[0]?.data as string)).toMatchObject({
    console: [
      {
        timestamp: expect.any(String),
        severity: "info",
        message: "test message"
      }
    ],
    network: [
      {
        type: "fetch",
        method: "POST",
        url: "https://example.com/path",
        startedOn: expect.any(String),
        completedOn: expect.any(String),
        statusCode: 404,
        statusText: "NOT FOUND"
      }
    ]
  });
});
