import type { ConsoleTelemetry, NavigationTelemetry, NetworkTelemetry, Telemetry, TelemetryType, VisitorTelemetry } from "./types";
import { truncate } from "./utils";

const MAX_LOG_SIZE = 30;
const MAX_MESSAGE_LENGTH = 10_000;
const MAX_URI_LENGTH = 1_000;
const MAX_ATTRIBUTES = 20;
const MAX_ATTRIBUTE_VALUE = 500;

export class TelemetryLog {

  private store: Array<{ type: TelemetryType, telemetry: Telemetry}> = [];

  public add(type: TelemetryType, telemetry: Telemetry): void {
    // Type and Telemetry are guaranteed to exist at this point, but the telemetry
    // might be the wrong shape. Normalize the properties and prevent huge values.
    switch (type) {
      case "con":
        telemetry = _normalizeConsoleTelemetry(telemetry);
        break;

      case "nav":
        telemetry = _normalizeNavigationTelemetry(telemetry);
        break;

      case "net":
        telemetry = _normalizeNetworkTelemetry(telemetry);
        break;

      case "vis":
        telemetry = _normalizeVisitorTelemetry(telemetry);
        break;

      default:
        return;
    }
    this.store.push({ type, telemetry});

    if (this.store.length > MAX_LOG_SIZE) {
      this.store = this.store.slice(this.store.length - MAX_LOG_SIZE);
    }
  }

  public clear(): void {
    this.store.length = 0;
  }

  public clone(): TelemetryLog {
    const cloned = new TelemetryLog();
    cloned.store = this.store.slice(0);
    return cloned;
  }

  public count(): number {
    return this.store.length;
  }

  public get<T extends Telemetry>(type: TelemetryType): Array<T> {
    return this.store
      .filter((item) => item.type == type)
      .map((item) => item.telemetry) as Array<T>;
  }

}

export function _normalizeConsoleTelemetry(telemetry: any) : ConsoleTelemetry {
  telemetry.message = truncate(telemetry.message, MAX_MESSAGE_LENGTH);
  return telemetry;
}

export function _normalizeNavigationTelemetry(telemetry: any) : NavigationTelemetry {
  telemetry.from = truncate(telemetry.from, MAX_URI_LENGTH);
  telemetry.to = truncate(telemetry.to, MAX_URI_LENGTH);
  return telemetry;
}

export function _normalizeNetworkTelemetry(telemetry: any) : NetworkTelemetry {
  telemetry.url = truncate(telemetry.url, MAX_URI_LENGTH);
  return telemetry;
}

export function _normalizeVisitorTelemetry(telemetry: any) : VisitorTelemetry {
  type attributes = Record<string, string>;
  const currentAttributes: attributes = telemetry.element?.attributes || {};
  let normalizedAttributes: attributes = {};

  const limitedAttributes = Object.entries(currentAttributes).slice(0, MAX_ATTRIBUTES);

  for (const [key, value] of limitedAttributes) {
    normalizedAttributes[key] = truncate(value, MAX_ATTRIBUTE_VALUE);
  }

  (telemetry.element || {}).attributes = normalizedAttributes;

  return telemetry;
}