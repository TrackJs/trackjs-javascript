import type {
  Transport,
  TransportRequest,
  TransportResponse
} from "@trackjs/core";

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

  getRequestData(index: number) : any {
    if (!this.sentRequests[index]) {
      return undefined;
    }

    return JSON.parse(this.sentRequests[index].data as string);
  }
 }