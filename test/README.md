# TrackJS Test Packages

This directory contains test packages for all TrackJS client libraries. Each test package is designed to verify the functionality of specific packages and their integrations.

## Structure

```
test/
├── core/              # Tests for @trackjs/core
├── node/              # Tests for @trackjs/node (future)
├── browser/           # Tests for @trackjs/browser (future)
├── react-native/      # Tests for @trackjs/react-native (future)
└── integration/       # Cross-package integration tests
```

## Test Package Types

### Package-Specific Tests
Each package-specific test directory (`core/`, `node/`, `browser/`, etc.) contains:
- **Unit-style integration tests** for that specific package
- **Environment-specific test scenarios** 
- **Package feature verification**
- **Performance and edge case testing**

### Integration Tests
The `integration/` directory contains:
- **Cross-package compatibility tests**
- **End-to-end workflow testing**
- **Package combination scenarios**
- **Real-world usage simulation**

## Running Tests

### Individual Package Tests
```bash
# Test core package
npm run test:core

# Test node package (future)
npm run test:node

# Test browser package (future) 
npm run test:browser
```

### Integration Tests
```bash
# Run integration tests
npm run test:integration

# Run all tests
npm run test:all
```

### Package-Specific Commands
```bash
# From root directory
npm run test:core --workspace=test/core
npm run test:all --workspace=test/core

# Or change to specific test directory
cd test/core
npm run test:all
```

## Adding New Test Packages

When creating a new client package (e.g., `@trackjs/browser`), create a corresponding test package:

1. **Create directory**: `test/browser/`
2. **Add package.json**: Following the pattern of existing test packages
3. **Add to workspace**: Update root `package.json` workspaces array
4. **Create tests**: Environment-specific test scenarios
5. **Update scripts**: Add convenience scripts to root package.json

### Example package.json for new test package:
```json
{
  "name": "@trackjs/test-browser",
  "version": "1.0.0",
  "description": "Test suite for @trackjs/browser package", 
  "private": true,
  "type": "module",
  "scripts": {
    "test:basic": "node basic-test.js",
    "test:dom": "node dom-test.js",
    "test:integration": "node integration-test.js",
    "test:all": "npm run test:basic && npm run test:dom && npm run test:integration"
  },
  "dependencies": {
    "@trackjs/core": "file:../../packages/core",
    "@trackjs/browser": "file:../../packages/browser"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "jsdom": "^22.0.0"
  }
}
```

## Benefits of This Structure

- ✅ **Environment-specific testing** - Each test package can have appropriate dependencies
- ✅ **Package isolation** - Tests are clearly associated with specific packages  
- ✅ **Integration verification** - Dedicated space for cross-package testing
- ✅ **Scalability** - Easy to add new test packages as client packages are created
- ✅ **Clear separation** - Production code in `packages/`, test code in `test/`
- ✅ **Independent versioning** - Each test package manages its own dependencies