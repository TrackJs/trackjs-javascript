import type { UUID } from "../types";

/**
 * Generate a random unhyphenated UUID v4 (32 hexadecimal characters)
 * Example: "550e8400e29b41d4a716446655440000"
 */
export function uuid(): UUID {
  // Use crypto.randomUUID if available (Node.js 14.17+, modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    // Remove hyphens from standard UUID format
    return crypto.randomUUID().replace(/-/g, '') as UUID;
  }

  // Fallback implementation for older environments
  const hex = '0123456789abcdef';
  let result = '';

  for (let i = 0; i < 32; i++) {
    // For UUID v4, certain positions have fixed values
    if (i === 12) {
      result += '4'; // Version 4
    } else if (i === 16) {
      // Variant bits: 10xx (8, 9, a, or b)
      result += hex[8 + Math.floor(Math.random() * 4)];
    } else {
      result += hex[Math.floor(Math.random() * 16)];
    }
  }

  return result as UUID;
}