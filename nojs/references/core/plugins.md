# No.JS Plugin System Reference

Plugins extend NoJS with custom directives, filters, validators, interceptors, and global reactive variables.

## Contents

- [Plugin Registration](#plugin-registration)
  - [NoJS.use(plugin, options?)](#nojsuseplugin-options)
  - [Object Form](#object-form)
  - [Function Shorthand](#function-shorthand)
  - [Options](#options)
  - [Duplicate Detection](#duplicate-detection)
- [Plugin Interface](#plugin-interface)
  - [TypeScript Definitions](#typescript-definitions)
- [Lifecycle](#lifecycle)
  - [install(app, options)](#installapp-options)
  - [init(app)](#initapp)
  - [dispose(app)](#disposeapp)
- [Reactive Globals](#reactive-globals)
  - [NoJS.global(name, value)](#nojsglobalname-value)
  - [Naming Conventions](#naming-conventions)
  - [Reserved Names](#reserved-names)
  - [Reactivity](#reactivity)
  - [Ownership Tracking](#ownership-tracking)
  - [Security Validations](#security-validations)
- [Interceptor Sentinels](#interceptor-sentinels)
  - [NoJS.CANCEL](#nojscancel)
  - [NoJS.RESPOND](#nojsrespond)
  - [NoJS.REPLACE](#nojsreplace)
- [Trusted Interceptors](#trusted-interceptors)
  - [Granting Trusted Access](#granting-trusted-access)
  - [Redacted Request Headers](#redacted-request-headers)
  - [Redacted Response Headers](#redacted-response-headers)
- [Disposal](#disposal)
  - [NoJS.dispose()](#nojsdispose)
  - [Disposal Order](#disposal-order)
  - [Async Dispose](#async-dispose)
  - [Constraints](#constraints)
- [Directive Registry Freezing](#directive-registry-freezing)
- [Security](#security)
  - [Prototype Pollution Protection](#prototype-pollution-protection)
  - [Dangerous Function Blocking](#dangerous-function-blocking)
  - [Plugin Name Validation](#plugin-name-validation)
  - [Ownership Tracking](#ownership-tracking-1)
  - [Interceptor Isolation](#interceptor-isolation)
- [Events](#events)
- [Complete Examples](#complete-examples)
  - [Analytics Plugin](#analytics-plugin)
  - [Auth Plugin (Trusted)](#auth-plugin-trusted)
  - [Offline Guard Plugin](#offline-guard-plugin)
  - [Feature Flags Plugin](#feature-flags-plugin)
  - [Custom Directive Plugin](#custom-directive-plugin)
- [Best Practices](#best-practices)

---

## Plugin Registration

### NoJS.use(plugin, options?)

Register a plugin before or after `NoJS.init()`.

| Parameter | Type | Description |
|-----------|------|-------------|
| `plugin` | object\|function | Plugin object with `name` + `install`, or a function shorthand |
| `options` | any | Optional. Passed as the second argument to `install()` |

### Object Form

```javascript
const MyPlugin = {
  name: 'my-plugin',
  install(app, options) {
    app.directive('tooltip', { /* ... */ });
    app.filter('initials', (v) => /* ... */);
    app.global('$myVar', 42);
  },
  init(app) {
    // called after NoJS.init() completes
  },
  dispose(app) {
    // called during NoJS.dispose()
  }
};

NoJS.use(MyPlugin);
```

### Function Shorthand

A plain function is treated as `install()`. The plugin name is inferred from the function name or defaults to `"anonymous"`.

```javascript
NoJS.use(function analytics(app) {
  app.interceptor('request', (url, opts) => {
    trackRequest(url);
    return opts;
  });
});

// Arrow function (anonymous)
NoJS.use((app) => {
  app.filter('greet', (name) => `Hello, ${name}!`);
});
```

### Options

Options are passed through to `install()` as the second argument:

```javascript
NoJS.use(AnalyticsPlugin, {
  trackingId: 'UA-XXXXX',
  debug: false,
  sampleRate: 0.1
});
```

### Duplicate Detection

A plugin name can only be registered once:

```javascript
NoJS.use(pluginA);     // installed
NoJS.use(pluginA);     // silently skipped (same object reference)
NoJS.use(pluginB);     // warning + ignored if pluginB.name === pluginA.name
```

---

## Plugin Interface

A plugin object may have the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Unique plugin identifier |
| `install` | function | Yes | Called immediately when `NoJS.use()` is invoked |
| `init` | function | No | Called after `NoJS.init()` completes |
| `dispose` | function | No | Called during `NoJS.dispose()` (reverse order) |
| `trusted` | boolean | No | Grant trusted interceptor access (bypasses header redaction) |

### TypeScript Definitions

```typescript
interface NoJSPlugin {
  name: string;
  trusted?: boolean;
  install(app: NoJSInstance, options?: any): void;
  init?(app: NoJSInstance): void;
  dispose?(app: NoJSInstance): void | Promise<void>;
}

type NoJSPluginFunction = (app: NoJSInstance, options?: any) => void;
```

---

## Lifecycle

### install(app, options)

Called synchronously when `NoJS.use(plugin, options)` is invoked. This is where the plugin registers its directives, filters, validators, interceptors, and globals.

The `app` parameter is the NoJS instance, providing access to all public API methods.

```javascript
install(app, options) {
  app.directive('my-dir', { init(el, val, ctx) { /* ... */ } });
  app.filter('my-filter', (v) => v.toUpperCase());
  app.validator('my-rule', (v) => v.length >= 3 || 'Too short');
  app.global('$myGlobal', { count: 0 });
  app.interceptor('request', (url, opts) => opts);
}
```

### init(app)

Called after `NoJS.init()` completes (DOM is processed, router is running). Use for setup that depends on the DOM being ready.

```javascript
init(app) {
  // DOM is ready, router is active
  console.log('Current route:', app.router.path);
}
```

### dispose(app)

Called during `NoJS.dispose()` in reverse installation order. Can be synchronous or return a `Promise`. Each plugin has a 3-second timeout for disposal.

```javascript
dispose(app) {
  // Clean up intervals, observers, connections
  clearInterval(this._interval);
  this._ws?.close();
}
```

---

## Reactive Globals

### NoJS.global(name, value)

Set a global reactive variable accessible in all expressions as `$name`.

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Variable name (without `$` prefix) |
| `value` | any | The value (primitives and objects both work) |

```javascript
NoJS.global('theme', 'dark');
NoJS.global('user', { name: 'Erick', role: 'admin' });
```

```html
<div class-dark="$theme === 'dark'">
  Welcome, <span bind="$user.name"></span>
</div>
```

### Naming Conventions

- Global names are accessed in templates with the `$` prefix: `$myGlobal`
- Use camelCase for names: `$currentUser`, `$themeMode`
- Plugin-specific globals should include the plugin name: `$authUser`, `$analyticsReady`

### Reserved Names

The following names cannot be used as global variable names:

`store`, `route`, `router`, `i18n`, `refs`, `form`, `parent`, `watch`, `set`, `notify`, `raw`, `isProxy`, `listeners`, `app`, `config`, `env`, `debug`, `version`, `plugins`, `globals`, `el`, `event`, `self`, `this`, `super`, `window`, `document`, `toString`, `valueOf`, `hasOwnProperty`

### Reactivity

Object values assigned via `NoJS.global()` become deeply reactive. Property changes automatically trigger re-evaluation of dependent expressions.

```javascript
NoJS.global('counter', { value: 0 });
// Later:
// Changing $counter.value in an expression re-renders all dependents
```

### Ownership Tracking

When `NoJS.global()` is called during `NoJS.use()`, the global is tracked as owned by that plugin. During `NoJS.dispose()`, plugin-owned globals are cleaned up automatically.

### Security Validations

1. `name` must be a non-empty string
2. `name` must not be in the reserved names set
3. `name` must not be a forbidden key (`__proto__`, `constructor`, `prototype`)
4. `value` must not reference `eval` or `Function`

---

## Interceptor Sentinels

Sentinel symbols control interceptor flow. They are read-only, non-configurable properties on the `NoJS` object.

### NoJS.CANCEL

Return from a request interceptor to abort the request entirely. No network call is made. The request fails with an `AbortError`.

```javascript
NoJS.interceptor('request', (url, opts) => {
  if (isMaintenanceMode()) return NoJS.CANCEL;
  return opts;
});
```

Cancelled requests are never retried, regardless of the `retries` config.

### NoJS.RESPOND

Return `{ __nojs__: NoJS.RESPOND, body: data }` from a request interceptor to short-circuit with mock data. No network request is made.

```javascript
NoJS.interceptor('request', (url, opts) => {
  const cached = getFromCache(url);
  if (cached) return { __nojs__: NoJS.RESPOND, body: cached };
  return opts;
});
```

### NoJS.REPLACE

Return `{ __nojs__: NoJS.REPLACE, body: data }` from a response interceptor to replace the response body.

```javascript
NoJS.interceptor('response', (response) => {
  if (response.url.includes('/v1/')) {
    const transformed = migrateV1ToV2(response.data);
    return { __nojs__: NoJS.REPLACE, body: transformed };
  }
  return response;
});
```

**Summary**:

| Sentinel | Type | Effect |
|----------|------|--------|
| `NoJS.CANCEL` | Request | Abort -- no network call, no data |
| `NoJS.RESPOND` | Request | Skip network -- use provided mock body |
| `NoJS.REPLACE` | Response | Replace the response body with new data |

---

## Trusted Interceptors

By default, interceptors receive redacted headers and proxy-wrapped responses to prevent credential leakage. Trusted plugins bypass these restrictions.

### Granting Trusted Access

Set `trusted: true` on the plugin object **before** calling `NoJS.use()`:

```javascript
const AuthPlugin = {
  name: 'auth',
  trusted: true,
  install(app) {
    app.interceptor('request', (url, opts) => {
      // Can see and modify Authorization, Cookie, etc.
      const token = getToken();
      opts.headers['Authorization'] = `Bearer ${token}`;
      return opts;
    });
  }
};

NoJS.use(AuthPlugin);
```

### Redacted Request Headers

Sensitive headers stripped from request options for untrusted interceptors:

- `authorization`
- `x-api-key`
- `x-auth-token`
- `cookie`
- `proxy-authorization`
- `set-cookie`
- `x-csrf-token`
- Any header matching `/^x-(auth|api)-/i`

### Redacted Response Headers

Sensitive headers stripped from the response proxy for untrusted interceptors:

- `set-cookie`
- `x-csrf-token`
- `x-auth-token`
- `www-authenticate`
- `proxy-authenticate`

---

## Disposal

### NoJS.dispose()

Tear down the NoJS instance. Returns a `Promise`.

```javascript
await NoJS.dispose();
```

### Disposal Order

1. Plugin `dispose()` methods are called in **reverse installation order** (LIFO)
2. Each plugin has a **3-second timeout** for disposal
3. All interceptors are cleared
4. All globals are cleared
5. All stores are cleared
6. All event bus listeners are cleared
7. The router is destroyed
8. Initialization state is reset (allowing `NoJS.init()` to be called again)

### Async Dispose

Plugin `dispose()` may return a `Promise`:

```javascript
dispose(app) {
  return fetch('/api/analytics/flush', { method: 'POST' });
}
```

### Constraints

- Interceptor registration is blocked during `dispose()` -- a warning is logged
- Globals registered during `install()` are automatically cleaned up
- Store watchers and route watchers are cleared

---

## Directive Registry Freezing

After all core directives are registered (during module loading), the directive registry is frozen. This means:

- Plugins **can** register NEW directive names via `NoJS.directive()`
- Plugins **cannot** override or replace built-in directive names
- Attempting to re-register a core directive name logs a warning and is ignored

```javascript
// OK: new directive name
NoJS.directive('tooltip', { init(el, v) { /* ... */ } });

// Blocked: "bind" is a core directive
NoJS.directive('bind', { init(el, v) { /* ... */ } }); // warning, ignored
```

---

## Security

### Prototype Pollution Protection

Global names and spread operations filter `__proto__`, `constructor`, and `prototype`.

### Dangerous Function Blocking

Values passed to `NoJS.global()` are checked against a set of dangerous function references (`eval`, `Function`). Matching values are rejected.

### Plugin Name Validation

Plugin names must be non-empty strings. Empty or non-string names throw a `TypeError`.

### Ownership Tracking

Globals and interceptors registered during `NoJS.use()` are tagged with the plugin name. This enables:
- Accurate disposal during `NoJS.dispose()`
- Debugging which plugin registered which state
- Preventing one plugin from interfering with another's state

### Interceptor Isolation

Untrusted interceptors receive:
- Redacted request headers
- Proxy-wrapped response objects (preventing mutation)
- Redacted URL query parameters
- Redacted response headers

See the [Security Reference](security.md) for complete details.

---

## Events

Plugins can subscribe to framework events via `NoJS.on()`:

```javascript
install(app) {
  app.on('ready', () => { /* framework initialized */ });
  app.on('route:change', (route) => { /* navigation occurred */ });
  app.on('store:change', (data) => { /* store updated */ });
  app.on('locale:change', (locale) => { /* locale switched */ });
  app.on('dispose', () => { /* framework tearing down */ });
}
```

---

## Complete Examples

### Analytics Plugin

```javascript
const AnalyticsPlugin = {
  name: 'analytics',
  install(app, options) {
    const { trackingId, sampleRate = 1.0 } = options;

    // Track page views on route changes
    app.on('route:change', (route) => {
      if (Math.random() > sampleRate) return;
      sendAnalytics('pageview', {
        trackingId,
        path: route.path,
        params: route.params
      });
    });

    // Track API calls
    app.interceptor('request', (url, opts) => {
      sendAnalytics('api_call', { url, method: opts.method || 'GET' });
      return opts;
    });

    // Track errors
    app.interceptor('response', (response) => {
      if (response.status >= 400) {
        sendAnalytics('api_error', {
          url: response.url,
          status: response.status
        });
      }
      return response;
    });

    // Expose analytics state
    app.global('analytics', { ready: true, trackingId });
  },

  dispose() {
    flushAnalyticsQueue();
  }
};

NoJS.use(AnalyticsPlugin, { trackingId: 'UA-XXXXX', sampleRate: 0.5 });
```

### Auth Plugin (Trusted)

```javascript
const AuthPlugin = {
  name: 'auth',
  trusted: true,
  install(app) {
    app.interceptor('request', (url, opts) => {
      const token = app.store.auth?.token;
      if (token) {
        opts.headers = opts.headers || {};
        opts.headers['Authorization'] = `Bearer ${token}`;
      }
      return opts;
    });

    app.interceptor('response', (response) => {
      if (response.status === 401) {
        app.store.auth.token = null;
        app.store.auth.user = null;
        app.notify();
        app.router.push('/login');
      }
      return response;
    });
  }
};

NoJS.use(AuthPlugin);
```

### Offline Guard Plugin

```javascript
const OfflinePlugin = {
  name: 'offline-guard',
  install(app) {
    app.interceptor('request', (url, opts) => {
      if (!navigator.onLine) return NoJS.CANCEL;
      return opts;
    });

    app.global('online', navigator.onLine);
    window.addEventListener('online', () => app.global('online', true));
    window.addEventListener('offline', () => app.global('online', false));
  }
};
```

### Feature Flags Plugin

```javascript
const FeatureFlagsPlugin = {
  name: 'feature-flags',
  install(app, options) {
    const flags = options.flags || {};
    app.global('flags', flags);

    app.directive('feature', {
      init(el, value, ctx) {
        const flagName = el.getAttribute('feature');
        if (!flags[flagName]) {
          el.style.display = 'none';
          el.setAttribute('aria-hidden', 'true');
        }
      }
    });
  }
};

NoJS.use(FeatureFlagsPlugin, {
  flags: { darkMode: true, newDashboard: false }
});
```

```html
<div feature="darkMode">Dark mode toggle here</div>
<div feature="newDashboard">Coming soon...</div>
```

### Custom Directive Plugin

```javascript
const LazyLoadPlugin = {
  name: 'lazy-load',
  install(app) {
    app.directive('lazy-src', {
      init(el, value, ctx) {
        const observer = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) {
            el.src = value;
            observer.disconnect();
          }
        }, { rootMargin: '200px' });
        observer.observe(el);
      },
      destroy(el) {
        el._observer?.disconnect();
      }
    });
  }
};
```

```html
<img lazy-src="images/photo.jpg" alt="Lazy loaded photo">
```

---

## Best Practices

1. **Name plugins uniquely** -- Use a namespace prefix for shared plugins (e.g., `myorg-analytics`)
2. **Clean up in `dispose()`** -- Remove intervals, observers, WebSocket connections, and event listeners
3. **Use `init()` for DOM-dependent setup** -- Registration goes in `install()`, DOM operations go in `init()`
4. **Keep plugins focused** -- One concern per plugin (auth, analytics, feature flags)
5. **Use `trusted: true` sparingly** -- Only for plugins that genuinely need access to credentials
6. **Prefer `NoJS.global()` over direct store mutation** -- Globals have built-in security checks
7. **Document your plugin's globals** -- Users need to know which `$variables` your plugin exposes
