import type {
  CapturePayload,
  Options,
  TrackOptions
} from "./types";
import { uuid, timestamp, serialize, isError } from "./utils";

export class Client {
  private config: Options;

  constructor(options: Options) {
    this.config = options;
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
      handlers: this.config.serializer
    });
  }

  /**
   * Create a complete payload for an error
   */
  _createPayload(error: Error, options: TrackOptions): CapturePayload {
    return {

      timestamp: timestamp(),
      entry: options.entry,
      message: error.message,
      stack: error.stack || '',
      bindStack: undefined,
      bindTime: undefined,
      url: '',

      customer: {
        application: this.config.application,
        correlationId: this.config.correlationId,
        sessionId: this.config.sessionId,
        token: this.config.token,
        userId: this.config.userId,
        version: this.config.version
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

      metadata: Object.entries({
        ...this.config.metadata,
        ...options.metadata,
      }).map(([key, value]) => ({ key, value })),

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
      await this.config.transport.send({
        method: 'POST',
        url: `${this.config.errorURL}?token=${encodeURIComponent(this.config.token)}&v=core-0.0.0`,
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