import type { HTTPMethods, ISO8601Date, SeverityLevel } from "./common";

export type TelemetryType = "console" | "network" | "nav" | "visitor";

export type Telemetry = ConsoleTelemetry|NavigationTelemetry|NetworkTelemetry|VisitorTelemetry;

export interface ConsoleTelemetry {
  /**
   * Timestamp of the log event
   */
  timestamp: ISO8601Date;

  /**
   * Severity of the log event
   */
  severity: SeverityLevel;

  /**
   * Serialized message(s) sent to console
   */
  message: string;
}

export interface NavigationTelemetry {
  /**
   * Timestamp the navigation happened.
   */
  on: ISO8601Date;

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
  startedOn: ISO8601Date;

  /**
   * Timestamp the request completed
   */
  completedOn?: ISO8601Date;

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
  timestamp: ISO8601Date;

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
