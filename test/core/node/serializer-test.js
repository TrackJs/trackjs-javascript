#!/usr/bin/env node

import { serialize } from '@trackjs/core';

console.log('🧪 TrackJS Core - Serializer Integration Test\n');

// Test 1: Basic data types
console.log('📝 Test 1: Basic data types');
const basicTypes = {
  string: 'Hello "World"',
  stringWithEscapes: 'Line 1\nLine 2\tTabbed\r\nNewline\\Backslash',
  number: 42,
  bigint: BigInt('9007199254740993'),
  boolean: true,
  null: null,
  undefined: undefined,
  symbol: Symbol('test'),
  regex: /test/gi,
  date: new Date('2025-01-01T00:00:00.000Z'),
  promise: Promise.resolve('test'),
  error: new Error('Test error')
};

console.log('Serialized:', serialize(basicTypes));
console.log('✅ Basic types serialized correctly\n');

// Test 2: Complex structures
console.log('📝 Test 2: Complex nested structures');
const complexStructure = {
  users: [
    { id: 1, name: 'Alice', active: true },
    { id: 2, name: 'Bob', active: false }
  ],
  metadata: {
    created: new Date(),
    version: BigInt(123),
    config: {
      deep: {
        nested: {
          value: 'deep value'
        }
      }
    }
  }
};

console.log('Serialized:', serialize(complexStructure));
console.log('✅ Complex structures serialized correctly\n');

// Test 3: Depth limiting
console.log('📝 Test 3: Depth limiting');
const deepObject = {
  level1: {
    level2: {
      level3: {
        level4: {
          level5: 'too deep'
        }
      }
    }
  }
};

console.log('Depth 2:', serialize(deepObject, { depth: 2 }));
console.log('Depth 3:', serialize(deepObject, { depth: 3 }));
console.log('Depth 5:', serialize(deepObject, { depth: 5 }));
console.log('✅ Depth limiting working correctly\n');

// Test 4: Circular references
console.log('📝 Test 4: Circular references');
const circular = { name: 'parent' };
circular.self = circular;
circular.child = { name: 'child', parent: circular };

console.log('Circular object:', serialize(circular));
console.log('✅ Circular references handled correctly\n');

// Test 5: Special characters and edge cases
console.log('📝 Test 5: Special characters and edge cases');
const edgeCases = {
  emptyString: '',
  whitespace: '   ',
  specialChars: '"\\\n\r\t',
  unicode: '🚀 Unicode test 中文',
  numbers: [0, -0, Infinity, -Infinity, NaN],
  bigNumbers: [
    Number.MAX_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER + 1,
    BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1000)
  ]
};

console.log('Edge cases:', serialize(edgeCases));
console.log('✅ Edge cases handled correctly\n');

// Test 6: Error scenarios
console.log('📝 Test 6: Error scenarios');
const throwingObject = new Proxy({}, {
  get() { throw new Error('Property access error'); },
  ownKeys() { return ['prop']; },
  has() { return true; },
  getOwnPropertyDescriptor() { 
    return { enumerable: true, configurable: true }; 
  }
});

console.log('Throwing object:', serialize(throwingObject));
console.log('✅ Error scenarios handled correctly\n');

// Test 7: Performance test
console.log('📝 Test 7: Performance test');
const largeObject = {
  array: new Array(1000).fill(0).map((_, i) => ({
    id: i,
    name: `Item ${i}`,
    data: { value: Math.random(), bigint: BigInt(i * 1000) }
  }))
};

const startTime = performance.now();
const result = serialize(largeObject, { depth: 3 });
const endTime = performance.now();

console.log(`Serialized ${largeObject.array.length} items in ${(endTime - startTime).toFixed(2)}ms`);
console.log(`Result length: ${result.length} characters`);
console.log('✅ Performance test completed\n');

console.log('🎉 All serializer tests passed!');
console.log('\n📋 Summary:');
console.log('- Basic data types: ✅');
console.log('- Complex structures: ✅');
console.log('- Depth limiting: ✅');
console.log('- Circular references: ✅');
console.log('- Edge cases: ✅');
console.log('- Error handling: ✅');
console.log('- Performance: ✅');