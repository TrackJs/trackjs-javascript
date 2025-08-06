import { TrackJS } from "@trackjs/core";
import { test, expect, beforeEach } from "vitest";
import type { Transport, TransportRequest, TransportResponse, UUID } from "@trackjs/core";

// Mock transport for testing
class MockTransport implements Transport {
  public sentRequests: TransportRequest[] = [];

  async send(request: TransportRequest): Promise<TransportResponse> {
    this.sentRequests.push(request);
    return {
      status: 200,
      headers: {},
      data: { success: true }
    };
  }

  reset() {
    this.sentRequests = [];
  }
}

beforeEach(() => {
  TrackJS.uninstall();
});

test('TrackJS.install({...}) with minimum options', () => {
  expect(() => {
    TrackJS.install({
      token: "test token"
    });
  }).not.toThrow();
  expect(TrackJS.isInstalled()).toBe(true);
});

test('TrackJS.track() can track errors after install', async () => {
  const mockTransport = new MockTransport();

  TrackJS.install({
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



