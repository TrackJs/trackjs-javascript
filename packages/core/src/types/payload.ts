import type { ISO8601Date, UUID } from "./common";
import type { ConsoleTelemetry, NavigationTelemetry, NetworkTelemetry, VisitorTelemetry } from "./telemetry";

/**
 * Payload of an error sent to TrackJS.
 */
export interface CapturePayload {

  /**
   * Stack Trace collected from async operations.
   */
  bindStack?: string;

  /**
   * Timestamp for async stack trace binding.
   */
  bindTime?: ISO8601Date;

  /**
   * Standardized context metadata about your user, environment, and application.
   */
  customer: {
    /**
     * TrackJS ApplicationId
     */
    application?: string;

    /**
     * Unique Id generated for the current context to combine related errors together.
     */
    correlationId: UUID;

    /**
     * Customer-provided Session Id.
     */
    sessionId?: string;

    /**
     * TrackJS Account Token
     */
    token: UUID;

    /**
     * Customer-provided user identification
     */
    userId?: string;

    /**
     * Customer-provided version for your running application
     */
    version?: string;
  };

  /**
   * How the error was captured.
   */
  entry: string;

  /**
   * Context about the client environment
   */
  environment: {
    /**
     * How long the application or page has been active, in ms
     */
    age: number;

    /**
     * Dependencies running and their versions
     */
    dependencies: {
      [name: string]: string
    };

    /**
     * User Agent string
     */
    userAgent: string;

    /**
     * User window height
     */
    viewportHeight: number;

    /**
     * User window width
     */
    viewportWidth: number;
  };

  /**
   * Metadata associated to the error.
   */
  metadata: {
    key: string;
    value: string;
  }[];

  /**
   * Serialized error message being tracked.
   */
  message: string;

  /**
   * Location or address of the user at the time of the error.
   */
  url: string;

  /**
   * Unformatted Stack Trace
   */
  stack: string;

  /**
   * Agent timestamp when the payload was sent
   */
  timestamp: ISO8601Date;

  /**
   * Version of the agent
   */
  version: string;

  /**
   * Count of payloads that may have been throttled by the agent before the current
   * payload was sent.
   */
  throttled: number;

  /**
   * Console Log Telemetry events
   */
  console: Array<ConsoleTelemetry>

  /**
   * Navigation Telemetry events
   */
  nav: Array<NavigationTelemetry>;

  /**
   * Network Telemetry events
   */
  network: Array<NetworkTelemetry>;

  /**
   * Visitor Telemetry events
   */
  visitor: Array<VisitorTelemetry>;
}