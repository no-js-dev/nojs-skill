# No.JS Troubleshooting Reference

Common issues, their causes, and fixes when developing with the No.JS framework.

## Contents

- [1. Common Console Warnings](#1-common-console-warnings) — Real warning messages from the framework and how to resolve them
  - [Expression Error](#expression-error)
  - [Unknown Filter](#unknown-filter)
  - [Failed to Load Template](#failed-to-load-template)
  - [Insecure Template URL](#insecure-template-url)
  - [Persist Without persist-key](#persist-without-persist-key)
  - [Persist Schema Warnings](#persist-schema-warnings)
  - [Sensitive State Keys](#sensitive-state-keys)
  - [Sensitive Headers Inline](#sensitive-headers-inline)
  - [Route Guard Failed Without Redirect](#route-guard-failed-without-redirect)
  - [Hash Mode SEO Warning](#hash-mode-seo-warning)
  - [Deprecated CSP Config](#deprecated-csp-config)
  - [Deprecated sanitize:false](#deprecated-sanitizefalse)
  - [HTML Sanitization Disabled](#html-sanitization-disabled)
  - [Deprecated Loop Syntax](#deprecated-loop-syntax)
  - [Security Warning for bind-html](#security-warning-for-bind-html)
  - [Cannot Override Core Directive](#cannot-override-core-directive)
  - [MaxListenersExceeded](#maxlistenersexceeded)
  - [Plugin Warnings](#plugin-warnings)
  - [drag-multiple Without drag-group](#drag-multiple-without-drag-group)
  - [Infinite Loop in Nested Outlets](#infinite-loop-in-nested-outlets)
  - [i18n Load Failures](#i18n-load-failures)
  - [Class-Based Route Transitions Deprecated](#class-based-route-transitions-deprecated)
- [2. Debugging Reactive State](#2-debugging-reactive-state) — How proxy-backed contexts work and why mutations might not trigger updates
  - [State Not Updating After Direct Object Mutation](#state-not-updating-after-direct-object-mutation)
  - [Nested Property Changes Not Detected](#nested-property-changes-not-detected)
  - [Context Inheritance and Shadowing](#context-inheritance-and-shadowing)
  - [Store Mutations From External JS](#store-mutations-from-external-js)
  - [Batch Updates Swallowing Changes](#batch-updates-swallowing-changes)
- [3. Directive Priority Conflicts](#3-directive-priority-conflicts) — What happens when directives compete and resolution order
  - [Priority Reference Table](#priority-reference-table)
  - [State Must Initialize Before Bindings](#state-must-initialize-before-bindings)
  - [Loop and Conditional Conflicts](#loop-and-conditional-conflicts)
- [4. CSP Issues](#4-csp-issues) — How the expression parser avoids eval and what might still trip CSP
  - [No eval or new Function](#no-eval-or-new-function)
  - [Inline Event Handlers](#inline-event-handlers)
  - [External Template Loading and connect-src](#external-template-loading-and-connect-src)
  - [Built-in Sanitizer Blocked Tags](#built-in-sanitizer-blocked-tags)
  - [SVG Data URI Deep-Sanitization](#svg-data-uri-deep-sanitization)
- [5. Router Configuration Pitfalls](#5-router-configuration-pitfalls) — Missing route-view, guard expressions, nested route setup
  - [Missing route-view Element](#missing-route-view-element)
  - [Guard Without Redirect](#guard-without-redirect)
  - [File-Based Routing Template Path](#file-based-routing-template-path)
  - [Nested Routes Not Rendering](#nested-routes-not-rendering)
  - [Hash Mode and SEO](#hash-mode-and-seo)
  - [Base Path Not Stripped](#base-path-not-stripped)
- [6. Data Fetching Gotchas](#6-data-fetching-gotchas) — Missing as attribute, CORS, interpolated URL re-fetch behavior
  - [Data Available But Not Rendering (Missing as)](#data-available-but-not-rendering-missing-as)
  - [CORS With baseApiUrl](#cors-with-baseapiurl)
  - [Interpolated URL Causing Infinite Re-Fetches](#interpolated-url-causing-infinite-re-fetches)
  - [GET Requests Not Firing on Non-Connected Elements](#get-requests-not-firing-on-non-connected-elements)
  - [Stale Cache Results](#stale-cache-results)
- [7. Form Validation Issues](#7-form-validation-issues) — validate outside form context, missing field names
  - [Fields Missing name Attribute](#fields-missing-name-attribute)
  - [Standalone validate On Non-Form Elements](#standalone-validate-on-non-form-elements)
  - [$form Not Available](#form-not-available)
  - [Submit Button Not Re-Enabling](#submit-button-not-re-enabling)
  - [Validation Errors Not Showing Until Interaction](#validation-errors-not-showing-until-interaction)
- [8. i18n Setup Problems](#8-i18n-setup-problems) — loadPath format, missing translations, locale persistence
  - [loadPath Placeholder Format](#loadpath-placeholder-format)
  - [Missing Translations Show Key Instead of Text](#missing-translations-show-key-instead-of-text)
  - [Locale Not Persisting Across Page Loads](#locale-not-persisting-across-page-loads)
  - [Namespace Not Loading for Route Templates](#namespace-not-loading-for-route-templates)
- [9. Template Loading Failures](#9-template-loading-failures) — Remote template resolution, lazy loading timing
  - [Template Loads But Content Not Visible](#template-loads-but-content-not-visible)
  - [Relative Paths Not Resolving](#relative-paths-not-resolving)
  - [Template Loading Order Issues](#template-loading-order-issues)
  - [Template HTML Cache](#template-html-cache)
- [10. Store Conflicts](#10-store-conflicts) — Duplicate store names, NoJS.notify() for external mutations
  - [Duplicate Store Declarations](#duplicate-store-declarations)
  - [External JS Mutations Not Reflected](#external-js-mutations-not-reflected)
  - [Store Data Not Available in Expressions](#store-data-not-available-in-expressions)
  - [Store Watcher Auto-Cleanup](#store-watcher-auto-cleanup)

---

## 1. Common Console Warnings

All No.JS warnings are prefixed with `[No.JS]` in the browser console. These are the actual messages emitted by the framework and their solutions.

### Expression Error

**Console message:**
```
[No.JS] Expression error: <expr> <error message>
```

**Cause:** An expression in a directive attribute failed to parse or evaluate. Common triggers: referencing undefined variables, syntax errors in expressions, or calling non-existent functions.

**Fix:** Check the expression syntax. Ensure all referenced variables exist in the current context or a parent context. In statement context (e.g., `on:click`), calling an undefined function throws a `ReferenceError`.

```html
<!-- Problem: typo in variable name -->
<span bind="naem"></span>

<!-- Fix: correct variable reference -->
<div state="{ name: 'Alice' }">
  <span bind="name"></span>
</div>
```

### Unknown Filter

**Console message:**
```
[No.JS] Unknown filter: <name>
```

**Cause:** A pipe expression references a filter that has not been registered.

**Fix:** Register the filter before `NoJS.init()`:

```html
<script>
  NoJS.filter('uppercase', value => String(value).toUpperCase());
</script>

<!-- Now works -->
<span bind="name | uppercase"></span>
```

### Failed to Load Template

**Console message:**
```
[No.JS] Failed to load template: <src> HTTP <status>
```
or
```
[No.JS] Failed to load template: <src> <error message>
```

**Cause:** A `<template src="...">` could not be fetched. The server returned an error status code or the network request failed entirely.

**Fix:** Verify the template file exists at the specified path. Check the network tab in DevTools for 404 errors. Ensure the server serves `.tpl` files with a proper MIME type.

### Insecure Template URL

**Console message:**
```
[No.JS] Template "<src>" is loaded over insecure HTTP from an HTTPS page. Use HTTPS to prevent tampering.
```

**Cause:** A template `src` attribute points to an `http://` URL while the page is served over HTTPS.

**Fix:** Use HTTPS URLs for all template sources, or use relative paths.

### Persist Without persist-key

**Console message:**
```
[No.JS] persist="<value>" requires a persist-key attribute. State will not be persisted.
```

**Cause:** The `persist` attribute is set on a `state` element but `persist-key` is missing.

**Fix:**

```html
<!-- Problem -->
<div state="{ count: 0 }" persist="localStorage">...</div>

<!-- Fix: add persist-key -->
<div state="{ count: 0 }" persist="localStorage" persist-key="counter">...</div>
```

### Persist Schema Warnings

**Console messages:**
```
[No.JS] persist-schema: ignoring unknown key "<key>"
[No.JS] persist-schema: type mismatch for "<key>" (expected <type>, got <type>)
```

**Cause:** When `persist-schema` is set, restored keys are validated against the initial state shape. Unknown keys or type mismatches are skipped with a warning.

**Fix:** Either update the initial state to include the key, or clear the stored data when your schema changes.

### Sensitive State Keys

**Console message:**
```
[No.JS] State key(s) "token", "password" may contain sensitive data. Consider using persist-fields to exclude them.
```

**Cause:** A persisted state contains keys whose names match sensitive patterns (`token`, `password`, `secret`, `key`, `auth`, `credential`, `session`).

**Fix:** Use `persist-fields` to explicitly list only safe fields:

```html
<div state="{ username: '', token: '' }"
     persist="localStorage"
     persist-key="auth"
     persist-fields="username">
</div>
```

### Sensitive Headers Inline

**Console message:**
```
[No.JS] Sensitive header "<key>" is set inline on a headers attribute. Use NoJS.config({ headers }) or an interceptor to avoid exposing credentials in HTML source.
```

**Cause:** An `Authorization`, `X-API-Key`, or similar sensitive header is placed directly in a `headers` attribute on a `get`/`post`/`call` element.

**Fix:** Move sensitive headers to the global config or use an interceptor:

```html
<script>
  NoJS.config({ headers: { 'Authorization': 'Bearer ...' } });
</script>
```

### Route Guard Failed Without Redirect

**Console message:**
```
[No.JS] Route guard failed for "<path>" but no redirect is defined. The route will not render.
```

**Cause:** A route template has a `guard` expression that evaluated to falsy, but no `redirect` attribute is defined to send the user elsewhere.

**Fix:** Add a `redirect` attribute alongside `guard`:

```html
<template route="/admin" guard="$store.auth?.isLoggedIn" redirect="/login">
  ...
</template>
```

### Hash Mode SEO Warning

**Console message:**
```
[No.JS] Router is running in hash mode (useHash: true). URLs like /#/about are not indexed as separate pages by search engines. Use useHash: false with a server-side SPA fallback (try_files) for SEO-friendly routing.
```

**Cause:** The router is configured with `useHash: true`.

**Fix:** Switch to history mode for SEO-critical apps, or suppress the warning if hash mode is intentional:

```js
NoJS.config({ router: { useHash: true, suppressHashWarning: true } });
```

### Deprecated CSP Config

**Console message:**
```
[No.JS] csp config option removed — No.JS is now CSP-safe by default
```

**Cause:** `NoJS.config({ csp: ... })` was called. The `csp` option no longer exists because the framework uses a custom recursive-descent parser instead of `eval()`.

**Fix:** Remove the `csp` option from your config.

### Deprecated sanitize:false

**Console message:**
```
[No.JS] sanitize:false is deprecated — use dangerouslyDisableSanitize:true to make the risk explicit.
```

**Cause:** `NoJS.config({ sanitize: false })` was called using the old API.

**Fix:** Replace with the explicit flag:

```js
NoJS.config({ dangerouslyDisableSanitize: true });
```

### HTML Sanitization Disabled

**Console message:**
```
[No.JS] HTML sanitization is DISABLED. This exposes your app to XSS attacks. Only disable for trusted content.
```

**Cause:** Either `sanitize: false` or `dangerouslyDisableSanitize: true` is set in config. `bind-html` will inject raw HTML without sanitization.

**Fix:** Only disable sanitization if you fully trust the content source. Prefer using a custom sanitizer via `sanitizeHtml`:

```js
NoJS.config({ sanitizeHtml: html => DOMPurify.sanitize(html) });
```

### Deprecated Loop Syntax

**Console message:**
```
[NoJS] "<directive>" with "from" is deprecated. Use <directive>="<item> in <list>" instead.
```

**Cause:** Using the old `foreach="item" from="list"` syntax.

**Fix:** Use the unified `in` syntax:

```html
<!-- Old (deprecated) -->
<ul foreach="user" from="users"><li bind="user.name"></li></ul>

<!-- New -->
<ul foreach="user in users"><li bind="user.name"></li></ul>
```

### Security Warning for bind-html

**Console message:**
```
[No.JS] [Security] bind-html used with dynamic expression: "<expr>". Ensure the value is trusted or sanitized — use bind for plain text.
```

**Cause:** `bind-html` is used with a dynamic expression (not a string literal) while debug or devtools mode is enabled.

**Fix:** If the content is trusted, this is informational. For untrusted content, use `bind` instead or ensure proper sanitization.

### Cannot Override Core Directive

**Console message:**
```
[No.JS] Cannot override core directive "<name>".
```

**Cause:** Attempted to register a custom directive using a name reserved by the framework (e.g., `state`, `bind`, `if`). Core directives are frozen after framework initialization.

**Fix:** Choose a different name for your custom directive:

```js
// Will warn — "bind" is a core directive
NoJS.directive('bind', { ... });

// Works — custom name
NoJS.directive('my-bind', { ... });
```

### MaxListenersExceeded

**Console message:**
```
[No.JS] MaxListenersExceeded: event "<name>" has <count> listeners (max <limit>). Possible memory leak.
```

**Cause:** More than `maxEventListeners` (default: 100) handlers have been registered for a single event name on the event bus.

**Fix:** Ensure you are calling the unsubscribe function returned by `NoJS.on()`. If the high count is intentional, increase the limit:

```js
NoJS.config({ maxEventListeners: 200 });
```

### Plugin Warnings

**Console messages:**
```
[No.JS] Plugin must have a unique, non-empty name. Use { name: "my-plugin", install: fn }.
[No.JS] Plugin "<name>" name collision: a different plugin with this name is already installed.
[No.JS] Cannot install plugins during dispose.
```

**Cause:** Plugin registration failed due to missing name, duplicate name, or calling `NoJS.use()` during app teardown.

**Fix:** Ensure every plugin has a unique `name` property and is installed before `NoJS.dispose()`.

### drag-multiple Without drag-group

**Console message:**
```
[No.JS] drag-multiple requires drag-group attribute
```

**Cause:** The `drag-multiple` directive is used without a corresponding `drag-group` attribute.

**Fix:** Add the `drag-group` attribute to enable multi-item drag:

```html
<div drag-multiple drag-group="items">...</div>
```

### Infinite Loop in Nested Outlets

**Console message:**
```
[No.JS] [ROUTER] Infinite loop detected for nested outlet: <key>
```

**Cause:** A nested `route-view` outlet is loading a template that contains the same outlet, creating a recursive loop.

**Fix:** Ensure nested route templates do not re-introduce the same `route-view` outlet that loaded them.

### i18n Load Failures

**Console messages:**
```
[No.JS] i18n: failed to load <url> (<status>)
[No.JS] i18n: error loading <url> <error>
```

**Cause:** A locale JSON file could not be fetched from the configured `loadPath`.

**Fix:** Verify that the locale file exists at the URL and returns valid JSON. Check that `{locale}` and `{ns}` placeholders in `loadPath` resolve correctly.

### Class-Based Route Transitions Deprecated

**Console message:**
```
[No.JS] Class-based route transitions are deprecated. The View Transition API is now used by default. Set router.viewTransition to false to keep legacy behavior.
```

**Cause:** A `route-view` outlet has a `transition` attribute, but the View Transition API is not being used (e.g., unsupported browser or `viewTransition: false`).

**Fix:** Migrate to the View Transition API or explicitly disable it:

```js
NoJS.config({ router: { viewTransition: false } });
```

---

## 2. Debugging Reactive State

No.JS uses `Proxy`-backed contexts (see `context.js`). Understanding how they work is key to debugging reactivity issues.

### State Not Updating After Direct Object Mutation

**Problem:** Modifying an object property directly does not trigger UI updates.

**Cause:** The reactive proxy only intercepts top-level property sets on the context's raw object. The proxy `set` trap compares `old !== value` using strict equality. If you mutate an object in place (e.g., push to an array), the reference does not change and no notification fires.

**Fix:** Replace the entire value or call `$notify()`:

```html
<div state="{ items: ['a', 'b'] }">
  <!-- Problem: push mutates in place, no re-render -->
  <button on:click="items.push('c')">Add</button>

  <!-- Fix option 1: reassign to trigger proxy set trap -->
  <button on:click="items = [...items, 'c']">Add</button>
</div>
```

In event handlers (`on:click`), the statement executor writes back changed values to the owning context. For deep mutations inside an object, it detects same-reference objects and calls `$notify()` automatically. However, if you mutate state from external JavaScript, you must notify manually (see [Store Mutations From External JS](#store-mutations-from-external-js)).

### Nested Property Changes Not Detected

**Problem:** Changing `obj.nested.prop` via `$set` does not update.

**Cause:** `$set` supports dot-path notation (`ctx.$set("obj.nested.prop", value)`), but the intermediate objects must already exist. If `obj.nested` is `null` or `undefined`, the set is silently skipped:

```js
// From context.js — $set implementation:
// let obj = proxy;
// for (let i = 0; i < parts.length - 1; i++) {
//   obj = obj[parts[i]];
//   if (obj == null) return;  // ← silently exits
// }
```

**Fix:** Ensure the parent path exists before setting nested properties:

```html
<div state="{ user: { profile: {} } }">
  <!-- Works: profile object exists -->
  <button on:click="user.profile.name = 'Alice'">Set Name</button>
</div>
```

### Context Inheritance and Shadowing

**Problem:** A child element's state does not see updates from a parent context.

**Cause:** Contexts form a prototype chain via the `$parent` property. The proxy `get` trap walks up the chain: if a key exists in the current context's raw data, it returns that value; otherwise it checks the parent. However, if a child declares the same key, it **shadows** the parent's value.

**Fix:** Avoid redeclaring the same key name in child `state` directives unless intentional. To read a parent value explicitly, restructure to avoid naming collisions.

### Store Mutations From External JS

**Problem:** Updating `NoJS.store.myStore` from plain JavaScript does not update the UI.

**Cause:** Direct mutations to the store's raw properties bypass the reactive proxy's `set` trap when accessed via the `_stores` object.

**Fix:** Call `NoJS.notify()` after external mutations:

```js
// External JS code
NoJS.store.cart.$set('items', updatedItems);
NoJS.notify();  // Triggers all store watchers
```

The `_execStatement` function in `evaluate.js` calls `_notifyStoreWatchers()` automatically when an expression contains `$store`, but external code must trigger this manually.

### Batch Updates Swallowing Changes

**Problem:** Multiple rapid state changes only trigger one update.

**Cause:** No.JS uses a batching system (`_startBatch` / `_endBatch` in `context.js`). When `_batchDepth > 0`, notify callbacks are queued in `_batchQueue` and only flushed when the depth returns to 0. If an element becomes disconnected during the batch, its callback is skipped:

```js
// From context.js:
// if (fn._el && !fn._el.isConnected) return;
```

**Fix:** This is normally desired behavior for performance. If you need immediate updates, ensure you are not inside a batch, or defer your logic to after the batch completes.

---

## 3. Directive Priority Conflicts

When multiple directives appear on the same element, they are sorted by priority (lower number = runs first) and executed in that order. This is handled in `registry.js` `processElement()`:

```js
matched.sort((a, b) => a.priority - b.priority);
```

### Priority Reference Table

| Priority | Directives |
|----------|-----------|
| 0 | `state`, `store` |
| 1 | `get`, `post`, `put`, `patch`, `delete`, `error-boundary`, `i18n-ns`, `page-title`, `page-description`, `page-canonical`, `page-jsonld` |
| 2 | `computed`, `watch` |
| 5 | `ref` |
| 10 | `if`, `else-if`, `else`, `switch`, `foreach`/`each`/`for`, `use` |
| 20 | `bind`, `bind-html`, `bind-*`, `model`, `show`, `hide`, `on:*`, `trigger`, `class-*`, `style-*`, `t`, `call` |
| 30 | `validate` |

### State Must Initialize Before Bindings

**Problem:** `bind` shows `undefined` even though `state` is on the same element.

**Cause:** If for some reason `state` did not initialize before `bind`, the context would not exist yet. By design, `state` has priority 0 and `bind` has priority 20, so this order is guaranteed. However, if the `state` expression itself fails (returns `null`/`undefined`), the context will have no data.

**Fix:** Ensure the `state` expression evaluates to a valid object:

```html
<!-- Problem: state evaluates to undefined -->
<div state="nonExistentVar">
  <span bind="name"></span>
</div>

<!-- Fix: provide a literal object -->
<div state="{ name: 'Alice' }">
  <span bind="name"></span>
</div>
```

### Loop and Conditional Conflicts

**Problem:** Using `if` and `foreach` on the same element causes unexpected behavior.

**Cause:** Both `if` and `foreach` have priority 10. When priorities are equal, directives execute in the order they appear in the element's attribute list, which is not guaranteed by HTML spec.

**Fix:** Nest them on separate elements:

```html
<!-- Avoid: both on same element -->
<ul if="showList" foreach="item in items">...</ul>

<!-- Preferred: separate elements -->
<div if="showList">
  <ul foreach="item in items">
    <li bind="item.name"></li>
  </ul>
</div>
```

---

## 4. CSP Issues

### No eval or new Function

No.JS is CSP-safe by default. The expression evaluator (`evaluate.js`) uses a custom recursive-descent parser that tokenizes and builds an AST, then walks it with `_evalNode()`. It never calls `eval()`, `new Function()`, or `setTimeout(string)`.

The previous `csp` config option has been removed. If you see the warning `csp config option removed — No.JS is now CSP-safe by default`, simply remove the `csp` key from your config.

### Inline Event Handlers

**Problem:** CSP `script-src` policy blocks inline event handlers.

**Cause:** No.JS does not use inline `onclick` attributes. All event handling goes through `addEventListener` from the `on:*` directive. However, if you manually add `onclick="..."` in your HTML, CSP will block it.

**Fix:** Use No.JS event directives instead of native inline handlers:

```html
<!-- CSP violation -->
<button onclick="alert('hi')">Click</button>

<!-- CSP-safe with No.JS -->
<button on:click="alert('hi')">Click</button>
```

### External Template Loading and connect-src

**Problem:** `template[src]` fails to load under strict CSP.

**Cause:** Loading external templates uses `fetch()`. The CSP `connect-src` directive must allow the template URL origin.

**Fix:** Add your template server to the CSP `connect-src` policy:

```
Content-Security-Policy: connect-src 'self' https://templates.example.com;
```

### Built-in Sanitizer Blocked Tags

The built-in HTML sanitizer (used by `bind-html`) strips the following tags entirely from the output. If content containing these tags does not render as expected, this is the cause:

| Blocked Tag | Reason |
|-------------|--------|
| `script` | JavaScript execution |
| `style` | CSS injection / data exfiltration |
| `iframe` | Arbitrary content embedding |
| `object` | Plugin-based code execution |
| `embed` | Plugin-based code execution |
| `base` | URL hijacking of all relative links |
| `form` | Phishing / credential harvesting |
| `meta` | Redirect injection / CSP override |
| `link` | External resource loading / CSS injection |
| `noscript` | Content injection in non-JS contexts |

The sanitizer also removes any attribute whose name starts with `on` (inline event handlers), any `href`, `src`, `action`, `xlink:href`, `formaction`, `poster`, or `data` attribute containing `javascript:` or `vbscript:` schemes, and any `data:` URI on URL attributes that is not `data:image/*`.

To bypass the sanitizer for trusted content, use `dangerouslyDisableSanitize: true` in config or provide a custom sanitizer via `sanitizeHtml`:

```js
// Custom sanitizer (e.g., DOMPurify)
NoJS.config({ sanitizeHtml: html => DOMPurify.sanitize(html) });
```

### SVG Data URI Deep-Sanitization

**Problem:** An inline SVG loaded via `data:image/svg+xml` in a `bind-html` attribute is modified or replaced with `#`.

**Cause:** The built-in sanitizer performs deep sanitization on `data:image/svg+xml` URIs. Both base64-encoded and URL-encoded forms are decoded, parsed with `DOMParser`, and cleaned:

1. All `<script>` elements inside the SVG are removed
2. All `on*` event-handler attributes are stripped
3. Any `href` or `xlink:href` with a `javascript:` scheme is removed
4. If the SVG fails to parse, it is replaced with an empty `<svg></svg>`

The cleaned SVG is then re-encoded back into the same format (base64 or URL-encoded). If the entire URI is malformed, it is replaced with `#`.

**Fix:** This is security-by-design. If your SVG content is trusted and must remain unmodified, either disable sanitization for that specific use case or ensure your SVGs do not contain event handlers or script elements.

---

## 5. Router Configuration Pitfalls

### Missing route-view Element

**Problem:** Route templates are defined but nothing renders on navigation.

**Cause:** The router only activates if `document.querySelector("[route-view]")` finds at least one outlet during `NoJS.init()`. Without a `route-view` element, `_routerInstance` remains `null`.

**Fix:** Add a route outlet to your HTML:

```html
<main route-view></main>

<!-- Or with a named outlet -->
<aside route-view="sidebar"></aside>
```

### Guard Without Redirect

**Problem:** Navigation to a guarded route results in an empty outlet with a console warning.

**Cause:** The guard expression evaluated to `false` but no `redirect` attribute exists. The router clears the outlet and warns:
```
Route guard failed for "<path>" but no redirect is defined. The route will not render.
```

**Fix:** Always pair `guard` with `redirect`:

```html
<template route="/dashboard"
          guard="$store.auth?.loggedIn"
          redirect="/login">
  ...
</template>
```

### File-Based Routing Template Path

**Problem:** File-based routing returns 404 for pages.

**Cause:** The router builds template URLs from `route-view[src]` or `router.templates` config, combining them with the path segments plus the file extension from `router.ext` (default: `.tpl`).

**Fix:** Ensure your file structure matches the expected pattern:

```html
<!-- Configuration -->
<script>
  NoJS.config({ router: { templates: 'pages', ext: '.tpl' } });
</script>

<!-- Outlet -->
<main route-view src="pages/" ext=".tpl"></main>

<!-- For route /about, the router fetches: pages/about.tpl -->
<!-- For route /, the router fetches: pages/index.tpl -->
```

The index file name defaults to `"index"` but can be changed with `route-index`:

```html
<main route-view src="pages/" route-index="home"></main>
<!-- For route /, fetches: pages/home.tpl -->
```

### Nested Routes Not Rendering

**Problem:** Multi-segment paths like `/docs/getting-started` show a 404.

**Cause:** The router uses hierarchical segment resolution. For `/docs/getting-started`, it first tries to load `pages/docs.tpl` as a layout. If that layout exists and contains a nested `route-view`, it loads the next segment into it. If the layout does not exist, it falls back to the flat path `pages/docs/getting-started.tpl`.

**Fix:** Either create a layout template with a nested outlet:

```html
<!-- pages/docs.tpl (layout) -->
<nav>Documentation sidebar</nav>
<div route-view src="./"></div>
<!-- Router loads pages/docs/getting-started.tpl into the nested outlet -->
```

Or ensure the flat file exists at `pages/docs/getting-started.tpl`.

### Hash Mode and SEO

**Problem:** Pages are not indexed by search engines.

**Cause:** Hash-based URLs (`/#/about`) are not treated as separate pages by crawlers.

**Fix:** Use history mode with server-side fallback:

```js
NoJS.config({ router: { useHash: false } });
```

Configure your server to serve `index.html` for all routes (e.g., nginx `try_files $uri /index.html;`).

### Base Path Not Stripped

**Problem:** Routes don't match when the app is deployed under a subpath (e.g., `/app/`).

**Cause:** The router strips the configured `base` from `window.location.pathname` before matching. If `base` is not set, the full pathname is used.

**Fix:**

```js
NoJS.config({ router: { base: '/app' } });
```

---

## 6. Data Fetching Gotchas

### Data Available But Not Rendering (Missing as)

**Problem:** A `get` request succeeds but the data is not accessible in the template.

**Cause:** The response is stored in the context under the key specified by the `as` attribute. The default key is `"data"`. If you reference a different variable name, it will be undefined.

**Fix:** Use the correct variable name or set `as`:

```html
<!-- Default: data is stored as "data" -->
<div get="/api/users">
  <ul foreach="user in data">...</ul>
</div>

<!-- Custom key with as -->
<div get="/api/users" as="users">
  <ul foreach="user in users">...</ul>
</div>
```

### CORS With baseApiUrl

**Problem:** Requests fail with CORS errors when `baseApiUrl` points to a different origin.

**Cause:** The `resolveUrl` function in `fetch.js` prepends `baseApiUrl` to relative URLs. If this resolves to a cross-origin URL, the browser enforces CORS. The default `credentials` config is `"same-origin"`, which does not send cookies cross-origin.

**Fix:** Configure your API server's CORS headers and adjust credentials:

```js
NoJS.config({
  baseApiUrl: 'https://api.example.com',
  credentials: 'include',  // Send cookies cross-origin
});
```

Alternatively, use the `base` attribute on a parent element for scoped URL resolution:

```html
<div base="https://api.example.com">
  <div get="/users" as="users">...</div>
</div>
```

### Interpolated URL Causing Infinite Re-Fetches

**Problem:** A `get` element with `{expression}` in the URL fires requests endlessly.

**Cause:** When the URL contains `{...}` interpolations, the HTTP directive watches all ancestor contexts for changes. If the response itself updates a context that is an ancestor, this triggers another URL resolution, which triggers another fetch, and so on.

**Fix:** Use the `debounce` attribute to prevent rapid re-fetches, or ensure the response data does not feed back into the URL expression:

```html
<!-- Add debounce to prevent rapid re-fetches -->
<div get="/api/search?q={query}" as="results" debounce="300">
  ...
</div>
```

Alternatively, structure your state so the fetch result and the URL parameters live in separate contexts.

### GET Requests Not Firing on Non-Connected Elements

**Problem:** A `get` directive does not fire when the element is created dynamically.

**Cause:** For `get` directives, the request only fires if `el.isConnected` is `true` at init time (from `http.js`):

```js
if (method === "get") {
  if (el.isConnected) doRequest();
}
```

**Fix:** Ensure the element is in the DOM before No.JS processes it. If creating elements dynamically, append them to the DOM first, then call `NoJS.processTree(element)`.

### Stale Cache Results

**Problem:** Data appears outdated despite API changes.

**Cause:** The `cached` attribute enables response caching with a TTL (default: 300000ms / 5 minutes from `_config.cache.ttl`). Memory cache uses LRU eviction with a max of 200 entries.

**Fix:** Adjust the TTL, disable caching, or use `el.refresh()` to force a re-fetch:

```html
<!-- Disable cache for this request -->
<div get="/api/data" as="data" cached="none">...</div>
```

```js
// Force refresh via ref
document.querySelector('[ref="myFetch"]').refresh();
```

---

## 7. Form Validation Issues

### Fields Missing name Attribute

**Problem:** Form validation ignores certain fields.

**Cause:** The validation system iterates fields with `el.querySelectorAll("input, textarea, select")` and skips any field without a `name` attribute:

```js
// From validation.js:
if (!field.name) continue;
```

Fields without `name` are excluded from `$form.values`, `$form.errors`, and `$form.fields`.

**Fix:** Add `name` to every field that should participate in validation:

```html
<form validate>
  <!-- Problem: no name, ignored by validation -->
  <input type="email" required>

  <!-- Fix: add name attribute -->
  <input name="email" type="email" required>
</form>
```

### Standalone validate On Non-Form Elements

**Problem:** `validate="required|email"` on a standalone input does not show errors.

**Cause:** Field-level validation (outside a `<form>`) only works on `INPUT`, `TEXTAREA`, and `SELECT` elements. It requires the `error` attribute pointing to a template for displaying errors.

**Fix:**

```html
<input validate="required|email" error="#email-error">
<template id="email-error">
  <span style="color:red" bind="err.message"></span>
</template>
```

### $form Not Available

**Problem:** `$form.valid` or `$form.errors` is undefined in template expressions.

**Cause:** The `$form` context variable is only created when `validate` is placed on a `<form>` element. If `validate` is on an input (field-level validation), `$form` is not created.

**Fix:** Place `validate` on the `<form>` element to enable the full form validation context:

```html
<form validate>
  <input name="email" type="email" required>
  <button bind-disabled="!$form.valid">Submit</button>
</form>
```

### Submit Button Not Re-Enabling

**Problem:** The submit button stays disabled after fixing validation errors.

**Cause:** The validation system auto-disables submit buttons (`button:not([type="button"])` and `input[type="submit"]`) based on form validity. If you have a custom `disabled` expression that conflicts, the auto-disable may not apply correctly.

**Fix:** Avoid mixing auto-disable with custom `disabled` expressions on submit buttons. Use `$form.valid` explicitly if needed:

```html
<button type="submit" bind-disabled="!$form.valid || $form.pending">Submit</button>
```

### Validation Errors Not Showing Until Interaction

**Problem:** Required field errors do not appear on page load.

**Cause:** By design, `$form.errors` only includes errors for fields that have been interacted with (touched or dirty). This prevents showing errors before the user has had a chance to fill in the form. The `$form.valid` property, however, reflects the real validity state immediately.

**Fix:** This is intentional UX behavior. Errors will appear after the user touches a field. To force all errors visible, submit the form — the submit handler marks all fields as touched:

```js
// From validation.js:
// for (const field of getFields()) {
//   if (field.name) touchedFields.add(field.name);
// }
```

---

## 8. i18n Setup Problems

### loadPath Placeholder Format

**Problem:** Translation files are not loading or returning 404.

**Cause:** The `loadPath` must contain `{locale}` as a placeholder. If using namespaces, it should also contain `{ns}`. The framework replaces these literally:

```js
// From i18n.js:
let url = _config.i18n.loadPath.replace("{locale}", locale);
if (ns) url = url.replace("{ns}", ns);
else if (url.includes("{ns}")) return; // ← skips load entirely
```

If `loadPath` contains `{ns}` but no namespace is provided, the load is skipped entirely.

**Fix:**

```js
// Without namespaces
NoJS.i18n({
  loadPath: '/locales/{locale}.json',
  defaultLocale: 'en'
});
// Loads: /locales/en.json

// With namespaces
NoJS.i18n({
  loadPath: '/locales/{locale}/{ns}.json',
  ns: ['common', 'dashboard'],
  defaultLocale: 'en'
});
// Loads: /locales/en/common.json, /locales/en/dashboard.json
```

### Missing Translations Show Key Instead of Text

**Problem:** The UI shows `"nav.home"` instead of the translated text.

**Cause:** The `_i18n.t()` function traverses the locale object using dot-separated keys. If the key path is not found, it returns the key string itself:

```js
// From i18n.js:
let msg = key.split(".").reduce((o, k) => o?.[k], messages);
if (msg == null) return key;
```

**Fix:** Verify that the locale JSON file contains the key at the correct nesting level:

```json
{
  "nav": {
    "home": "Home"
  }
}
```

Also verify that the locale file has been loaded (check the Network tab for 200 responses).

### Locale Not Persisting Across Page Loads

**Problem:** The locale resets to the default on every page reload.

**Cause:** Locale persistence requires `persist: true` in the i18n config. When enabled, the locale is saved to `localStorage` under the key `"nojs-locale"` via the `_i18n.locale` setter. On init, `NoJS.i18n()` reads it back:

```js
// From index.js:
if (_config.i18n.persist && typeof localStorage !== "undefined") {
  const saved = localStorage.getItem("nojs-locale");
  if (saved) { _i18n._locale = saved; return; }
}
```

**Fix:** Enable persistence:

```js
NoJS.i18n({
  loadPath: '/locales/{locale}.json',
  defaultLocale: 'en',
  persist: true
});
```

### Namespace Not Loading for Route Templates

**Problem:** Translations are missing after navigating to a route with `i18n-ns`.

**Cause:** The `i18n-ns` directive (priority 1) strips children from the element, loads the namespace asynchronously, then re-appends children and processes the tree. If the namespace file fails to load, the children are restored but translations will fall back to keys.

The route template's `i18n-ns` attribute is also read by the router during navigation, which calls `_loadI18nNamespace(ns)` before rendering.

**Fix:** Ensure the namespace file exists and the `loadPath` includes `{ns}`:

```html
<!-- Route template with namespace -->
<template route="/dashboard" i18n-ns="dashboard" src="pages/dashboard.tpl">
</template>
```

```js
NoJS.i18n({
  loadPath: '/locales/{locale}/{ns}.json',
  ns: ['common'],  // pre-loaded namespaces
  defaultLocale: 'en'
});
// "dashboard" namespace loads on-demand when route is visited
```

---

## 9. Template Loading Failures

### Template Loads But Content Not Visible

**Problem:** A remote `<template src="...">` loads successfully but its content does not appear.

**Cause:** `<template>` elements are inert by default in HTML — the browser never renders their `.content`. No.JS handles non-route templates by replacing the `<template>` element with its content after loading. However, route templates remain as `<template>` elements and their content is only cloned into `route-view` outlets during navigation.

**Fix:** For content includes (non-route templates), ensure the template does not have a `route` attribute. For route templates, ensure a `route-view` outlet exists:

```html
<!-- Content include: auto-injected into DOM after load -->
<template src="components/header.tpl"></template>

<!-- Route template: needs route-view to display -->
<template route="/about" src="pages/about.tpl"></template>
<main route-view></main>
```

### Relative Paths Not Resolving

**Problem:** A template using `src="./child.tpl"` fails to load with a 404.

**Cause:** Relative `./` paths are resolved against the nearest ancestor's `__srcBase` property, which is set to the folder of the parent template's resolved URL. If no ancestor has `__srcBase` (e.g., the template is at the document root), the `./` is simply stripped.

**Fix:** Ensure parent templates are loaded first (they set `__srcBase` on their content), or use absolute paths:

```html
<!-- In pages/docs.tpl, this resolves to pages/sidebar.tpl -->
<template src="./sidebar.tpl"></template>

<!-- If unsure about base, use absolute path -->
<template src="/pages/sidebar.tpl"></template>
```

### Template Loading Order Issues

**Problem:** Templates loaded with `lazy="ondemand"` are not available when needed.

**Cause:** No.JS loads templates in phases:
1. **Phase 0:** Templates with `lazy="priority"` load first
2. **Phase 1:** Non-route templates and the route matching the current URL load next (blocking)
3. **Phase 2:** Remaining route templates load in the background (non-blocking)

Templates with `lazy="ondemand"` are excluded from all phases and only load when their route is navigated to.

**Fix:** If a template is needed immediately, do not use `lazy="ondemand"`. Use `lazy="priority"` for critical templates:

```html
<!-- Loads immediately, before anything else -->
<template src="shared/nav.tpl" lazy="priority"></template>

<!-- Loads only when route is visited -->
<template route="/settings" src="pages/settings.tpl" lazy="ondemand"></template>
```

### Template HTML Cache

**Problem:** A template file was updated on the server but the browser still shows the old content, even after a page reload.

**Cause:** Loaded `.tpl` files are cached in an in-memory `Map` keyed by their fully resolved URL. Once a template URL has been fetched, subsequent loads (including route navigations back to the same page) return the cached HTML string without hitting the network. Additionally, route templates pre-warm the cache for their nested sub-templates during Phase 1 loading, so sub-templates may also be cached before they are ever directly requested.

The cache is controlled by `_config.templates.cache` (default: `true`). It persists for the entire lifetime of the page (i.e., until a full browser refresh or `NoJS.dispose()`).

**Fix:**

1. **During development**, disable template caching:
   ```js
   NoJS.config({ templates: { cache: false } });
   ```

2. **In production**, use cache-busting query strings or versioned filenames:
   ```html
   <template src="components/header.tpl?v=2"></template>
   ```

3. **Programmatically**, there is no public API to clear the template cache. A full page reload with cache disabled is the simplest approach during development.

---

## 10. Store Conflicts

### Duplicate Store Declarations

**Problem:** A store seems to ignore its `value` attribute.

**Cause:** The `store` directive only creates a new store if one with that name does not already exist:

```js
// From directives/state.js:
if (!_stores[storeName]) {
  const data = valueAttr ? evaluate(valueAttr, createContext()) || {} : {};
  _stores[storeName] = createContext(data);
}
```

If a store named `"cart"` already exists (from a previous `store` directive, `NoJS.config({ stores: {...} })`, or a prior route render), the second declaration is silently skipped.

**Fix:** Declare each store name only once. Use `NoJS.config({ stores: {...} })` for global stores that should exist before any directives run:

```js
NoJS.config({
  stores: {
    cart: { items: [], total: 0 },
    auth: { loggedIn: false }
  }
});
```

### External JS Mutations Not Reflected

**Problem:** Updating store data from plain JavaScript does not trigger UI updates.

**Cause:** The statement executor in `evaluate.js` automatically calls `_notifyStoreWatchers()` when an expression contains `$store`. But external JavaScript bypasses the expression system entirely.

**Fix:** Use `$set` on the store context and then call `NoJS.notify()`:

```js
// Update store from external code
const cart = NoJS.store.cart;
cart.$set('items', [...cart.items, newItem]);
NoJS.notify();
```

### Store Data Not Available in Expressions

**Problem:** `$store.myStore.items` returns `undefined` in an expression.

**Cause:** The store must be declared before the expression evaluates. If the store is declared in a template that loads after the expression's element is processed, the store will not exist yet.

**Fix:** Declare stores early, either via `NoJS.config()` before `NoJS.init()`, or in the HTML before the elements that reference them:

```html
<!-- Declare store first -->
<div store="cart" value="{ items: [] }"></div>

<!-- Then reference it -->
<span bind="$store.cart.items.length"></span>
```

Or in JavaScript:

```js
NoJS.config({ stores: { cart: { items: [] } } });
NoJS.init();
```

### Store Watcher Auto-Cleanup

**Problem:** A store watcher (e.g., an expression that references `$store`) stops firing after the element that created it is removed from the DOM.

**Cause:** Store watchers are automatically cleaned up when the owning element is no longer connected to the DOM. This is implemented via a `MutationObserver` that monitors the element's parent for `childList` changes. When `el.isConnected` becomes `false`, the watcher is deleted from the `_storeWatchers` set and the observer disconnects itself:

```js
// From globals.js — _watchExpr():
const ro = new MutationObserver(() => {
  if (!el.isConnected) {
    _storeWatchers.delete(fn);
    unwatch();
    ro.disconnect();
  }
});
ro.observe(el.parentElement, { childList: true, subtree: false });
```

Additionally, during `_notifyStoreWatchers()`, any watcher whose `_el` is no longer connected is removed from the set before invocation.

**Fix:** This is intentional behavior to prevent memory leaks. If you need a watcher to persist beyond the element's lifecycle, use `NoJS.on()` to subscribe to framework events instead, and manage unsubscription manually.

If a watcher stops firing unexpectedly, check whether the element is being removed and re-added to the DOM (e.g., by a parent `if`/`foreach` directive). Each time the element is recreated, directives are re-processed and new watchers are registered.
