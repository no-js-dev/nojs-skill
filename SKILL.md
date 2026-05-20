---
name: nojs
metadata:
  version: 1.11.0
description: Expert-level knowledge of the No.JS HTML-first reactive framework for building dynamic web applications using only HTML attributes. Use this skill whenever the user mentions No.JS, NoJS, "no javascript framework", HTML-first framework, or is writing HTML with reactive attributes like bind, state, get, foreach, each, for, on:click, model, route, store, computed, watch, if/else, show/hide, validate, animate, drag, drop, t (i18n), class-*, style-*, or bind-*. Also use when the user asks about declarative HTML frameworks, zero-JS frameworks, or wants to build a web app without writing JavaScript. Even if the user doesn't mention No.JS by name, activate this skill when you see HTML attributes that match No.JS directive patterns.
---

# NoJS-Skill

No.JS is an HTML-first reactive framework with zero dependencies that replaces JavaScript with declarative HTML attributes. CSP-compliant via a custom expression parser (no eval). Include one `<script>` tag and start writing directives.

```html
<script src="https://cdn.no-js.dev/"></script>
<body base="https://jsonplaceholder.typicode.com">
  <div get="/users" as="users">
    <div each="user in users">
      <h2 bind="user.name"></h2>
      <p bind="user.email"></p>
    </div>
  </div>
</body>
```

No `app.mount()`, no `createApp()`, no build step. It just works.

## When to use

Use this skill when:

- The user mentions **No.JS**, **NoJS**, or the **HTML-first reactive framework**
- The user is writing HTML with No.JS directive attributes (`bind`, `state`, `get`, `foreach`, `each`, `for`, `on:click`, `model`, `route`, `store`, `validate`, `animate`, `drag`, `drop`, `t`, `class-*`, `style-*`, `bind-*`)
- The user asks about **declarative HTML frameworks** or wants to build a **web app without writing JavaScript**
- The user needs to **scaffold**, **validate**, or **debug** No.JS templates
- You see HTML attributes that match No.JS directive patterns, even without explicit mention

## Instructions

### 1. Understand the framework architecture

No.JS works by walking the DOM on `DOMContentLoaded`, matching HTML attributes to directives, and executing them by priority:

| Priority | Directives | Purpose |
|----------|-----------|---------|
| 0 | `state`, `store` | Initialize reactive data first |
| 1 | `get`, `post`, `put`, `patch`, `delete`, `error-boundary`, `i18n-ns`, `page-title`, `page-description`, `page-canonical`, `page-jsonld` | Fetch data, error/i18n setup, head management |
| 2 | `computed`, `watch` | Derive values and observe changes |
| 5 | `ref` | Element references |
| 10 | `if`, `else-if`, `else`, `switch`, `foreach`, `each`, `for`, `use`, `drag-list` | Structural (add/remove DOM) |
| 15 | `drag`, `drop` | Drag and drop setup |
| 16 | `drag-multiple` | Multi-select drag |
| 20 | `bind`, `bind-*`, `bind-html`, `model`, `class-*`, `style-*`, `on:*`, `show`, `hide`, `t`, `call`, `trigger`, `page-title`, `page-description`, `page-canonical`, `page-jsonld` | Rendering, events, i18n, actions, head management |
| 30 | `validate` | Form validation side effects |

Data lives in Proxy-backed reactive contexts that inherit from parent elements (like lexical scoping). When data changes, every bound element updates automatically.

### 2. Know the core directives

**Data Fetching** - `get="/url"` with `as="varName"`, `loading`, `error`, `empty`, `success`, `refresh`, `cached`, `into`, `debounce`, `headers`, `params`, `skeleton` (CLS-prevention: hides an existing DOM element during fetch). URLs support interpolation: `get="/users/{userId}"` re-fetches reactively. Mutation verbs: `post`, `put`, `patch`, `delete`. Static `get=` URLs automatically get a `<link rel="preload" as="fetch">` hint injected at init time; cross-origin URLs also get `<link rel="preconnect">`. Route templates with `src=` get `<link rel="prefetch">` at router startup.

**State** - `state="{ key: value }"` (local), `store="name"` (global via `$store.name`), `computed="name" expr="expr"`, `watch="prop" on:change="handler"`, `persist`/`persist-fields`. Note: stores created via `NoJS.config({ stores })` won't be overwritten by later `<div store>` with the same name. Use `NoJS.notify()` after mutating stores from JavaScript outside expressions.

**Binding** - `bind="expr"` (text), `bind-html="expr"` (sanitized HTML), `bind-*="expr"` (any attribute), `model="prop"` (two-way for form inputs).

**Conditionals** - `if`/`then`/`else`, `else-if`, `show`/`hide` (CSS toggle), `switch`/`case`/`default`.

**Loops** - `foreach="item in items"` is the primary loop directive. `each` and `for` are aliases (same handler, identical behavior). All three support `filter`, `sort`, `limit`, `offset`, `key`, `else`, `template`, `index`, `animate-*`. When no `template` attribute is present, the element's inline children serve as the repeating template. Loop vars: `$index`, `$count`, `$first`, `$last`, `$even`, `$odd`.

**Events** - `on:click="expr"` with modifiers `.prevent`, `.stop`, `.once`, `.self`, `.debounce.300`, `.throttle.100`. Key mods: `.enter`, `.escape`, `.tab`, `.space`, `.delete`, `.backspace`, `.up`, `.down`, `.left`, `.right`, `.ctrl`, `.alt`, `.shift`, `.meta`. Lifecycle: `on:init`, `on:mounted`, `on:updated`, `on:unmounted`. Vars: `$event`, `$el`.

**Styling** - `class-active="cond"`, `class-map="{ ... }"`, `style-color="expr"`, `style-map="{ ... }"`.

**Forms** - `<form validate>` with `$form` context (`valid`, `dirty`, `submitting`, `errors`, `firstError`, `reset()`). Field rules: `validate="required,email,min:5"`. Per-field state: `$form.fields.email.valid`. Triggers: `validate-on="blur"`. Conditional: `validate-if="expr"`. Auto-disables submit buttons when `$form.submitting`. Custom: `NoJS.validator('name', fn)`.

**Routing** - `<a route="/path">`, `<template route="/users/:id">`, `<main route-view>`. Named outlets: `outlet="sidebar"`. Context: `$route.params`, `$route.query`, `$route.path`, `$route.matched`. Guards: `guard="expr"`. File-based: `route-view src="pages/"`. Catch-all: `route="*"`. Programmatic: `NoJS.router.push()`, `.replace()`, `.back()`, `.forward()` (return Promises). **View Transitions:** `<main route-view transition="slide">` uses the View Transition API with built-in presets (`slide`, `fade`, `scale`, `none`). Enabled by default (`router.viewTransition: true`). **Accessibility:** `focusBehavior: 'auto'` in router config moves focus after navigation (`[autofocus]` → `[tabindex="-1"]` → `h1` → outlet). **Hash mode warning:** enabling `useHash: true` logs a console warning about SEO impact; silence with `suppressHashWarning: true`. **Route head attributes** on `<template route>`: `page-title="expr"`, `page-description="expr"`, `page-canonical="expr"`, `page-jsonld='{"@type":…}'` — update `<head>` on every navigation; expressions can use `$route` and `$store`.

**Animations** - `animate="fadeIn"`, `transition="slide"`, `animate-stagger="50"`. Built-in: fadeIn, fadeOut, fadeInUp, slideInLeft, zoomIn, bounceIn, etc. **Route transitions use the View Transition API** by default: `<main route-view transition="slide">` wraps DOM swaps in `document.startViewTransition()` with built-in presets (`slide`, `fade`, `scale`, `none`). The `slide` preset detects forward/backward direction automatically. Custom CSS via `::view-transition-old(route-content)` / `::view-transition-new(route-content)` and `:active-view-transition-type()`. Respects `prefers-reduced-motion`. Disable with `router: { viewTransition: false }` to fall back to legacy class-based transitions. The `transition` attribute on non-router elements (e.g., `if`, `show`) still uses class-based `{name}-enter` / `{name}-leave` transitions.

**i18n** - `t="key"`, `t-name="expr"`, `t-html` (render translation as sanitized HTML), `i18n-ns="namespace"`, pluralization `"one item | {count} items"`. Namespace mode: `loadPath: '/locales/{locale}/{ns}.json'`. Formatting filters: `currency`, `date`, `datetime`, `relative`, `number`, `percent`. Context: `$i18n.locale`.

**DnD** - `drag`, `drop="handler"`, `drag-list="items"`, `drag-multiple`.

**Templates** - `<template id="name">`, `use="tplId"`, `<slot>`, `<template src="/path.html">` (recursive loading), `include="#tpl"`. Template variables: `var="name"`. Lazy loading: `lazy` (auto), `lazy="priority"` (phase 0), `lazy="ondemand"` (routes only). Loading placeholder: `loading="#tpl"`.

**Head Management** - `page-title="expr"`, `page-description="expr"`, `page-canonical="expr"`, `page-jsonld` (with `{interpolation}` in text content). Place on `<div hidden>` elements. Reactively update `<head>` elements. Priority 1.

**Refs** - `ref="name"` → `$refs.name`, `call="/url"`, `trigger="eventName"`.

**Errors** - `error="#tpl"`, `error-boundary`, `NoJS.config({ onError })`.

**Head Management** (priority 20, non-routing pages) - Body directives on `<div hidden>` that update `<head>` reactively: `page-title="expr"` (sets `document.title`), `page-description="expr"` (updates `<meta name="description">`), `page-canonical="expr"` (updates `<link rel="canonical">`), `page-jsonld` (body content with `{placeholder}` interpolation, updates `<script type="application/ld+json" data-nojs>`). For SPA routes prefer route head attributes on `<template route>` instead.

### 3. Use the expression syntax correctly

Expressions support JavaScript-like syntax against the reactive context:
- Property access: `user.name`, `items[0]`, `user?.address?.city`
- Arithmetic, comparisons, ternary, template literals
- Pipes (filters): `name | uppercase`, `price | currency:'USD'`
- Assignments: `count++`, `name = 'John'`
- Function calls: `items.push(newItem)`
- The evaluator uses an allow-list approach: `_SAFE_GLOBALS` for JS built-ins and `_BROWSER_GLOBALS` for curated browser APIs. `fetch`, `XMLHttpRequest`, `localStorage`, `sessionStorage`, `WebSocket`, and `indexedDB` are NOT on the allow-list. Spread operations filter `_FORBIDDEN_PROPS` (`__proto__`, `constructor`, `prototype`)

### 4. Apply filters via pipe syntax

`bind="value | filter1 | filter2:arg"` - 32 built-in filters across text, numbers, arrays, dates, and utilities. See [references/filters.md](references/filters.md) for the complete list. Custom: `NoJS.filter('name', fn)`.

### 5. Use the public API when needed

```javascript
NoJS.config({ baseApiUrl, headers, timeout, retries, router, i18n, stores, exprCacheSize, dangerouslyDisableSanitize, maxEventListeners, devtools })  // router.viewTransition: true (default) enables View Transition API
NoJS.init(root?)           // Auto-called by CDN; manual for ESM/CJS. Returns a Promise
NoJS.use(plugin, options?) // Register a plugin ({ name, install, init?, dispose? })
NoJS.global(name, value)   // Register reactive global ($name in expressions)
NoJS.dispose()             // Full teardown (plugins, stores, interceptors, router)
NoJS.directive(name, { priority, init(el, attrName, value) })
NoJS.filter(name, fn)      // Custom filter
NoJS.validator(name, fn)   // Custom validator
NoJS.i18n({ loadPath, defaultLocale, fallbackLocale, persist })
NoJS.on(event, callback)   // Global event bus
NoJS.interceptor('request' | 'response', fn)  // Supports async, plugin tracking
NoJS.store                 // Access global stores
NoJS.notify()              // Trigger UI update after external mutation
NoJS.router                // push(), replace(), back(), forward()
NoJS.locale = 'pt'         // Get/set locale
NoJS.version               // "1.10.1"
NoJS.CANCEL                // Symbol sentinel: cancel request in interceptor
NoJS.RESPOND               // Symbol sentinel: short-circuit with mock response
NoJS.REPLACE               // Symbol sentinel: replace response data
```

### 6. Use the plugin system for extensibility

No.JS supports a plugin system for reusable extensions. Plugins can register interceptors, inject reactive globals, add custom directives, and hook into the app lifecycle.

**Plugin registration** - `NoJS.use(plugin, options?)` accepts an object with `{ name, install, init?, dispose? }` or a named function. Plugins are installed synchronously; their `init` hook runs after `NoJS.init()`.

**Reactive globals** - `NoJS.global('name', value)` injects a variable accessible as `$name` in all expressions. Objects are auto-wrapped in reactive contexts. Reserved names (`store`, `route`, `router`, `i18n`, `refs`, `form`, etc.) and prototype pollution vectors (`__proto__`, `constructor`, `prototype`) are blocked.

**Interceptor sentinels** - Request interceptors can return `{ [NoJS.CANCEL]: true }` to abort, `{ [NoJS.RESPOND]: data }` to short-circuit. Response interceptors can return `{ [NoJS.REPLACE]: data }` to replace parsed data.

**Trusted interceptors** - Plugins receive redacted headers by default. Install with `{ trusted: true }` for unredacted access to sensitive headers.

**Disposal** - `NoJS.dispose()` tears down plugins in reverse order (3s timeout each), then clears globals and interceptors.

**Directive freezing** - Core directives are frozen after framework load. Plugins can add new directives but cannot override built-ins.

See [references/plugins.md](references/plugins.md) for the complete plugin system reference with lifecycle details, security rules, and examples.

### 7. Follow these rules when generating No.JS code

1. **Always set `as` on fetch directives** - `get="/users" as="users"` not just `get="/users"`
2. **Use `foreach` for all loops** (`each` and `for` are aliases -- all three share the same handler and support filter/sort/limit/key)
3. **Use `show`/`hide` for frequent toggles, `if` for rare** - show is CSS-only, if recreates DOM
4. **Use templates for reuse** - `<template id="name">` + `then="name"` or `use="name"`
5. **Scope state close to usage** - Put `state` on the nearest common ancestor
6. **Use `$store` for cross-component data** - Auth, theme, cart, notifications
7. **Add `key` on loops** - `each="item in items" key="item.id"` for efficient updates
8. **Use filters for display** - `bind="price | currency"` not inline formatting
9. **Events use colon syntax** - `on:click` not `onclick` or `on-click`
10. **Validate forms declaratively** - `<form validate>` + `validate="required,email"` on inputs
11. **Use plugins for reusable extensions** - `NoJS.use({ name, install })` for auth, analytics, etc.
12. **Namespace plugin globals** - `app.global('myPlugin', {...})` not `app.global('data', {...})`

### 8. Validate templates for common mistakes

Check for: directive typos (`bnd`→`bind`, `on-click`→`on:click`), missing `as` on `get`, `foreach`/`each`/`for` without `in`, `model` on non-form elements, unsanitized `bind-html`. See [references/validation.md](references/validation.md) for the full checklist.

### 9. Use the NoJS CLI for development tooling

The NoJS CLI (`@erickxavier/nojs-cli`) provides project scaffolding, a dev server, HTML optimization, template validation, and plugin management — all from the command line.

**Scaffold** — `nojs init my-app` runs an interactive wizard generating `index.html`, routes, i18n locales, styles, and `nojs.config.json`. Non-interactive: `nojs init my-app --routing --i18n --locales en,pt --api https://api.example.com -y`.

**Dev server** — `nojs dev` starts a local HTTP server with SSE live reload, SPA fallback for client-side routing, and path traversal protection. Options: `--port`, `--open`, `--quiet`, `--no-reload`.

**Prebuild** — `nojs prebuild` runs 6 HTML optimization plugins: `inject-resource-hints` (preload/preconnect for fetch URLs), `inject-head-attrs` (title, description, canonical, JSON-LD), `inject-speculation-rules` (Speculation Rules API from routes), `inject-og-twitter` (Open Graph + Twitter Card meta), `generate-sitemap` (sitemap.xml from routes), `optimize-images` (lazy loading, LCP preload, fetchpriority). Configurable via `nojs-prebuild.config.js`.

**Validate** — `nojs validate *.html` checks 10 rules: missing `as` on fetch, `foreach`/`each`/`for` without `in`, `model` on non-form elements, `bind-html` warning, routes without `route-view`, empty event handlers, loops without `key`, duplicate store names, `validate` outside `<form>`. Use `--format json` for CI.

**Plugins** — `nojs plugin search|install|update|remove|list` manages plugins from CDN (official, with SRI integrity) or npm (community). Config stored in `nojs.config.json`.

See [references/cli.md](references/cli.md) for the complete CLI reference with all options, config schemas, and examples.

### 10. Consult reference files for deep details

- [references/directives.md](references/directives.md) - Complete directive reference with all attributes and examples
- [references/filters.md](references/filters.md) - All 32 built-in filters with syntax
- [references/api.md](references/api.md) - Full JavaScript API reference
- [references/plugins.md](references/plugins.md) - Plugin system: lifecycle, globals, interceptors, sentinels, security
- [references/routing.md](references/routing.md) - Routing reference: View Transition API, presets, direction detection, custom CSS
- [references/patterns.md](references/patterns.md) - Common patterns, scaffolds, and best practices
- [references/validation.md](references/validation.md) - Template validation rules and common mistakes
- [references/cli.md](references/cli.md) - NoJS CLI: init, dev, prebuild, validate, plugin commands

## Ecosystem

- **Website**: https://no-js.dev/
- **CDN**: https://cdn.no-js.dev/
- **npm**: `npm install @erickxavier/no-js`
- **GitHub**: https://github.com/ErickXavier/no-js
- **CLI**: `npm install -g @erickxavier/nojs-cli` (scaffold, dev server, prebuild, validate, plugins)
- **VS Code Extension**: NoJS LSP (completions, diagnostics, hover docs for 43+ directives)
- **Full docs**: https://no-js.dev/llms-full.txt
