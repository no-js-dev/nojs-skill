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

### Safe by default

The `bind` directive (without `-html`) uses `textContent`, which is inherently safe -- no HTML is parsed or rendered.

```html
<!-- Safe: uses textContent -->
<span bind="userInput"></span>

<!-- Sanitized: HTML is cleaned before insertion -->
<div bind-html="richContent"></div>
```

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

Configure automatic CSRF token injection for all fetch directive requests.

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

When configured, every request made by `get`, `post`, `put`, `delete`, and `patch` directives automatically includes this header.

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

**Untrusted response interceptors** receive a proxy that hides sensitive response headers:

| Redacted Response Headers |
|---------------------------|
| `set-cookie` |
| `x-csrf-token` |
| `x-auth-token` |
| `www-authenticate` |
| `proxy-authenticate` |

### URL Parameter Redaction

For untrusted interceptors, URL query parameters matching the following pattern are replaced with `[REDACTED]`:

```
token|key|secret|auth|password|credential
```

(Case-insensitive match)

Example: `https://api.example.com/data?token=abc123` becomes `https://api.example.com/data?token=[REDACTED]`.

### Untrusted Response Isolation

Response objects passed to untrusted interceptors are wrapped in a `Proxy` that prevents modification of the original response. This ensures one interceptor cannot tamper with data that other interceptors or the application will consume.

### Trusted Plugins

Plugins can be granted trusted interceptor access, which bypasses header redaction:

```javascript
const AuthPlugin = {
  name: 'auth',
  trusted: true,  // must be set before NoJS.use()
  install(app) {
    app.interceptor('request', (url, opts) => {
      // Can see Authorization header, cookies, etc.
      return opts;
    });
  }
};

NoJS.use(AuthPlugin);
```

Only grant `trusted: true` to first-party plugins that genuinely need access to credentials.

### Additional interceptor guards

| Guard | Description |
|-------|-------------|
| **Timeout** | Interceptors have a built-in execution timeout to prevent hangs |
| **Recursion depth** | Nested interceptor invocations are guarded to prevent infinite loops |
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
// Global headers via config
NoJS.config({
  headers: { 'Authorization': 'Bearer ' + token }
});

// Dynamic headers via interceptor
NoJS.interceptor('request', (url, opts) => {
  opts.headers['Authorization'] = 'Bearer ' + getToken();
  return opts;
});
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

After `NoJS.init()`, core directive names are frozen. Plugins can only register NEW directive names -- they cannot override built-in directives.

### Ownership tracking

When `NoJS.global()` or `NoJS.interceptor()` is called during `NoJS.use()`, the registration is tracked with the plugin name. During `NoJS.dispose()`, all plugin-owned state is cleaned up in reverse installation order.

### Interceptor isolation

Untrusted interceptors (any interceptor not registered via a `trusted: true` plugin) receive:
- Redacted request headers
- Redacted response headers
- Proxy-wrapped response objects
- Redacted URL query parameters

---

## Best Practices

1. **Keep `sanitize: true`** (the default). Only disable sanitization if you fully control the HTML content.

2. **Use interceptors for auth headers** instead of inline `headers` attributes. Interceptors centralize credential management and enable redaction.

3. **Set `credentials: 'same-origin'`** (the default) unless cross-origin cookie sending is required.

4. **Configure CSRF protection** for applications with server-rendered forms.

5. **Use `nonce`-based CSP** when possible. NoJS is fully compatible with strict CSP policies.

6. **Grant `trusted: true` sparingly**. Only first-party auth plugins should bypass interceptor redaction.

7. **Avoid `dangerouslyDisableSanitize`**. If the built-in sanitizer is insufficient, provide a custom `sanitizeHtml` function (e.g., DOMPurify) instead.

8. **Do not expose credentials in `NoJS.global()`**. While dangerous value checks block `eval`/`Function`, avoid storing tokens or secrets as global reactive variables where they are accessible from template expressions.

9. **Use `NoJS.config({ headers })` for static secrets**. The config-level headers are applied directly to requests without passing through the expression engine.

10. **Subresource Integrity (SRI)**: When loading NoJS from a CDN in production, add `integrity` and `crossorigin` attributes to the script tag to protect against CDN compromise:
    ```html
    <script src="https://cdn.no-js.dev/"
            integrity="sha384-..."
            crossorigin="anonymous"></script>
    ```
