import { HTTPMethods } from "./types";

/**
 * Transport interface for sending data over the network. Provide a transport that
 * can send an HTTP request for the environment.
 */
export interface Transport {
  send(request: TransportRequest): Promise<TransportResponse>;
}

export interface TransportRequest {
  method: HTTPMethods;
  url: string;
  headers?: Record<string, string>;
  data?: string;
}

export interface TransportResponse {
  status: number;
  headers: Record<string, string>;
  data: any;
}

/**
 * Default transport that utilizes the common `fetch` function. Throws an error if used when `fetch` is unavailable.
 */
export class FetchTransport implements Transport {

  public async send(request: TransportRequest): Promise<TransportResponse> {
    if (typeof fetch === "undefined") {
      throw new Error("Fetch is not available. Provide a transport option to TrackJS");
    }

    const response = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.data
    });

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    let data: any;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return {
      status: response.status,
      headers: responseHeaders,
      data
    };
  }

}
