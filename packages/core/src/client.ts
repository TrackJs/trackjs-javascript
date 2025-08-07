import { Metadata } from "./metadata";
import type {
  CapturePayload,
  Options,
  TrackOptions
} from "./types";
import { timestamp, serialize, isError } from "./utils";

export class Client {
  private options: Options;
  private metadata: Metadata;

  constructor(options: Options) {
    this.options = options;
    this.metadata = new Metadata(this.options.metadata);
  }

  public addMetadata(metadata: Record<string, string>): void {
    this.metadata.add(metadata);
  }

  public removeMetadata(metadata: Record<string, any>): void {
    this.metadata.remove(metadata);
  }

  /**
   * Track an error and send it to TrackJS
   */
  public async track(error: Error | object | string, options?: Partial<TrackOptions>): Promise<void> {
    const safeOptions: TrackOptions = {
      entry: "direct",
      metadata: {},
      ...options
    };

    const safeError = isError(error) ? error as Error : new Error(this._serialize(error))

    const payload = this._createPayload(safeError, safeOptions);

    await this._send(payload);
  }

  _serialize(thing: any): string {
    return serialize(thing, {
      depth: 3,
      handlers: this.options.serializer
    });
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
        dependencies: {
          "foo": "bar"
        },
        originalUrl: "",
        referrer: "",
        userAgent: 'node/22.0 (osx x64 123)',
        viewportHeight: -1,
        viewportWidth: -1
      },

      metadata: payloadMetadata.get(),

      console: [],
      nav: [],
      network: [],
      visitor: [],

      agentPlatform: "",
      version: '0.0.0',
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