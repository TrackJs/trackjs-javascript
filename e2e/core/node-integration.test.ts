import { TrackJS, timestamp } from "@trackjs/core";
import { test, expect, beforeEach } from "vitest";
import { MockTransport } from "./mocks/transport";
import type { NetworkTelemetry, Transport, TransportRequest, TransportResponse } from "@trackjs/core";

beforeEach(() => {
  TrackJS.destroy();
});

test('TrackJS.install({...}) with minimum options', () => {
  TrackJS.initialize({
    token: "test-token",
  });
  expect(TrackJS.isInitialized()).toBe(true);
});

test('TrackJS.track() can track errors after install', async () => {
  const transport = new MockTransport();

  TrackJS.initialize({
    token: 'test-token',
    transport
  });

  // Track different error types
  await TrackJS.track('String error');
  await TrackJS.track(new Error('Error'));
  await TrackJS.track({ custom: 'object' });

  // Verify requests were sent
  expect(transport.sentRequests).toHaveLength(3);

  // Verify the structure of a request
  const firstRequest = transport.sentRequests[0] as TransportRequest;
  expect(firstRequest.method).toBe('POST');
  expect(firstRequest.url).toBe('https://capture.trackjs.com/capture/node?token=test-token&v=core-0.0.0');

  expect(JSON.parse(firstRequest.data as string)).toMatchObject({
    message: '"String error"',
    stack: expect.any(String)
  });
  expect(JSON.parse(transport.sentRequests[1]?.data as string)).toMatchObject({
    message: 'Error',
    stack: expect.any(String)
  });
  expect(JSON.parse(transport.sentRequests[2]?.data as string)).toMatchObject({
    message: '{"custom":"object"}',
    stack: expect.any(String)
  });
});

test('TrackJS.track() with custom metadata', async () => {
  const transport = new MockTransport();

  TrackJS.initialize({
    token: 'test token',
    transport,
    metadata: {
      "foo": "bar"
    }
  });

  await TrackJS.track(new Error('Oops'), { metadata: { "bar": "baz" }});

  expect(transport.sentRequests).toHaveLength(1);
  expect(JSON.parse(transport.sentRequests[0]?.data as string)).toMatchObject({
    metadata: [
      { key: "foo", value: "bar" },
      { key: "bar", value: "baz" }
    ]
  });
})

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

