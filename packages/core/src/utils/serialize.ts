import { isArray, isBoolean, isError, isFunction, isNumber, isObject, isRegExp, isString, isSymbol } from "./isType";

export interface SerializeHandler {
  /**
   * Test if this handler should be used for the given value
   */
  test: (thing: any) => boolean;

  /**
   * Serialize the value. If test() returns true, this MUST return a string.
   * Use the serialize callback to recursively serialize nested values.
   */
  serialize: (thing: any, serialize: (value: any, depth: number) => string, depth: number) => string;
}

export interface SerializeOptions {
  /**
   * Maximum depth to serialize nested objects/arrays
   * @default 3
   */
  depth?: number;

  /**
   * Custom handlers to extend serialization behavior
   */
  handlers?: SerializeHandler[];
}

export function serialize(thing: any, options?: SerializeOptions): string {
  const opts: Required<SerializeOptions> = {
    depth: 3,
    handlers: [],
    ...options
  };

  // Keep track of all the objects and arrays serialized inside an outer closure
  // to prevent circular references and double serializing complex objects.
  const serialized = new WeakSet();

  function _serialize(thing: any, depth: number): string {
    try {
      // Check custom handlers first
      for (const handler of opts.handlers) {
        if (handler.test(thing)) {
          return handler.serialize(thing, _serialize, depth);
        }
      }

      if (isString(thing)) {
        return `"${thing
          .replace(/\\/g, '\\\\')  // Escape backslashes first
          .replace(/"/g, '\\"')    // Escape quotes
          .replace(/\n/g, '\\n')   // Escape newlines
          .replace(/\r/g, '\\r')   // Escape carriage returns
          .replace(/\t/g, '\\t')   // Escape tabs
        }"`;
      }

      if (typeof thing === 'bigint') {
        return thing.toString() + 'n';
      }

      if (isBoolean(thing) || isFunction(thing) || isNumber(thing) || isRegExp(thing) || thing === null) {
        return `${thing}`;
      }

      if (isSymbol(thing)) {
        return Symbol.prototype.toString.call(thing)
      }

      if (typeof globalThis !== "undefined" && globalThis === thing) {
        return "[Global]"
      }

      if (isError(thing)) {
        return `[${Error.prototype.toString.call(thing)}]`;
      }

      if (thing instanceof Date) {
        return thing.toISOString();
      }

      if (thing instanceof Promise) {
        return "[Promise]";
      }

      if (isArray(thing)) {
        if (depth <= 0 || serialized.has(thing)) {
          return "[Array]";
        }
        serialized.add(thing);

        const serializedItems = [];
        for (const item of thing) {
          // RECURSION with depth limiting
          serializedItems.push(_serialize(item, depth-1));
        }
        return `[${"" + serializedItems}]`;
      }

      if (isObject(thing)) {
        if (depth <= 0 || serialized.has(thing)) {
          return "{Object}";
        }
        serialized.add(thing);

        const serializedProps = [];
        for (const key in thing) {
          // RECURSION with depth limiting
          serializedProps.push(`${_serialize(key, depth-1)}:${_serialize(thing[key], depth-1)}`);
        }
        return `{${"" + serializedProps}}`;
      }

      return `${thing}`;
    }
    catch(err) {
      return "[Unserializable]";
    }
  }

  return _serialize(thing, opts.depth);
}