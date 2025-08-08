import type { Telemetry, TelemetryType } from "./types";

const MAX_LOG_SIZE = 30;

export class TelemetryLog {

  private store: Array<{
    type: TelemetryType,
    telemetry: Telemetry
  }> = [];

  public add(type: TelemetryType, telemetry: Telemetry): void {
    this.store.push({ type, telemetry });

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

  public get(type: TelemetryType): Array<Telemetry> {
    return this.store
      .filter((item) => item.type === type)
      .map((item) => item.telemetry);
  }

}