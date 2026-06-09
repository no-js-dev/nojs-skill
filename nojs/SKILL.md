---
name: nojs
metadata:
  version: 1.14.0
description: Provides expert-level knowledge of the No.JS HTML-first reactive framework for building dynamic web applications using only HTML attributes. Activates when the user mentions No.JS, NoJS, "no javascript framework", HTML-first framework, or is writing HTML with reactive attributes like bind, state, get, foreach, each, for, on:click, model, route, store, computed, watch, if/else, show/hide, validate, animate, drag, drop, t (i18n), class-*, style-*, or bind-*. Also relevant when the user asks about declarative HTML frameworks, zero-JS frameworks, or wants to build a web app without writing JavaScript. Applies whenever HTML attributes match No.JS directive patterns, even without explicit mention of the framework.
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

## Project context

Project configuration:
`cat nojs.config.json 2>/dev/null || echo 'No nojs.config.json found'`

HTML files in the project:
`find . -name '*.html' -maxdepth 2 -not -path '*/node_modules/*' | head -10`

Files using NoJS:
`grep -l 'cdn.no-js.dev\|@erickxavier/no-js' package.json *.html 2>/dev/null | head -5`

## When to use

This skill applies when:

- The user mentions **No.JS**, **NoJS**, or the **HTML-first reactive framework**
- The user is writing HTML with No.JS directive attributes (`bind`, `state`, `get`, `foreach`, `each`, `for`, `on:click`, `model`, `route`, `store`, `validate`, `animate`, `drag`, `drop`, `t`, `class-*`, `style-*`, `bind-*`)
- The user asks about **declarative HTML frameworks** or wants to build a **web app without writing JavaScript**
- The user needs to **scaffold**, **validate**, or **debug** No.JS templates
- HTML attributes match No.JS directive patterns, even without explicit mention of the framework

## Instructions

### 1. Understand the framework architecture

No.JS works by walking the DOM on `DOMContentLoaded`, matching HTML attributes to directives, and executing them by priority:

| Priority | Directives | Purpose |
|----------|-----------|---------|
| 0 | `state`, `store` | Initialize reactive data first |
| 1 | `get`, `post`, `put`, `patch`, `delete`, `error-boundary`, `i18n-ns`, `page-title`, `page-description`, `page-canonical`, `page-jsonld` | Fetch data, error/i18n setup, head management |
| 2 | `computed`, `watch` | Derive values and observe changes |
| 5 | `ref` | Element references |
| 10 | `if`, `else-if`, `else`, `switch`, `foreach`, `each`, `for`, `use`, `drag-list`* | Structural (add/remove DOM) |
| 15 | `drag`*, `drop`* | Drag and drop setup |
| 16 | `drag-multiple`* | Multi-select drag |
| 20 | `bind`, `bind-*`, `bind-html`, `model`, `class-*`, `style-*`, `on:*`, `show`, `hide`, `t`, `call`, `trigger` | Rendering, events, i18n, actions |
| 30 | `validate`* | Form validation side effects |

> \* As of v1.13.0, `drag`, `drop`, `drag-list`, `drag-multiple`, and `validate` require the `@erickxavier/nojs-elements` plugin. Install it and call `NoJS.use(NoJSElements)` to enable them. The `error-boundary` directive and `NoJS.validator()` remain in core.

Data lives in Proxy-backed reactive contexts that inherit from parent elements (like lexical scoping). When data changes, every bound element updates automatically.

### 2. Know the directive categories

Directives are organized into eight categories. Each summary below provides enough context to decide when to consult the full reference.

**Data Fetching** -- `get`, `post`, `put`, `patch`, `delete` with `as`, `loading`, `error`, `empty`, `success`, `refresh`, `cached`, `skeleton`, `debounce`, `headers`, `params`, `get-trigger`, `get-insert`, `get-page`, `get-cursor`, `get-cursor-field`, `get-threshold`. URLs support interpolation (`/users/{userId}`). Pagination via `get-trigger="scroll"` + `get-insert="append"` + `get-page` or `get-cursor`. See [references/directives/data-fetching.md](references/directives/data-fetching.md).

**State and Binding** -- `state` (local), `store` (global via `$store`), `computed`, `watch`, `persist`/`persist-key`/`persist-fields`. Binding: `bind` (text), `bind-html` (sanitized), `bind-*` (attributes), `model` (two-way). See [references/directives/state-and-binding.md](references/directives/state-and-binding.md).

**Control Flow** -- `if`/`else-if`/`else`, `show`/`hide` (CSS toggle), `switch`/`case`/`default`. Loops: `foreach`/`each`/`for` (aliases, same handler) with `filter`, `sort`, `limit`, `offset`, `key`. Loop vars: `$index`, `$count`, `$first`, `$last`, `$even`, `$odd`. See [references/directives/control-flow.md](references/directives/control-flow.md).

**Events** -- `on:click="expr"` with modifiers (`.prevent`, `.stop`, `.once`, `.debounce.300`, `.throttle.100`). Key mods, lifecycle hooks (`on:init`, `on:mounted`, `on:updated`, `on:unmounted`, `on:error`). Vars: `$event`, `$el`. See [references/directives/events.md](references/directives/events.md).

**Routing** -- `<a route>`, `<template route>`, `<main route-view>`. View Transition API with presets (`slide`, `fade`, `scale`, `none`). Guards, named outlets, `$route` context, file-based routing, head attributes. See [references/directives/routing.md](references/directives/routing.md).

**Forms** -- `<form validate>` with `$form` context (requires Elements plugin since v1.13.0). Field rules: `validate="required,email,min:5"`. Triggers: `validate-on`. Conditional: `validate-if`. Custom validators via `NoJS.validator()` (remains in core). See [references/directives/forms.md](references/directives/forms.md).

**Templates** -- `<template id>` + `use`, `<slot>`, `<template src>` (remote loading), `include`, lazy loading (`lazy`, `lazy="priority"`, `lazy="ondemand"`). See [references/directives/templates.md](references/directives/templates.md).

**Extras** -- Animations (`animate`, `transition`, `animate-stagger`), i18n (`t`, `i18n-ns`, pluralization), DnD (`drag`, `drop`, `drag-list`, `drag-multiple` -- requires Elements plugin since v1.13.0), head management (`page-title`, `page-description`, `page-canonical`, `page-jsonld`), refs (`ref`, `call`, `trigger`), styling (`class-*`, `style-*`), error boundaries. See [references/directives/extras.md](references/directives/extras.md).

### 3. Use the expression syntax correctly

Expressions support JavaScript-like syntax against the reactive context:
- Property access: `user.name`, `items[0]`, `user?.address?.city`
- Arithmetic, comparisons, ternary, template literals
- Pipes (filters): `name | uppercase`, `price | currency:'USD'`
- Assignments: `count = 'John'`, `count += 1`, `count -= 1`, `total *= 2`, `total /= 2`, `remaining %= 3`
- Increment/decrement: `count++`, `count--`, `++count`, `--count`
- Multi-statement: semicolon-separated statements in event handlers: `on:click="count++; name = 'updated'; validate()"`
- Function calls: `items.push(newItem)`
- **Statement write-back**: In event handlers (`on:*`, `watch`), mutated context variables are automatically written back to the owning context in the scope chain after execution. New variables created during execution are persisted to the context via `$set`
- **Caching**: Expression and statement ASTs are cached using LRU eviction (configurable via `exprCacheSize`, default 500)
- The evaluator uses an allow-list approach: `_SAFE_GLOBALS` for JS built-ins and `_BROWSER_GLOBALS` for curated browser APIs. `fetch`, `XMLHttpRequest`, `localStorage`, `sessionStorage`, `WebSocket`, and `indexedDB` are NOT on the allow-list. Spread operations filter `_FORBIDDEN_PROPS` (`__proto__`, `constructor`, `prototype`)
- **Security proxies**: `window`, `document`, `location`, `history`, and `navigator` are wrapped in security proxies that block sensitive sub-properties:
  - **window**: blocks `fetch`, `XMLHttpRequest`, `localStorage`, `sessionStorage`, `WebSocket`, `indexedDB`, `eval`, `Function`, `importScripts`, `open`, `postMessage`
  - **document**: blocks `cookie`, `domain`, `write`, `writeln`, `execCommand`
  - **location**: read-only wrapper exposing `href`, `pathname`, `search`, `hash`, `origin`, `hostname`, `port`, `protocol`, `host`. Navigation methods (`assign`, `replace`, `reload`) are no-ops
  - **history**: read-only wrapper exposing `length`, `state`, `scrollRestoration`. Navigation methods (`pushState`, `replaceState`, `back`, `forward`, `go`) are no-ops
  - **navigator**: blocks `sendBeacon` and `credentials`

### 4. Apply filters via pipe syntax

`bind="value | filter1 | filter2:arg"` -- 32 built-in filters across text, numbers, arrays, dates, and utilities. Custom filters via `NoJS.filter('name', fn)`. See [references/filters.md](references/filters.md) for the complete list.

### 5. Use the public API when needed

```javascript
NoJS.config({ baseApiUrl, headers, timeout, retries, router, i18n, stores, exprCacheSize, dangerouslyDisableSanitize, maxEventListeners, devtools })
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
NoJS.version               // "1.11.1"
NoJS.CANCEL                // Symbol sentinel: cancel request in interceptor
NoJS.RESPOND               // Symbol sentinel: short-circuit with mock response
NoJS.REPLACE               // Symbol sentinel: replace response data
```

See [references/api.md](references/api.md) for the complete API reference. See [references/plugins.md](references/plugins.md) for the plugin system (lifecycle, globals, interceptors, sentinels, security).

### 6. Follow these rules when generating No.JS code

1. **Always set `as` on fetch directives** -- `get="/users" as="users"` not just `get="/users"`
2. **Use `foreach` for all loops** (`each` and `for` are aliases -- all three share the same handler and support filter/sort/limit/key)
3. **Use `show`/`hide` for frequent toggles, `if` for rare** -- show is CSS-only, if recreates DOM
4. **Use templates for reuse** -- `<template id="name">` + `then="name"` or `use="name"`
5. **Scope state close to usage** -- put `state` on the nearest common ancestor
6. **Use `$store` for cross-component data** -- auth, theme, cart, notifications
7. **Add `key` on loops** -- `each="item in items" key="item.id"` for efficient updates
8. **Use filters for display** -- `bind="price | currency"` not inline formatting
9. **Events use colon syntax** -- `on:click` not `onclick` or `on-click`
10. **Validate forms declaratively** -- `<form validate>` + `validate="required,email"` on inputs
11. **Use plugins for reusable extensions** -- `NoJS.use({ name, install })` for auth, analytics, etc.
12. **Namespace plugin globals** -- `NoJS.global('myPlugin', {...})` not `NoJS.global('data', {...})`

### 7. Validate templates for common mistakes

Check for: directive typos (`bnd` -> `bind`, `on-click` -> `on:click`), missing `as` on `get`, `foreach`/`each`/`for` without `in`, `model` on non-form elements, unsanitized `bind-html`. See [references/validation.md](references/validation.md) for the full checklist.

## Decision tree: which reference file to consult

| Need | Reference file |
|------|---------------|
| Directive syntax for `get`, `post`, `put`, `patch`, `delete`, `as`, `loading`, `error`, `cached`, `skeleton`, `get-trigger`, `get-insert`, `get-page`, `get-cursor`, `get-threshold` | [references/directives/data-fetching.md](references/directives/data-fetching.md) |
| Directive syntax for `state`, `store`, `computed`, `watch`, `bind`, `model`, `persist` | [references/directives/state-and-binding.md](references/directives/state-and-binding.md) |
| Directive syntax for `if`, `else`, `show`, `hide`, `switch`, `foreach`, `each`, `for` | [references/directives/control-flow.md](references/directives/control-flow.md) |
| Directive syntax for `on:*`, event modifiers, lifecycle hooks | [references/directives/events.md](references/directives/events.md) |
| Setting up routing, view transitions, guards, named outlets, `$route` | [references/directives/routing.md](references/directives/routing.md) |
| Building a form with validation rules, `$form`, custom validators | [references/directives/forms.md](references/directives/forms.md) |
| Template reuse, slots, remote loading, lazy loading | [references/directives/templates.md](references/directives/templates.md) |
| Animations, i18n, DnD, head management, refs, styling, errors | [references/directives/extras.md](references/directives/extras.md) |
| Filter syntax and the 32 built-in filters | [references/filters.md](references/filters.md) |
| JavaScript API (`NoJS.config`, `NoJS.init`, `NoJS.use`, etc.) | [references/api.md](references/api.md) |
| Plugin system (lifecycle, globals, interceptors, sentinels) | [references/plugins.md](references/plugins.md) |
| Common patterns and scaffolds | [references/patterns.md](references/patterns.md) |
| Template validation rules and common mistakes | [references/validation.md](references/validation.md) |
| Debugging issues, console warnings, common mistakes | [references/troubleshooting.md](references/troubleshooting.md) |

## Workflow checklists

### Scaffold a NoJS app from scratch

1. Include the CDN script: `<script src="https://cdn.no-js.dev/"></script>`
2. Add `base="https://api.example.com"` on `<body>` if using a REST API
3. Define initial state with `state="{ ... }"` on a container element
4. Add fetch directives with `get="/endpoint" as="data"` and display with `bind`
5. Add interactivity with `on:click`, `model`, `show`/`if`
6. Optionally configure with `NoJS.config({ ... })` in a `<script>` tag before the CDN script

### Add client-side routing

1. Configure the router: `NoJS.config({ router: { viewTransition: true } })`
2. Add a route outlet: `<main route-view transition="slide"></main>`
3. Define routes: `<template route="/users" page-title="'Users'">...</template>`
4. Add navigation links: `<a route="/users">Users</a>`
5. For dynamic routes: `<template route="/users/:id">` and access `$route.params.id`
6. Add guards if needed: `guard="$store.auth.loggedIn"`
7. For file-based routing: `<main route-view src="pages/"></main>`
8. See [references/directives/routing.md](references/directives/routing.md) for all options

### Setup i18n

1. Configure: `NoJS.i18n({ loadPath: '/locales/{locale}.json', defaultLocale: 'en', fallbackLocale: 'en', persist: true })`
2. Create locale files: `/locales/en.json`, `/locales/pt.json` with `{ "key": "value" }` structure
3. Use translations: `<h1 t="greeting"></h1>` with interpolation `t-name="user.name"`
4. For HTML content: add `t-html` attribute
5. Switch locale: `NoJS.locale = 'pt'` or bind to a select with `model`
6. For namespaces: `loadPath: '/locales/{locale}/{ns}.json'` and `i18n-ns="namespace"` on containers. When the locale is switched, all previously loaded namespaces (including route-loaded ones) are automatically re-fetched for the new locale
7. Pluralization: `"one item | {count} items"` in locale files
8. Formatting filters: `bind="price | currency:'USD'"`, `bind="date | date:'short'"`

### Add form validation

> Prerequisite: the `validate` directive requires the `@erickxavier/nojs-elements` plugin. Install it and call `NoJS.use(NoJSElements)` to enable it.

1. Add `validate` attribute to the `<form>` element
2. Add validation rules to inputs: `<input model="email" validate="required,email">`
3. Display errors: `<span if="$form.fields.email.errors.length" bind="$form.fields.email.errors[0]"></span>`
4. Disable submit when invalid: submit buttons auto-disable when `$form.submitting` is true
5. Control validation triggers: `validate-on="blur"` for per-field timing
6. Conditional validation: `validate-if="showAddress"` to skip fields dynamically
7. Access form state: `$form.valid`, `$form.dirty`, `$form.errors`, `$form.firstError`
8. Submit handling: `on:submit.prevent="post('/api/submit', $form.data)"` (auto-sets `$form.submitting`)
9. Register custom validators: `NoJS.validator('phone', fn)`
10. See [references/directives/forms.md](references/directives/forms.md) and [references/validation.md](references/validation.md)

### Create a CRUD interface

> Prerequisite: the `validate` directive used below requires the `@erickxavier/nojs-elements` plugin. Install it and call `NoJS.use(NoJSElements)` to enable it.

1. Set `base` URL on a container: `<div base="https://api.example.com">`
2. **List**: `<div get="/items" as="items"><div foreach="item in items" key="item.id">...</div></div>`
3. **Create**: `<form validate on:submit.prevent="post('/items', { name, description }); name=''; description=''"><input model="name" validate="required">...</form>`
4. **Read**: Use routing for detail view: `<template route="/items/:id"><div get="/items/{$route.params.id}" as="item"><h1 bind="item.name"></h1></div></template>`
5. **Update**: `<form validate on:submit.prevent="put('/items/' + item.id, { name: item.name })">...</form>`
6. **Delete**: `<button on:click="delete('/items/' + item.id)">Delete</button>`
7. **Refresh**: Add `refresh="30"` on the list `get` to poll, or re-fetch on mutations with reactive URL interpolation
8. **Infinite Scroll**: `<div get="/items?page={page}" get-trigger="scroll" get-insert="append" get-page="1" as="items"><div foreach="item in items" key="item.id">...</div></div>`
9. **Load More**: Same as infinite scroll but `get-trigger="button"` + optional `get-trigger-label="Show More"`
10. **Cursor Pagination**: `<div get="/feed?cursor={cursor}" get-trigger="scroll" get-insert="append" get-cursor as="posts">...</div>`
11. **Loading states**: Use `loading`, `error`, `empty` attributes on fetch containers
12. See [references/directives/data-fetching.md](references/directives/data-fetching.md) and [references/patterns.md](references/patterns.md)

## Ecosystem

- **Website**: https://no-js.dev/
- **CDN**: https://cdn.no-js.dev/
- **npm**: `npm install @erickxavier/no-js`
- **GitHub**: https://github.com/ErickXavier/no-js
- **Elements**: `npm install @erickxavier/nojs-elements` (UI plugin — `drag`, `drop`, `drag-list`, `drag-multiple`, `validate`; new in v1.13.0)
- **VS Code Extension**: NoJS LSP (completions, diagnostics, hover docs for 43+ directives)
- **Full docs**: https://no-js.dev/llms-full.txt
