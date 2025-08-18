import { Metadata } from "./metadata";
import { TelemetryLog } from "./telemetryLog";
import { timestamp, serialize, isError } from "./utils";
import type {
  CapturePayload,
  ErrorHandler,
  TelemetryHandler,
  Options,
  Telemetry,
  TelemetryType,
  TrackOptions
} from "./types";

export class Client {
  private options: Options;
  private metadata: Metadata;
  private telemetry: TelemetryLog;
  private errorHandlers: Set<ErrorHandler>;
  private telemetryHandlers: Set<TelemetryHandler>;

  constructor(options: Options) {
    this.options = options;
    this.metadata = new Metadata(this.options.metadata);
    this.telemetry = new TelemetryLog();
    this.errorHandlers = new Set(!!options.onError ? [options.onError] : undefined);
    this.telemetryHandlers = new Set();
  }

  public addMetadata(metadata: Record<string, string>): void {
    this.metadata.add(metadata);
  }

  public removeMetadata(metadata: Record<string, any>): void {
    this.metadata.remove(metadata);
  }

  public addTelemetry(type: TelemetryType, telemetry: Telemetry): void {
    let prevented = false;
    for(const handler of this.telemetryHandlers) {
      prevented = prevented || !handler(type, telemetry);
    }

    if (!prevented) {
      this.telemetry.add(type, telemetry);
    }
  }

  public onError(handler: ErrorHandler) : void {
    this.errorHandlers.add(handler);
  }

  public onTelemetry(handler: TelemetryHandler) : void {
    this.telemetryHandlers.add(handler);
  }

  public async track(error: Error | object | string, options?: Partial<TrackOptions>): Promise<boolean> {
    const safeOptions: TrackOptions = {
      entry: "direct",
      metadata: {},
      ...options
    };

    const safeError = isError(error) ? error as Error : new Error(serialize(error))
    const payload = this._createPayload(safeError, safeOptions);

    let prevented = false;
    for(const handler of this.errorHandlers) {
      prevented = prevented || !handler(payload);
    }

    if (!prevented) {
      await this._send(payload);
    }

    return !prevented;
  }

  /**
   * Create a complete payload for an error
   */
  _createPayload(error: Error, options: TrackOptions): CapturePayload {
    const payloadMetadata = this.metadata.clone();
    payloadMetadata.add(options.metadata);

    return {

      timestamp: timestamp(),
      entry: options.entry,
      message: error.message,
      stack: error.stack || '',
      bindStack: undefined,
      bindTime: undefined,
      url: '',

      customer: {
        application: this.options.application,
        correlationId: this.options.correlationId,
        sessionId: this.options.sessionId,
        token: this.options.token,
        userId: this.options.userId,
        version: this.options.version
      },

      environment: {
        age: 0,
        dependencies: structuredClone(this.options.dependencies),
        originalUrl: this.options.originalUrl,
        referrer: this.options.referrerUrl,
        userAgent: this.options.userAgent,
        viewportHeight: this.options.viewportHeight,
        viewportWidth: this.options.viewportWidth
      },

      metadata: payloadMetadata.get(),

      console: this.telemetry.get("con"),
      nav: this.telemetry.get("nav"),
      network: this.telemetry.get("net"),
      visitor: this.telemetry.get("vis"),

      agentPlatform: this.options.agent,
      version: this.options.agentVersion,
      throttled: 0,
    };
  }

  /**
   * Send payload to TrackJS
   */
  async _send(payload: CapturePayload): Promise<void> {
    try {
      await this.options.transport.send({
        method: 'POST',
        url: `${this.options.errorURL}?token=${encodeURIComponent(this.options.token)}&v=core-0.0.0`,
        headers: {
          'User-Agent': 'todo something'
        },
        data: JSON.stringify(payload)
      });
    } catch (err) {
      // In a real implementation, you might want to handle transmission errors
      console.warn('Failed to send error to TrackJS:', err);
    }
  }
}