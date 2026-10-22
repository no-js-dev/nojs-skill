# No.JS Configuration Reference

Complete reference for all `NoJS.config()` options. `NoJS.config()` can be called before or after `NoJS.init()`. After initialization only the sanitization keys (`sanitize`, `dangerouslyDisableSanitize`, `sanitizeHtml`) are locked, and `strictBindings` cannot be turned off once it is `true`.

## Contents

- [Usage](#usage)
- [Top-Level Options](#top-level-options)
- [HTTP Options](#http-options)
- [Cache Options](#cache-options)
- [Template Options](#template-options)
- [Sanitization Options](#sanitization-options)
- [Performance Options](#performance-options)
- [Development Options](#development-options)
- [Router Options](#router-options)
- [i18n Options](#i18n-options)
- [Opt-in Hardening Flags](#opt-in-hardening-flags)
- [Stores](#stores)
- [Merging Behavior](#merging-behavior)

---

## Usage

```javascript
NoJS.config({
  baseApiUrl: 'https://api.example.com',
  debug: true,
  router: { base: '/app' },
  stores: { cart: { items: [] } }
});
```

`NoJS.config()` works before or after `NoJS.init()`; it never throws. After `init()` starts, changing `sanitize`, `dangerouslyDisableSanitize` or `sanitizeHtml` logs `config.<key> cannot be changed after init()` and the value is ignored, and setting `strictBindings` back from `true` logs `config.strictBindings cannot be turned off after init()`. Both locks reset on `NoJS.dispose()`.

---

## Top-Level Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `appId` | string | `""` | Application identifier. Exposed via the devtools panel for distinguishing between multiple NoJS instances or environments |
| `debug` | boolean | `false` | Enable `[No.JS]` console logging for all framework operations |
| `devtools` | boolean | `false` | Enable the browser devtools panel integration |

---

## HTTP Options

Options controlling the behavior of fetch directives (`get`, `post`, `put`, `delete`, `patch`).

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `baseApiUrl` | string | `""` | Default base URL prepended to all fetch directive URLs |
| `headers` | object | `{}` | Default headers included in all HTTP requests, cross-origin requests included. Set `scopeHeaders: true` to send them only to trusted origins |
| `timeout` | number | `10000` | Request timeout in milliseconds |
| `retries` | number | `0` | Number of automatic retries on failed requests |
| `retryDelay` | number | `1000` | Delay between retries in milliseconds |
| `credentials` | string | `"same-origin"` | Fetch credentials mode |
| `csrf` | object\|null | `null` | CSRF token configuration |

### credentials

Controls which requests include cookies and authorization headers.

| Value | Behavior |
|-------|----------|
| `"same-origin"` | Include credentials only for same-origin requests (default) |
| `"include"` | Include credentials for all requests (cross-origin included) |
| `"omit"` | Never include credentials |

### csrf

When set, the token is sent in the configured header on mutating requests (`post`, `put`, `patch`, `delete`) to the page's own origin. `GET` and `QUERY` requests and cross-origin requests never receive it.

```javascript
NoJS.config({
  csrf: {
    token: document.querySelector('meta[name="csrf-token"]').content,
    header: 'X-CSRF-Token'
  }
});
```

| Property | Type | Description |
|----------|------|-------------|
| `token` | string | The CSRF token value |
| `header` | string | The HTTP header name to send the token in (default `X-CSRF-Token`). `X-CSRF-Token` is always a sensitive header: untrusted request interceptors cannot read or override it. A custom header name is protected the same way only with `strictRedaction: true` |

---

## Cache Options

Control HTTP response caching for fetch directives.

```javascript
NoJS.config({
  cache: {
    strategy: 'memory',
    ttl: 300000
  }
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `cache.strategy` | string | `"none"` | Caching strategy |
| `cache.ttl` | number | `300000` | Time-to-live in milliseconds (5 minutes) |

### strategy

| Value | Behavior |
|-------|----------|
| `"none"` | No caching (default) |
| `"memory"` | In-memory LRU cache (max 200 entries) |
| `"local"` | `localStorage`-backed cache |
| `"session"` | `sessionStorage`-backed cache |

The in-memory cache holds a maximum of **200 entries** with LRU (Least Recently Used) eviction.

---

## Template Options

Control remote template loading behavior.

```javascript
NoJS.config({
  templates: { cache: true }
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `templates.cache` | boolean | `true` | Cache loaded remote templates to avoid duplicate fetches |
| `templates.pageRelative` | boolean | `false` | Opt-in. Resolve `<template src>` against the page and ignore the nearest `base` attribute and `baseApiUrl`. By default `src` is resolved like an HTTP directive URL (nearest `base`, else `baseApiUrl`, else as written). See [templates.md](../directives/templates.md#how-src-is-resolved) |

---

## Sanitization Options

Control HTML sanitization for `bind-html` directives.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `sanitize` | boolean | `true` | Sanitize HTML content in `bind-html` using the built-in DOMParser-based sanitizer |
| `dangerouslyDisableSanitize` | boolean | `false` | Explicit opt-out of all HTML sanitization. **Use with extreme caution** -- this exposes the application to XSS |
| `sanitizeHtml` | function\|null | `null` | Custom sanitizer function to replace the built-in sanitizer |
| `strictBindings` | boolean | `false` | Opt-in. Reject `bind-on*` event-handler attributes and sanitize `bind-srcdoc` like `bind-html`. See [Opt-in Hardening Flags](#opt-in-hardening-flags) |

### Custom sanitizer

Provide a custom function that receives raw HTML and returns sanitized HTML. This replaces the built-in DOMParser-based sanitizer entirely.

```javascript
// Using DOMPurify as the sanitizer
NoJS.config({
  sanitizeHtml: (html) => DOMPurify.sanitize(html)
});
```

The custom function signature: `(html: string) => string`.

---

## Performance Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `exprCacheSize` | number | `500` | Maximum number of parsed expression ASTs to cache (LRU eviction) |
| `maxEventListeners` | number | `100` | Maximum event listeners per event name. Exceeding this limit logs a memory leak warning |

```javascript
// Large application with many dynamic expressions
NoJS.config({
  exprCacheSize: 2000,
  maxEventListeners: 500
});
```

---

## Development Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `debug` | boolean | `false` | Enable verbose console logging with `[No.JS]` prefix |
| `devtools` | boolean | `false` | Enable the browser devtools panel. The `window.__NOJS_DEVTOOLS__` API is installed only on local hosts, but `nojs:devtools` events are dispatched on any host unless `strictDevtools: true`. See [devtools.md](../devtools.md) |
| `strictDevtools` | boolean | `false` | Opt-in. Limit devtools events to local hosts and redact devtools snapshots, config and fetch URLs. See [Opt-in Hardening Flags](#opt-in-hardening-flags) |
| `appId` | string | `""` | Application identifier shown in devtools |

When `debug` is `true`, the framework logs directive processing, expression evaluation, store changes, route transitions, and interceptor execution.

---

## Router Options

Client-side router configuration. When present, `NoJS.init()` creates and starts the router.

```javascript
NoJS.config({
  router: {
    useHash: false,
    base: '/app',
    scrollBehavior: 'smooth',
    templates: 'pages',
    ext: '.tpl',
    focusBehavior: 'none',
    suppressHashWarning: false,
    viewTransition: true
  }
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `router.useHash` | boolean | `false` | Use hash-based routing (`/#/path`) instead of History API |
| `router.base` | string | `"/"` | URL prefix for all routes (history mode). `$route.path` / `router.current.path` exclude it, and routes and `push()` paths are written without it. `<base href>` is not read |
| `router.scrollBehavior` | string | `"top"` | Scroll behavior on route change: `"top"`, `"smooth"`, `"none"` |
| `router.templates` | string | `"pages"` | Directory path for route template files. A relative path resolves against the current URL; in history mode use an absolute path (`'/pages'`) so deep links to nested routes load their templates |
| `router.ext` | string | `".tpl"` | File extension for route template files |
| `router.focusBehavior` | string | `"none"` | Focus management on route change |
| `router.suppressHashWarning` | boolean | `false` | Suppress the warning about hash fragments conflicting with hash routing |
| `router.viewTransition` | boolean | `true` | Enable View Transitions API for route changes (when supported by the browser) |

---

## i18n Options

Internationalization configuration for the `t` directive and locale management.

```javascript
NoJS.config({
  i18n: {
    defaultLocale: 'en',
    fallbackLocale: 'en',
    detectBrowser: true,
    loadPath: '/locales/{locale}/{ns}.json',
    ns: ['common', 'auth'],
    supportedLocales: ['en', 'pt', 'es'],
    cache: true,
    persist: true
  }
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `i18n.defaultLocale` | string | `"en"` | Default locale code |
| `i18n.fallbackLocale` | string | `"en"` | Fallback locale when a translation key is missing in the active locale |
| `i18n.detectBrowser` | boolean | `false` | Auto-detect locale from `navigator.language` on initialization |
| `i18n.loadPath` | string\|null | `null` | URL pattern for locale files. Supports `{locale}` and `{ns}` placeholders |
| `i18n.ns` | string[] | `[]` | Namespaces to load |
| `i18n.supportedLocales` | string[] | `[]` | Locales eligible for browser detection under `loadPath`. On first visit `detectBrowser` adopts the browser language (or its prefix, e.g. `pt` from `pt-BR`) only when present in this list. Locale priority: persisted `nojs-locale` > detection > `defaultLocale` |
| `i18n.cache` | boolean | `true` | Cache loaded locale JSON files to avoid duplicate fetches |
| `i18n.persist` | boolean | `false` | Persist the selected locale to `localStorage` so it survives page reloads. The persisted value is restored even when it is not in `supportedLocales`, unless `i18n.strictLocale: true` |
| `i18n.escapeParams` | boolean | `false` | Opt-in. HTML-escape `t-*` param values in `t-html` translations. By default params are inserted raw and the combined result is sanitized. Plain `t` is not affected. Changing it after `init()` re-renders active translations |
| `i18n.strictLocale` | boolean | `false` | Opt-in. Ignore (and remove from `localStorage`) a persisted `nojs-locale` that is not listed in a non-empty `supportedLocales`. Read only by the `NoJS.i18n()` call that restores the locale: pass it in that call, or set it with `config()` before it |

---

## Opt-in Hardening Flags

Stricter security behaviors are opt-in, so apps built on v1.21.1 keep working unchanged. Every flag defaults to `false` (v1.21.1 behavior) and is set with `NoJS.config()`. Most take effect immediately, before or after `init()`. Exceptions:

- `strictDirectives` applies to the directive registrations made after it is set. The core registry is frozen as soon as No.JS loads, so set it before any `NoJS.directive()` or `NoJS.use()` call.
- `i18n.strictLocale` applies only to the `NoJS.i18n()` call that restores the persisted locale.
- `strictBindings` is read when each binding initializes, so set it before `NoJS.init()`. Once `true`, it cannot be turned off after `init()`.

| Flag | Default | When `true` |
|------|---------|-------------|
| `scopeHeaders` | `false` | Global `config({ headers })` are sent only to trusted origins: the page, the `baseApiUrl` origin and the origin of the nearest `base` attribute. Per-request `headers` still apply to any origin. Default: global headers go with every request, cross-origin included |
| `strictRedaction` | `false` | Untrusted request and response interceptors, `fetch:success` / `fetch:error` / `error` event payloads and request failure warnings get a string-level redacted URL: the `#fragment` is dropped and the values of sensitive query parameters become `[REDACTED]` (names matched by word, so `author` or `keyword` stay intact). The `csrf.header` name is withheld from untrusted interceptors and cannot be overridden by them. Response headers that are sensitive as request headers (`authorization`, `x-auth-*`, `x-api-*`, ...) are also stripped from the response proxy |
| `strictDirectives` | `false` | `NoJS.directive()` / `app.directive()` reject names covered by a core wildcard (`on:*`, `bind-*`, `class-*`, `style-*`) with a warning |
| `strictDevtools` | `false` | `nojs:devtools` events and context ids are also limited to local hosts. Devtools snapshots, `globals`, plugin `options` and `ctx:updated` values redact sensitive names (matched by word) at every depth; the `config` getter redacts headers per key; devtools fetch events redact tokens in URLs |
| `strictJsonld` | `false` | `page-jsonld` placeholders inside JSON strings are always escaped as JSON string content, so a value cannot end the string or add keys, and a value with `"`, `\` or a line break no longer makes the output invalid JSON. `<` in values becomes `\u003c`. Default: the v1.21.1 output byte-for-byte |
| `strictBindings` | `false` | `bind-on*` event-handler attributes (any `bind-on*` name without a hyphen: `bind-onclick`, `bind-onerror`, ...) are rejected with a `[Security]` warning; `bind-onboarding-step` still binds. `bind-srcdoc` values go through the `bind-html` sanitizer (or your `sanitizeHtml`) |
| `templates.pageRelative` | `false` | `<template src>` resolves against the page and ignores `base` and `baseApiUrl` |
| `i18n.escapeParams` | `false` | `t-*` params in `t-html` translations are HTML-escaped before interpolation |
| `i18n.strictLocale` | `false` | A persisted `nojs-locale` not listed in a non-empty `supportedLocales` is ignored and removed when `NoJS.i18n()` restores it |

```javascript
NoJS.config({
  scopeHeaders: true,
  strictRedaction: true,
  strictDevtools: true,
  strictJsonld: true,
  strictBindings: true,
  templates: { pageRelative: true },
  i18n: { escapeParams: true }
});
```

---

## Stores

Define global reactive stores at config time. Each key becomes a named store accessible via `$store.<name>` in templates and `NoJS.store.<name>` in JavaScript.

```javascript
NoJS.config({
  stores: {
    auth: { user: null, token: null, loading: false },
    cart: { items: [], total: 0 },
    ui: { sidebarOpen: true, theme: 'light' }
  }
});
```

```html
<span bind="$store.auth.user?.name ?? 'Guest'"></span>
<div if="$store.cart.items.length > 0">
  <span bind="$store.cart.items | count"></span> items
</div>
```

Stores are deeply reactive -- nested property assignments automatically trigger re-evaluation of dependent expressions. The `stores` key is consumed at config time and removed from the config object afterward.

---

## Merging Behavior

Nested option objects (`headers`, `cache`, `templates`, `router`, `i18n`) are **merged** with existing values, not replaced. This allows incremental configuration:

```javascript
// First call sets defaults
NoJS.config({
  headers: { 'Accept': 'application/json' },
  router: { base: '/app' }
});

// Second call merges -- does not overwrite router.base
NoJS.config({
  headers: { 'X-Custom': 'value' },
  router: { scrollBehavior: 'smooth' }
});

// Result:
// headers: { 'Accept': 'application/json', 'X-Custom': 'value' }
// router: { base: '/app', scrollBehavior: 'smooth', ... }
```

The `stores` key is the exception -- it creates stores and is then removed from the config object.
