# TrackJS Core - Test Application

This test application verifies that the `@trackjs/core` package works correctly in different environments and scenarios.

## Setup

1. **Install dependencies:**
   ```bash
   cd test-app
   npm install
   ```

2. **Build the core package first:**
   ```bash
   cd ../packages/core
   npm run build
   ```

## Node.js Tests

### Run Individual Tests

```bash
# Basic functionality test
npm run test:basic

# Serializer comprehensive test
npm run test:serializer

# Extensibility and custom handlers test
npm run test:extensibility
```

### Run All Node.js Tests

```bash
npm run test:all
```

### What Each Node.js Test Covers

#### `basic-test.js`
- ✅ Package import verification
- ✅ Basic serialization functionality
- ✅ Client instantiation
- ✅ Error tracking with metadata  
- ✅ Telemetry addition
- ✅ Metadata management

#### `serializer-test.js`
- ✅ All basic data types (string, number, BigInt, etc.)
- ✅ String escaping (`\n`, `\t`, `\r`, `\\`, quotes)
- ✅ Complex nested structures
- ✅ Depth limiting configuration
- ✅ Circular reference handling
- ✅ Edge cases and special characters
- ✅ Error scenarios (unserializable objects)
- ✅ Performance with large objects

#### `extensibility-test.js`
- ✅ Custom handlers for Map objects
- ✅ Custom handlers for Set objects
- ✅ Multiple handler composition
- ✅ Recursive serialization in handlers
- ✅ Handler precedence order
- ✅ Depth limiting with custom handlers
- ✅ Error handling in custom handlers

## Browser Tests

### Setup Browser Tests

1. **Build the core package for browser:**
   ```bash
   cd ../packages/core
   npm run build
   ```

2. **Serve the test page:**
   ```bash
   cd ../test-app
   npm run serve
   ```

3. **Open browser:**
   Navigate to `http://localhost:8000/browser/`

### What Browser Tests Cover

- ✅ Module import in browser environment
- ✅ Serialization of browser-specific objects
- ✅ Client functionality with mock transport
- ✅ Error tracking with browser-generated errors
- ✅ DOM element serialization with custom handlers
- ✅ Browser API integration (navigator, location, etc.)

## Expected Outputs

### Successful Basic Test
```
🧪 TrackJS Core - Basic Integration Test
✅ Successfully imported Client and serialize from @trackjs/core
📝 Testing basic serialization:
✅ Serialization working correctly
🔧 Testing Client instantiation:
✅ Client created successfully
🚨 Testing error tracking:
✅ Error tracked successfully
📊 Testing telemetry:
✅ Telemetry added successfully
🏷️ Testing metadata:
✅ Metadata added successfully
🎉 All basic tests passed!
```

### Key Serialization Examples
```javascript
// BigInt preservation
BigInt(9007199254740993) → "9007199254740993n"

// String escaping
"Line1\nLine2\tTab" → "\"Line1\\nLine2\\tTab\""

// Circular references
{ self: [Circular] } → "{"name":"test","self":{Object}}"

// Custom handlers
Map([['key', 'value']]) → "[Map[[\"key\",\"value\"]]]"
```

## Troubleshooting

### "Cannot find module" Error
Make sure you've built the core package:
```bash
cd ../packages/core
npm run build
```

### Browser Tests Not Loading
1. Check that the HTTP server is running (`npm run serve`)
2. Verify the import path in `browser/test.js` points to the correct build output
3. Check browser console for detailed error messages

### Tests Failing
1. Ensure all dependencies are installed (`npm install`)
2. Check that you're using a compatible Node.js version (14+)
3. Verify the core package builds without errors

## Adding New Tests

### Node.js Test
Create a new file in the `node/` directory and add a script to `package.json`:

```javascript
#!/usr/bin/env node
import { Client, serialize } from '@trackjs/core';

console.log('🧪 Your Test Name');
// Your test logic here
```

### Browser Test
Add new test functions to `browser/test.js` and corresponding UI elements to `index.html`.

## Expected Performance

- Serializing 1000 complex objects: < 50ms
- Basic serialization: < 1ms
- Client instantiation: < 5ms
- Error tracking: < 10ms

## Integration Verification Checklist

- [ ] Package imports correctly
- [ ] Serializer handles all data types
- [ ] String escaping works properly  
- [ ] BigInt precision preserved
- [ ] Circular references handled
- [ ] Depth limiting configurable
- [ ] Custom handlers work
- [ ] Client creates successfully
- [ ] Error tracking functional
- [ ] Telemetry system working
- [ ] Metadata management working
- [ ] Browser compatibility confirmed