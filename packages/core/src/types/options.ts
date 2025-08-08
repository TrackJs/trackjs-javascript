import { SerializeHandler } from "../utils";
import type { HTTPMethods } from "./common";
import type { CapturePayload } from "./payload";

/**
 * Transport interface for sending data over the network. Provide a transport that
 * can send an HTTP request for the current environment.
 */
export interface Transport {
  /**
   * Send a HTTP Request
   */
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
}

export interface TrackOptions {
  /**
   * How this error was captured by TrackJS
   * @default "direct"
   */
  entry: string

  /**
   * Metadata key-values to send with this error
   */
  metadata: Record<string, string>;
}

export interface Options {

  /**
   * TrackJS Application key.
   *
   * @default ""
   */
  application: string;

  /**
   * Override the TrackJS-generated identifier to correlate errors together that share a common thread, session, or request.
   *
   * @default uuid()
   */
  correlationId: string;

  /**
   * URL destination override for capturing errors.
   *
   * @default https://capture.trackjs.com/capture/node
   */
  errorURL: string;

  /**
   * Metadata key-values to set immediately
   *
   * @default {}
   */
  metadata: Record<string, string>;

  /**
   * Custom handler to manipulate or suppress errors captured by the agent.
   * @param payload error payload to be sent to TrackJS.
   * @returns false will suppress the error from being sent.
   *
   * @default (payload) => true
   */
  onError: (payload: CapturePayload) => boolean;

  /**
   * Custom functions for serializing objects to strings. Will execute before the default serializer.
   *
   * @default []
   */
  serializer: Array<SerializeHandler>;

  /**
   * Customer-generated Id representing the current session.
   *
   * @default ""
   */
  sessionId: string;

  /**
   * TrackJS Account Token
   */
  token: string;

  /**
   * Custom transport function for sending data. Required if the current environment does not support `fetch`.
   *
   * @default FetchTransport
   */
  transport: Transport;

  /**
   * Customer-generated Id representing the current user.
   *
   * @default ""
   */
  userId: string;

  /**
   * Customer-generated Id representing the version of the running application.
   *
   * @default ""
   */
  version: string;

}