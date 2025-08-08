import { FetchTransport } from "./fetchTransport";
import { Client } from "./client";
import { uuid } from "./utils";

import type { CapturePayload, ConsoleTelemetry, NavigationTelemetry, NetworkTelemetry, Options, Telemetry, TelemetryType, TrackOptions, VisitorTelemetry } from "./types";

let config: Options | null = null;
let client: Client | null = null;

const defaultOptions: Options = {
  application: '',
  correlationId: uuid(),
  errorURL: 'https://capture.trackjs.com/capture/node',
  metadata: {},
  onError: () => true,
  serializer: [],
  sessionId: '',
  token: '',
  transport: new FetchTransport(),
  userId: '',
  version: ''
};

/**
 * Whether TrackJS has been initialized.
 */
export function isInitialized(): boolean {
  return !!client;
}

/**
 * Initialize the TrackJS agent.
 *
 * @param options Initial client options.
 */
export function initialize(options: Partial<Options> & { token: string }): void {
  if (isInitialized()) {
    throw new Error("TrackJS is already initialized");
  }
  if (!options || !options.token) {
    throw new Error("TrackJS token is required");
  }

  config = {
    ...defaultOptions,
    ...options
  };

  client = new Client(config);
}

/**
 * Adds a object set of key-value pairs to metadata for any future errors.
 * Keys and values will be truncated to 500 characters.
 *
 * @param metadata - object with string values to be added as metadata.
 * @example
 *
 * ```
 * TrackJS.addMetadata({
 *   'customerStatus': 'paid',
 *   'test-112': 'alpha'
 * });
 * ```
 */
export function addMetadata(metadata: Record<string, string>): void {
  if (!isInitialized()) {
    throw new Error("TrackJS must be initialized");
  }
  return client!.addMetadata(metadata);
}

/**
 * Remove keys from metadata.
 *
 * @param metadata - object with string properties to be removed from metadata.
 * @example
 *
 * ```
 * TrackJS.removeMetadata({
 *   'customerStatus': null,
 *   'test-112': null
 * });
 * ```
 */
export function removeMetadata(metadata: Record<string, any>): void {
  if (!isInitialized()) {
    throw new Error("TrackJS must be initialized");
  }
  return client!.removeMetadata(metadata);
}

/**
 * Adds an event to the Telemetry Log. The log can store events from Console,
 * Network, Navigation, or Visitor, designated by the type key provided. TrackJS
 * will store the last 30 events in the rolling log to be included with any error.
 *
 * @param type - The type of Telemetry to be provided
 * @param telemetry - Any of the supported types. The telemetry object will be
 * stored by reference, so you can update it after it has been added. This is
 * particularly useful for network events.
 *
 * @example
 *
 * ```
 * TrackJS.addTelemetry("console", {
 *   timestamp: timestamp(),
 *   severity: "log",
 *   message: "My Log Message"
 * });
 * ```
 *
 * @example
 *
 * ```
 * const networkTelemetry = {
 *   type: "fetch",
 *   startedOn: timestamp(),
 *   method: "POST",
 *   url: "https://example.com/foo"
 * };
 * TrackJS.addTelemetry("network", networkTelemetry);
 *
 * // later when fetch completes
 * networkTelemetry.completedOn = timestamp();
 * networkTelemetry.statusCode = 200;
 * networkTelemetry.statusText = "OK";
 * ```
 */
export function addTelemetry(type: TelemetryType, telemetry: Telemetry): void {
  if (!isInitialized()) {
    throw new Error("TrackJS must be initialized");
  }
  return client!.addTelemetry(type, telemetry);
}

export function addDependencies(...args: [dependencies: Record<string, string>]): void {
  throw new Error("not implemented");
}

export function track(error: Error|object|string, options?: Partial<TrackOptions>): Promise<void> {
  if (!client) {
    throw new Error("TrackJS must be initialized");
  }

  return client.track(error, options);
}

export function usage(): void {
  throw new Error("not implemented");
}

export function onError(callback: (payload: CapturePayload) => boolean) : void {
  throw new Error("not implemented");
}

export function onTelemetry(callback: (type: TelemetryType, telemetry: ConsoleTelemetry|NavigationTelemetry|NetworkTelemetry|VisitorTelemetry) => boolean) : void {
  throw new Error("not implemented");
}

/**
 * Removes the TrackJS initialization and options.
 * Primarily used for testing.
 */
export function destroy(): void {
  config = null;
  client = null;
}