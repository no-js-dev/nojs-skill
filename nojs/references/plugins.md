# No.JS Plugin System Reference

The plugin system extends No.JS with reusable packages -- analytics, auth, feature flags, UI libraries -- without modifying the core framework. Plugins can register interceptors, inject reactive globals, add custom directives, and hook into the app lifecycle.

---

## Table of Contents

- [Plugin Registration](#plugin-registration) -- NoJS.use(), object form, function shorthand, options
- [Plugin Interface](#plugin-interface) -- name, version, capabilities, install, init, dispose
- [Lifecycle](#lifecycle) -- installation, initialization, disposal flow
- [Reactive Globals](#reactive-globals) -- NoJS.global(), $name access, reserved names, reactivity
- [Interceptor Sentinels](#interceptor-sentinels) -- CANCEL, RESPOND, REPLACE symbols
- [Trusted Interceptors](#trusted-interceptors) -- header redaction, trusted access
- [Disposal](#disposal) -- NoJS.dispose(), reverse order, timeouts
- [Directive Registry Freezing](#directive-registry-freezing) -- core directive protection
- [Security](#security) -- prototype pollution, eval/Function blocking, ownership tracking
- [Complete Examples](#complete-examples) -- analytics plugin, auth plugin, feature flags

---

## Plugin Registration

### `NoJS.use(plugin, options?)`

Register a plugin before or after `NoJS.init()`. If the app is already initialized, the plugin's `init` hook runs immediately.

| Parameter | Type | Description |
|-----------|------|-------------|
| `plugin` | object \| function | Plugin object or named install function |
| `options` | object | Optional configuration passed to the plugin's `install` function |

```javascript
// Object form
NoJS.use(analyticsPlugin);

// With options
NoJS.use(authPlugin, { trusted: true, apiKey: 'xxx' });

// Function shorthand (named functions only)
NoJS.use(function myLogger(app, options) {
  app.interceptor('request', (url, opts) => {
    console.log(`[${options.prefix || 'LOG'}]`, url);
    return opts;
  });
}, { prefix: 'API' });
```

### Object Form

The standard way to define a plugin:

```javascript
const analyticsPlugin = {
  name: 'analytics',
  version: '1.0.0',
  capabilities: ['interceptors', 'globals'],

  install(app, options) {
    // Called immediately by NoJS.use()
    app.global('analytics', { pageViews: 0 });
    app.interceptor('response', (response, url) => {
      // Track API calls
      return response;
    });
  },

  init(app) {
    // Called after NoJS.init() completes
    console.log('Analytics ready');
  },

  dispose(app) {
    // Called during NoJS.dispose()
    console.log('Analytics disposed');
  }
};
```

### Function Shorthand

For simple plugins, pass a named function. The function name becomes the plugin name:

```javascript
function myLogger(app, options) {
  app.interceptor('request', (url, opts) => {
    console.log(`[${options.prefix || 'LOG'}]`, url);
    return opts;
  });
}

NoJS.use(myLogger, { prefix: 'API' });
```

**Constraints:**
- Anonymous functions are rejected -- the plugin must have a name
- Arrow functions are rejected -- they have no `.name` property in the required form
- The function name must not be `"anonymous"`

### Options

The second argument to `NoJS.use()` is passed to the plugin's `install` function:

```javascript
NoJS.use(analyticsPlugin, {
  trackingId: 'UA-123456',
  debug: true
});
```

The `trusted` option is special -- see [Trusted Interceptors](#trusted-interceptors) below.

### Duplicate Detection

A plugin name can only be registered once:

```javascript
NoJS.use(pluginA);     // installed
NoJS.use(pluginA);     // silently skipped (same object reference)
NoJS.use(pluginB);     // warning + ignored if pluginB.name === pluginA.name
```

---

## Plugin Interface

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | `string` | Yes | Unique, non-empty identifier. Duplicate names are rejected |
| `version` | `string` | No | Semver string for debugging |
| `capabilities` | `string[]` | No | Declared capabilities (logged in debug mode). Values: `directives`, `filters`, `validators`, `interceptors`, `globals`, `events`, `config`, `stores` |
| `install` | `function(app, options)` | Yes | Called synchronously by `NoJS.use()` |
| `init` | `function(app)` | No | Called after `NoJS.init()` completes (DOM is ready) |
| `dispose` | `function(app)` | No | Called during `NoJS.dispose()` for cleanup |

### TypeScript Definitions

```typescript
interface NoJSPlugin {
  name: string;
  version?: string;
  capabilities?: PluginCapability[];
  install(nojs: NoJSInstance, options?: Record<string, unknown>): void;
  init?(nojs: NoJSInstance): void | Promise<void>;
  dispose?(nojs: NoJSInstance): void | Promise<void>;
}

type PluginCapability =
  | "directives" | "filters" | "validators" | "interceptors"
  | "globals" | "events" | "config" | "stores";
```

Full TypeScript definitions available in the framework at `types/nojs-plugin.d.ts`, including `NoJSInstance` (full app API surface), `RequestInterceptorFn`, `ResponseInterceptorFn`, and sentinel result types (`RequestInterceptorResult`, `RespondInterceptorResult`, `ReplaceInterceptorResult`).

---

## Lifecycle

```
NoJS.use(plugin)     ->  plugin.install(app, options)   [synchronous]
NoJS.init()          ->  ... DOM processed ...  ->  plugin.init(app)   [async allowed]
NoJS.dispose()       ->  plugin.dispose(app)  ->  ... teardown ...     [async allowed, 3s timeout]
```

### install(app, options)

- Runs **immediately** and **synchronously** during `NoJS.use()`
- Use to register interceptors, globals, directives, filters, validators, event listeners, and stores
- The `app` parameter is the `NoJS` object itself
- The `options` parameter contains whatever was passed as the second argument to `NoJS.use()`

### init(app)

- Runs **after** `NoJS.init()` completes
- DOM is fully processed, router is active, stores are available
- Can be async (returns a Promise)
- If `NoJS.init()` has already been called when the plugin is installed, `init` runs immediately (awaited)
- All plugin `init` hooks run in installation order
- The `plugins:ready` event is emitted after all init hooks complete

### dispose(app)

- Runs during `NoJS.dispose()`
- Use to close WebSocket connections, clear intervals, flush pending analytics, etc.
- Can be async (returns a Promise)
- Has a **3-second timeout** -- if it exceeds the timeout, an error is logged and disposal continues
- Plugins are disposed in **reverse** installation order

---

## Reactive Globals

### `NoJS.global(name, value)`

Inject a reactive variable accessible as `$name` in any template expression.

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Variable name (without `$` prefix). Must be a valid JS identifier |
| `value` | any | The value to expose. Objects are wrapped in a reactive context |

```javascript
NoJS.global('theme', { mode: 'dark', accent: 'blue' });
NoJS.global('apiVersion', '2.1');
```

```html
<!-- Access in templates with $ prefix -->
<span bind="$theme.mode"></span>
<button on:click="$theme.mode = $theme.mode === 'dark' ? 'light' : 'dark'">
  Toggle Theme
</button>
<span bind="$apiVersion"></span>
```

### Naming Conventions

- Global names are accessed with a `$` prefix in templates: `NoJS.global('foo', ...)` becomes `$foo`
- Use your plugin name as a namespace to avoid collisions: `$analytics`, `$auth`, `$featureFlags`
- Name must start with a letter, `_`, or `$`, and contain only `[a-zA-Z0-9_$]`

### Reserved Names

The following names cannot be used with `NoJS.global()`:

`store`, `route`, `router`, `i18n`, `refs`, `form`, `parent`, `watch`, `set`, `notify`, `raw`, `isProxy`, `listeners`, `app`, `config`, `env`, `debug`, `version`, `plugins`, `globals`, `el`, `event`, `self`, `this`, `super`, `window`, `document`, `toString`, `valueOf`, `hasOwnProperty`

Prototype pollution vectors are also blocked: `__proto__`, `constructor`, `prototype`.

### Reactivity

Object values passed to `NoJS.global()` are automatically wrapped in a reactive context. Mutations trigger DOM updates just like store or state changes:

```javascript
NoJS.global('user', { name: 'Guest', role: 'viewer' });
```

```html
<!-- Updates reactively when $user.name changes -->
<span bind="$user.name"></span>
<button on:click="$user.name = 'John'">Set Name</button>
```

Primitive values (strings, numbers, booleans) are stored as-is and trigger a full re-evaluation of any expression that references them when changed via a subsequent `NoJS.global()` call.

### Ownership Tracking

When called inside a plugin's `install()`, the global is tracked as owned by that plugin. If a different plugin overwrites that global, a warning is logged:

```
[No.JS] Global "$theme" owned by "ui-kit" is being overwritten.
```

### Security Validations

1. **Identifier check** -- name must match `/^[a-zA-Z_$][a-zA-Z0-9_$]*$/`
2. **Reserved name check** -- name must not be in the reserved list
3. **Prototype pollution check** -- `__proto__`, `constructor`, `prototype` are blocked
4. **Dangerous reference check** -- `eval` and `Function` references are rejected, even nested inside objects
5. **Object sanitization** -- serializable objects are JSON-round-tripped to strip `__proto__` keys; non-serializable objects are deep-checked for dangerous references

---

## Interceptor Sentinels

Request and response interceptors can return special objects keyed by Symbol sentinels to control the fetch pipeline.

### `NoJS.CANCEL` -- Abort the Request

Return `{ [NoJS.CANCEL]: true }` from a **request** interceptor to prevent the request from being sent. The fetch throws a `DOMException` with name `"AbortError"`.

```javascript
NoJS.interceptor('request', (url, opts) => {
  if (!navigator.onLine) {
    return { [NoJS.CANCEL]: true };
  }
  return opts;
});
```

### `NoJS.RESPOND` -- Short-Circuit with Mock Data

Return `{ [NoJS.RESPOND]: data }` from a **request** interceptor to skip the HTTP call and use `data` directly as the response.

```javascript
const cache = new Map();

NoJS.interceptor('request', (url, opts) => {
  if (opts.method === 'GET' && cache.has(url)) {
    return { [NoJS.RESPOND]: cache.get(url) };
  }
  return opts;
});
```

### `NoJS.REPLACE` -- Replace Response Data

Return `{ [NoJS.REPLACE]: data }` from a **response** interceptor to replace the parsed response body entirely.

```javascript
NoJS.interceptor('response', (response, url) => {
  if (url.includes('/users')) {
    return {
      [NoJS.REPLACE]: {
        timestamp: Date.now(),
        source: url
      }
    };
  }
  return response;
});
```

### Summary

| Sentinel | Used In | Effect |
|----------|---------|--------|
| `NoJS.CANCEL` | Request interceptor | Aborts the request (throws `AbortError`) |
| `NoJS.RESPOND` | Request interceptor | Returns data directly, skips HTTP call |
| `NoJS.REPLACE` | Response interceptor | Replaces the parsed response body |

All three are read-only `Symbol` properties on the `NoJS` object. They cannot be reassigned.

---

## Trusted Interceptors

By default, interceptors registered by plugins receive **redacted** copies of requests and responses -- sensitive headers and URL parameters are stripped or replaced with `[REDACTED]`.

### Granting Trusted Access

Install a plugin with `{ trusted: true }` to give its interceptors full, unredacted access:

```javascript
NoJS.use(authPlugin, { trusted: true });
```

A console warning is always logged when a plugin is installed with trusted access. Only grant `trusted` to plugins you control or have audited.

### Redacted Request Headers

Sensitive headers stripped before passing to untrusted interceptors:

`authorization`, `x-api-key`, `x-auth-token`, `cookie`, `proxy-authorization`, `set-cookie`, `x-csrf-token`

Headers matching the pattern `x-auth-*` or `x-api-*` are also redacted.

### Redacted Response Headers

Sensitive headers stripped from the response proxy for untrusted interceptors:

`set-cookie`, `x-csrf-token`, `x-auth-token`, `www-authenticate`, `proxy-authenticate`

### How It Works

1. During `plugin.install()`, the `_currentPluginName` is set to the plugin name
2. Any interceptor registered during install is tagged with the plugin name
3. When the fetch pipeline runs, tagged interceptors receive redacted copies unless their plugin was installed with `{ trusted: true }`
4. After the interceptor chain completes, sensitive headers are re-applied from the original options

---

## Disposal

### `NoJS.dispose()`

Tears down the entire application: disposes plugins, clears globals, removes interceptors, and resets init state.

```javascript
await NoJS.dispose();
```

Returns a `Promise` that resolves when teardown is complete.

### Disposal Order

1. Plugins are disposed in **reverse** installation order (last installed, first disposed)
2. Each plugin's `dispose` function has a **3-second timeout**. If it exceeds the timeout, an error is logged and disposal continues
3. After all plugins are disposed: globals cleared, interceptors cleared, init state reset

```
NoJS.dispose()
  -> pluginC.dispose()   (last installed)
  -> pluginB.dispose()
  -> pluginA.dispose()   (first installed)
  -> clear globals
  -> clear interceptors
  -> reset init state
```

### Async Dispose

Plugin `dispose` functions can be async:

```javascript
const analyticsPlugin = {
  name: 'analytics',
  install(app) { /* ... */ },
  async dispose(app) {
    await flushPendingEvents();   // Runs within 3s timeout
  }
};
```

### Constraints

- Plugins cannot be installed during disposal. Calls to `NoJS.use()` while `dispose()` is running are ignored with a warning
- After disposal, `NoJS.init()` can be called again to re-initialize

---

## Directive Registry Freezing

Core directives (`state`, `bind`, `get`, `on:*`, `each`, `foreach`, `if`, `show`, `model`, `validate`, etc.) are frozen after the framework loads. Plugins can register **new** directives but cannot override built-in ones:

```javascript
const myPlugin = {
  name: 'charts',
  install(app) {
    app.directive('chart', {            // new directive -- allowed
      priority: 25,
      init(el, name, value) { /* ... */ }
    });
    app.directive('bind', { /* ... */ }); // core directive -- warning, ignored
  }
};
```

The freezing is implemented via `_freezeDirectives()` which runs after all built-in directive modules are imported. The `_coreDirectives` Set tracks which names were registered before freezing.

---

## Security

### Prototype Pollution Protection

`NoJS.global()` blocks:
- Names: `__proto__`, `constructor`, `prototype` are forbidden
- Values: objects are JSON-round-tripped to strip `__proto__` keys before being wrapped in a reactive context
- Non-serializable objects are deep-checked for dangerous function references

### Dangerous Function Blocking

`eval` and `Function` references are blocked at all levels:
- Direct assignment: `NoJS.global('run', eval)` -- rejected
- Nested in objects: `NoJS.global('tools', { exec: Function })` -- rejected
- Deep nesting: `NoJS.global('nested', { a: { b: { fn: eval } } })` -- rejected

### Plugin Name Validation

- Must be a non-empty string
- Must not be `"anonymous"`
- Must be unique across all installed plugins
- Different objects with the same name log a collision warning

### Ownership Tracking

Globals registered during `plugin.install()` are tagged with the plugin name. If another plugin overwrites the same global, a warning is emitted to help debug conflicts.

### Interceptor Isolation

Response interceptors from untrusted plugins receive a frozen, redacted shell -- never the original `Response` object. Internal code uses a `WeakMap` to recover the original response.

---

## Complete Examples

### Analytics Plugin

```javascript
const analyticsPlugin = {
  name: 'analytics',
  version: '1.0.0',
  capabilities: ['interceptors', 'globals'],

  _queue: [],
  _flushInterval: null,

  install(app, options) {
    const trackingId = options.trackingId;
    if (!trackingId) {
      console.warn('[analytics] Missing trackingId option');
      return;
    }

    // Inject reactive global
    app.global('analytics', {
      pageViews: 0,
      events: []
    });

    // Track all API calls
    app.interceptor('response', (response, url) => {
      this._queue.push({
        type: 'api_call',
        url,
        status: response.status,
        timestamp: Date.now()
      });
      return response;
    });

    // Listen for route changes
    app.on('route:change', (route) => {
      this._queue.push({
        type: 'page_view',
        path: route.path,
        timestamp: Date.now()
      });
    });

    // Flush events periodically
    this._flushInterval = setInterval(() => {
      this._flush(trackingId);
    }, options.flushInterval || 10000);
  },

  init(app) {
    // Track initial page view after DOM is ready
    this._queue.push({
      type: 'page_view',
      path: location.pathname,
      timestamp: Date.now()
    });
  },

  async dispose(app) {
    clearInterval(this._flushInterval);
    await this._flush();
  },

  _flush(trackingId) {
    if (this._queue.length === 0) return;
    const events = this._queue.splice(0);
    return fetch('/analytics/collect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackingId, events })
    }).catch(() => {
      this._queue.unshift(...events);
    });
  }
};

NoJS.use(analyticsPlugin, { trackingId: 'UA-123456' });
```

```html
<span bind="$analytics.pageViews + ' page views'"></span>
```

### Auth Plugin (Trusted)

```javascript
const authPlugin = {
  name: 'auth',
  version: '1.0.0',
  capabilities: ['interceptors', 'stores'],

  install(app, options) {
    // Add auth header to every request (needs trusted access)
    app.interceptor('request', (url, opts) => {
      const token = app.store.auth?.token;
      if (token) {
        opts.headers = opts.headers || {};
        opts.headers['Authorization'] = 'Bearer ' + token;
      }
      return opts;
    });

    // Handle 401 responses
    app.interceptor('response', (response, url) => {
      if (response.status === 401) {
        app.store.auth.token = null;
        app.store.auth.user = null;
        app.notify();
        app.router?.push('/login');
      }
      return response;
    });
  }
};

// Trusted -- receives unredacted headers
NoJS.use(authPlugin, { trusted: true });
```

### Offline Guard Plugin

```javascript
NoJS.use({
  name: 'offline-guard',
  install(app) {
    app.interceptor('request', (url, opts) => {
      if (!navigator.onLine) {
        return { [app.CANCEL]: true };
      }
      return opts;
    });
  }
});
```

### Feature Flags Plugin

```javascript
const featureFlagsPlugin = {
  name: 'feature-flags',
  capabilities: ['globals'],

  install(app, options) {
    app.global('flags', options.flags || {});
  },

  init(app) {
    // Refresh flags from server after init
    fetch('/api/feature-flags')
      .then(r => r.json())
      .then(flags => {
        Object.assign(app.store?.featureFlags || {}, flags);
        app.notify();
      })
      .catch(() => {});
  }
};

NoJS.use(featureFlagsPlugin, {
  flags: {
    newDashboard: false,
    darkMode: true,
    betaFeatures: false
  }
});
```

```html
<div if="$flags.newDashboard">
  <!-- New dashboard UI -->
</div>
<div else>
  <!-- Legacy dashboard -->
</div>
```

### Custom Directive Plugin

```javascript
const tooltipPlugin = {
  name: 'tooltip',
  capabilities: ['directives'],

  install(app) {
    app.directive('tooltip', {
      priority: 25,
      init(el, attrName, value) {
        const ctx = app.findContext(el);
        const text = app.evaluate(value, ctx);
        el.title = text;
        el.style.cursor = 'help';

        // Update reactively
        ctx.$watch(() => {
          el.title = app.evaluate(value, ctx);
        });
      }
    });
  }
};

NoJS.use(tooltipPlugin);
```

```html
<span tooltip="user.name + ' (' + user.email + ')'">Hover me</span>
```

---

## Events

The plugin system emits the following events via the global event bus:

| Event | When | Data |
|-------|------|------|
| `plugins:ready` | After all plugin `init()` hooks complete | none |

Listen for it:

```javascript
NoJS.on('plugins:ready', () => {
  console.log('All plugins initialized');
});
```

---

## Best Practices

1. **Namespace everything** -- prefix globals, stores, and event names with your plugin name
2. **Validate options** -- check required options in `install` and warn early
3. **Always provide `dispose`** -- clean up intervals, connections, event listeners
4. **Avoid overwriting globals** -- check ownership before overwriting another plugin's global
5. **Use capabilities** -- declare what your plugin uses for debugging and documentation
6. **Keep `install` synchronous** -- async work belongs in `init`
7. **Don't modify core directives** -- they are frozen; register new names instead
8. **Use `trusted` sparingly** -- only for plugins that genuinely need unredacted header access
