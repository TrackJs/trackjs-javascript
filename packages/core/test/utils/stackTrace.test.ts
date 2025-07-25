import { describe, it, expect } from 'vitest';
import { parseStackTrace } from '../../src/utils/stackTrace';

describe('parseStackTrace', () => {
  it('should handle empty or undefined stack', () => {
    expect(parseStackTrace('')).toEqual([]);
    expect(parseStackTrace(undefined as any)).toEqual([]);
  });

  describe('Chrome/V8 format', () => {
    it('should parse Chrome format with function name', () => {
      const stack = `Error: Test error
    at testFunction (http://localhost:3000/app.js:10:5)
    at main (http://localhost:3000/app.js:20:10)`;
      
      const frames = parseStackTrace(stack);
      
      expect(frames).toHaveLength(2);
      expect(frames[0]).toEqual({
        function: 'testFunction',
        file: 'http://localhost:3000/app.js',
        line: 10,
        column: 5
      });
      expect(frames[1]).toEqual({
        function: 'main',
        file: 'http://localhost:3000/app.js',
        line: 20,
        column: 10
      });
    });

    it('should parse Chrome format without function name', () => {
      const stack = `Error: Test error
    at http://localhost:3000/app.js:15:8`;
      
      const frames = parseStackTrace(stack);
      
      expect(frames).toHaveLength(1);
      expect(frames[0]).toEqual({
        file: 'http://localhost:3000/app.js',
        line: 15,
        column: 8
      });
    });

    it('should handle anonymous functions', () => {
      const stack = `Error: Test error
    at <anonymous> (http://localhost:3000/app.js:5:2)`;
      
      const frames = parseStackTrace(stack);
      
      expect(frames).toHaveLength(1);
      expect(frames[0]).toEqual({
        function: '<anonymous>',
        file: 'http://localhost:3000/app.js',
        line: 5,
        column: 2
      });
    });
  });

  describe('Firefox format', () => {
    it('should parse Firefox format with function name', () => {
      const stack = `testFunction@http://localhost:3000/app.js:10:5
main@http://localhost:3000/app.js:20:10`;
      
      const frames = parseStackTrace(stack);
      
      expect(frames).toHaveLength(2);
      expect(frames[0]).toEqual({
        function: 'testFunction',
        file: 'http://localhost:3000/app.js',
        line: 10,
        column: 5
      });
      expect(frames[1]).toEqual({
        function: 'main',
        file: 'http://localhost:3000/app.js',
        line: 20,
        column: 10
      });
    });

    it('should parse Firefox format without function name', () => {
      const stack = `@http://localhost:3000/app.js:15:8`;
      
      const frames = parseStackTrace(stack);
      
      expect(frames).toHaveLength(1);
      expect(frames[0]).toEqual({
        function: undefined,
        file: 'http://localhost:3000/app.js',
        line: 15,
        column: 8
      });
    });
  });

  describe('file paths', () => {
    it('should handle file:// URLs', () => {
      const stack = `Error: Test error
    at testFunction (file:///Users/test/app.js:10:5)`;
      
      const frames = parseStackTrace(stack);
      
      expect(frames[0]).toEqual({
        function: 'testFunction',
        file: 'file:///Users/test/app.js',
        line: 10,
        column: 5
      });
    });

    it('should handle relative paths', () => {
      const stack = `Error: Test error
    at testFunction (./src/app.js:10:5)`;
      
      const frames = parseStackTrace(stack);
      
      expect(frames[0]).toEqual({
        function: 'testFunction',
        file: './src/app.js',
        line: 10,
        column: 5
      });
    });

    it('should handle webpack paths', () => {
      const stack = `Error: Test error
    at testFunction (webpack:///src/app.js:10:5)`;
      
      const frames = parseStackTrace(stack);
      
      expect(frames[0]).toEqual({
        function: 'testFunction',
        file: 'webpack:///src/app.js',
        line: 10,
        column: 5
      });
    });
  });

  describe('edge cases', () => {
    it('should handle malformed stack lines', () => {
      const stack = `Error: Test error
    malformed line without proper format
    at testFunction (http://localhost:3000/app.js:10:5)
    another malformed line`;
      
      const frames = parseStackTrace(stack);
      
      expect(frames).toHaveLength(1);
      expect(frames[0]).toEqual({
        function: 'testFunction',
        file: 'http://localhost:3000/app.js',
        line: 10,
        column: 5
      });
    });

    it('should handle stack with only error message', () => {
      const stack = `Error: Test error`;
      
      const frames = parseStackTrace(stack);
      
      expect(frames).toEqual([]);
    });

    it('should handle missing line/column numbers', () => {
      const stack = `testFunction@http://localhost:3000/app.js:10:5`;
      
      const frames = parseStackTrace(stack);
      
      expect(frames).toHaveLength(1);
      expect(frames[0]).toEqual({
        function: 'testFunction',
        file: 'http://localhost:3000/app.js',
        line: 10,
        column: 5
      });
    });

    it('should handle very long function names', () => {
      const longFunctionName = 'very'.repeat(50) + 'LongFunctionName';
      const stack = `Error: Test error
    at ${longFunctionName} (http://localhost:3000/app.js:10:5)`;
      
      const frames = parseStackTrace(stack);
      
      expect(frames[0].function).toBe(longFunctionName);
    });
  });
});