// Note: This assumes the TrackJS Core package is built and available
// You may need to adjust the import path based on your build setup

let Client, serialize;

// Try to import the modules (will need to be built first)
async function loadModules() {
    try {
        // This would need to point to the built version
        const module = await import('../../packages/core/dist/esm/index.js');
        Client = module.Client;
        serialize = module.serialize;
        return true;
    } catch (error) {
        console.error('Failed to load modules:', error);
        return false;
    }
}

function updateStatus(testId, passed) {
    const statusEl = document.getElementById(`${testId}-status`);
    statusEl.textContent = passed ? 'PASS' : 'FAIL';
    statusEl.className = `status ${passed ? 'pass' : 'fail'}`;
}

function logResult(testId, content, isError = false) {
    const resultEl = document.getElementById(`${testId}-result`);
    resultEl.textContent = content;
    resultEl.className = `result ${isError ? 'error' : ''}`;
}

window.testImport = async function() {
    try {
        const loaded = await loadModules();
        if (loaded && Client && serialize) {
            logResult('import', '✅ Successfully imported Client and serialize from @trackjs/core');
            updateStatus('import', true);
        } else {
            throw new Error('Modules not loaded properly');
        }
    } catch (error) {
        logResult('import', `❌ Import failed: ${error.message}`, true);
        updateStatus('import', false);
    }
};

window.testSerializer = async function() {
    try {
        if (!serialize) {
            await loadModules();
        }

        const testData = {
            string: 'Hello "Browser" World',
            number: 42,
            boolean: true,
            date: new Date(),
            bigint: BigInt(123456789),
            array: [1, 2, { nested: 'value' }],
            promise: Promise.resolve('test'),
            error: new Error('Test error')
        };

        const result = serialize(testData);
        
        logResult('serializer', 
            `Input: ${JSON.stringify(testData, (k, v) => 
                typeof v === 'bigint' ? v.toString() + 'n' : 
                v instanceof Date ? v.toISOString() : 
                v instanceof Promise ? '[Promise]' : 
                v instanceof Error ? `[Error: ${v.message}]` : v
            , 2)}\n\nSerialized: ${result}`
        );
        updateStatus('serializer', true);
    } catch (error) {
        logResult('serializer', `❌ Serialization failed: ${error.message}`, true);
        updateStatus('serializer', false);
    }
};

window.testClient = async function() {
    try {
        if (!Client) {
            await loadModules();
        }

        // Mock transport for browser
        const mockTransport = {
            send: async (request) => {
                console.log('📤 Browser transport received:', request);
                return { status: 200, data: { success: true } };
            }
        };

        const client = new Client({
            token: 'browser-test-token',
            url: 'https://api.trackjs.com/v1/track',
            transport: mockTransport,
            application: 'browser-test-app',
            version: '1.0.0'
        });

        // Test metadata
        client.addMetadata('userAgent', navigator.userAgent);
        client.addMetadata('viewport', {
            width: window.innerWidth,
            height: window.innerHeight
        });

        // Test telemetry
        client.addTelemetry('navigation', {
            from: 'home',
            to: 'test-page',
            timestamp: Date.now()
        });

        logResult('client', 
            '✅ Client created successfully\n' +
            '✅ Metadata added (userAgent, viewport)\n' +
            '✅ Telemetry added (navigation)\n' +
            'Check browser console for transport logs'
        );
        updateStatus('client', true);
    } catch (error) {
        logResult('client', `❌ Client test failed: ${error.message}`, true);
        updateStatus('client', false);
    }
};

window.testErrorTracking = async function() {
    try {
        if (!Client) {
            await loadModules();
        }

        const mockTransport = {
            send: async (request) => {
                console.log('📤 Error tracking transport:', request);
                return { status: 200, data: { success: true } };
            }
        };

        const client = new Client({
            token: 'error-test-token',
            url: 'https://api.trackjs.com/v1/track',
            transport: mockTransport
        });

        // Test error tracking
        try {
            // Simulate a browser-specific error
            document.querySelector('#non-existent-element').click();
        } catch (error) {
            await client.track(error, {
                context: 'browser-test',
                url: window.location.href,
                timestamp: new Date().toISOString()
            });
        }

        // Test string error
        await client.track('Custom error message', {
            level: 'warning',
            source: 'manual-test'
        });

        logResult('error', 
            '✅ DOM error tracked successfully\n' +
            '✅ String error tracked successfully\n' +
            'Check browser console for transport logs'
        );
        updateStatus('error', true);
    } catch (error) {
        logResult('error', `❌ Error tracking failed: ${error.message}`, true);
        updateStatus('error', false);
    }
};

window.testBrowserSpecific = async function() {
    try {
        if (!serialize) {
            await loadModules();
        }

        // Test browser-specific objects
        const browserData = {
            location: {
                href: window.location.href,
                hostname: window.location.hostname,
                pathname: window.location.pathname
            },
            navigator: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform,
                cookieEnabled: navigator.cookieEnabled
            },
            screen: {
                width: screen.width,
                height: screen.height,
                availWidth: screen.availWidth,
                availHeight: screen.availHeight
            },
            performance: {
                now: performance.now(),
                timeOrigin: performance.timeOrigin
            }
        };

        const serialized = serialize(browserData, { depth: 2 });

        // Test custom handlers for browser objects
        const domHandler = {
            test: (thing) => thing && thing.nodeType === 1,
            serialize: (el) => `<${el.tagName.toLowerCase()}${el.id ? ` id="${el.id}"` : ''}>`
        };

        const testElement = document.body;
        const elementSerialized = serialize(testElement, { handlers: [domHandler] });

        logResult('browser', 
            `Browser Data Serialized:\n${serialized}\n\n` +
            `DOM Element Serialized: ${elementSerialized}\n\n` +
            '✅ Browser-specific serialization working'
        );
        updateStatus('browser', true);
    } catch (error) {
        logResult('browser', `❌ Browser-specific test failed: ${error.message}`, true);
        updateStatus('browser', false);
    }
};

window.runAllTests = async function() {
    const tests = ['import', 'serializer', 'client', 'error', 'browser'];
    let passed = 0;
    let total = tests.length;

    logResult('summary', 'Running all tests...\n');

    for (const test of tests) {
        try {
            await window[`test${test.charAt(0).toUpperCase() + test.slice(1)}`]();
            const statusEl = document.getElementById(`${test}-status`);
            if (statusEl.textContent === 'PASS') passed++;
        } catch (error) {
            console.error(`Test ${test} failed:`, error);
        }
    }

    const summary = `\n🎯 Test Summary:\n` +
                   `Passed: ${passed}/${total}\n` +
                   `Success Rate: ${Math.round((passed/total) * 100)}%\n\n` +
                   `${passed === total ? '🎉 All tests passed!' : '⚠️ Some tests failed'}`;

    logResult('summary', summary);
};

// Auto-load modules when page loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 TrackJS Core Browser Test loaded');
    console.log('Click the buttons to run individual tests or "Run All Tests" for everything');
});