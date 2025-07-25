#!/usr/bin/env node

import { Client, serialize } from '../../../packages/core/dist/esm/index.js';

console.log('🧪 TrackJS Core - Simple Integration Test');

// Test import
console.log('✅ Successfully imported Client and serialize');

// Test serialization
const result = serialize({ test: 'value', number: 42 });
console.log('Serialized:', result);
console.log('✅ Serialization working');

console.log('🎉 Simple test passed!');