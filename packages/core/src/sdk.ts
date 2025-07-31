import { FetchTransport } from "./transport";
import { Client } from "./Client";
import { uuid } from "./utils";

import type { CapturePayload, ConsoleTelemetry, NavigationTelemetry, NetworkTelemetry, Options, TelemetryType, TrackOptions, VisitorTelemetry } from "./types/";

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
 * Whether TrackJS has been installed in the current environment.
 */
export function isInstalled(): boolean {
  return !!client;
}

/**
 * Uninstall TrackJS from the current environment.
 * Primarily used for testing.
 */
export function uninstall(): void {
  config = null;
  client = null;
}

/**
 * Install TrackJS into the current environment.
 *
 * @param options Initial options for install.
 */
export function install(options: Partial<Options> & { token: string }): void {
  if (isInstalled()) {
    throw new Error("TrackJS is already installed");
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

export function addMetadata(...args: [metadata: Record<string, string>]): void {
  throw new Error("not implemented");
}

export function removeMetadata(...args: [metadata: Record<string, any>]): void {
  throw new Error("not implemented");
}

export function addTelemetry(type: TelemetryType, telemetry: ConsoleTelemetry|NavigationTelemetry|NetworkTelemetry|VisitorTelemetry): void {
  throw new Error("not implemented");
}

export function addDependencies(...args: [dependencies: Record<string, string>]): void {
  throw new Error("not implemented");
}

export function track(error: Error|object|string, options?: Partial<TrackOptions>): Promise<void> {
  if (!client) {
    throw new Error("TrackJS must be installed");
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