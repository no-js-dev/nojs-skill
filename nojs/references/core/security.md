# No.JS Security Reference

No.JS is designed with defense-in-depth: a sandboxed expression engine, HTML sanitization, allow-list-based global access, prototype pollution guards, and interceptor isolation.

## Contents

- [Expression Sandboxing](#expression-sandboxing)
- [HTML Sanitization](#html-sanitization)
- [Content Security Policy (CSP)](#content-security-policy-csp)
- [CSRF Protection](#csrf-protection)
- [CORS and Credentials](#cors-and-credentials)
- [Prototype Pollution Protection](#prototype-pollution-protection)
- [Interceptor Security](#interceptor-security)
  - [Header Redaction](#header-redaction)
  - [URL Parameter Redaction](#url-parameter-redaction)
  - [Untrusted Response Isolation](#untrusted-response-isolation)
  - [Trusted Plugins](#trusted-plugins)
- [Sensitive Header Warning](#sensitive-header-warning)
- [Global Variable Security](#global-variable-security)
- [Nonce Attributes](#nonce-attributes)
- [Network Access Restrictions](#network-access-restrictions)
- [Browser Global Proxies](#browser-global-proxies)
- [Plugin Security](#plugin-security)
- [Opt-in Hardening Flags](#opt-in-hardening-flags)
- [Best Practices](#best-practices)

---

## Expression Sandboxing

No.JS uses a custom recursive-descent parser and tree-walking evaluator. No `eval()` or `Function()` constructor is ever called.

**Key properties**:

- **No dynamic code execution**: The parser produces an AST that is walked by the evaluator. There is no string-to-code path.
- **Allow-list globals**: Only curated JS built-ins (`_SAFE_GLOBALS`) and browser APIs (`_BROWSER_GLOBALS`) are accessible. See the [Expressions Reference](expressions.md) for the complete lists.
- **Forbidden properties**: `__proto__`, `constructor`, and `prototype` are blocked at both the tokenizer and evaluator levels.
- **No network access from expressions**: `fetch`, `XMLHttpRequest`, `localStorage`, `sessionStorage`, `WebSocket`, and `indexedDB` are not on any allow-list.
- **Identifier resolution stops before `Object.prototype`**: The scope-chain walk uses `hasOwnProperty` checks and terminates before reaching inherited properties like `toString`, `valueOf`, or `hasOwnProperty` itself.

---

## HTML Sanitization

The `bind-html` directive sanitizes HTML before insertion into the DOM.

### Built-in sanitizer

NoJS ships a DOMParser-based structural sanitizer that:

1. Parses the HTML string into a DOM document via `DOMParser`
2. Walks the resulting tree
3. Removes dangerous elements and attributes (script tags, event handlers, etc.)
4. Returns the cleaned HTML

### Configuration

```javascript
// Default: sanitization enabled
NoJS.config({ sanitize: true });

// Use a custom sanitizer (e.g., DOMPurify)
NoJS.config({
  sanitizeHtml: (html) => DOMPurify.sanitize(html)
});

// DANGEROUS: disable sanitization entirely
NoJS.config({
  dangerouslyDisableSanitize: true
});
```

| Option | Default | Description |
|--------|---------|-------------|
| `sanitize` | `true` | Enable/disable the built-in sanitizer |
| `sanitizeHtml` | `null` | Custom sanitizer function `(html: string) => string` |
| `dangerouslyDisableSanitize` | `false` | Bypass all sanitization. Only use when content is fully trusted |

These three keys are locked once `NoJS.init()` starts: changing them later logs a warning and is ignored.

### Safe by default

The `bind` directive (without `-html`) uses `textContent`, which is inherently safe -- no HTML is parsed or rendered.

```html
<!-- Safe: uses textContent -->
<span bind="userInput"></span>

<!-- Sanitized: HTML is cleaned before insertion -->
<div bind-html="richContent"></div>
```

### `bind-*` and `strictBindings`

By default (v1.21.1 behavior) `bind-*` writes any attribute name. URL attributes (`href`, `src`, `action`, ...) are still checked for `javascript:` / `vbscript:` / non-image `data:` URIs, but two cases are not sanitized:

- **Inline handlers** -- `bind-onclick="handler"` sets an `onclick` attribute whose value comes from state and runs as code. If that value can come from an API response, the URL or a persisted store, it is an XSS vector. Use `on:click` instead.
- **`bind-srcdoc`** -- the value is a whole HTML document rendered inside the `<iframe>`, written as-is, so scripts in it run inside the frame. Only bind trusted markup, or isolate the frame with `sandbox`.

Set `NoJS.config({ strictBindings: true })` before `NoJS.init()` to close both: any `bind-on*` name without a hyphen (`bind-onclick`, `bind-onerror`, `bind-OnMouseOver`) is never set and logs `[No.JS] [Security] bind-onclick rejected: event-handler attributes are not bindable — use on:click instead.` (names with a hyphen, such as `bind-onboarding-step`, still bind), and `bind-srcdoc` values go through the `bind-html` sanitizer (or your `sanitizeHtml`) on every update. The flag is read when each binding initializes; once `true`, it cannot be turned off after `init()`.

---

## Content Security Policy (CSP)

NoJS is fully CSP-compatible without requiring `unsafe-eval` or `unsafe-inline` for scripts.

**Why**:
- The expression engine is a custom parser/evaluator -- no `eval()` or `Function()` is called
- Event handlers are attached programmatically via `addEventListener`, not via inline `onclick` attributes
- No `document.write()` or dynamic `<script>` injection

### Recommended CSP headers

```
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.no-js.dev; style-src 'self' 'unsafe-inline'
```

If you use `nonce`-based CSP, add the nonce to the NoJS script tag:

```html
<script src="https://cdn.no-js.dev/" nonce="abc123"></script>
```

### Inline styles

NoJS `style-*` and `style-map` directives set styles via the `element.style` property (not inline `style` attributes), so they work under strict CSP. However, if your CSP blocks all inline styles, you may need `'unsafe-inline'` for `style-src` or use `nonce`-based style policies.

---

## CSRF Protection

Configure automatic CSRF token injection for mutating requests to the page's own origin.

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
| `header` | string | The HTTP header name |

When configured, `post`, `put`, `patch` and `delete` requests (directives and `call`) to the page's own origin include this header (default name `X-CSRF-Token`). `GET` and `QUERY` requests and cross-origin requests never receive the token. By default untrusted request interceptors can read and override the header; with `strictRedaction: true` it is withheld from them.

### Server-side integration

```html
<!-- Server renders the token in a meta tag -->
<meta name="csrf-token" content="<%= csrfToken %>">

<script>
  NoJS.config({
    csrf: {
      token: document.querySelector('meta[name="csrf-token"]').content,
      header: 'X-CSRF-Token'
    }
  });
</script>
```

---

## CORS and Credentials

Control how credentials (cookies, authorization headers) are sent with cross-origin requests.

```javascript
NoJS.config({
  credentials: 'same-origin'  // default
});
```

| Value | Behavior |
|-------|----------|
| `"same-origin"` | Include credentials only for same-origin requests (default) |
| `"include"` | Include credentials for all requests, including cross-origin |
| `"omit"` | Never include credentials |

When using `"include"`, the server must respond with `Access-Control-Allow-Credentials: true` and a specific `Access-Control-Allow-Origin` (not `*`).

### Global headers and other origins

Headers set with `NoJS.config({ headers })` are sent with **every** request by default, including requests to other origins (v1.21.1 behavior). If they carry a token, set `scopeHeaders: true` to send them only to trusted origins: the page, the `baseApiUrl` origin and the origin of the nearest `base` attribute. Per-request `headers` attributes still apply to any origin.

```javascript
NoJS.config({
  baseApiUrl: 'https://api.example.com',
  headers: { Authorization: 'Bearer ' + token },
  scopeHeaders: true
});
```


---

## Prototype Pollution Protection

NoJS blocks prototype pollution at multiple levels:

### Expression evaluator

- The tokenizer flags `__proto__`, `constructor`, and `prototype` as `Forbidden` tokens
- Property access via member expressions (`obj.constructor`) returns `undefined` for forbidden names
- Computed property access (`obj['__proto__']`) is similarly blocked
- Spread operations (`{...obj}`) filter forbidden keys from the source

### Global variables

- `NoJS.global()` rejects names in the `_FORBIDDEN_GLOBAL_KEYS` set: `__proto__`, `constructor`, `prototype`
- The global store is never directly exposed to expressions -- only proxied values

### Plugin system

- Plugin names are validated
- Global ownership is tracked per-plugin
- Dangerous function references (`eval`, `Function`) are rejected as global values

---

## Interceptor Security

Interceptors process HTTP requests and responses. NoJS isolates untrusted interceptors to prevent credential leakage.

### Header Redaction

**Untrusted request interceptors** receive a sanitized copy of request options with sensitive headers redacted:

| Redacted Request Headers |
|--------------------------|
| `authorization` |
| `x-api-key` |
| `x-auth-token` |
| `cookie` |
| `proxy-authorization` |
| `set-cookie` |
| `x-csrf-token` |
| Any header matching `/^x-(auth\|api)-/i` |
| The `csrf.header` name (only with `strictRedaction: true`) |

**Untrusted response interceptors** receive a proxy that hides sensitive response headers:

| Redacted Response Headers |
|---------------------------|
| `set-cookie` |
| `x-csrf-token` |
| `x-auth-token` |
| `www-authenticate` |
| `proxy-authenticate` |

With `strictRedaction: true`, response headers that are sensitive as request headers (`authorization`, `cookie`, `x-api-key`, `x-auth-*`, `x-api-*`, the `csrf.header` name, ...) are stripped too.

### URL Parameter Redaction

By default (v1.21.1 behavior), only the URL handed to **untrusted response interceptors** (and the response proxy's `url`) is redacted. Query parameters whose name contains one of the following words (case-insensitive substring) have their value replaced:

```
token|key|secret|auth|password|credential
```

The URL is re-serialized by the `URL` API, so `https://api.example.com/data?token=abc123` becomes `https://api.example.com/data?token=%5BREDACTED%5D`. Untrusted **request** interceptors, the `url` in `fetch:success` / `fetch:error` / `error` event payloads and the request failure warnings (`GET /api/x?token=... failed:`) get the **raw URL**.

With `NoJS.config({ strictRedaction: true })`, all of those consumers get the same string-level redacted URL: the `#fragment` is dropped (it can carry tokens such as an OAuth implicit-flow `access_token`), and the values of sensitive parameters become a literal `[REDACTED]` with the rest of the URL unchanged: `https://api.example.com/data?token=[REDACTED]`. Names are matched by word, not substring: `token`, `access_token`, `api_key`, `apiKey`, `password`, `secret`, `session`, `sessionId`, `auth`, `authorization` are redacted, while `author`, `keyword`, `keyboard` and `sort_key` stay intact. The request itself always goes to the real URL. Trusted plugins always see the raw URL.

### Untrusted Response Isolation

Response objects passed to untrusted interceptors are wrapped in a `Proxy` that prevents modification of the original response. This ensures one interceptor cannot tamper with data that other interceptors or the application will consume.

### Trusted Plugins

Plugins can be granted trusted interceptor access, which bypasses header and URL redaction. Pass `{ trusted: true }` as the `NoJS.use()` options (a `trusted` property on the plugin object itself is ignored). NoJS logs a warning naming the plugin when trust is granted:

```javascript
const AuthPlugin = {
  name: 'auth',
  install(app) {
    app.interceptor('request', (url, opts) => {
      // Can see Authorization header, cookies, etc.
      return opts;
    });
  }
};

NoJS.use(AuthPlugin, { trusted: true });
```

Only grant `trusted: true` to first-party plugins that genuinely need access to credentials.

### Additional interceptor guards

| Guard | Description |
|-------|-------------|
| **Timeout** | Interceptors have a built-in execution timeout to prevent hangs |
| **Re-entrancy** | A fetch issued synchronously from inside a request interceptor skips the request interceptor chain, so an interceptor cannot loop on itself. The guard is scoped to that call and never affects concurrent requests |
| **Registration during dispose** | Interceptor registration is blocked during `NoJS.dispose()` |
| **AbortError bypass** | Requests aborted via `NoJS.CANCEL` are never retried |

---

## Sensitive Header Warning

Setting sensitive headers directly in fetch directive attributes triggers an unconditional console warning:

```html
<!-- WARNING: sensitive headers in attributes -->
<div get="/api/data" headers="{'Authorization': 'Bearer token'}">...</div>
```

**Detected header names**: `Authorization`, `Cookie`, `X-CSRF-Token`, `X-API-Key`.

**Recommended alternatives**:

```javascript
// Global headers via config (scopeHeaders keeps them off other origins)
NoJS.config({
  headers: { 'Authorization': 'Bearer ' + token },
  scopeHeaders: true
});

// Dynamic headers via a trusted plugin's interceptor. Sensitive headers
// (Authorization, Cookie, X-API-Key, ...) set by untrusted interceptors are dropped.
NoJS.use({
  name: 'auth-token',
  install(app) {
    app.interceptor('request', (url, opts) => {
      opts.headers['Authorization'] = 'Bearer ' + getToken();
      return opts;
    });
  }
}, { trusted: true });
```

---

## Global Variable Security

`NoJS.global()` enforces multiple safety checks:

1. **Reserved names** -- A large set of names (`store`, `route`, `router`, `i18n`, `refs`, `form`, `parent`, `watch`, `set`, `notify`, etc.) are reserved and cannot be used
2. **Forbidden keys** -- `__proto__`, `constructor`, `prototype` are blocked
3. **Dangerous values** -- References to `eval` or `Function` are rejected
4. **Ownership tracking** -- Globals registered during plugin installation are tracked and cleaned up during `NoJS.dispose()`

---

## Nonce Attributes

For CSP policies that use nonces, add the `nonce` attribute to the NoJS `<script>` tag:

```html
<script src="https://cdn.no-js.dev/" nonce="<%= nonce %>"></script>
```

NoJS-generated DOM elements do not inject `<script>` or `<style>` tags, so no additional nonce management is needed for framework-created content. The `bind-html` sanitizer strips `<script>` tags from user content.

---

## Network Access Restrictions

Template expressions have **no direct network access**. The following APIs are deliberately excluded from all allow-lists:

| Blocked API | Reason |
|-------------|--------|
| `fetch` | Prevents expressions from making arbitrary HTTP requests |
| `XMLHttpRequest` | Prevents expressions from making arbitrary HTTP requests |
| `WebSocket` | Prevents persistent network connections |
| `localStorage` | Prevents storage reads/writes that could exfiltrate data |
| `sessionStorage` | Same as localStorage |
| `indexedDB` | Prevents database access |
| `window.open` | Prevents popup windows and navigation |
| `window.postMessage` | Prevents cross-origin messaging |
| `navigator.sendBeacon` | Prevents background data transmission |

All HTTP operations must go through NoJS fetch directives (`get`, `post`, `put`, `delete`, `patch`), which apply interceptors, CSRF tokens, timeouts, and header management.

---

## Browser Global Proxies

`window`, `document`, `location`, `history`, and `navigator` are wrapped in `Proxy` objects that enforce read-only access and block sensitive sub-properties. See the [Expressions Reference](expressions.md#security-proxies) for the complete blocked property lists per proxy.

Key behaviors:
- **Window proxy**: All property writes are silently swallowed (no-op). Sensitive sub-properties return `undefined`.
- **Document proxy**: `cookie`, `domain`, `write`, `writeln`, `execCommand` are blocked. `defaultView` returns the safe window proxy.
- **Location proxy**: All writes are blocked. Properties like `href`, `pathname`, `search` are readable.
- **History proxy**: Navigation methods are blocked. `length` and `state` are readable.
- **Navigator proxy**: `sendBeacon` and `credentials` are blocked. Properties like `language`, `userAgent`, `onLine` are readable.

---

## Plugin Security

### Plugin name validation

Plugin names must be non-empty strings. Duplicate plugin names are rejected with a warning.

### Directive registry freezing

Core directive names are frozen as soon as No.JS loads, before `NoJS.init()` runs. Plugins can only register NEW directive names -- they cannot override built-in directives (`Cannot override core directive "<name>".`). A name covered by a core wildcard (`on:*`, `bind-*`, `class-*`, `style-*`, e.g. `bind-chart`) is accepted and wins for that exact attribute only. Set `strictDirectives: true` before any `NoJS.directive()` / `NoJS.use()` call to reject such names, so the core `bind-*` handler keeps sanitizing `bind-href`, `bind-src` and the rest.

### Ownership tracking

When `NoJS.global()` or `NoJS.interceptor()` is called during `NoJS.use()`, the registration is tracked with the plugin name. During `NoJS.dispose()`, all plugin-owned state is cleaned up in reverse installation order.

### Interceptor isolation

Untrusted interceptors (any interceptor not registered by a plugin installed with `NoJS.use(plugin, { trusted: true })`) receive:
- Redacted request headers
- Redacted response headers
- Proxy-wrapped response objects
- Redacted URL query parameters (response interceptors by default; request interceptors too with `strictRedaction`)

---

## Opt-in Hardening Flags

Stricter behaviors are opt-in, so apps built on v1.21.1 keep working unchanged. Every flag defaults to `false` and is set with `NoJS.config()`. See [Configuration](config.md#opt-in-hardening-flags) for when each one takes effect.

| Flag | Hardening when `true` |
|------|----------------------|
| `scopeHeaders` | Global `config({ headers })` go only to trusted origins (page, `baseApiUrl`, nearest `base`) |
| `strictRedaction` | String-level URL redaction (fragment dropped, sensitive values `[REDACTED]`, names matched by word) for untrusted interceptors, fetch event payloads and failure warnings; `csrf.header` withheld; request-sensitive response headers stripped |
| `strictDirectives` | Reject plugin directive names covered by core wildcards |
| `strictDevtools` | Devtools events and context ids limited to local hosts; snapshots, `globals`, plugin options, `ctx:updated` values and the `config` getter redacted by word at every depth; devtools fetch URLs redacted |
| `strictJsonld` | Always JSON-escape `page-jsonld` placeholders inside JSON strings (untrusted data cannot add keys) |
| `strictBindings` | Reject `bind-on*` handler attributes; sanitize `bind-srcdoc` like `bind-html`. Set before `init()`; cannot be turned off after |
| `templates.pageRelative` | Resolve `<template src>` against the page, not `base` / `baseApiUrl` |
| `i18n.escapeParams` | HTML-escape `t-*` params in `t-html` |
| `i18n.strictLocale` | Ignore a persisted locale not in a non-empty `supportedLocales` |

For a production app that sends tokens in global headers, loads third-party plugins, puts route or user data in `page-jsonld`, or binds attributes from untrusted data, consider `scopeHeaders`, `strictRedaction`, `strictJsonld` and `strictBindings`. Never ship `devtools: true`; if you must, also set `strictDevtools: true`.

---

## Best Practices

1. **Keep `sanitize: true`** (the default). Only disable sanitization if you fully control the HTML content.

2. **Use interceptors for auth headers** instead of inline `headers` attributes. Interceptors centralize credential management and enable redaction.

3. **Set `credentials: 'same-origin'`** (the default) unless cross-origin cookie sending is required.

4. **Configure CSRF protection** for applications with server-rendered forms.

5. **Use `nonce`-based CSP** when possible. NoJS is fully compatible with strict CSP policies.

6. **Grant `{ trusted: true }` sparingly** (it is a `NoJS.use()` option). Only first-party auth plugins should bypass interceptor redaction.

7. **Avoid `dangerouslyDisableSanitize`**. If the built-in sanitizer is insufficient, provide a custom `sanitizeHtml` function (e.g., DOMPurify) instead.

8. **Do not expose credentials in `NoJS.global()`**. While dangerous value checks block `eval`/`Function`, avoid storing tokens or secrets as global reactive variables where they are accessible from template expressions.

9. **Use `NoJS.config({ headers })` for static secrets, with `scopeHeaders: true`**. The config-level headers are applied directly to requests without passing through the expression engine, but by default they are sent to every origin.

10. **Subresource Integrity (SRI)**: When loading NoJS from a CDN in production, add `integrity` and `crossorigin` attributes to the script tag to protect against CDN compromise:
    ```html
    <script src="https://cdn.no-js.dev/"
            integrity="sha384-..."
            crossorigin="anonymous"></script>
    ```
