# No.JS DevTools Reference

Runtime inspection, mutation, and monitoring API for No.JS applications. DevTools provides zero-overhead tooling that is only active when explicitly enabled and running on a local hostname.

## Contents

- [Enabling DevTools](#enabling-devtools)
- [Local-Hostname Restriction](#local-hostname-restriction)
- [window.\_\_NOJS\_DEVTOOLS\_\_ API](#window__nojs_devtools__-api)
  - [Read-Only Properties](#read-only-properties)
  - [inspect(selector)](#inspectselector)
  - [inspectStore(name)](#inspectstorename)
  - [inspectTree(selector?)](#inspecttreeselector)
  - [stats()](#stats)
  - [mutate(id, key, value)](#mutateid-key-value)
  - [mutateStore(name, key, value)](#mutateStorename-key-value)
  - [highlight(selector) / unhighlight()](#highlightselector--unhighlight)
  - [on(type, fn)](#ontype-fn)
- [CustomEvent Protocol](#customevent-protocol)
  - [Command Channel](#command-channel)
  - [Response Channel](#response-channel)
  - [Command Types](#command-types)
- [Event Stream](#event-stream)
  - [Event Types](#event-types)
- [Context Registry](#context-registry)
- [Cleanup and Disposal](#cleanup-and-disposal)

---

## Enabling DevTools

Enable DevTools via `NoJS.config()` before calling `NoJS.init()`:

```js
NoJS.config({ devtools: true });
NoJS.init();
```

When enabled, the framework:
1. Assigns a unique `__devtoolsId` to every reactive context created by `createContext()`
2. Registers each context in an internal `_ctxRegistry` Map for inspection
3. Emits `CustomEvent` lifecycle events on the `window` object
4. Exposes the `window.__NOJS_DEVTOOLS__` API object
5. Listens for `nojs:devtools:cmd` CustomEvents for external tool integration

A confirmation message appears in the console when DevTools is successfully initialized:

```
[No.JS DevTools] enabled — access via window.__NOJS_DEVTOOLS__
```

---

## Local-Hostname Restriction

DevTools is silently disabled on non-local hostnames to prevent accidental exposure in production. The following hostnames are considered local:

| Hostname | Description |
|----------|-------------|
| `localhost` | Standard local development |
| `127.0.0.1` | IPv4 loopback |
| `::1` | IPv6 loopback |
| `0.0.0.0` | All-interfaces bind |
| `*.localhost` | Subdomain localhost (e.g., `app.localhost`) |
| `""` (empty string) | File protocol / no hostname |

If `devtools: true` is set but the hostname is not local, the following warning is emitted and DevTools does not initialize:

```
[No.JS] devtools: true is ignored outside local environments. Remove devtools: true before deploying to production.
```

**Important:** Always remove `devtools: true` from production builds. Even though the hostname guard prevents activation, the config flag itself signals intent and should not ship to production.

---

## window.\_\_NOJS\_DEVTOOLS\_\_ API

When DevTools is enabled, `window.__NOJS_DEVTOOLS__` exposes the following interface.

### Read-Only Properties

These are getter properties that return snapshots (not live references) to prevent accidental mutations:

```js
const dt = window.__NOJS_DEVTOOLS__;

dt.stores   // Object — snapshot of all stores { name: { ...data } }
dt.config   // Object — shallow copy of current framework config
dt.refs     // Object — copy of all ref-registered elements
dt.router   // Object — live router instance (or null)
dt.version  // String — framework version (e.g., "1.11.1")
dt.plugins  // Map — copy of installed plugins (name -> { plugin, options })
dt.globals  // Object — copy of plugin globals
```

Store snapshots are serialized safely: functions are excluded, circular references are stringified, and proxy references are recursively unwrapped. Sensitive config values (`headers`, `csrf.token`) are redacted in the `get:config` command response but visible in the `config` getter.

### inspect(selector)

Inspect a DOM element's reactive context and directive attributes.

```js
window.__NOJS_DEVTOOLS__.inspect('#my-component');
```

**Returns:**

```js
{
  selector: '#my-component',
  tag: 'div#my-component.active',       // tag + id + classes
  hasContext: true,
  contextId: 3,                          // __devtoolsId of the context
  data: { count: 0, name: 'Alice' },    // safe snapshot of context data
  directives: [                          // non-standard attributes
    { name: 'state', value: '{ count: 0, name: "Alice" }' },
    { name: 'bind', value: 'name' }
  ]
}
```

If the element is not found, returns `{ error: "Element not found", selector }`.

### inspectStore(name)

Inspect a named store's reactive context.

```js
window.__NOJS_DEVTOOLS__.inspectStore('cart');
```

**Returns:**

```js
{
  name: 'cart',
  contextId: 1,
  data: { items: [], total: 0 }
}
```

If the store is not found, returns `{ error: "Store not found", name }`.

### inspectTree(selector?)

Walk the DOM tree from a root element and build a hierarchy of elements that have reactive contexts or declared directives.

```js
// Inspect entire page
window.__NOJS_DEVTOOLS__.inspectTree();

// Inspect a subtree
window.__NOJS_DEVTOOLS__.inspectTree('#app');
```

**Returns:**

```js
{
  tag: 'body',
  contextId: null,
  children: [
    {
      tag: 'div#app',
      contextId: 2,
      children: [
        { tag: 'ul', contextId: 5, children: [] }
      ]
    }
  ]
}
```

The tree walker skips `<template>` and `<script>` elements. Only elements with `__ctx` (reactive context) or `__declared` (processed by a directive) are included.

### stats()

Return framework-wide statistics useful for diagnosing performance issues or memory leaks.

```js
window.__NOJS_DEVTOOLS__.stats();
```

**Returns:**

```js
{
  contexts: 42,       // total reactive contexts in registry
  stores: 3,          // number of named stores
  listeners: 128,     // total watcher callbacks across all contexts
  refs: 5,            // number of ref-registered elements
  hasRouter: true,     // whether the router is active
  locale: 'en'        // current i18n locale
}
```

### mutate(id, key, value)

Directly mutate a value on a reactive context by its `__devtoolsId`. The mutation goes through the proxy's `set` trap, triggering reactive updates.

```js
// Change the "count" property on context #3
window.__NOJS_DEVTOOLS__.mutate(3, 'count', 42);
```

**Returns:** `{ ok: true, id: 3, key: 'count' }` on success, or `{ error: "Context not found", id }` if the ID is invalid.

### mutateStore(name, key, value)

Directly mutate a value on a named store. The mutation goes through the store's proxy `set` trap.

```js
window.__NOJS_DEVTOOLS__.mutateStore('cart', 'total', 99.99);
```

**Returns:** `{ ok: true, name: 'cart', key: 'total' }` on success, or `{ error: "Store not found", name }` if the store does not exist.

### highlight(selector) / unhighlight()

Visually highlight an element by overlaying a semi-transparent blue rectangle over it. Useful for identifying which element owns a particular context.

```js
// Highlight an element
window.__NOJS_DEVTOOLS__.highlight('#my-component');

// Remove the highlight
window.__NOJS_DEVTOOLS__.unhighlight();
```

The overlay is a fixed-position `div` with:
- Background: `rgba(66, 133, 244, 0.25)`
- Border: `2px solid rgba(66, 133, 244, 0.8)`
- z-index: `2147483647` (maximum)
- `pointer-events: none` (does not interfere with interaction)
- ID: `__nojs_devtools_highlight__`

Only one highlight can be active at a time. Calling `highlight()` again automatically removes the previous overlay.

### on(type, fn)

Subscribe to the DevTools event stream. Returns an unsubscribe function.

```js
// Listen for all events
const unsub = window.__NOJS_DEVTOOLS__.on(null, (detail) => {
  console.log(detail.type, detail.data);
});

// Listen for a specific event type
const unsub2 = window.__NOJS_DEVTOOLS__.on('ctx:updated', (detail) => {
  console.log('Context updated:', detail.data);
});

// Unsubscribe
unsub();
unsub2();
```

The callback receives the event's `detail` object with `{ type, data, timestamp }`.

---

## CustomEvent Protocol

DevTools communicates via standard browser `CustomEvent` objects on the `window`. This enables external browser extensions or console scripts to interact with the framework without holding direct references.

### Command Channel

Send commands to DevTools by dispatching a `nojs:devtools:cmd` event:

```js
window.dispatchEvent(new CustomEvent('nojs:devtools:cmd', {
  detail: {
    command: 'inspect:element',
    args: { selector: '#my-app' }
  }
}));
```

### Response Channel

DevTools responds on `nojs:devtools:response`:

```js
window.addEventListener('nojs:devtools:response', (e) => {
  console.log(e.detail.command, e.detail.result);
});
```

Response shape: `{ command, result, timestamp }`.

### Command Types

| Command | Args | Description |
|---------|------|-------------|
| `inspect:element` | `{ selector }` | Inspect a DOM element's context and directives |
| `inspect:store` | `{ name }` | Inspect a named store |
| `inspect:tree` | `{ selector }` | Walk directive tree from root (default: `document.body`) |
| `mutate:context` | `{ id, key, value }` | Set a value on a context by devtools ID |
| `mutate:store` | `{ name, key, value }` | Set a value on a named store |
| `get:config` | (none) | Return framework config (headers/CSRF token redacted) |
| `get:routes` | (none) | Return registered route definitions |
| `get:stats` | (none) | Return framework statistics |
| `highlight:element` | `{ selector }` | Show visual overlay on element |
| `unhighlight` | (none) | Remove visual overlay |

Unknown commands return `{ error: "Unknown command", command }`.

---

## Event Stream

When DevTools is enabled, the framework emits `nojs:devtools` CustomEvents on the `window` for every significant lifecycle event. These events fire automatically -- no subscription is required to enable them.

```js
window.addEventListener('nojs:devtools', (e) => {
  const { type, data, timestamp } = e.detail;
  console.log(`[${type}]`, data, `@${timestamp}`);
});
```

### Event Types

| Type | Data | Emitted When |
|------|------|-------------|
| `store:created` | `{ name, keys }` | A new store is registered |
| `global:set` | `{ name, value }` | `NoJS.global()` sets a plugin global |
| `ctx:created` | `{ id, parentId, keys, elementTag }` | `createContext()` creates a new reactive context |
| `ctx:updated` | `{ id, key, oldValue, newValue }` | A context property is set through the proxy |
| `ctx:disposed` | `{ id }` | A context is disposed (element removed) |
| `directive:init` | `{ name, element }` | A directive initializes on an element |
| `route:navigate` | `{ path, params }` | The router navigates to a new route |
| `batch:start` | `{ depth }` | `_startBatch()` increments batch depth |
| `batch:end` | `{ depth, queueSize }` | `_endBatch()` flushes queued callbacks |

The `_devtoolsEmit()` function is a no-op when `_config.devtools` is `false`, so there is zero performance overhead when DevTools is disabled.

---

## Context Registry

When DevTools is enabled, every reactive context created by `createContext()` is assigned a monotonically increasing `__devtoolsId` and registered in an internal `Map` (`_ctxRegistry`). This registry maps `id -> Proxy` and is used by the `inspect` and `mutate` commands.

The registry enables:
- Looking up any context by numeric ID (from `inspect:element` results)
- Mutating context values from the console without needing a DOM reference
- Building the directive tree via `inspectTree()`

Context IDs are sequential integers starting from 1. They are not reused during the page lifecycle.

---

## Cleanup and Disposal

DevTools resources are cleaned up when `NoJS.dispose()` is called:

1. The `nojs:devtools:cmd` event listener is removed from `window`
2. The `window.__NOJS_DEVTOOLS__` object is deleted
3. The internal cleanup reference is nullified

After disposal, the DevTools API is no longer accessible and command events are ignored.
