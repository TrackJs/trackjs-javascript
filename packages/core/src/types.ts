export interface InstallOptions {

}

/**
 * String formatted as an ISO-8601 Date. Example 2025-01-01T12:01:01.123Z
 */
export interface ISO8601DateString extends String { }

export type HTTPMethods = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';

export type ConsoleSeverity = 'debug' | 'info' | 'log' | 'warn' | 'error';

export type TelemetryType = "console" | "network" | "navigation" | "visitor";

export interface ConsoleTelemetry {
  /**
   * Timestamp of the log event
   */
  timestamp: ISO8601DateString;

  /**
   * Severity of the log event
   */
  severity: ConsoleSeverity;

  /**
   * Serialized message(s) sent to console
   */
  message: string;
}

export interface NavigationTelemetry {
  /**
   * Timestamp the navigation happened.
   */
  on: ISO8601DateString;

  /**
   * Navigation method used. IE "replaceState" "setState"
   */
  type: string;

  /**
   * Previous location
   */
  from: string;

  /**
   * Destination location
   */
  to: string;
}

export interface NetworkTelemetry {
  /**
   * Timestamp the request started
   */
  startedOn: ISO8601DateString;

  /**
   * Timestamp the request completed
   */
  completedOn?: ISO8601DateString;

  /**
   * HTTP Method used
   */
  method: HTTPMethods;

  /**
   * URL of the network request
   */
  url: string;

  /**
   * HTTP Status Code returned, if the request has completed.
   */
  statusCode?: number;

  /**
   * HTTP Status Text returned, if the request has completed.
   */
  statusText?: string;

  /**
   * How the request was made, IE 'fetch' or 'XMLHTTPRequest'
   */
  type: string;
}

export interface VisitorTelemetry {
  /**
   * Timestamp the event occurred
   */
  timestamp: ISO8601DateString;

  /**
   * Action taken by the visitor. IE 'click' or 'input'
   */
  action: string;

  /** DOM element acted upon */
  element: {
    /**
     * The element tag, like DIV, CONTROL, or BUTTON
     */
    tag: string;

    /**
     * Non-sensitive attributes of the element, IE { class: "button button-red" }
     */
    attributes: {
      [name: string]: string
    };

    /**
     * Non-PII record of the value for the element
     */
    value: {
      /**
       * Length in characters of the value
       */
      length: number;

      /**
       * Pattern that describes the value
       */
      pattern: "empty" | "email" | "date" | "usphone" | "whitespace" | "numeric" | "alpha" | "alphanumeric" | "characters";
    }
  };
}

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
  bindTime?: ISO8601DateString;

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
    correlationId: string;

    /**
     * Customer-provided Session Id.
     */
    sessionId?: string;

    /**
     * TrackJS Account Token
     */
    token: string;

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
  timestamp: ISO8601DateString;

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