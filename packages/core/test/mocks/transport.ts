import type { Transport, TransportRequest, TransportResponse } from "../../src/types";

// Mock transport for testing
export class MockTransport implements Transport {
  public sentRequests: TransportRequest[] = [];
  public shouldFail = false;

  async send(request: TransportRequest): Promise<TransportResponse> {
    if (this.shouldFail) {
      throw new Error("Transport error");
    }
    this.sentRequests.push(request);
    return {
      status: 200
    };
  }

  reset() {
    this.sentRequests = [];
    this.shouldFail = false;
  }
}