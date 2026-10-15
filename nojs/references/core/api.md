# No.JS Public JavaScript API Reference

Complete reference for the NoJS JavaScript API surface. All methods, getters, sentinels, and utility functions.

## Contents

- [NoJS.config(options)](#nojsconfigoptions) -- Global framework configuration
- [NoJS.init(root?)](#nojsinitroot) -- Initialize or re-initialize the framework
- [NoJS.directive(name, handler)](#nojsdirectivename-handler) -- Register custom directives
- [NoJS.filter(name, fn)](#nojsfiltername-fn) -- Register custom pipe filters
- [NoJS.validator(name, fn)](#nojsvalidatorname-fn) -- Register custom form validators
- [NoJS.i18n(options)](#nojsi18noptions) -- Configure internationalization
- [NoJS.on(event, callback)](#nojsonevent-callback) -- Subscribe to lifecycle events
- [NoJS.use(plugin, options?)](#nojsuseplugin-options) -- Install plugins
- [NoJS.global(name, value)](#nojsglobalname-value) -- Set global reactive variables
- [NoJS.dispose()](#nojsdispose) -- Tear down and clean up the framework
- [NoJS.CANCEL](#nojscancel) -- Cancel sentinel for interceptors
- [NoJS.RESPOND](#nojsrespond) -- Short-circuit response sentinel
- [NoJS.REPLACE](#nojsreplace) -- Replace request sentinel
- [NoJS.interceptor(type, fn)](#nojsinterceptortype-fn) -- Register request/response interceptors
- [NoJS.store](#nojsstore) -- Global reactive state store
- [NoJS.notify()](#nojsnotify) -- Trigger reactive re-evaluation
- [NoJS.router](#nojsrouter) -- Client-side router instance
- [NoJS.locale](#nojslocale) -- Current locale getter/setter
- [NoJS.baseApiUrl](#nojsbaseapiurl) -- Base URL for fetch directives
- [NoJS.version](#nojsversion) -- Framework version string
- [NoJS.internals](#nojsinternals) -- Internal API for trusted plugins
- [Utility Functions](#utility-functions) -- Low-level helper functions
- [Special Context Variables](#special-context-variables) -- Built-in variables in expressions
- [Security](#security) -- XSS, CSP, and CSRF protections
- [Web Components Compatibility](#web-components-compatibility) -- Integration with custom elements
- [Complete Example](#complete-example)

---

## NoJS.config(options)

Configure global framework settings. Can be called before or after `NoJS.init()` and never throws. After `init()` starts, only `sanitize`, `dangerouslyDisableSanitize` and `sanitizeHtml` are locked (changing them logs a warning and is ignored), and `strictBindings` cannot be turned off once it is `true`. Both locks reset on `NoJS.dispose()`.

```javascript
NoJS.config({
  debug: false,
  baseApiUrl: 'https://api.example.com',
  headers: { 'X-Custom': 'value' },
  timeout: 10000,
  retries: 0,
  retryDelay: 1000,
  credentials: 'same-origin',
  csrf: { token: 'abc', header: 'X-CSRF-Token' },
  cache: { strategy: 'none', ttl: 300000 },
  templates: { cache: true },
  sanitize: true,
  dangerouslyDisableSanitize: false,
  exprCacheSize: 500,
  maxEventListeners: 100,
  devtools: false,
  appId: 'my-app',
  router: { /* see config.md */ },
  i18n: { /* see config.md */ },
  stores: {
    auth: { user: null, token: null },
    cart: { items: [] }
  },

  // Opt-in hardening flags (all default false = v1.21.1 behavior)
  scopeHeaders: false,
  strictRedaction: false,
  strictDirectives: false,
  strictDevtools: false,
  strictJsonld: false,
  strictBindings: false
  // plus templates.pageRelative, i18n.escapeParams, i18n.strictLocale
});
```

For the full options table with types, defaults, and detailed descriptions, see the [Configuration Reference](config.md). The hardening flags are described in [Opt-in Hardening Flags](config.md#opt-in-hardening-flags).

---

## NoJS.init(root?)

Initialize the framework on a DOM subtree. Processes all directives, loads remote templates, starts the router if configured.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `root` | Element | `document.body` | Root element to process |

```javascript
// Initialize on the full page
await NoJS.init();

// Initialize on a specific container
await NoJS.init(document.getElementById('app'));

// Calling it again returns the same Promise (no second walk).
// For HTML added later, use NoJS.processTree(el).
```

**Initialization sequence**:
1. Lock the sanitization config keys and mark as initialized (a second call returns the same Promise)
2. Load i18n locale files (when `i18n.loadPath` is set)
3. Inline template includes, then load Phase 1 remote templates (blocking)
4. Create the router if a `[route-view]` element exists
5. Process all directive attributes on the DOM tree (first paint)
6. Start the router, start Phase 2 template preloading (non-blocking), initialize devtools (if enabled)
7. Run each plugin's `init()` hook, then emit `plugins:ready` on the event bus

Returns a `Promise` that resolves when initialization is complete.

**Directive errors are isolated.** A directive whose `init` throws no longer stops the rest of the page from rendering: the error is warned on its element (`[No.JS] directive "<name>" init error on <tag>:`) and the walk continues. `NoJS.init()` still starts the router, runs plugin `init()` hooks and emits `plugins:ready`, then rejects with the first such error. Inside a reactive batch update the error is only warned. A disposer that throws is warned and does not stop the remaining disposers.

---

## NoJS.directive(name, handler)

Register a custom directive for use in HTML attributes.

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Directive name (used as `name="..."` in HTML) |
| `handler` | object\|function | Directive handler |

### Handler shape

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `init(el, name, value)` | function | Yes | Called once when the element is processed. `name` is the attribute name, `value` the raw attribute string. Evaluate it yourself with `NoJS.evaluate(value, NoJS.findContext(el))` and watch the context if it must react to changes |
| `priority` | number | No | Processing order (lower = earlier, default: `50`, after all built-in directives) |

There are no `update` or `destroy` hooks. Register cleanup for listeners, observers and timers on the element (see Custom directive utilities below).

```javascript
NoJS.directive('tooltip', {
  priority: 25,
  init(el, name, value) {
    const ctx = NoJS.findContext(el);
    const tip = document.createElement('div');
    tip.className = 'tooltip';
    tip.textContent = NoJS.evaluate(value, ctx);
    const show = () => document.body.appendChild(tip);
    const hide = () => tip.remove();
    el.addEventListener('mouseenter', show);
    el.addEventListener('mouseleave', hide);
    el.__disposers = el.__disposers || [];
    el.__disposers.push(() => {
      el.removeEventListener('mouseenter', show);
      el.removeEventListener('mouseleave', hide);
      tip.remove();
    });
  }
});
```

```html
<div tooltip="'Saved!'">Hover me</div>
```

A directive whose `init` throws is isolated: the error is warned on its element and the rest of the page keeps rendering.

### Registry freezing and wildcard names

Core directive names are frozen as soon as No.JS loads, before `NoJS.init()` runs: registering one logs `Cannot override core directive "<name>".` and is ignored. A name is also locked once it has been registered, so a later registration cannot replace it.

Custom directives cannot declare their own wildcard patterns; only the core wildcards `on:*`, `bind-*`, `class-*` and `style-*` exist. A custom name that one of them would otherwise handle, such as `on:clickoutside`, `class-x` or `bind-chart`, is accepted and wins for that exact attribute only (debug mode logs `Directive "bind-chart" shadows core "bind-*" for that attribute.`). Set `NoJS.config({ strictDirectives: true })` before any `NoJS.directive()` or `NoJS.use()` call to reject such names too.

### Custom directive utilities

| Utility | Description |
|---------|-------------|
| `_onDispose(fn)` | Register a cleanup callback on the element currently being processed |
| `_watchExpr(expr, ctx, fn)` | Watch an expression for changes with automatic store subscription |
| `_disposeTree(root)` | Dispose all directives on a DOM subtree |
| `_disposeChildren(parent)` | Dispose descendants only (not the parent) |
| `el.__declared = false` | Force re-processing by `processTree()` on next pass |

---

## NoJS.filter(name, fn)

Register a custom filter for use in pipe expressions.

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Filter name used after `\|` in expressions |
| `fn` | function | Transform function. First argument is the piped value; additional arguments follow |

Built-in filter names are protected and cannot be overridden (see [Filters Reference](filters.md) for the full list).

```javascript
// Single-argument filter
NoJS.filter('initials', (name) => {
  return name.split(' ').map(w => w[0]).join('').toUpperCase();
});

// Multi-argument filter
NoJS.filter('pad', (value, length, char) => {
  return String(value).padStart(length, char || '0');
});
```

```html
<span bind="fullName | initials"></span>       <!-- "John Doe" -> "JD" -->
<span bind="id | pad:6,'0'"></span>            <!-- 42 -> "000042" (args are comma-separated) -->
```

---

## NoJS.validator(name, fn)

Register a custom form validator.

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Validator name used in `validate="name"` |
| `fn` | function | Validation function. Receives the input value, returns `true` (valid) or a string (error message) |

Only the names of the built-in rules of the NoJS Elements `validate` directive are reserved: `required`, `email`, `url`, `min` and `max`. Registering one of them logs `"<name>" is a built-in validator and cannot be overridden` and does nothing. Every other name can be registered, including `minlength`, `maxlength`, `pattern`, `match`, `number`, `integer`, `alpha` and `alphanumeric` -- the `validate` directive has no rule with those names, so register your own if you want to use them.

Validators are run by NoJS Elements, which reads the registry when it installs: register them before the Elements script loads.

```javascript
NoJS.validator('username', (value) => {
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(value)) {
    return 'Username must be 3-20 characters (letters, numbers, underscores)';
  }
  return true;
});

NoJS.validator('strongPassword', (value) => {
  if (value.length < 8) return 'At least 8 characters required';
  if (!/[A-Z]/.test(value)) return 'Must include an uppercase letter';
  if (!/[0-9]/.test(value)) return 'Must include a number';
  return true;
});
```

```html
<input type="text" model="username" validate="required|username">
<input type="password" model="password" validate="required|strongPassword">
```

---

## NoJS.i18n(options)

Configure internationalization settings. Can be called before or after `init()`.

| Option | Type | Description |
|--------|------|-------------|
| `loadPath` | string | URL pattern with `{locale}` and `{ns}` placeholders |
| `ns` | string[] | Namespaces to load |
| `cache` | boolean | Cache loaded locale files |
| `persist` | boolean | Persist locale selection to localStorage |
| `defaultLocale` | string | Default locale code |
| `fallbackLocale` | string | Fallback locale when a key is missing |
| `detectBrowser` | boolean | Auto-detect locale from `navigator.language` |
| `supportedLocales` | string[] | Locales eligible for browser detection. When set with `loadPath`, `detectBrowser` adopts the browser language (or its prefix, e.g. `pt` from `pt-BR`) only if present in this list |
| `escapeParams` | boolean | Default `false`: `t-*` params in `t-html` are inserted raw and the result is sanitized. `true`: params are HTML-escaped first. Changing it after `init()` re-renders active translations |
| `strictLocale` | boolean | Default `false`: a persisted `nojs-locale` is restored even if it is not in `supportedLocales`. `true`: such a value is ignored and removed (only when `supportedLocales` is non-empty). Read by this `NoJS.i18n()` call only |

```javascript
NoJS.i18n({
  loadPath: '/locales/{locale}/{ns}.json',
  ns: ['common', 'auth'],
  defaultLocale: 'en',
  fallbackLocale: 'en',
  detectBrowser: true,
  supportedLocales: ['en', 'pt', 'es'],
  persist: true
});
```

On first visit the active locale is resolved by priority: persisted `nojs-locale` > browser detection (when `detectBrowser` + `supportedLocales` match) > `defaultLocale`. The persisted value wins even when it is not in `supportedLocales`, unless `strictLocale: true`.

### Examples

```javascript
// Load additional namespaces at runtime
NoJS.i18n({ ns: ['dashboard'] });

// Switch locale (triggers re-render)
NoJS.locale = 'pt-BR';
```

---

## NoJS.on(event, callback)

Subscribe to lifecycle events on the internal event bus.

| Parameter | Type | Description |
|-----------|------|-------------|
| `event` | string | Event name |
| `callback` | function | Handler function |

Returns an unsubscribe function.

```javascript
const unsub = NoJS.on('ready', () => {
  console.log('NoJS initialized');
});

// Later: unsubscribe
unsub();
```

**Framework events**: `plugins:ready` (end of `NoJS.init()`), `fetch:success` (`{ url, data }`), `fetch:error` and `error` (`{ url, error }`) from the HTTP verb directives and `call`, and `fetch:end`. The `url` in these payloads is the raw URL by default; with `strictRedaction: true` it is redacted (fragment dropped, sensitive query values `[REDACTED]`). Any other name works as a custom event between `NoJS.on()` and your own code.

A maximum of `config.maxEventListeners` (default: 100) listeners can be registered per event. Exceeding this limit logs a memory leak warning.

---

## NoJS.use(plugin, options?)

Install a plugin.

| Parameter | Type | Description |
|-----------|------|-------------|
| `plugin` | object\|function | Plugin with `name` and `install()`, or a function shorthand |
| `options` | any | Passed as second argument to `install()` |

### Plugin interface

```javascript
const MyPlugin = {
  name: 'my-plugin',
  install(app, options) {
    // Register directives, filters, globals, interceptors
    app.directive('my-dir', { init(el, val, ctx) { /* ... */ } });
    app.filter('my-filter', (v) => v);
    app.global('$myGlobal', { value: 42 });
  },
  init(app) {
    // Called after NoJS.init() completes
  },
  dispose(app) {
    // Called during NoJS.dispose()
  }
};

NoJS.use(MyPlugin, { debug: true });
```

### Function shorthand

```javascript
NoJS.use((app) => {
  app.filter('greet', (name) => `Hello, ${name}!`);
});
```

### Options

Options are passed through to `install()`:

```javascript
NoJS.use(AnalyticsPlugin, {
  trackingId: 'UA-XXXXX',
  debug: false
});
```

### Duplicate detection

A plugin name can only be registered once. Attempting to register the same plugin object again is silently skipped. A different plugin object with the same `name` property logs a warning and is ignored.

See the [Plugin System Reference](plugins.md) for lifecycle, disposal, directive freezing, and security details.

---

## NoJS.global(name, value)

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

**Reserved names** (cannot be used): `store`, `route`, `router`, `i18n`, `refs`, `form`, `parent`, `watch`, `set`, `notify`, `raw`, `isProxy`, `listeners`, `app`, `config`, `env`, `debug`, `version`, `plugins`, `globals`, `el`, `event`, `self`, `this`, `super`, `window`, `document`, `toString`, `valueOf`, `hasOwnProperty`.

**Forbidden keys**: `__proto__`, `constructor`, `prototype` -- blocked to prevent prototype pollution.

**Security**: Values that reference `eval` or `Function` are rejected.

**Ownership tracking**: When called during plugin installation, the global is tracked as owned by that plugin and is cleaned up during `NoJS.dispose()`.

---

## NoJS.dispose()

Tear down the entire NoJS instance. Returns a `Promise`.

```javascript
await NoJS.dispose();
// All plugins disposed, all state cleared
```

**Disposal sequence**:
1. Calls `dispose()` on each installed plugin in **reverse installation order** (3-second timeout per plugin)
2. Clears all plugins, globals, interceptors, stores, and event listeners
3. Destroys the router instance
4. Resets initialization state so `NoJS.init()` can be called again

---

## NoJS.CANCEL

Sentinel symbol. Return from a request interceptor to abort the request entirely.

```javascript
NoJS.interceptor('request', (url, opts) => {
  if (isOffline()) return NoJS.CANCEL;
  return opts;
});
```

Read-only, non-configurable property.

---

## NoJS.RESPOND

Sentinel symbol. Return `{ __nojs__: NoJS.RESPOND, body: data }` from a request interceptor to short-circuit with mock data (no network request is made).

```javascript
NoJS.interceptor('request', (url, opts) => {
  if (url.includes('/cached')) {
    return { __nojs__: NoJS.RESPOND, body: getCachedData(url) };
  }
  return opts;
});
```

---

## NoJS.REPLACE

Sentinel symbol. Return `{ __nojs__: NoJS.REPLACE, body: data }` from a response interceptor to replace the response body.

```javascript
NoJS.interceptor('response', (response) => {
  if (response.url.includes('/transform')) {
    return { __nojs__: NoJS.REPLACE, body: transformData(response) };
  }
  return response;
});
```

---

## NoJS.interceptor(type, fn)

Register a request or response interceptor.

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | `"request"` \| `"response"` | Interceptor type |
| `fn` | function | Interceptor function |

### Request interceptor

```javascript
NoJS.interceptor('request', (url, opts) => {
  opts.headers = opts.headers || {};
  opts.headers['X-Client-Version'] = '2.4.0';
  return opts;
});
```

A request interceptor returns the (modified) options. Sensitive headers (`Authorization`, `Cookie`, `X-API-Key`, `X-CSRF-Token`, `x-auth-*`, `x-api-*`, ...) are stripped from the options an untrusted interceptor receives and re-applied after the chain, and values it sets for them are dropped. To stamp an `Authorization` header, register the interceptor from a plugin installed with `{ trusted: true }`:

```javascript
NoJS.use({
  name: 'auth-token',
  install(app) {
    app.interceptor('request', (url, opts) => {
      const token = NoJS.store.auth?.token;
      if (token) opts.headers['Authorization'] = `Bearer ${token}`;
      return opts;
    });
  }
}, { trusted: true });
```

### Response interceptor

```javascript
NoJS.interceptor('response', (response) => {
  if (response.status === 401) {
    NoJS.router.push('/login');
  }
  return response;
});
```

### Plugin tracking and header redaction

When registered during `NoJS.use()`, the interceptor is tracked with the plugin name. Untrusted interceptors (those not registered by a plugin installed with `NoJS.use(plugin, { trusted: true })`) receive redacted request and response headers.

### Sensitive header redaction

**Redacted request headers** for untrusted interceptors: `authorization`, `x-api-key`, `x-auth-token`, `cookie`, `proxy-authorization`, `set-cookie`, `x-csrf-token`, plus any header matching `/^x-(auth|api)-/i`.

**Redacted response headers**: `set-cookie`, `x-csrf-token`, `x-auth-token`, `www-authenticate`, `proxy-authenticate`.

**URL query param redaction (default, v1.21.1 behavior)**: only the URL handed to untrusted **response** interceptors (and the response proxy's `url`) is redacted. Values of parameters whose name contains `token`, `key`, `secret`, `auth`, `password` or `credential` (case-insensitive substring) are replaced, and the URL is re-serialized by the `URL` API, so they read `%5BREDACTED%5D`. Untrusted **request** interceptors, the `fetch:success` / `fetch:error` / `error` payloads and the request failure warnings get the raw URL.

**`strictRedaction: true`**: request and response interceptors, the event payloads and the failure warnings all get a string-level redacted URL: the `#fragment` is dropped and the values of sensitive parameters become a literal `[REDACTED]`, with names matched by word (`author`, `keyword` and `sort_key` stay intact). The `csrf.header` name is withheld from untrusted interceptors and cannot be overridden by them, and response headers that are sensitive as request headers (`authorization`, `cookie`, `x-auth-*`, `x-api-*`, ...) are also stripped from the response proxy.

### Interceptor timeout

Interceptors have a built-in execution timeout to prevent hangs.

### Recursion depth guard

Nested interceptor calls are guarded to prevent infinite recursion.

### Untrusted interceptor response

Responses exposed to untrusted interceptors are proxy-wrapped to prevent modification of the original response object.

### Retry behavior

Multiple interceptors of the same type run in registration order. Requests that fail with `AbortError` (including `NoJS.CANCEL` cancellations) are never retried, regardless of the `retries` config.

---

## NoJS.store

Getter that returns the global reactive stores object. Stores are defined via `NoJS.config({ stores: { ... } })`.

```javascript
// Define stores at config time
NoJS.config({
  stores: {
    auth: { user: null, token: null },
    cart: { items: [], total: 0 }
  }
});

// Read/write from JavaScript
NoJS.store.auth.user = { name: 'Erick' };
NoJS.store.cart.items.push({ id: 1, name: 'Widget' });
```

```html
<!-- Access in templates via $store -->
<span bind="$store.auth.user?.name"></span>
<span bind="$store.cart.items | count"></span>
```

Stores are deeply reactive -- property assignments automatically trigger re-evaluation of bound expressions.

---

## NoJS.notify()

Force a reactive re-evaluation cycle on all bound expressions. Useful after mutations that bypass the reactive proxy (e.g., direct array index assignment).

```javascript
NoJS.store.cart.items[0].qty = 5;
NoJS.notify(); // trigger UI update
```

---

## NoJS.router

Getter that returns the client-side router instance (created during `NoJS.init()` if router config is present).

### Properties and methods

| Member | Type | Description |
|--------|------|-------------|
| `push(path)` | method | Navigate to a path |
| `replace(path)` | method | Navigate without adding history entry |
| `back()` | method | Go back in history |
| `forward()` | method | Go forward in history |
| `path` | string | Current route path |
| `params` | object | Current route parameters |
| `query` | object | Current query string parameters |
| `hash` | string | Current hash fragment |

### Examples

```javascript
NoJS.router.push('/dashboard');
NoJS.router.replace('/login');
NoJS.router.back();

console.log(NoJS.router.path);   // "/dashboard"
console.log(NoJS.router.params); // { id: "42" }
console.log(NoJS.router.query);  // { tab: "settings" }
```

```html
<!-- Access in templates via $route -->
<div if="$route.path === '/dashboard'">Dashboard</div>
<span bind="$route.params.id"></span>
<a href="/profile" route>Profile</a>
```

---

## NoJS.locale

Getter/setter for the current locale. Setting triggers locale file loading and re-renders all `t` (i18n) directives.

```javascript
console.log(NoJS.locale); // "en"
NoJS.locale = 'pt-BR';   // triggers re-render
```

---

## NoJS.baseApiUrl

Getter/setter for the base URL used by fetch directives (`get`, `post`, `put`, `delete`, `patch`).

```javascript
NoJS.baseApiUrl = 'https://api.example.com/v2';
```

Setting the base URL after initialization triggers re-evaluation of any active fetch directives.

---

## NoJS.version

Read-only string with the current framework version.

```javascript
console.log(NoJS.version); // current framework version string
```

---

## NoJS.internals

Getter that returns a frozen object exposing internal APIs for trusted plugins (e.g., NoJS-Elements). These APIs are not part of the public contract and may change between minor versions.

| Property | Type | Description |
|----------|------|-------------|
| `execStatement(expr, ctx, extraVars?)` | function | Execute a statement expression (assignments, side effects) |
| `cloneTemplate(template)` | function | Clone a `<template>` element with full processing |
| `disposeChildren(parent)` | function | Dispose all directive state on child elements |
| `disposeTree(root)` | function | Dispose all directive state on an element and its descendants |
| `warn(message)` | function | Log a framework warning |
| `validators` | object | Frozen copy of all registered validators |
| `removeCoreDirective(name)` | function | Remove a core directive from the registry |
| `onDispose(fn)` | function | Register a disposal callback on the current element |

```javascript
const MyElementPlugin = {
  name: 'my-elements',
  install(app) {
    const { execStatement, cloneTemplate, warn } = app.internals;
    // Use internal APIs for advanced element behavior
  }
};
```

**Warning**: These APIs are for framework-level plugins only. They bypass safety guards and should not be used in application code.

---

## Utility Functions

Low-level helpers exposed on the `NoJS` object for advanced use cases and custom directive development.

### NoJS.createContext(data?, parent?)

Create a reactive context object. Used internally by directives and available for custom directive authors.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `data` | object | `{}` | Initial data for the context |
| `parent` | Context | `null` | Parent context for prototype-chain lookup |

```javascript
const ctx = NoJS.createContext({ name: 'Erick', count: 0 });
const child = NoJS.createContext({ role: 'admin' }, ctx);
// child.name resolves via prototype chain to 'Erick'
```

### NoJS.evaluate(expr, ctx)

Evaluate an expression string against a context. Returns the result.

```javascript
const ctx = NoJS.createContext({ price: 10, qty: 3 });
const total = NoJS.evaluate('price * qty', ctx); // 30
```

### NoJS.findContext(el)

Find the reactive context associated with a DOM element by walking up the tree.

```javascript
const ctx = NoJS.findContext(document.getElementById('item'));
console.log(ctx.name);
```

### NoJS.processTree(root)

Process all unprocessed directive attributes on a DOM subtree. Useful after dynamically inserting HTML.

```javascript
container.innerHTML = '<div bind="message"></div>';
NoJS.processTree(container);
```

### NoJS.resolve(path, ctx)

Resolve a dot-separated path on a context object. Forbidden property names are blocked.

```javascript
const value = NoJS.resolve('user.address.city', ctx);
```

---

## Special Context Variables

Built-in variables automatically available in expressions depending on the context.

### Global

| Variable | Description |
|----------|-------------|
| `$store` | Global reactive stores |
| `$route` | Current route object (path, params, query, hash) |
| `$router` | Router instance |
| `$i18n` | i18n utilities |
| `$refs` | Named element references |
| `$app` | The NoJS instance |

### Events

| Variable | Description |
|----------|-------------|
| `$event` | The native DOM event object |
| `$el` | The element that triggered the event |

### Loops

| Variable | Description |
|----------|-------------|
| `$index` | Current iteration index (0-based) |
| `$first` | `true` if first iteration |
| `$last` | `true` if last iteration |
| `$even` | `true` if index is even |
| `$odd` | `true` if index is odd |
| `$parent` | Parent context |

### Forms

| Variable | Description |
|----------|-------------|
| `$form` | Form state object |
| `$form.valid` | Whether the form is valid |
| `$form.dirty` | Whether any field has been modified |
| `$form.errors` | Object of field errors |
| `$form.touched` | Object of touched fields |

### Drag and Drop

| Variable | Description |
|----------|-------------|
| `$drag` | Drag state object |
| `$drag.data` | Data attached to the dragged element |
| `$drag.source` | The source element being dragged |
| `$drop` | Drop state object |

---

## Security

### XSS Protection

- `bind` uses `textContent` -- safe by default (no HTML parsing)
- `bind-html` sanitizes HTML with a built-in DOMParser-based structural sanitizer before insertion
- The expression parser is a custom sandboxed recursive-descent parser -- **no `eval()` or `Function()` is ever used**
- The evaluator uses an allow-list approach: `_SAFE_GLOBALS` exposes JS built-ins, `_BROWSER_GLOBALS` exposes curated browser APIs
- `fetch`, `XMLHttpRequest`, `localStorage`, `sessionStorage`, `WebSocket`, and `indexedDB` are NOT on the allow-list
- Spread operations filter `_FORBIDDEN_PROPS` (`__proto__`, `constructor`, `prototype`) to prevent prototype pollution

See the [Security Reference](security.md) for complete details.

### Sensitive Header Warning

Inline sensitive headers (`Authorization`, `Cookie`, `X-CSRF-Token`, `X-API-Key`) in fetch directive attributes trigger an unconditional console warning. Use `NoJS.config({ headers })` or `NoJS.interceptor('request', ...)` instead.

### Content Security Policy (CSP)

NoJS is fully CSP-compatible. No `eval()`, `Function()`, or `unsafe-eval` is required. Inline event handlers are attached programmatically (not via `onclick` attributes), so `unsafe-inline` for scripts is not needed.

### CSRF Protection

Use `NoJS.config({ csrf: { token: '...', header: 'X-CSRF-Token' } })` to automatically include CSRF tokens in all fetch requests.

---

## Web Components Compatibility

### `bind-prop-*` -- Pass Reactive Data to Web Components

```html
<my-component bind-prop-data="items"></my-component>
```

Sets a JavaScript property (not an HTML attribute) on the custom element, enabling reactive data flow into Web Components.

### Shadow DOM Support

NoJS can process directives inside Shadow DOM when `processTree()` is called on the shadow root.

### Component-like Patterns with Templates

```html
<template id="card">
  <div class="card">
    <h3 bind="title"></h3>
    <p bind="description"></p>
  </div>
</template>

<div include="card" state="{ title: 'Hello', description: 'World' }"></div>
```

---

## Complete Example

```html
<script src="https://cdn.no-js.dev/"></script>
<script>
  NoJS.config({
    baseApiUrl: 'https://api.example.com',
    router: { base: '/app', scrollBehavior: 'smooth' },
    stores: {
      auth: { user: null, token: localStorage.getItem('token') },
      theme: { mode: 'light' }
    },
    i18n: {
      loadPath: '/locales/{locale}/common.json',
      defaultLocale: 'en',
      persist: true,
      detectBrowser: true
    }
  });

  NoJS.filter('avatar', (email) => {
    return `https://gravatar.com/avatar/${email}?d=identicon`;
  });

  NoJS.validator('username', (value) => {
    return /^[a-zA-Z0-9_]{3,20}$/.test(value);
  });

  NoJS.interceptor('request', (url, opts) => {
    const token = NoJS.store.auth?.token;
    if (token) {
      opts.headers = opts.headers || {};
      opts.headers['Authorization'] = 'Bearer ' + token;
    }
    return opts;
  });

  NoJS.interceptor('response', (response) => {
    if (response.status === 401) {
      NoJS.store.auth.token = null;
      NoJS.store.auth.user = null;
      NoJS.notify();
      NoJS.router.push('/login');
    }
    return response;
  });

  NoJS.on('route:change', (route) => {
    analytics.pageView(route.path);
  });
</script>
```
