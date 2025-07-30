// hidden symbol property for creating branded types
// @see https://prosopo.io/articles/typescript-branding/
const brand = Symbol('brand');

/**
 * String formatted as an ISO-8601 Date.
 * Example: 2025-01-01T12:01:01.123Z
 */
export type ISO8601Date = string & { [brand]: 'ISO8601Date' }

/**
 * HTTP Method verbs
 */
export type HTTPMethods = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';

/**
 * Log message severity levels
 */
export type SeverityLevel = 'debug' | 'info' | 'log' | 'warn' | 'error';

/**
 * Unhyphenated UUID string (32 hexadecimal characters)
 * Example: "550e8400e29b41d4a716446655440000"
 */
export type UUID = string & { [brand]: 'UUID' };