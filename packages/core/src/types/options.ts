import type { Transport } from "../transport";
import { SerializeHandler } from "../utils";
import type { UUID } from "./common";
import type { CapturePayload } from "./payload";

export interface InstallOptions extends Options {
  /**
   * TrackJS Account Token
   */
  token: UUID;

  /**
   * Custom functions for serializing objects to strings. Will execute before the default serializer.
   */
  serializer?: Array<SerializeHandler>;

  /**
   * Custom transport function for sending data. Required if the current environment does not support `fetch`.
   */
  transport?: Transport;
}

export interface Options {

  /**
   * TrackJS Application key.
   */
  application?: string;

  /**
   * Override the TrackJS-generated identifier to correlate errors together that share a common thread, session, or request.
   */
  correlationId?: UUID;

  /**
   * Customer-generated Id representing the current session.
   */
  sessionId?: string;

  /**
   * Customer-generated Id representing the current user.
   */
  userId?: string;

  /**
   * Customer-generated Id representing the version of the running application.
   */
  version?: string;

  /**
   * Metadata key-values to set immediately
   */
  metadata?: Record<string, string>;

  /**
   * Custom handler to manipulate or suppress errors captured by the agent.
   * @param payload error payload to be sent to TrackJS.
   * @returns false will suppress the error from being sent.
   */
  onError?: (payload: CapturePayload) => boolean;

}