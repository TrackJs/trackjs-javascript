import type { Transport, TransportRequest, TransportResponse } from "./types";

/**
 * Default transport that utilizes the common `fetch` function. Throws an error if used when `fetch` is unavailable.
 */
export class FetchTransport implements Transport {

  public async send(request: TransportRequest): Promise<TransportResponse> {
    if (typeof fetch === "undefined") {
      throw new Error("Fetch is not available. Provide a transport option to TrackJS");
    }

    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.data
      });

      return {
        status: response.status,
      };
    }
    catch(e) {
      throw new Error(`Failed to fetch ${request.url}`);
    }

  }

}
