export interface Transport {
  send(request: TransportRequest): Promise<TransportResponse>;
}

export interface TransportRequest {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  headers?: Record<string, string>;
  data?: any;
}

export interface TransportResponse {
  status: number;
  headers: Record<string, string>;
  data: any;
}

/**
 * Default transport that automatically selects the best available method
 * for sending HTTP requests based on the current environment.
 */
export class DefaultTransport implements Transport {
  private readonly sendMethod: (request: TransportRequest) => Promise<TransportResponse>;

  constructor() {
    this.sendMethod = this.detectBestTransport();
  }

  public async send(request: TransportRequest): Promise<TransportResponse> {
    return this.sendMethod(request);
  }

  private detectBestTransport(): (request: TransportRequest) => Promise<TransportResponse> {
    // Check for fetch API (modern browsers and Node.js 18+)
    if (typeof fetch !== 'undefined') {
      return this.fetchTransport.bind(this);
    }

    // Fallback to a no-op transport if nothing is available
    return this.noopTransport.bind(this);
  }

  private async fetchTransport(request: TransportRequest): Promise<TransportResponse> {
    const response = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.data ? JSON.stringify(request.data) : undefined,
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
      data,
    };
  }

  private async noopTransport(_request: TransportRequest): Promise<TransportResponse> {
    console.warn('No suitable transport method found. Request will not be sent.');
    return {
      status: 0,
      headers: {},
      data: null,
    };
  }
}
