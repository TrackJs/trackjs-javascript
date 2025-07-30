import { CapturePayload, ConsoleTelemetry, InstallOptions, NavigationTelemetry, NetworkTelemetry, TelemetryType, VisitorTelemetry } from "./types";

export function isInstalled(): boolean {
  throw new Error("not implemented");
}

export function install(options: InstallOptions): void {
  throw new Error("not implemented");
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