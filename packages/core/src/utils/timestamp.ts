import type { ISO8601Date } from "../types";

/**
 * Get the current timestamp as an ISO8601Date
 */
export function timestamp(): ISO8601Date {
  return new Date().toISOString() as ISO8601Date;
}