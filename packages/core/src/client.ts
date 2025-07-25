import { parseStackTrace, serialize, generateId, throttle } from './utils';
import { ClientOptions, ErrorPayload, TelemetryEntry } from './types';

export class Client {
  private config: ClientOptions;
  private telemetry: TelemetryEntry[] = [];
  private metadata: Record<string, any> = {};
  private recentErrors: Set<string> = new Set();

  // Throttle error reporting to prevent spam
  private throttledSend = throttle(this.sendError.bind(this), 100);

  constructor(options: ClientOptions) {
    this.config = {
      enabled: true,
      dedupe: true,
      telemetryLimit: 50,
      serialize,
      ...options
    };
  }

  public track(error: Error | string, metadata?: Record<string, any>): void {
    if (!this.config.enabled) return;

    const payload = this.createPayload(error, metadata);

    // Dedupe errors if enabled
    if (this.config.dedupe) {
      const errorKey = `${payload.message}:${payload.file}:${payload.line}`;
      if (this.recentErrors.has(errorKey)) {
        return;
      }
      this.recentErrors.add(errorKey);

      // Clear dedupe cache after 1 minute  
      Promise.resolve().then(() => {
        const start = Date.now();
        const waitUntil = start + 60000;
        const checkAndClear = () => {
          if (Date.now() >= waitUntil) {
            this.recentErrors.delete(errorKey);
          } else {
            Promise.resolve().then(checkAndClear);
          }
        };
        checkAndClear();
      });
    }

    this.throttledSend(payload);
  }

  public addMetadata(key: string, value: any): void {
    this.metadata[key] = this.config.serialize!(value);
  }

  public removeMetadata(key: string): void {
    delete this.metadata[key];
  }

  public addTelemetry(type: TelemetryEntry['type'], data: Record<string, any>): void {
    this.telemetry.push({
      timestamp: Date.now(),
      type,
      data: JSON.parse(this.config.serialize!(data))
    });
    
    const limit = this.config.telemetryLimit || 50;
    if (this.telemetry.length > limit) {
      this.telemetry.shift();
    }
  }

  public configure(options: Partial<ClientOptions>): void {
    this.config = { ...this.config, ...options };
  }

  private sendError(payload: ErrorPayload): void {
    if (this.config.onError) {
      this.config.onError(payload);
    }

    // Create transport request with token and payload
    const request = {
      method: 'POST' as const,
      url: this.config.url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.token}`
      },
      data: payload
    };
    
    this.config.transport.send(request).catch((error: unknown) => {
      // Transport failed - could log to console in debug mode
    });
  }

  private createPayload(error: Error | string, metadata?: Record<string, any>): ErrorPayload {
    const timestamp = Date.now();
    const id = generateId();
    
    const mergedMetadata = {
      ...this.metadata,
      ...(metadata ? JSON.parse(this.config.serialize!(metadata)) : {})
    };

    // Get context from platform-specific provider
    const context = this.config.getContext ? this.config.getContext() : {};

    if (typeof error === 'string') {
      return {
        id,
        message: error,
        timestamp,
        userId: this.config.userId,
        application: this.config.application,
        version: this.config.version,
        metadata: mergedMetadata,
        telemetry: [...this.telemetry],
        context
      };
    }

    // Parse stack trace
    const stack = error.stack ? parseStackTrace(error.stack) : [];
    const topFrame = stack[0];

    return {
      id,
      message: error.message,
      stack,
      file: topFrame?.file,
      line: topFrame?.line,
      column: topFrame?.column,
      timestamp,
      userId: this.config.userId,
      application: this.config.application,
      version: this.config.version,
      metadata: mergedMetadata,
      telemetry: [...this.telemetry],
      context
    };
  }
}