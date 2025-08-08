import { TrackJS, timestamp } from "@trackjs/core";
import { test, expect, beforeEach } from "vitest";
import type { Transport, TransportRequest, TransportResponse } from "@trackjs/core";

// Mock transport for testing
class MockTransport implements Transport {
  public sentRequests: TransportRequest[] = [];

  async send(request: TransportRequest): Promise<TransportResponse> {
    this.sentRequests.push(request);
    return {
      status: 200
    };
  }

  reset() {
    this.sentRequests = [];
  }
}

beforeEach(() => {
  TrackJS.destroy();
});

test('TrackJS.install({...}) with minimum options', () => {
  expect(() => {
    TrackJS.initialize({
      token: "test token"
    });
  }).not.toThrow();
  expect(TrackJS.isInitialized()).toBe(true);
});

test('TrackJS.track() can track errors after install', async () => {
  const mockTransport = new MockTransport();

  TrackJS.initialize({
    token: 'test token',
    transport: mockTransport
  });

  // Track different error types
  await TrackJS.track('String error');
  await TrackJS.track(new Error('Error object'));
  await TrackJS.track({ custom: 'object' });

  // Verify requests were sent
  expect(mockTransport.sentRequests).toHaveLength(3);

  // Verify the structure of a request
  const firstRequest = mockTransport.sentRequests[0] as TransportRequest;
  expect(firstRequest.method).toBe('POST');
  expect(firstRequest.url).toBe('https://capture.trackjs.com/capture/node?token=test%20token&v=core-0.0.0');
  expect(JSON.parse(firstRequest.data as string)).toHaveProperty('message', '"String error"');
});

test('TrackJS.track() with custom metadata', async () => {
  const mockTransport = new MockTransport();

  TrackJS.initialize({
    token: 'test token',
    transport: mockTransport,
    metadata: {
      "foo": "bar"
    }
  });

  await TrackJS.track(new Error('Oops'), { metadata: { "bar": "baz" }});

  // Verify requests were sent
  expect(mockTransport.sentRequests).toHaveLength(1);

  // Verify the structure of a request
  const request = mockTransport.sentRequests[0] as TransportRequest;
  const payload = JSON.parse(request.data as string);

  expect(payload).toMatchObject({
    metadata: [
      { key: "foo", value: "bar" },
      { key: "bar", value: "baz" }
    ]
  });
})

test('TrackJS.addTelemetry(...) sends telemetry', async () => {
  const mockTransport = new MockTransport();

  TrackJS.initialize({
    token: 'test token',
    transport: mockTransport
  });

  TrackJS.addTelemetry("console", {
    timestamp: timestamp(),
    severity: "info",
    message: "test message"
  });

  await TrackJS.track(new Error('Oops'));

  // Verify requests were sent
  expect(mockTransport.sentRequests).toHaveLength(1);

  // Verify the structure of a request
  const request = mockTransport.sentRequests[0] as TransportRequest;
  const payload = JSON.parse(request.data as string);

  expect(payload).toMatchObject({
    console: [
      {
        timestamp: expect.any(String),
        severity: "info",
        message: "test message"
      }
    ]
  });
});

