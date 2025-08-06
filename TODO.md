# TODO

- Top-level Readme
- Build Actions
- Deploy/Publish actions

## core

- `const tjs = TrackJS.createClient(key: string, options: Partial<Options>)` that creates a user-managed clone of the root agent. It has the same API as TrackJS and copies over any metadata/telemetry from the core.
  - `getClient(key)`, `setCurrentClient(key)`, `removeClient(key)` to let the user manage the active client when `TrackJS` is used. The root client cannot be removed.
- Metadata data lifecycle
- Telemetry data lifecycle
- Dependencies
- UserAgent settings
- Internal fault/error management
- Usage
- Console Wrapping utility/option
- Default onError wrappers for throttling, deduplication
- onError
- onTelemetry
- Offline Support
- Readme

## node

- implement a simple node client with core to make sure it works as expected for what needs to be done
