# SSE (Server-Sent Events) Directive

Declarative Server-Sent Events via the native `EventSource` API. Priority 1.

## Contents

- [Overview](#overview)
- [Attribute API](#attribute-api)
  - [sse](#sse) -- EventSource URL
  - [as](#as) -- context variable name for incoming data
  - [sse-event](#sse-event) -- named SSE event to listen for
  - [sse-insert](#sse-insert) -- insert mode (replace, append, prepend)
  - [sse-limit](#sse-limit) -- array length cap for append/prepend
  - [sse-credentials](#sse-credentials) -- enable withCredentials
  - [into](#into) -- write data to a global store
  - [error](#error) -- error template (terminal close only)
  - [then](#then) -- expression on each message
- [Connection State ($sse)](#connection-state-sse)
- [Data Parsing](#data-parsing)
- [Reactive URL](#reactive-url)
- [Authentication](#authentication)
- [Connection Limits](#connection-limits)
- [Disposal and Cleanup](#disposal-and-cleanup)

---

## Overview

The `sse` directive opens a persistent EventSource connection to a server endpoint and binds incoming messages to the element's reactive context. It is the streaming counterpart to `get` -- where `get` performs a one-shot request-response cycle, `sse` holds an open connection and receives server-pushed messages in real time.

Key characteristics:

- **Native EventSource** -- uses the browser's built-in `EventSource` API. No polyfills, no external dependencies.
- **Automatic reconnection** -- browsers reconnect automatically when the connection drops. The directive distinguishes between auto-reconnect (non-terminal) and permanent close (terminal).
- **Reactive context integration** -- incoming data is set on the element's context via `$set()`, triggering automatic UI updates for all bound children.
- **Consistent API** -- shares `as`, `into`, `error`, and `then` attributes with the HTTP directives.

---

## Attribute API

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `sse` | string | (required) | URL for the EventSource. Supports reactive interpolation (`sse="/feed/{userId}"`). |
| `as` | string | `"data"` | Context variable name for incoming data. |
| `sse-event` | string | `"message"` | Named SSE event to listen for. When set, default `message` events are ignored. |
| `sse-insert` | `"replace"` \| `"append"` \| `"prepend"` | `"replace"` | How incoming messages update the context variable. |
| `sse-limit` | number | (none) | Maximum array length in append/prepend mode. Oldest items dropped when exceeded. |
| `sse-credentials` | boolean (presence) | `false` | Sets `withCredentials: true` on the EventSource for cross-origin cookie sending. |
| `into` | string | (none) | Write data to a named global store in addition to local context (dual-write). |
| `error` | string | (none) | Template ID to render when the connection permanently closes (`readyState === CLOSED`). NOT rendered during auto-reconnect. |
| `then` | string | (none) | Expression evaluated on each received message. The parsed message is available as `$event`. |

### `sse`

Open a Server-Sent Events connection to the specified URL.

**Syntax:** `<element sse="/endpoint">`

The directive creates an `EventSource` for the URL and listens for incoming messages. The connection opens immediately when the element is processed and closes automatically when the element is removed from the DOM.

URLs support `{variable}` interpolation with reactive re-connection (see [Reactive URL](#reactive-url)).

```html
<div sse="/api/ticker" as="ticker">
  <span bind="ticker.price"></span>
</div>
```

### `as`

Name for incoming data in the element's reactive context.

**Syntax:** `<element sse="/endpoint" as="varName">`

Default: `"data"` (consistent with the `get` directive). In replace mode, the variable holds the latest parsed message. In append/prepend mode, the variable is an array of parsed messages.

```html
<div sse="/api/stream" as="quote">
  <span bind="quote.symbol"></span>: <span bind="quote.price | currency"></span>
</div>
```

### `sse-event`

Listen for a specific named SSE event instead of the default `message` event.

**Syntax:** `<element sse="/endpoint" sse-event="eventName">`

When `sse-event` is set, the directive listens ONLY for that named event. Default `message` events (those sent by the server without an `event:` field) are ignored.

```html
<!-- Server sends: event: price-update\ndata: {"value": 100}\n\n -->
<div sse="/api/stream" sse-event="price-update" as="price">
  <span bind="price.value | currency"></span>
</div>
```

Without `sse-event`, the directive listens on the default `"message"` event (all messages without an `event:` field, plus messages with `event: message`).

### `sse-insert`

Control how incoming messages update the context variable.

**Syntax:** `<element sse="/endpoint" sse-insert="append|prepend">`

| Value | Behavior |
|-------|----------|
| `"replace"` (default) | Each message replaces the previous value. Context variable holds a single value. |
| `"append"` | Messages accumulate in an array. New messages are pushed to the end. If `sse-limit` is set and the array exceeds it, the oldest item (front) is removed. |
| `"prepend"` | Messages accumulate in an array. New messages are inserted at the front. If `sse-limit` is set and the array exceeds it, the oldest item (end) is removed. |

The context variable is initialized as an empty array `[]` when the insert mode is `append` or `prepend`.

```html
<!-- Live feed: newest at top, keep last 50 -->
<ul sse="/api/feed" as="messages" sse-insert="prepend" sse-limit="50">
  <li each="msg in messages" key="msg.id" bind="msg.text"></li>
</ul>
```

**Warnings:** The directive issues `_warn()` in two situations:

- `sse-limit` is set but `sse-insert` is absent or `"replace"` -- the limit has no effect without an array mode.
- `sse-insert` is `"append"` or `"prepend"` but `sse-limit` is NOT set -- unbounded memory growth risk on long-lived streams.

### `sse-limit`

Cap the array length in append/prepend mode.

**Syntax:** `<element sse="/endpoint" sse-insert="append" sse-limit="100">`

When the array exceeds this limit after a new message is added:

- **append mode:** the oldest item is removed from the front (`shift()`).
- **prepend mode:** the oldest item is removed from the end (`pop()`).

Has no effect in replace mode (a warning is issued).

### `sse-credentials`

Enable `withCredentials` on the EventSource for cross-origin requests.

**Syntax:** `<element sse="https://other.com/stream" sse-credentials>`

Boolean attribute (presence = `true`). When set, cookies and HTTP authentication are sent with the EventSource request to the cross-origin server. Required for cross-origin SSE endpoints that authenticate via cookies.

### `into`

Write incoming data to a named global store in addition to the local context.

**Syntax:** `<element sse="/endpoint" as="price" into="live">`

Dual-write: the data is set both on the element's local context (`ctx.$set(asKey, value)`) and on the named store (`_stores[storeName].$set(asKey, value)`), then store watchers are notified. This allows other components anywhere in the page to reactively consume the same live data.

The store is created automatically if it does not already exist.

```html
<!-- SSE source -->
<div sse="/api/ticker" as="price" into="live">
  <span bind="price | currency"></span>
</div>

<!-- Consumer elsewhere on the page -->
<div>Latest: <span bind="$store.live.price | currency"></span></div>
```

### `error`

Template ID to render when the EventSource connection permanently closes.

**Syntax:** `<element sse="/endpoint" error="errorTpl">`

The error template is rendered ONLY when the EventSource `error` event fires AND `readyState === EventSource.CLOSED` (terminal failure). It is NOT rendered during browser auto-reconnect attempts (`readyState === EventSource.CONNECTING`).

When triggered, the element's children are disposed (Safety Rule 1) and replaced with the cloned template. The template receives a context with a variable (default name from template's `var` attribute, or `"err"`) containing `{ message: "SSE connection closed" }`.

```html
<div sse="/api/stream" error="sseFailed">
  <span bind="data"></span>
</div>

<template id="sseFailed">
  <p>Connection lost. Please refresh.</p>
</template>
```

**No loading template:** Unlike the HTTP directives, `sse` does not support a `loading` attribute. SSE connections are persistent -- there is no clear "loading finished" moment. Use `$sse.connecting` and `$sse.open` to compose loading/status indicators instead:

```html
<div sse="/api/stream" as="data">
  <p show="$sse.connecting">Connecting...</p>
  <p show="$sse.open" bind="data"></p>
  <p show="$sse.error">Connection lost</p>
</div>
```

### `then`

Expression evaluated each time a message is received.

**Syntax:** `<element sse="/endpoint" then="count = count + 1">`

The parsed message data is available in the expression scope as `$event`. Executed via `_execStatement()` against the element's context.

```html
<div state="{ count: 0 }" sse="/api/notifications" as="notif"
     then="count = count + 1">
  <span bind="count"></span> notifications received
  <p bind="notif.text"></p>
</div>
```

Errors in the `then` expression are caught and logged via `_warn()` without disrupting the SSE connection.

---

## Connection State ($sse)

The directive exposes a `$sse` reactive object on the element's context with three boolean properties reflecting the connection lifecycle:

| Property | Type | Description |
|----------|------|-------------|
| `$sse.connecting` | boolean | `true` while the EventSource is in the `CONNECTING` state (initial connection or auto-reconnecting). |
| `$sse.open` | boolean | `true` when the EventSource connection is open and receiving messages. |
| `$sse.error` | boolean | `true` when the connection has permanently closed (`readyState === CLOSED`). |

### State transitions

| Event | `connecting` | `open` | `error` |
|-------|:---:|:---:|:---:|
| EventSource created | `true` | `false` | `false` |
| `open` event fires | `false` | `true` | `false` |
| `error` with `readyState === CONNECTING` (auto-reconnect) | `true` | `false` | `false` |
| `error` with `readyState === CLOSED` (terminal) | `false` | `false` | `true` |

`$sse` is scoped to the element's context. Nested SSE elements maintain independent `$sse` state. Non-SSE elements do not have `$sse` in their context.

```html
<div sse="/api/stream" as="data">
  <span show="$sse.connecting" class="badge yellow">Connecting...</span>
  <span show="$sse.open" class="badge green">Live</span>
  <span show="$sse.error" class="badge red">Disconnected</span>

  <div show="$sse.open">
    <p bind="data"></p>
  </div>
</div>
```

---

## Data Parsing

Each incoming SSE message's `data` field is parsed as follows:

1. Attempt `JSON.parse(event.data)`.
2. On parse failure, use the raw string value as-is.

The parsed value is then assigned to the context variable named by `as`, following the insert mode rules.

```html
<!-- JSON payloads: automatically parsed to objects -->
<!-- Server: data: {"price": 42.5, "symbol": "AAPL"}\n\n -->
<div sse="/api/ticker" as="ticker">
  <span bind="ticker.symbol"></span>: <span bind="ticker.price"></span>
</div>

<!-- Plain text payloads: used as raw strings -->
<!-- Server: data: Server started on port 3000\n\n -->
<div sse="/api/log" as="line">
  <p bind="line"></p>
</div>
```

---

## Reactive URL

URLs containing `{variable}` interpolation expressions are reactive. When a referenced variable changes, the directive:

1. Closes the existing EventSource connection.
2. Resets accumulated data (in append/prepend mode, the array resets to `[]`).
3. Opens a new EventSource with the resolved URL.

If the resolved URL is identical to the current one, no reconnection occurs.

The directive watches all ancestor contexts in the parent chain, plus global reactive sources (`$store`, `$route`, `$i18n`) if referenced in the URL. This uses the same ancestor-walk watcher pattern as the HTTP directives.

```html
<div state="{ channel: 'general' }">
  <select model="channel">
    <option value="general">General</option>
    <option value="alerts">Alerts</option>
  </select>

  <!-- Connection closes and reopens when channel changes -->
  <div sse="/api/stream/{channel}" as="messages" sse-insert="append" sse-limit="100">
    <p each="msg in messages" bind="msg.text"></p>
  </div>
</div>
```

---

## Authentication

**Browser limitation:** The native `EventSource` API does NOT support custom request headers. You cannot send `Authorization: Bearer <token>` or any custom header with an EventSource connection. This is a browser API constraint, not a NoJS limitation.

**NoJS interceptors do not apply.** `NoJS.config({ interceptors })` hooks into `fetch()` requests only. EventSource connections bypass the fetch pipeline entirely.

### Workarounds

| Method | How | Example |
|--------|-----|---------|
| **Query-string token** | Pass the token in the URL. Simple but less secure (token visible in logs/history). | `sse="/api/stream?token={$store.auth.token}"` |
| **Cookies** | Authenticate via a cookie-setting endpoint first, then use `sse-credentials` for cross-origin. | `sse="/api/stream" sse-credentials` |
| **Cookie-setting auth endpoint** | POST credentials to an auth endpoint that sets an HttpOnly cookie, then open the SSE connection. | See example below |

```html
<!-- Pattern: cookie-based auth then SSE -->
<div state="{ authenticated: false }">
  <form post="/auth/login" body="{ email, password }"
        then="authenticated = true" show="!authenticated">
    <input model="email"><input model="password" type="password">
    <button>Login</button>
  </form>

  <div if="authenticated" sse="/api/stream" sse-credentials as="data">
    <p bind="data.message"></p>
  </div>
</div>
```

---

## Connection Limits

Browsers limit HTTP/1.1 to **6 concurrent connections per origin**. Each `sse` element holds one persistent connection for as long as it is in the DOM.

The directive tracks active connections per origin. When 6 or more connections exist to the same origin, a warning is issued via `_warn()`:

> SSE: 6 connections to https://example.com. Browsers limit HTTP/1.1 to 6 concurrent connections per origin. Consider HTTP/2 or reducing open streams.

**Mitigations:**

- **HTTP/2:** multiplexes all connections over a single TCP connection, effectively removing the limit.
- **Combine streams:** multiplex multiple event types on a single SSE endpoint and use `sse-event` to filter on the client.
- **Conditional connections:** use `if` to gate SSE elements so connections only open when needed.

```html
<!-- Only connect when the tab is active -->
<div if="tabActive" sse="/api/stream" as="data">
  <p bind="data"></p>
</div>
```

---

## Disposal and Cleanup

The directive follows all NoJS safety rules for resource cleanup:

- **Safety Rule 1 (Disposal before clearing DOM):** When the error template is rendered, all children are disposed via `_disposeChildren(el)` before `el.innerHTML = ""`.
- **Safety Rule 2 (Event listener cleanup):** `eventSource.close()` is registered via `_onDispose()` immediately after EventSource creation.
- **Disconnected element guard:** Every message handler checks `el.isConnected` before processing. If the element has been removed, the EventSource is closed and the message is ignored.
- **Watcher cleanup:** All `$watch()` subscriptions for reactive URLs are unsubscribed via `_onDispose()`.
- **Connection tracking cleanup:** The origin connection set is cleaned up on close/dispose.
- **Gated directive:** Registered with `gated: true`, so the connection does not open for elements behind a falsy `if` gate. Gate deactivation triggers disposal and closes the connection.
