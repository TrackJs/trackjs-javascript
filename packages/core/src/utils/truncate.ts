import { isString } from "./isType";

/**
 * Truncate a string to exactly the specified length, appending ellipsis if
 * characters were truncated beyond the specified length.
 *
 * @param value - String value to truncate
 * @param length - Maximum length of the returned string
 * @returns Truncated string that may be appended with "…"
 *
 * @example
 * ```
 * truncate("1234567890", 10);
 * // returns "1234567890"
 *
 * truncate("1234567890", 8);
 * // return "1234567…"
 * ```
 */
export function truncate(value: string, length: number): string {
  // It's possible for the user the send us some unexpected type. Rather than
  // let it blow up somewhere unexpected, or have the error report rejected,
  // blow up explicitly.
  if (!isString(value)) {
    throw new Error("Value must be a string")
  }

  if (value.length <= length) {
    return value;
  }

  return `${value.substring(0, length - 1)}…`;
}