import { FetchTransport } from "./fetchTransport";
import { Client } from "./client";
import { uuid, configureSerializer } from "./utils";

import type {
  CapturePayload,
  Options,
  TrackOptions,
  ConsoleTelemetry,
  NavigationTelemetry,
  NetworkTelemetry,
  Telemetry,
  TelemetryType,
  VisitorTelemetry
} from "./types";

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
 * @see {@link Options} for full options.
 *
 * @param options - Initial client options
 * @param options.token - Your TrackJS account token from https://my.trackjs.com/
 *
 * @example
 * ```
 * TrackJS.initialize({
 *   token: "abcde1234567890"
 * });
 * ```
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

  configureSerializer({
    depth: 3,
    handlers: config.serializer
  });

  client = new Client(config);
}

/**
 * Adds a object set of key-value pairs to metadata for any future errors.
 * Keys and values will be truncated to 500 characters.
 *
 * @param metadata - object with string values to be added as metadata.
 *
 * @example
 * ```
 * TrackJS.addMetadata({
 *   'customerStatus': 'paid',
 *   'test-112': 'alpha'
 * });
 * ```
 */
export function addMetadata(metadata: Record<string, string>): void {
  _checkInitialized();
  _checkRequired("Metadata", metadata);

  return client!.addMetadata(metadata);
}

/**
 * Remove keys from metadata.
 *
 * @param metadata - object with string properties to be removed from metadata.
 *
 * @example
 * ```
 * TrackJS.removeMetadata({
 *   'customerStatus': null,
 *   'test-112': null
 * });
 * ```
 */
export function removeMetadata(metadata: Record<string, any>): void {
  _checkInitialized();
  _checkRequired("Metadata", metadata);

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
 * TrackJS.addTelemetry("con", {
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
 * TrackJS.addTelemetry("net", networkTelemetry);;
 *
 * // later when fetch completes
 * networkTelemetry.completedOn = timestamp();
 * networkTelemetry.statusCode = 200;
 * networkTelemetry.statusText = "OK";
 * ```
 */
export function addTelemetry(type: "con", telemetry: ConsoleTelemetry): void;
export function addTelemetry(type: "nav", telemetry: NavigationTelemetry): void;
export function addTelemetry(type: "net", telemetry: NetworkTelemetry): void;
export function addTelemetry(type: "vis", telemetry: VisitorTelemetry): void;
export function addTelemetry(type: TelemetryType, telemetry: Telemetry): void {
  _checkInitialized();
  _checkRequired("Type", type);
  _checkRequired("Telemetry", telemetry);

  return client!.addTelemetry(type, telemetry);
}

export function addDependencies(...args: [dependencies: Record<string, string>]): void {
  throw new Error("not implemented");
}

/**
 * Track and error or error-like object to the TrackJS error monitoring service.
 *
 * @param error - Error or error-like object. If a non-error is provided, it will
 * attempt to serialize and generate a stack trace for the error.
 * @param options.entry - (Optional) How this error was captured. Default: "direct"
 * @param options.metadata - (Optional) Metadata key-values to be sent with this
 * error in addition to the global metadata. Default: {}
 *
 * @returns Whether the error was sent or prevented by an event handler.
 *
 * @example
 * ```
 * TrackJS.track(new Error("oops!"), { entry: "fetch", metadata: { "foo": "bar" }});
 * ```
 */
export async function track(error: Error|object|string, options?: Partial<TrackOptions>): Promise<boolean> {
  _checkInitialized();
  _checkRequired("Error", error);

  await client!.track(error, options);
  return true;
}

export function usage(): void {
  throw new Error("not implemented");
}

export function onError(callback: (payload: CapturePayload) => boolean) : void {
  throw new Error("not implemented");
}

// export function onTelemetry(callback: (type: TelemetryType, telemetry: ConsoleTelemetry|NavigationTelemetry|NetworkTelemetry|VisitorTelemetry) => boolean) : void {
//   throw new Error("not implemented");
// }

/**
 * Removes the TrackJS initialization and options.
 * Primarily used for testing.
 */
export function destroy(): void {
  config = null;
  client = null;
}

function _checkInitialized() {
  if (!client) {
    throw new Error("TrackJS must be initialized");
  }
}

function _checkRequired(name: string, val: any) {
  if (!val) {
    throw new Error(`${name} is required`)
  }
}