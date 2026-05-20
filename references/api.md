# No.JS Public JavaScript API Reference

The `NoJS` object is the single entry point to the framework's JavaScript API. When using the CDN (`<script src="https://cdn.no-js.dev/">`), it is available as `window.NoJS`. For ESM/CJS usage: `import NoJS from '@erickxavier/no-js'`.

---

## NoJS.config(options)

Configure global framework settings. Call before `NoJS.init()` or the DOM ready event.

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
  router: {
    useHash: false,
    base: '/',
    scrollBehavior: 'top',
    templates: 'pages',
    ext: '.tpl',
    focusBehavior: 'none',
    suppressHashWarning: false,
    viewTransition: true
  },
  i18n: {
    defaultLocale: 'en',
    fallbackLocale: 'en',
    detectBrowser: false,
    loadPath: null,
    ns: [],
    cache: true,
    persist: false
  },
  stores: {
    auth: { user: null, token: null },
    cart: { items: [] }
  }
});
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `debug` | boolean | `false` | Enable `[No.JS]` console logging |
| `baseApiUrl` | string | `""` | Default base URL for all fetch directives (`get`, `post`, etc.) |
| `headers` | object | `{}` | Default headers for all HTTP requests |
| `timeout` | number | `10000` | Request timeout in milliseconds |
| `retries` | number | `0` | Number of automatic retries on failed requests |
| `retryDelay` | number | `1000` | Delay between retries in milliseconds |
| `credentials` | string | `"same-origin"` | Fetch credentials mode (`same-origin`, `include`, `omit`) |
| `csrf` | object\|null | `null` | CSRF token configuration (`{ token, header }`) |
| `cache` | object | `{ strategy: "none", ttl: 300000 }` | HTTP cache settings. `strategy`: `"none"`, `"memory"`, etc. |
| `templates` | object | `{ cache: true }` | Template loading settings |
| `sanitize` | boolean | `true` | Sanitize HTML in `bind-html` |
| `dangerouslyDisableSanitize` | boolean | `false` | Explicit opt-out of HTML sanitization (use with caution) |
| `exprCacheSize` | number | `500` | Maximum expression cache entries; uses LRU eviction |
| `maxEventListeners` | number | `100` | Maximum event listeners per element |
| `devtools` | boolean | `false` | Enable browser devtools panel |
| `router` | object | See below | Router configuration |
| `i18n` | object | See below | Internationalization settings |
| `stores` | object | -- | Define global stores at config time (keys become store names) |

#### router options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `useHash` | boolean | `false` | Use hash-based routing (`/#/path`) instead of History API |
| `base` | string | `"/"` | Base path prefix for all routes |
| `scrollBehavior` | string | `"top"` | Scroll on navigate: `"top"`, `"smooth"`, or `"preserve"` |
| `templates` | string | `"pages"` | Directory for file-based route templates |
| `ext` | string | `".tpl"` | File extension for auto-resolved route templates |
| `focusBehavior` | string | `"none"` | Accessibility focus management after navigation. `"auto"` moves focus to `[autofocus]` → `[tabindex="-1"]` → `h1` → outlet |
| `suppressHashWarning` | boolean | `false` | Silence the console warning emitted when `useHash: true` is set |
| `viewTransition` | boolean | `true` | Enable/disable the View Transition API for route changes. When `true` (default), `transition` on `route-view` uses `document.startViewTransition()` with built-in presets (`slide`, `fade`, `scale`, `none`). When `false`, falls back to legacy class-based transitions |

#### i18n options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `defaultLocale` | string | `"en"` | Default locale code |
| `fallbackLocale` | string | `"en"` | Fallback when a key is missing in the active locale |
| `detectBrowser` | boolean | `false` | Auto-detect locale from `navigator.language` |
| `loadPath` | string\|null | `null` | URL pattern for locale files, e.g. `"locales/{locale}/{ns}.json"` |
| `ns` | string[] | `[]` | Namespaces to load |
| `cache` | boolean | `true` | Cache loaded locale files |
| `persist` | boolean | `false` | Persist selected locale to `localStorage` |

Nested options (headers, cache, router, i18n) are **merged** with existing values, not replaced. The `stores` key creates reactive stores at config time and is removed from the config object afterward.

### Examples

```html
<script>
  // Minimal config
  NoJS.config({ baseApiUrl: 'https://api.example.com' });

  // SPA with hash routing
  NoJS.config({
    router: { useHash: true },
    stores: { auth: { user: null } }
  });

  // Full production config
  NoJS.config({
    baseApiUrl: 'https://api.example.com',
    headers: { 'Accept': 'application/json' },
    timeout: 15000,
    retries: 2,
    csrf: { token: document.querySelector('meta[name="csrf"]')?.content, header: 'X-CSRF-Token' },
    cache: { strategy: 'memory', ttl: 60000 },
    router: { base: '/app', scrollBehavior: 'smooth' },
    i18n: { loadPath: '/locales/{locale}/common.json', defaultLocale: 'en', persist: true, detectBrowser: true }
  });
</script>
```

---

## NoJS.init(root?)

Initialize the framework on a root DOM element. Walks the DOM tree, activates directives, loads remote templates, and starts the router if a `[route-view]` element exists.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `root` | Element | `document.body` | The root element to process |

```javascript
// Automatic (CDN script tag) -- no call needed
// <script src="https://cdn.no-js.dev/"></script>

// Manual (ESM/npm)
import NoJS from '@erickxavier/no-js';
NoJS.config({ baseApiUrl: '/api' });
NoJS.init();

// Initialize on a specific subtree
NoJS.init(document.getElementById('app'));
```

**Lifecycle**: `init()` is idempotent -- calling it more than once is a no-op. The CDN entry point calls `NoJS.init()` automatically on `DOMContentLoaded`. For ESM/CJS consumers, call it manually after configuration. Returns a `Promise` that resolves when initialization is complete (including plugin `init()` hooks).

**Initialization sequence**:
1. Load external locale files (blocking, if `i18n.loadPath` is set)
2. Process inline template includes (`<template include>`)
3. Load remote templates (Phase 1: priority + default route)
4. Create router if `[route-view]` is present
5. `processTree(root)` -- first paint
6. Initialize router (navigate to current URL)
7. Background preload remaining route templates (Phase 2)
8. Initialize DevTools integration
9. Call `init()` on all installed plugins (in installation order)
10. Emit `plugins:ready` event

---

## NoJS.directive(name, handler)

Register a custom directive that No.JS will recognize on DOM elements.

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | The attribute name to match (e.g., `"tooltip"` matches `<div tooltip="...">`) |
| `handler` | object | Directive definition with `priority` and `init` |

### Handler shape

```javascript
{
  priority: 20,                    // Execution order (lower = earlier). Default priorities:
                                   //   0 = state/store, 1 = fetch, 2 = computed,
                                   //   5 = route/ref, 10 = structural, 20 = rendering, 30 = effects
  init(el, attrName, value) {      // Called once when the directive is first processed
    // el       - the DOM element
    // attrName - the full attribute name (e.g., "tooltip")
    // value    - the attribute value string
  }
}
```

### Examples

```javascript
// Simple tooltip directive
NoJS.directive('tooltip', {
  priority: 20,
  init(el, attrName, value) {
    el.title = value;
    el.style.cursor = 'help';
  }
});

// Auto-focus directive
NoJS.directive('autofocus', {
  priority: 30,
  init(el) {
    requestAnimationFrame(() => el.focus());
  }
});

// Directive that uses the reactive context
NoJS.directive('log-click', {
  priority: 20,
  init(el, attrName, value) {
    el.addEventListener('click', () => {
      const ctx = NoJS.findContext(el);
      const result = NoJS.evaluate(value, ctx);
      console.log('Clicked:', result);
    });
  }
});
```

```html
<span tooltip="Click to edit">Edit</span>
<input autofocus>
<button log-click="user.name">Log Name</button>
```

---

## NoJS.filter(name, fn)

Register a custom filter for use in pipe expressions.

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | The filter name used after `|` in expressions |
| `fn` | function | Transform function. First argument is the piped value; additional arguments follow |

```javascript
// Single-argument filter
NoJS.filter('initials', (name) => {
  return name.split(' ').map(w => w[0]).join('').toUpperCase();
});

// Multi-argument filter
NoJS.filter('pad', (value, length, char) => {
  return String(value).padStart(length, char || '0');
});

// Filter using external library
NoJS.filter('markdown', (text) => {
  return marked.parse(text);
});
```

```html
<span bind="fullName | initials"></span>
<!-- "John Doe" -> "JD" -->

<span bind="id | pad(6, '0')"></span>
<!-- 42 -> "000042" -->

<div bind-html="content | markdown"></div>
```

---

## NoJS.validator(name, fn)

Register a custom form validation rule.

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | The validator name used in `validate="..."` |
| `fn` | function | Receives the field value, returns `true` if valid or a string error message if invalid |

```javascript
NoJS.validator('phone', (value) => {
  return /^\+?[\d\s\-()]{7,15}$/.test(value);
});

NoJS.validator('strong-password', (value) => {
  if (value.length < 8) return 'Must be at least 8 characters';
  if (!/[A-Z]/.test(value)) return 'Must contain an uppercase letter';
  if (!/[0-9]/.test(value)) return 'Must contain a number';
  return true;
});

NoJS.validator('matches', (value, fieldName) => {
  // Access other field values via the second argument
  return value === document.querySelector(`[name="${fieldName}"]`)?.value;
});
```

```html
<form validate>
  <input name="phone" validate="required,phone" />
  <input name="password" validate="required,strong-password" />
  <input name="confirm" validate="required,matches:password" />
</form>
```

---

## NoJS.i18n(options)

Configure internationalization. Can be called before or after `NoJS.config()`. Options are merged with any `i18n` settings from config.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `loadPath` | string | `null` | URL pattern: `"locales/{locale}/{ns}.json"` |
| `ns` | string[] | `[]` | Namespaces to load |
| `defaultLocale` | string | `"en"` | Default locale |
| `fallbackLocale` | string | `"en"` | Fallback locale for missing keys |
| `persist` | boolean | `false` | Persist locale choice to `localStorage` (`"nojs-locale"` key) |
| `detectBrowser` | boolean | `false` | Detect locale from `navigator.language` |
| `locales` | object | -- | Inline locale definitions |
| `cache` | boolean | `true` | Cache loaded locale files |

**Locale resolution priority** (highest to lowest):
1. Persisted value from `localStorage` (when `persist: true`)
2. Browser language (when `detectBrowser: true`)
3. `defaultLocale`

### Examples

```javascript
// Inline translations
NoJS.i18n({
  defaultLocale: 'en',
  locales: {
    en: { greeting: 'Hello', farewell: 'Goodbye' },
    es: { greeting: 'Hola', farewell: 'Adios' },
    pt: { greeting: 'Ola', farewell: 'Tchau' }
  }
});

// External locale files
NoJS.i18n({
  loadPath: '/locales/{locale}/common.json',
  defaultLocale: 'en',
  fallbackLocale: 'en',
  detectBrowser: true,
  persist: true
});

// With namespaces
NoJS.i18n({
  loadPath: '/locales/{locale}/{ns}.json',
  ns: ['common', 'dashboard'],
  defaultLocale: 'en'
});
```

```html
<h1 t="greeting"></h1>
<!-- Renders "Hello" (en), "Hola" (es), "Ola" (pt) -->
```

---

## NoJS.on(event, callback)

Subscribe to the global event bus. Returns an unsubscribe function.

| Parameter | Type | Description |
|-----------|------|-------------|
| `event` | string | Event name (any string) |
| `callback` | function | Handler called with event data |

```javascript
// Subscribe
const unsub = NoJS.on('user:login', (data) => {
  console.log('User logged in:', data.name);
});

// Unsubscribe when done
unsub();
```

Events can be emitted from HTML using the `trigger` directive:

```html
<!-- Emit from HTML using trigger directive -->
<button on:click trigger="cart:updated" trigger-data="{ count: items.length }">Update</button>

<!-- Listen in another part of the page -->
<div on:cart:updated="refreshCart($event.detail)">...</div>
```

```javascript
// Cross-component communication
NoJS.on('theme:change', (theme) => {
  document.body.className = theme;
});
```

---

## NoJS.use(plugin, options?)

Register a plugin with the framework. Plugins extend NoJS with new directives, filters, interceptors, globals, and lifecycle hooks.

| Parameter | Type | Description |
|-----------|------|-------------|
| `plugin` | object \| function | Plugin object or named install function |
| `options` | object | Optional configuration passed to the plugin's `install` function |

### Plugin interface

```javascript
{
  name: 'my-plugin',          // Required. Unique plugin name
  version: '1.0.0',           // Optional. Semver string
  capabilities: ['auth'],     // Optional. Logged in debug mode
  install(NoJS, options) {    // Required. Called immediately on use()
    // Register directives, filters, interceptors, globals, etc.
  },
  init(NoJS) {                // Optional. Called after NoJS.init() completes
    // DOM is ready, router/stores are available
  },
  dispose(NoJS) {             // Optional. Called during NoJS.dispose()
    // Cleanup timers, event listeners, connections, etc.
  }
}
```

### Function shorthand

Named functions are accepted as a shorthand (the function name becomes the plugin name):

```javascript
NoJS.use(function analytics(NoJS, options) {
  NoJS.interceptor('response', (res, url) => {
    track(url, res.status);
    return res;
  });
});
```

### Options

The optional `options` object is passed directly to the plugin's `install` function. One special key:

| Option | Type | Description |
|--------|------|-------------|
| `trusted` | boolean | Grant the plugin access to unredacted HTTP headers and URLs in interceptors. Default: `false` |

### Examples

```javascript
// Object plugin
const authPlugin = {
  name: 'auth',
  version: '1.0.0',
  capabilities: ['interceptor', 'store'],
  install(NoJS, options) {
    NoJS.interceptor('request', (url, opts) => {
      const token = NoJS.store.auth?.token;
      if (token) {
        opts.headers = opts.headers || {};
        opts.headers['Authorization'] = 'Bearer ' + token;
      }
      return opts;
    });
  },
  init(NoJS) {
    console.log('Auth plugin ready');
  },
  dispose(NoJS) {
    console.log('Auth plugin disposed');
  }
};

NoJS.use(authPlugin);
NoJS.use(authPlugin, { trusted: true }); // Grant header access

// Duplicate installs are no-ops (same object)
NoJS.use(authPlugin); // Silently ignored
```

**Lifecycle**: `install()` runs synchronously during `use()`. If `NoJS.init()` has already completed and the plugin defines `init()`, it is called immediately (awaited). `dispose()` is called in reverse installation order during `NoJS.dispose()`.

**Constraints**: Plugin names must be unique and non-empty. Installing a different plugin object with the same name logs a warning and is rejected. Plugins cannot be installed during `dispose()`.

---

## NoJS.global(name, value)

Register a reactive global variable accessible as `$name` in all expressions.

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Variable name (without the `$` prefix). Must start with a letter and contain only `[a-zA-Z0-9_]` |
| `value` | any | The value to expose. Objects are sanitized (prototype keys stripped). Functions, `eval`, and `Function` references are rejected |

```javascript
// Register a global
NoJS.global('apiVersion', '2.1');
NoJS.global('theme', { mode: 'dark', accent: '#0af' });
```

```html
<!-- Access in expressions as $apiVersion, $theme -->
<span bind="$apiVersion"></span>
<div class-dark="$theme.mode === 'dark'">...</div>
```

**Reserved names**: The following names are reserved and cannot be used: `store`, `route`, `router`, `i18n`, `refs`, `form`, `parent`, `watch`, `set`, `notify`, `raw`, `isProxy`, `listeners`, `app`, `config`, `env`, `debug`, `version`, `plugins`, `globals`, `el`, `event`, `self`, `this`, `super`, `window`, `document`, `toString`, `valueOf`, `hasOwnProperty`.

**Ownership**: When called inside a plugin's `install()`, the global is tracked as owned by that plugin. Overwriting a global owned by a different plugin logs a warning.

---

## NoJS.dispose()

Tear down the entire NoJS instance. Disposes plugins in reverse installation order, clears interceptors, globals, stores, event bus, and the router.

```javascript
await NoJS.dispose();
// All plugins disposed, all state cleared
```

**Behavior**:
1. Calls `dispose()` on each installed plugin in reverse order (with a 3-second timeout per plugin)
2. Clears all plugins, globals, interceptors, stores, and event listeners
3. Destroys the router instance
4. Resets initialization state so `NoJS.init()` can be called again

Returns a `Promise` that resolves when teardown is complete.

---

## NoJS.CANCEL

Read-only `Symbol` sentinel. Return an object with this symbol key set to `true` from a request interceptor to abort the request.

```javascript
NoJS.interceptor('request', (url, opts) => {
  if (isBlacklisted(url)) {
    return { [NoJS.CANCEL]: true };
  }
  return opts;
});
```

The cancelled request throws a `DOMException` with name `"AbortError"`, which is handled by the `error` template if present.

---

## NoJS.RESPOND

Read-only `Symbol` sentinel. Return an object with this symbol key from a request interceptor to short-circuit the request and provide a mock response without hitting the network.

```javascript
NoJS.interceptor('request', (url, opts) => {
  if (url.includes('/cached-data')) {
    return { [NoJS.RESPOND]: { users: cachedUsers } };
  }
  return opts;
});
```

The value of `[NoJS.RESPOND]` becomes the parsed response data.

---

## NoJS.REPLACE

Read-only `Symbol` sentinel. Return an object with this symbol key from a response interceptor to replace the response data entirely.

```javascript
NoJS.interceptor('response', (response, url) => {
  if (url.includes('/transform')) {
    return { [NoJS.REPLACE]: transformedData };
  }
  return response;
});
```

---

## NoJS.interceptor(type, fn)

Register request or response interceptors for all HTTP directives (`get`, `post`, `put`, `patch`, `delete`). Interceptors can be synchronous or asynchronous (return a Promise).

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | `"request"` \| `"response"` | The interception point |
| `fn` | function | Interceptor function (sync or async) |

### Request interceptor

Receives `(url, options)` and must return `options` (possibly modified), or a sentinel object (`CANCEL`, `RESPOND`). The URL is read-only and cannot be reassigned.

```javascript
NoJS.interceptor('request', (url, opts) => {
  // Add auth header to every request
  const token = NoJS.store.auth?.token;
  if (token) {
    opts.headers = opts.headers || {};
    opts.headers['Authorization'] = 'Bearer ' + token;
  }
  return opts;
});

// Async interceptor
NoJS.interceptor('request', async (url, opts) => {
  const token = await refreshTokenIfNeeded();
  opts.headers['Authorization'] = 'Bearer ' + token;
  return opts;
});
```

### Response interceptor

Receives `(response, url)` and must return a response (possibly modified), or a sentinel object (`REPLACE`).

```javascript
NoJS.interceptor('response', (response, url) => {
  if (response.status === 401) {
    NoJS.store.auth.token = null;
    NoJS.router.push('/login');
  }
  return response;
});
```

### Plugin tracking and header redaction

When interceptors are registered inside a plugin's `install()`, they are automatically tagged with the plugin name. By default, response interceptors receive a **redacted** response object with sensitive headers (`Authorization`, `Cookie`, `Set-Cookie`, etc.) and URL query parameters stripped. Plugins installed with `{ trusted: true }` receive the original unredacted response.

### Interceptor timeout

Each interceptor has a 5-second execution timeout. If an interceptor exceeds this limit, it is skipped and a warning is logged.

Multiple interceptors of the same type run in registration order.

---

## NoJS.store

Access global reactive stores. Returns the stores object; individual stores are accessed as properties.

```javascript
// Read store data
console.log(NoJS.store.auth.user);
console.log(NoJS.store.cart.items.length);

// Mutate store data (call NoJS.notify() afterward for UI update)
NoJS.store.auth.user = { name: 'John' };
NoJS.store.cart.items.push({ id: 1, name: 'Widget' });
NoJS.notify();
```

Stores are created via `NoJS.config({ stores: { ... } })` or from HTML with the `store` directive:

```html
<div store="auth" state="{ user: null, token: null }">...</div>
```

```html
<!-- Access stores in expressions with $store -->
<span bind="$store.auth.user.name"></span>
<div if="$store.cart.items.length > 0">
  <span bind="$store.cart.items | count"></span> items in cart
</div>
```

---

## NoJS.notify()

Trigger a UI update for all store watchers. Call this after mutating store data from external JavaScript (outside of No.JS expressions).

```javascript
// Mutation from external JS (e.g., WebSocket handler, third-party library)
NoJS.store.notifications.items.push({ text: 'New message', read: false });
NoJS.notify(); // UI elements bound to $store.notifications update

// Inside a WebSocket handler
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  NoJS.store.messages.list.push(data);
  NoJS.store.messages.unread++;
  NoJS.notify();
};
```

**When to call**: Only when mutating stores from outside No.JS (plain JavaScript, WebSocket callbacks, third-party libraries). Mutations from No.JS expressions (`on:click="$store.cart.items.push(item)"`) trigger reactivity automatically.

---

## NoJS.router

Access the router instance. Only available after initialization when a `[route-view]` element exists in the DOM.

### Properties and methods

| Member | Type | Description |
|--------|------|-------------|
| `router.current` | object | Current route: `{ path, params, query, hash, matched }` |
| `router.push(path)` | async function | Navigate to a new path (adds history entry). Returns a Promise |
| `router.replace(path)` | async function | Navigate without adding a history entry. Returns a Promise |
| `router.back()` | function | Go back one history entry (`window.history.back()`) |
| `router.forward()` | function | Go forward one history entry (`window.history.forward()`) |
| `router.on(fn)` | function | Listen for route changes. Returns an unsubscribe function |

### Examples

```javascript
// Programmatic navigation
NoJS.router.push('/users/42');
NoJS.router.push('/search?q=hello');
NoJS.router.replace('/login'); // No back-button entry

// Navigation with hash
NoJS.router.push('/docs#cheatsheet');

// History navigation
NoJS.router.back();
NoJS.router.forward();

// Read current route
console.log(NoJS.router.current.path);    // "/users/42"
console.log(NoJS.router.current.params);  // { id: "42" }
console.log(NoJS.router.current.query);   // { q: "hello" }

// Listen for route changes
const unsub = NoJS.router.on((route) => {
  console.log('Navigated to:', route.path);
  analytics.pageView(route.path);
});

// Stop listening
unsub();

// Register a route programmatically
NoJS.router.register('/dynamic-path', templateElement, 'outletName');
```

```html
<!-- Access route data in templates -->
<h1 bind="'User #' + $route.params.id"></h1>
<span bind="$route.query.q"></span>
<div if="$route.path === '/dashboard'" class-active="true">Dashboard</div>
```

---

## NoJS.locale

Getter/setter for the current locale. Changing the locale triggers re-rendering of all `t` (translation) bindings.

```javascript
// Get current locale
console.log(NoJS.locale); // "en"

// Set locale
NoJS.locale = 'pt';
NoJS.locale = 'es';
```

```html
<!-- Language switcher -->
<select model="$i18n.locale">
  <option value="en">English</option>
  <option value="es">Espanol</option>
  <option value="pt">Portugues</option>
</select>

<!-- Or with buttons -->
<button on:click="window.NoJS.locale = 'en'">EN</button>
<button on:click="window.NoJS.locale = 'es'">ES</button>
```

---

## NoJS.baseApiUrl

Getter/setter for the default API base URL. This is prepended to relative URLs in fetch directives.

```javascript
// Get
console.log(NoJS.baseApiUrl); // "https://api.example.com"

// Set (e.g., switch environments)
NoJS.baseApiUrl = 'https://staging-api.example.com';
```

```html
<!-- Also settable via the base attribute on body -->
<body base="https://api.example.com">
  <div get="/users" as="users">...</div>
  <!-- Fetches https://api.example.com/users -->
</body>
```

---

## NoJS.version

Read-only string containing the current No.JS version.

```javascript
console.log(NoJS.version); // "1.10.0"
```

```html
<footer bind="'Powered by No.JS v' + window.NoJS.version"></footer>
```

---

## Special Context Variables

These variables are available in No.JS expressions depending on the context:

### Global

| Variable | Description |
|----------|-------------|
| `$store` | Access global stores (e.g., `$store.auth.user`) |
| `$route` | Current route: `{ path, params, query, hash, matched }` |
| `$router` | Router instance: `push()`, `replace()`, `back()`, `forward()` |
| `$refs` | Named element references set via `ref="name"` |
| `$i18n` | i18n context: `locale` (get/set), `t(key, params)` |

### Events

| Variable   | Where           | Description                    |
|------------|-----------------|--------------------------------|
| `$event`   | `on:*` handlers | The native DOM event object    |
| `$el`      | `on:*` handlers | The current element            |

### Loops

| Variable   | Where              | Description                              |
|------------|--------------------|------------------------------------------|
| `$index`   | `foreach`, `each`, `for` | Zero-based index of the current item     |
| `$count`   | `foreach`, `each`, `for` | Total number of items in the loop        |
| `$first`   | `foreach`, `each`, `for` | `true` if first item                     |
| `$last`    | `foreach`, `each`, `for` | `true` if last item                      |
| `$even`    | `foreach`, `each`, `for` | `true` if index is even                  |
| `$odd`     | `foreach`, `each`, `for` | `true` if index is odd                   |

### Forms

| Variable   | Where                      | Description                                                                                |
|------------|----------------------------|--------------------------------------------------------------------------------------------|
| `$form`    | Inside `<form validate>`   | Form context: `valid`, `dirty`, `submitting`, `errors`, `firstError`, `reset()`, `fields`  |
| `$error`   | Error templates            | Error message for the field                                                                |
| `$rule`    | Error templates            | Name of the failing validation rule                                                        |

### Drag and Drop

| Variable     | Where              | Description                                      |
|--------------|--------------------|--------------------------------------------------|
| `$drag`      | `drop` expressions | The dragged value (array if multi-select)        |
| `$dragType`  | `drop` expressions | The `drag-type` of the item                      |
| `$dropIndex` | `drop` expressions | Insertion index within the drop zone             |
| `$source`    | `drop` expressions | `{ list, index, el }` -- source info             |
| `$target`    | `drop` expressions | `{ list, index, el }` -- target info             |

---

## Security

### XSS Protection

- `bind` uses `textContent` -- safe by default (no HTML parsing)
- `bind-html` sanitizes HTML with a built-in DOMParser-based structural sanitizer before insertion
- The expression parser is a custom sandboxed recursive-descent parser -- **no `eval()` or `Function()` is ever used**
- The evaluator uses an allow-list approach: `_SAFE_GLOBALS` exposes JS built-ins (Math, Date, Object, Array, etc.) and `_BROWSER_GLOBALS` exposes curated browser APIs (document, console, navigator, etc.). `fetch`, `XMLHttpRequest`, `localStorage`, `sessionStorage`, `WebSocket`, and `indexedDB` are NOT on the allow-list
- Spread operations filter `_FORBIDDEN_PROPS` (`__proto__`, `constructor`, `prototype`) to prevent prototype pollution

### Sensitive Header Warning

Inline sensitive headers (`Authorization`, `Cookie`, `X-CSRF-Token`, `X-API-Key`) in fetch directive attributes trigger an unconditional console warning. Use `NoJS.config({ headers })` or `NoJS.interceptor('request', ...)` to set sensitive headers without warnings.

### Content Security Policy (CSP)

No.JS is fully CSP-compliant. It does not require `unsafe-eval` or `unsafe-inline` for script-src. The custom expression parser evaluates directive values without using `eval()`, `new Function()`, or any runtime code generation.

### CSRF Protection

```javascript
NoJS.config({
  csrf: {
    token: document.querySelector('meta[name="csrf-token"]')?.content,
    header: 'X-CSRF-Token'
  }
});
```

The configured CSRF header is automatically included in all mutation requests (`post`, `put`, `patch`, `delete`).

---

## Web Components Compatibility

### `bind-prop-*` -- Pass Reactive Data to Web Components

Use `bind-prop-*` to pass reactive values as JavaScript properties (not HTML attributes) to custom elements:

```html
<my-chart bind-prop-data="chartData" bind-prop-options="chartOptions"></my-chart>
<my-slider bind-prop-value="sliderValue" bind-prop-min="0" bind-prop-max="100"></my-slider>
```

### Shadow DOM Support

No.JS can process directives inside Shadow DOM when using declarative shadow roots:

```html
<my-component>
  <template shadowroot="open">
    <div state="{ count: 0 }">
      <span bind="count"></span>
      <button on:click="count++">+</button>
    </div>
  </template>
</my-component>
```

### Component-like Patterns with Templates

Use templates with `var` and `use` to create component-like reusable patterns:

```html
<template id="counter" var="config">
  <div state="{ count: config.initial || 0 }">
    <span bind="config.label + ': ' + count"></span>
    <button on:click="count++">+</button>
  </div>
</template>

<div use="counter" var-config="{ label: 'Apples', initial: 5 }"></div>
<div use="counter" var-config="{ label: 'Oranges', initial: 3 }"></div>
```

---

## Utility Functions

These low-level utilities are exposed on the `NoJS` object for use in custom directives, extensions, and advanced integrations.

### NoJS.createContext(data?, parent?)

Create a new reactive context manually. Data is wrapped in a `Proxy` that tracks reads and triggers watchers on writes.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `data` | object | `{}` | Initial data for the context |
| `parent` | context\|null | `null` | Parent context for prototype-chain lookups |

```javascript
const ctx = NoJS.createContext({ count: 0, name: 'World' });

// Contexts are Proxy objects -- read and write like plain objects
console.log(ctx.count); // 0

// Watch for changes
ctx.$watch(() => {
  console.log('Count changed to:', ctx.count);
});

ctx.count = 5; // Triggers watcher

// Child context inherits from parent
const child = NoJS.createContext({ color: 'blue' }, ctx);
console.log(child.name);  // "World" (inherited from parent)
console.log(child.color); // "blue" (own property)
```

### NoJS.evaluate(expr, ctx)

Evaluate an expression string against a reactive context. Supports the full No.JS expression syntax including property access, operators, ternaries, template literals, and pipe filters.

| Parameter | Type | Description |
|-----------|------|-------------|
| `expr` | string | The expression to evaluate |
| `ctx` | context | The reactive context providing variables |

```javascript
const ctx = NoJS.createContext({ price: 29.99, quantity: 3, name: 'Widget' });

NoJS.evaluate('price * quantity', ctx);       // 89.97
NoJS.evaluate('name | uppercase', ctx);       // "WIDGET"
NoJS.evaluate('price > 20 ? "expensive" : "cheap"', ctx); // "expensive"
NoJS.evaluate('`Total: ${price * quantity}`', ctx);        // "Total: 89.97"
```

### NoJS.findContext(el)

Find the nearest reactive context for a DOM element by walking up the ancestor chain. Returns a new empty context if none is found.

| Parameter | Type | Description |
|-----------|------|-------------|
| `el` | Element | The DOM element to search from |

```javascript
const el = document.querySelector('#my-element');
const ctx = NoJS.findContext(el);
console.log(ctx.someValue); // Access the reactive data bound to this element's scope
```

### NoJS.processTree(root)

Process a DOM subtree to activate all No.JS directives on it. Useful after dynamically inserting HTML that contains No.JS attributes.

| Parameter | Type | Description |
|-----------|------|-------------|
| `root` | Element | The root element of the subtree to process |

```javascript
// Dynamically add HTML with No.JS directives
const container = document.getElementById('dynamic');
container.innerHTML = '<div state="{ count: 0 }"><span bind="count"></span></div>';
NoJS.processTree(container); // Activate directives on the new content
```

### NoJS.resolve(path, ctx)

Resolve a dot-separated property path from a context object. Returns `undefined` for any missing segment.

| Parameter | Type | Description |
|-----------|------|-------------|
| `path` | string | Dot-separated property path (e.g., `"user.address.city"`) |
| `ctx` | context\|object | The context or object to resolve from |

```javascript
const ctx = NoJS.createContext({
  user: { address: { city: 'New York', zip: '10001' } }
});

NoJS.resolve('user.address.city', ctx); // "New York"
NoJS.resolve('user.address.zip', ctx);  // "10001"
NoJS.resolve('user.phone', ctx);        // undefined (safe, no error)
```

---

## Complete Example

Combining multiple API methods in a realistic application setup:

```html
<script src="https://cdn.no-js.dev/"></script>
<script>
  // Configure
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

  // Custom filter
  NoJS.filter('avatar', (email) => {
    return `https://gravatar.com/avatar/${email}?d=identicon`;
  });

  // Custom validator
  NoJS.validator('username', (value) => {
    return /^[a-zA-Z0-9_]{3,20}$/.test(value);
  });

  // Auth interceptor
  NoJS.interceptor('request', (url, opts) => {
    const token = NoJS.store.auth?.token;
    if (token) {
      opts.headers = opts.headers || {};
      opts.headers['Authorization'] = 'Bearer ' + token;
    }
    return opts;
  });

  // 401 handler
  NoJS.interceptor('response', (response) => {
    if (response.status === 401) {
      NoJS.store.auth.token = null;
      NoJS.store.auth.user = null;
      NoJS.notify();
      NoJS.router.push('/login');
    }
    return response;
  });

  // Analytics
  NoJS.on('route:change', (route) => {
    analytics.pageView(route.path);
  });
</script>
```
