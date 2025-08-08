/**
 * Truncate a string at a specified length and append ellipsis with a count
 * of truncated characters.
 *
 * @param value String value to truncate
 * @param length Maximum length of original string
 * @example "this string was too...{12}".
 */
export function truncate(value: string, length: number): string {
  if (value.length <= length) {
    return value;
  }
  var truncatedLength = value.length - length;
  return `${value.substring(0, length)}…{${truncatedLength}}`;
}