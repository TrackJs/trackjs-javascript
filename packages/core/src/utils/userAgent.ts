/**
 * Build a TrackJS-compatible browser-like userAgent string based on the current
 * running environment.
 *
 * @param engine - The runtime engine, like "Node", "Deno", or "Chrome"
 * @param engineVersion - The runtime version.
 * @param os - The running operating system, like "Macintosh" or "Windows"
 * @param osArch - The architecture of the operating system, like "x64"
 * @param osVersion - The running operating system version, like 10.15.7
 * @returns A constructed userAgent String
 *
 * @example
 * ```
 * TrackJS.initialize({
 *   token: "your-token",
 *   userAgent: userAgent("Node", "22.12.0", "Macintosh", "x64", "15.6")
 * })
 */
export function userAgent(
  engine: string,
  engineVersion: string,
  os: string,
  osArch: string,
  osVersion: string) : string {
    return `${engine}/${engineVersion.replace("v", "")} (${os} ${osArch} ${osVersion})`;
}