import type { SerializeHandler } from "../utils";
import type { HTTPMethods } from "./common";
import type { CapturePayload } from "./payload";
import type { Telemetry, TelemetryType } from "./telemetry";

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

/**
 * Error event handler function for processing or preventing an error event that
 * is about to be tracked by the agent.
 *
 * @param payload - Reference to the full error capture payload that will be sent.
 * You can modify the contents of the payload to add or remove data.
 * @returns False if the error should be prevented from sending.
 */
export type ErrorHandler = (payload: CapturePayload) => boolean;

/**
 * Telemetry event handler function for processing or preventing telemetry
 * events from being added to the log.
 *
 * @param type - Type of Telemetry entry to be added
 * @param telemetry - Reference to the telemetry object to be added. You can
 * modify the contents of the telemetry to add or remove data.
 * @return False if the telemetry should be prevented.
 */
export type TelemetryHandler = (type: TelemetryType, telemetry: Telemetry) => boolean;

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
   * The name of the TrackJS agent package
   *
   * @default "core"
   */
  agent: string,

  /**
   * The version of the TrackJS agent package
   *
   * @default "{{AGENT_VERSION}}"
   */
  agentVersion: string,

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
   * Dependency package names and version for the current environment.
   *
   * @default {}
   * @example { "node": "22.12.0" }
   */
  dependencies: { [name: string]: string };

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
   *
   * @see {@link ErrorHandler}
   */
  onError?: ErrorHandler

  /**
   * When environment has a user interface, the URI location where the application
   * was started, or the URL of the page when it was first loaded.
   *
   * @default ""
   */
  originalUrl: string

  /**
   * When environment has a user interface, the URI location where the user came
   * from before landing on this page or screen.
   *
   * @default ""
   */
  referrerUrl: string

  /**
   * Custom functions for serializing objects to strings. Will execute before the
   * default serializer.
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
   * Custom transport function for sending data. Required if the current
   * environment does not support `fetch`.
   *
   * @default FetchTransport
   */
  transport: Transport;

  /**
   * User-Agent string describing the user's running environment, browser, process,
   * operating system, arch, and version. For non-browser environments, this can
   * be constructed with the userAgent() util function.
   *
   * @defaults ""
   */
  userAgent: string

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

  /**
   * When environment has a user interface, the height of the user viewport in
   * pixels.
   *
   * @default -1
   */
  viewportHeight: number

  /**
   * When environment has a user interface, the width of the user viewport in
   * pixels.
   *
   * @default -1
   */
  viewportWidth: number
}