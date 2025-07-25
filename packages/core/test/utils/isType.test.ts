import { describe, it, expect } from 'vitest';
import { isArray, isBoolean, isError, isElement, isFunction, isNumber, isObject, isString } from '../../src/utils/isType';

describe('isType utilities', () => {
  describe('isArray', () => {
    it('should identify arrays correctly', () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
      expect(isArray(new Array(5))).toBe(true);
    });

    it('should reject non-arrays', () => {
      expect(isArray({})).toBe(false);
      expect(isArray('string')).toBe(false);
      expect(isArray(null)).toBe(false);
      expect(isArray(undefined)).toBe(false);
      expect(isArray(42)).toBe(false);
    });
  });

  describe('isBoolean', () => {
    it('should identify booleans correctly', () => {
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
      expect(isBoolean(new Boolean(true))).toBe(true);
      expect(isBoolean(new Boolean(false))).toBe(true);
    });

    it('should reject non-booleans', () => {
      expect(isBoolean(0)).toBe(false);
      expect(isBoolean(1)).toBe(false);
      expect(isBoolean('true')).toBe(false);
      expect(isBoolean(null)).toBe(false);
      expect(isBoolean(undefined)).toBe(false);
    });
  });

  describe('isError', () => {
    it('should identify Error objects correctly', () => {
      expect(isError(new Error('test'))).toBe(true);
      expect(isError(new TypeError('test'))).toBe(true);
      expect(isError(new ReferenceError('test'))).toBe(true);
      expect(isError(new SyntaxError('test'))).toBe(true);
    });

    it('should identify error-like objects', () => {
      expect(isError({ name: 'CustomError', message: 'test message' })).toBe(true);
      expect(isError({ name: 'Error', message: 'another test' })).toBe(true);
    });

    it('should reject non-errors', () => {
      expect(isError({})).toBe(false);
      expect(isError({ name: 'NotAnError' })).toBe(false);
      expect(isError({ message: 'No name property' })).toBe(false);
      expect(isError('Error')).toBe(false);
      expect(isError(null)).toBe(false);
    });
  });

  describe('isElement', () => {
    it('should identify element-like objects', () => {
      const mockElement = { nodeType: 1, tagName: 'DIV' };
      expect(isElement(mockElement)).toBe(true);
    });

    it('should reject non-elements', () => {
      expect(isElement({})).toBe(false);
      expect(isElement({ nodeType: 2 })).toBe(false); // Not element node
      expect(isElement({ nodeType: '1' })).toBe(false); // String, not number
      expect(isElement(null)).toBe(false);
      expect(isElement('div')).toBe(false);
    });
  });

  describe('isFunction', () => {
    it('should identify functions correctly', () => {
      expect(isFunction(function() {})).toBe(true);
      expect(isFunction(() => {})).toBe(true);
      expect(isFunction(async function() {})).toBe(true);
      expect(isFunction(function* generator() {})).toBe(true);
      expect(isFunction(Array.prototype.push)).toBe(true);
    });

    it('should reject non-functions', () => {
      expect(isFunction({})).toBe(false);
      expect(isFunction('function')).toBe(false);
      expect(isFunction(null)).toBe(false);
      expect(isFunction(undefined)).toBe(false);
      expect(isFunction(42)).toBe(false);
    });
  });

  describe('isNumber', () => {
    it('should identify numbers correctly', () => {
      expect(isNumber(42)).toBe(true);
      expect(isNumber(0)).toBe(true);
      expect(isNumber(-1)).toBe(true);
      expect(isNumber(3.14)).toBe(true);
      expect(isNumber(Infinity)).toBe(true);
      expect(isNumber(NaN)).toBe(true);
      expect(isNumber(new Number(42))).toBe(true);
    });

    it('should reject non-numbers', () => {
      expect(isNumber('42')).toBe(false);
      expect(isNumber(true)).toBe(false);
      expect(isNumber(null)).toBe(false);
      expect(isNumber(undefined)).toBe(false);
      expect(isNumber({})).toBe(false);
    });
  });

  describe('isObject', () => {
    it('should identify objects correctly', () => {
      expect(isObject({})).toBe(true);
      expect(isObject([])).toBe(true);
      expect(isObject(new Date())).toBe(true);
      expect(isObject(new Error())).toBe(true);
      expect(isObject(/regex/)).toBe(true);
    });

    it('should reject non-objects', () => {
      expect(isObject(null)).toBe(false);
      expect(isObject(undefined)).toBe(false);
      expect(isObject('string')).toBe(false);
      expect(isObject(42)).toBe(false);
      expect(isObject(true)).toBe(false);
      expect(isObject(function() {})).toBe(false);
    });
  });

  describe('isString', () => {
    it('should identify strings correctly', () => {
      expect(isString('hello')).toBe(true);
      expect(isString('')).toBe(true);
      expect(isString(new String('wrapped'))).toBe(true);
    });

    it('should reject non-strings', () => {
      expect(isString(42)).toBe(false);
      expect(isString(true)).toBe(false);
      expect(isString(null)).toBe(false);
      expect(isString(undefined)).toBe(false);
      expect(isString({})).toBe(false);
      expect(isString([])).toBe(false);
    });
  });
});