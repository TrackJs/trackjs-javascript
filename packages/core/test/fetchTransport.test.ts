import { test, expect, beforeEach, afterEach, vi } from "vitest";
import { FetchTransport } from "../src/fetchTransport";
import type { TransportRequest } from "../src/types";

let originalFetch: typeof global.fetch | undefined;

beforeEach(() => {
  // Save original fetch
  originalFetch = (global as any).fetch;
});

afterEach(() => {
  // Restore original fetch
  if (originalFetch !== undefined) {
    (global as any).fetch = originalFetch;
  } else {
    delete (global as any).fetch;
  }
});

test("throws error when fetch is not available", async () => {
  // Remove fetch from global
  delete (global as any).fetch;

  const transport = new FetchTransport();
  const request: TransportRequest = {
    method: "POST",
    url: "https://example.com",
    headers: { "Content-Type": "application/json" },
    data: '{"test": true}'
  };

  await expect(transport.send(request)).rejects.toThrow(
    "Fetch is not available. Provide a transport option to TrackJS"
  );
});

test("returns correct response on successful fetch", async () => {
  // Mock fetch with successful response
  const mockResponse = {
    status: 200
  };

  (global as any).fetch = vi.fn().mockResolvedValue(mockResponse);

  const transport = new FetchTransport();
  const request: TransportRequest = {
    method: "POST",
    url: "https://example.com/api",
    headers: { "Content-Type": "application/json" },
    data: '{"test": true}'
  };

  const response = await transport.send(request);

  expect(response.status).toBe(200);
  expect((global as any).fetch).toHaveBeenCalledWith(
    "https://example.com/api",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"test": true}'
    }
  );
});

test("throws error with URL when fetch fails", async () => {
  // Mock fetch to reject
  (global as any).fetch = vi.fn().mockRejectedValue(new Error("Failed to fetch"));

  const transport = new FetchTransport();
  const request: TransportRequest = {
    method: "GET",
    url: "https://example.com/failing",
    headers: {}
  };

  await expect(transport.send(request)).rejects.toThrow(
    "Failed to fetch https://example.com/failing"
  );
});

test("throws error when fetch throws non-Error", async () => {
  // Mock fetch to throw a string (edge case)
  (global as any).fetch = vi.fn().mockRejectedValue("String error");

  const transport = new FetchTransport();
  const request: TransportRequest = {
    method: "POST",
    url: "https://example.com/error",
    data: '{"test": true}'
  };

  await expect(transport.send(request)).rejects.toThrow(
    "Failed to fetch https://example.com/error"
  );
});

test("handles 4xx and 5xx status codes", async () => {
  // Test 404
  let mockResponse = {
    status: 404
  };

  (global as any).fetch = vi.fn().mockResolvedValue(mockResponse);

  const transport = new FetchTransport();
  let response = await transport.send({
    method: "GET",
    url: "https://example.com/notfound"
  });

  expect(response.status).toBe(404);
});