import { truncate } from "./utils";
import {
  MAX_TELEMETRY_ATTRIBUTE_VALUE,
  MAX_TELEMETRY_ATTRIBUTES,
  MAX_TELEMETRY_LOG_SIZE,
  MAX_TELEMETRY_MESSAGE_LENGTH,
  MAX_TELEMETRY_URI_LENGTH
} from "./constants";

import type {
  ConsoleTelemetry,
  NavigationTelemetry,
  NetworkTelemetry,
  Telemetry,
  TelemetryType,
  VisitorTelemetry
} from "./types";


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

    if (this.store.length > MAX_TELEMETRY_LOG_SIZE) {
      this.store = this.store.slice(this.store.length - MAX_TELEMETRY_LOG_SIZE);
    }
  }

  public clear(): void {
    this.store.length = 0;
  }

  public clone(): TelemetryLog {
    const cloned = new TelemetryLog();
    cloned.store = structuredClone(this.store);
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
  telemetry.message = truncate(telemetry.message, MAX_TELEMETRY_MESSAGE_LENGTH);
  return telemetry;
}

export function _normalizeNavigationTelemetry(telemetry: any) : NavigationTelemetry {
  telemetry.from = truncate(telemetry.from, MAX_TELEMETRY_URI_LENGTH);
  telemetry.to = truncate(telemetry.to, MAX_TELEMETRY_URI_LENGTH);
  return telemetry;
}

export function _normalizeNetworkTelemetry(telemetry: any) : NetworkTelemetry {
  telemetry.url = truncate(telemetry.url, MAX_TELEMETRY_URI_LENGTH);
  return telemetry;
}

export function _normalizeVisitorTelemetry(telemetry: any) : VisitorTelemetry {
  type attributes = Record<string, string>;
  const currentAttributes: attributes = telemetry.element?.attributes || {};
  let normalizedAttributes: attributes = {};

  const limitedAttributes = Object.entries(currentAttributes).slice(0, MAX_TELEMETRY_ATTRIBUTES);

  for (const [key, value] of limitedAttributes) {
    normalizedAttributes[key] = truncate(value, MAX_TELEMETRY_ATTRIBUTE_VALUE);
  }

  (telemetry.element || {}).attributes = normalizedAttributes;

  return telemetry;
}