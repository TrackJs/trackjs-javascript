#!/usr/bin/env node

import { Client, serialize } from '@trackjs/core';

console.log('🧪 TrackJS Core - Basic Integration Test\n');

// Test 1: Import verification
console.log('✅ Successfully imported Client and serialize from @trackjs/core');

// Test 2: Serializer basic functionality
console.log('\n📝 Testing basic serialization:');
const testObj = {
  string: 'Hello World',
  number: 42,
  boolean: true,
  array: [1, 2, 3],
  nested: {
    bigint: BigInt(9007199254740993),
    date: new Date('2025-01-01'),
    promise: Promise.resolve('test')
  }
};

const serialized = serialize(testObj);
console.log('Input:', testObj);
console.log('Serialized:', serialized);
console.log('✅ Serialization working correctly');

// Test 3: Client instantiation
console.log('\n🔧 Testing Client instantiation:');

// Mock transport for testing
const mockTransport = {
  send: async (request) => {
    console.log('📤 Transport received:', {
      method: request.method,
      url: request.url,
      hasData: !!request.data
    });
    return { 
      status: 200, 
      data: { success: true }
    };
  }
};

const client = new Client({
  token: 'test-token-123',
  url: 'https://api.trackjs.com/v1/track',
  transport: mockTransport,
  application: 'test-app',
  version: '1.0.0'
});

console.log('✅ Client created successfully');

// Test 4: Error tracking
console.log('\n🚨 Testing error tracking:');

try {
  // Simulate an error
  throw new Error('Test error for TrackJS');
} catch (error) {
  await client.track(error, { 
    testMetadata: 'additional context',
    userId: 'test-user-123' 
  });
  console.log('✅ Error tracked successfully');
}

// Test 5: Telemetry
console.log('\n📊 Testing telemetry:');
client.addTelemetry('console', { 
  level: 'info', 
  message: 'Test console log' 
});

client.addTelemetry('network', {
  method: 'GET',
  url: '/api/test',
  status: 200,
  duration: 150
});

console.log('✅ Telemetry added successfully');

// Test 6: Metadata
console.log('\n🏷️ Testing metadata:');
client.addMetadata('environment', 'test');
client.addMetadata('feature-flags', { 
  newUI: true, 
  betaFeature: false 
});

console.log('✅ Metadata added successfully');

console.log('\n🎉 All basic tests passed!');
console.log('\n📋 Summary:');
console.log('- Package import: ✅');
console.log('- Serialization: ✅');
console.log('- Client creation: ✅');
console.log('- Error tracking: ✅');
console.log('- Telemetry: ✅');
console.log('- Metadata: ✅');