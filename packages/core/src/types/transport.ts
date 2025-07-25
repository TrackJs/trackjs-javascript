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