import type { CapturePayload, ConsoleTelemetry, InstallOptions, NavigationTelemetry, NetworkTelemetry, TelemetryType, VisitorTelemetry } from "./types/";
import { DefaultTransport } from "./transport";

// Internal state
let installed = false;
let config: InstallOptions | null = null;

// Default options for all optional properties
const defaultOptions = {
  application: '',
  sessionId: '',
  userId: '',
  version: '',
  metadata: {},
  serializer: [],
  transport: new DefaultTransport()
};

/**
 * Whether TrackJS has been installed in the current environment.
 */
export function isInstalled(): boolean {
  return installed;
}

/**
 * Install TrackJS into the current environment.
 *
 * @param options Initial options for install.
 */
export function install(options: InstallOptions): void {
  if (installed) {
    throw new Error("TrackJS is already installed");
  }
  if (!options) {
    throw new Error("TrackJS install options required")
  }
  if (!options.token) {
    throw new Error("TrackJS token is required");
  }

  // Merge provided options with defaults
  config = {
    ...defaultOptions,
    ...options
  };

  installed = true;
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

export function track(error: Error|object|string, options: { metadata: Record<string, string> }) {
  throw new Error("not implemented")
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