/**
 * getTag
 * @private
 * Returns the string notation tag of an object, such as `[object Object]`.
 *
 * @param {*} thing Thing to be checked
 * @return {String} tag for the thing.
 */
function getTag(thing: any): string {
  return Object.prototype.toString.call(thing);
}

/**
 * isArray
 * Whether a thing is an Array
 *
 * @param {*} thing to be checked
 * @return {Boolean} true if thing is an Array
 */
export function isArray(thing: any): boolean {
  return getTag(thing) === "[object Array]";
}

/**
 * isBoolean
 * Check if the item is a Boolean
 *
 * @param {*} thing Item to be checked
 * @return {Boolean} Whether the thing was a boolean
 */
export function isBoolean(thing: any): boolean {
  return typeof thing === "boolean" || (isObject(thing) && getTag(thing) === "[object Boolean]");
}

/**
 * isError
 * Checks if the item is an Error
 *
 * @param {*} thing Item to be checked
 * @return {Boolean} Whether item is an Error.
 */
export function isError(thing: any): boolean {
  if (!isObject(thing)) {
    return false;
  }
  var tag = getTag(thing);
  return (
    tag === "[object Error]" ||
    tag === "[object DOMException]" ||
    (isString(thing["name"]) && isString(thing["message"]))
  );
}

/**
 * isElement
 * Checks if the item is an HTML Element. Because some browsers are not
 * compliant with W3 DOM2 specification, `HTMLElement` may not exist or
 * be defined inconsistently. Instead, we check if the shape of the object
 * is consistent with an Element. This is the same approach used by Lodash.
 *
 * @param {*} thing Item to be checked
 * @return {Boolean} Whether item is an Element.
 */
export function isElement(thing: any): boolean {
  return isObject(thing) && thing["nodeType"] === 1;
}

/**
 * isFunction
 * Check if the item is a Function
 *
 * @param {*} thing Item to be checked
 * @return {Boolean} Whether the thing was a function
 */
export function isFunction(thing: any): boolean {
  return !!(thing && typeof thing === "function");
}

/**
 * isNumber
 * Check if the item is a Number
 *
 * @param {*} thing Item to be checked
 * @return {Boolean} Whether the thing was a number
 */
export function isNumber(thing: any): boolean {
  return typeof thing === "number" || (isObject(thing) && getTag(thing) === "[object Number]");
}

/**
 * isObject
 * Check if the item is an Object
 *
 * @param {*} thing Item to be checked
 * @return {Boolean} Whether the thing was an object
 */
export function isObject(thing: any): boolean {
  return !!(thing && typeof thing === "object");
}

/**
 * isString
 * Check if the item is a String
 *
 * @param {*} thing Item to be checked
 * @return {Boolean} Whether the thing was a string
 */
export function isString(thing: any): boolean {
  return typeof thing === "string" || (!isArray(thing) && isObject(thing) && getTag(thing) === "[object String]");
}

/**
 * isRegExp
 * Check if the thing is a RegExp
 *
 * @param {*} thing Thing to be checked
 * @returns {Boolean} Whether the thing is a RegExp
 */
export function isRegExp(thing: any): boolean {
  return thing instanceof RegExp;
}

/**
 * isSymbol
 * Check if the thing is a Symbol
 *
 * @param {*} thing Thing to be checked
 * @returns {Boolean} Whether the thing is a Symbol
 */
export function isSymbol(thing: any): boolean {
  return typeof thing === "symbol";
}