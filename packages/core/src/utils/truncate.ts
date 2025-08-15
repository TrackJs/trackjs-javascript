/**
 * Truncate a string to exactly the specified length, appending ellipsis with
 * a count of truncated characters when needed.
 *
 * @param value String value to truncate
 * @param length Exact length of the resulting string
 * @example "this string was too...{12}" (exactly 'length' characters).
 */
export function truncate(value: string, length: number): string {
  if (value.length <= length) {
    return value;
  }
  
  const truncatedCount = value.length - length;
  // Cap at 999+ to keep suffix predictable length
  const displayCount = truncatedCount > 999 ? "999+" : truncatedCount.toString();
  const suffix = `…{${displayCount}}`;
  
  // Calculate how much of the original string we can keep
  const availableLength = length - suffix.length;
  
  if (availableLength <= 0) {
    // If the suffix itself is too long, just return the suffix truncated to length
    return suffix.substring(0, length);
  }
  
  return value.substring(0, availableLength) + suffix;
}