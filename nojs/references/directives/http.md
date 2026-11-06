# HTTP Directives

Declarative HTTP requests via HTML attributes. Priority 1.

## Contents

- [Data Fetching](#data-fetching) -- base, get, post, put, patch, delete, query and all companion attributes
  - [base](#base) -- set API base URL for descendant HTTP directives
  - [get](#get) -- fetch data via HTTP GET
  - [post](#post) -- submit data via HTTP POST
  - [put](#put) -- update data via HTTP PUT (full replacement)
  - [patch](#patch) -- partial update via HTTP PATCH
  - [delete](#delete) -- delete data via HTTP DELETE
  - [query](#query) -- safe/idempotent read via HTTP QUERY (carries a request body)
  - [Mutation Attributes](#mutation-attributes-postputpatchdelete) -- body, success, error, loading, confirm, redirect, then, into, cached, retry, retry-delay
  - [as](#as) -- name for fetched data in local context
  - [body](#body) -- request body for POST/PUT/PATCH
  - [headers](#headers) -- custom request headers
  - [params](#params) -- query parameters appended to URL
  - [cached](#cached) -- cache HTTP responses
  - [into](#into) -- write response to global store
  - [debounce](#debounce) -- debounce reactive URL refetches
  - [refresh](#refresh) -- auto-refresh interval for polling
  - [retry](#retry) -- retry count on failure
  - [retry-delay](#retry-delay) -- delay between retries
  - [Programmatic Refresh](#programmatic-refresh) -- re-trigger fetch via el.refresh()
  - [Template var Priority](#template-var-priority) -- success/error template variable naming
  - [Trigger Behavior](#trigger-behavior) -- how each directive triggers its request
  - [Pagination & Fetch Triggers](#pagination--fetch-triggers) -- get-trigger, get-insert, get-page, get-cursor, get-threshold
  - [SwitchMap / Abort Behavior](#switchmap--abort-behavior) -- rapid calls abort in-flight requests
- [Error Boundary](#error-boundary) -- catch errors in a subtree
  - [Global Error Handler](#global-error-handler) -- framework-wide error events

---

## Syntax Reference

| Directive | Syntax | Description |
|-----------|--------|-------------|
| `base` | `base="https://api.example.com"` | Set API base URL for descendant HTTP directives |
| `get` | `get="/endpoint"` | Fetch data via HTTP GET (fires on mount) |
| `post` | `post="/endpoint"` | Submit data via HTTP POST (fires on submit/click) |
| `put` | `put="/endpoint"` | Update data via HTTP PUT (fires on submit/click) |
| `patch` | `patch="/endpoint"` | Partial update via HTTP PATCH (fires on submit/click) |
| `delete` | `delete="/endpoint"` | Delete data via HTTP DELETE (fires on submit/click) |
| `query` | `query="/endpoint"` | Safe/idempotent read via HTTP QUERY that carries a request body (fires on mount/submit, cacheable) |
| `error-boundary` | `error-boundary="#fallbackId"` | Catch errors in a subtree and render fallback template |

---

## Data Fetching

Declarative HTTP requests via HTML attributes. Set a base URL on any ancestor and all descendant fetch directives resolve relative URLs against it.

### `base`

Set API base URL for all descendant HTTP directives.

**Syntax:** `<element base="https://api.example.com">`

All descendant `get`, `post`, `put`, `patch`, `delete`, `query` resolve relative URLs against this base. Absolute URLs skip base resolution. Can be overridden on nested elements.

```html
<body base="https://api.myapp.com/v1">
  <div get="/users">...</div>        <!-- https://api.myapp.com/v1/users -->
  <div get="/posts">...</div>        <!-- https://api.myapp.com/v1/posts -->

  <!-- Override for a section -->
  <div base="https://cms.myapp.com/api">
    <div get="/articles">...</div>   <!-- https://cms.myapp.com/api/articles -->
  </div>
</body>
```

### `get`

Fetch data via HTTP GET request.

**Syntax:** `<element get="/endpoint" as="dataVar">`

**Attributes:**

| Attribute | Type | Description |
|-----------|------|-------------|
| `get` | string | URL to fetch (GET request) |
| `as` | string | Name for response data in context. Default: `"data"` |
| `loading` | string | Template ID shown while loading (e.g. `"#skeleton"`) |
| `error` | string | Template ID shown on fetch error |
| `empty` | string | Template ID shown when response is empty array/null |
| `refresh` | number | Auto-refresh interval in ms (polling) |
| `cached` | boolean or string | Cache responses. `cached` = memory, `cached="local"` = localStorage, `cached="session"` = sessionStorage |
| `into` | string | Write response to a named global store, under the `as` key: `$store.<into>.<as>` |
| `debounce` | number | Debounce reactive URL refetches in ms |
| `headers` | string | JSON string of additional headers |
| `params` | string | Expression that resolves to query params object |
| `skeleton` | string | ID (without `#`) of an existing DOM element to hide while loading and show again on response. Use for CLS prevention — element starts visible in HTML and No.JS hides it during the request. |
| `retry` | number | Number of retry attempts on failure. Default: value from `NoJS.config({ retries })` |
| `retry-delay` | number | Delay in ms between retries. Default: `1000` |
| `var` | string | Variable name for response data in success/error templates. Default fallback described in [Template var Priority](#template-var-priority) |

> **Programmatic refresh:** Every HTTP element exposes a `.refresh()` method. Use `$refs.myEl.refresh()` to re-trigger the fetch programmatically. See [Programmatic Refresh](#programmatic-refresh).

```html
<div get="/users"
     as="users"
     loading="#usersSkeleton"
     error="#usersError"
     empty="#noUsers"
     refresh="30000"
     cached>
  <div each="user in users">
    <h2 bind="user.name"></h2>
  </div>
</div>
```

**Reactive URLs** -- URLs referencing state variables re-fetch automatically when values change. If the resolved URL is identical to the previous one, the re-fetch is skipped.

```html
<div state="{ page: 1, search: '' }">
  <input model="search" />
  <div get="/users?page={page}&q={search}" as="results" debounce="300">
    ...
  </div>
</div>
```

**URL placeholders** -- each `{expression}` value is encoded with `encodeURIComponent`, so `/` becomes `%2F`. URL attributes are never evaluated as expressions, so build multi-segment paths with one placeholder per segment: `get="/files/{dir}/{name}"`. In the path part of the URL, a value that is exactly `.` or `..` is escaped as `%252E` / `%252E%252E` (with a console warning) so URL parsers cannot collapse it as a dot-segment and send the request elsewhere: `get="/users/{id}/avatar"` with `id = '..'` requests `/users/%252E%252E/avatar` (the server decodes the segment to the text `%2E%2E`). The warning is logged once per request. This is on by default with no opt-out, and applies to every HTTP verb, `call` and `sse`. Query-string and fragment values, and request bodies, are not affected.

### `post`

Submit data via HTTP POST request.

**Syntax:** `<form post="/endpoint">` (named fields) or `<element post="/endpoint" body='{"key": "{expression}"}'>`

**Trigger:** On a `<form>`, intercepts the `submit` event. On any other element, attaches a `click` listener. When the host element is a `<form>`, fields are auto-serialized via `FormData` (overrides `body` if both are present).

```html
<!-- Form: every field with a name is sent as a JSON object -->
<form post="/login" as="result"
      success="#loginSuccess" error="#loginError" loading="#loginLoading">
  <input name="email" model="email">
  <input name="password" model="password" type="password">
  <button>Login</button>
</form>

<!-- Non-form: triggers on click; send a JSON body -->
<button post="/api/action" body='{"id": {item.id}, "note": "{note}"}'>Do it</button>

<!-- Same request as an object literal -->
<button post="/api/action" body="{ id: item.id, note: note }">Do it</button>

<!-- URL-encoded body -->
<button post="/api/action"
        headers='{"Content-Type": "application/x-www-form-urlencoded"}'
        body="id={item.id}">Do it</button>
```

On a `<form>`, `body` is ignored: the named fields are sent. See [`body`](#body) for the rules.

### `put`

Update data via HTTP PUT request (full replacement).

**Syntax:** `<form put="/endpoint">` (named fields) or `<element put="/endpoint" body='{"key": "{expression}"}'>`

**Trigger:** On a `<form>`, intercepts the `submit` event and auto-serializes fields via `FormData` (same as `post`). On any other element, attaches a `click` listener.

```html
<form put="/users/{user.id}">
  <input name="name" model="user.name">
  <select name="role" model="selectedRole">...</select>
  <button>Save</button>
</form>

<!-- Non-form: triggers on click -->
<button put="/users/{user.id}"
        headers='{"Content-Type": "application/x-www-form-urlencoded"}'
        body="role=admin">Promote</button>
```

### `patch`

Partial update via HTTP PATCH request.

**Syntax:** `<form patch="/endpoint">` (named fields) or `<element patch="/endpoint" body="key={expression}">`

**Trigger:** On a `<form>`, intercepts the `submit` event and auto-serializes fields via `FormData` (same as `post`). On any other element, attaches a `click` listener.

### `delete`

Delete data via HTTP DELETE request.

**Syntax:** `<element delete="/endpoint">`

**Trigger:** On a `<form>`, intercepts the `submit` event. On any other element (typical), attaches a `click` listener.

```html
<button delete="/users/{user.id}"
        confirm="Are you sure?"
        success="#deleteSuccess">
  Delete User
</button>
```

### `query`

Read data via HTTP `QUERY` request ([RFC 10008](https://www.rfc-editor.org/rfc/rfc10008.html)).

**Syntax:** `<form query="/endpoint" as="dataVar">` (named fields) or `<element query="/endpoint" body="key={expression}" as="dataVar">`

`QUERY` is a **safe, idempotent, cacheable** method that — unlike `get` — **carries a request body**. Use it for complex read operations whose criteria don't fit cleanly in a URL query string: rich search, faceted filtering, or long structured filter payloads. Semantically it is a **read**, not a mutation: it never changes server state, so it is safe to retry, cache, and re-fire reactively.

**Trigger:**

- On a `<form>`, intercepts the `submit` event and serializes fields via `FormData` (same as `post`).
- On any other element, **auto-fires on mount** and **re-fires reactively** when a placeholder in its URL changes (same as `get`). A change to state used only in `body` does not re-fire; call `el.refresh()` (for example `$refs.x.refresh()` from a later event) or put the value in the URL.

**Trigger modes (non-form elements):** control *when* the request fires with `query-trigger` — the QUERY-side counterparts of `get-trigger`:

| Attribute | Description |
|-----------|-------------|
| `query-trigger` | When the request fires: `visible` (on IntersectionObserver entry), `hover` (first `mouseenter`), or `none` (suppress auto-fire; use `.refresh()`). Absent = fires on mount. `scroll` and `button` need `get-insert`, which is GET-only, so on `query` they warn and fall back (`scroll` to `visible`, `button` to firing on mount); `query-trigger-label` has no effect |
| `query-threshold` | IntersectionObserver `rootMargin` for the `visible` trigger (e.g. `"200px"`) |

**Body-aware caching:** when `cached` is set, the cache key incorporates the serialized request body (not just the URL), so two QUERY requests to the same endpoint with different filter bodies cache independently.

**CSRF-exempt:** because `QUERY` is a safe method, No.JS does **not** attach a CSRF token to these requests (same treatment as `get`).

> **Pagination is GET-only:** the `get-cursor` / `get-page` (and related `get-insert`) pagination companions are **not** available on `query` in this version. For paginated reads, use `get`. All other method-agnostic companions — `as`, `loading`, `error`, `empty`, `then`, `into`, `headers`, `params`, `retry`, `retry-delay`, `debounce`, `refresh` — work with `query`.

```html
<!-- Complex search/filter as a safe, body-carrying read -->
<form query="/orders" as="result">
  <select name="status">
    <option value="open">Open</option>
    <option value="closed">Closed</option>
  </select>
  <input name="minTotal" type="number">
  <select name="sort">
    <option value="date">Newest</option>
    <option value="total">Total</option>
  </select>
  <button>Search</button>

  <div each="order in result">
    <span bind="order.id"></span>
  </div>
</form>

<!-- Non-form: fires when visible; re-fires when region (a URL placeholder) changes.
     tag is body-only: changing it alone does not re-fire (use $refs.x.refresh()). -->
<div state="{ region: 'us', tag: 'new' }">
  <div query="/products/search?region={region}"
       headers='{"Content-Type": "application/x-www-form-urlencoded"}'
       body="tag={tag}"
       query-trigger="visible"
       query-threshold="200px"
       as="products"
       cached>
    <div each="p in products">
      <h3 bind="p.name"></h3>
    </div>
  </div>
</div>
```

### Mutation Attributes (post/put/patch/delete)

| Attribute | Description |
|-----------|-------------|
| `body` | Request body. A JSON template (`'{"name": "{name}"}'`) or object literal (`{ id: item.id }`) is sent as JSON; in other text each `{expression}` is replaced with its `encodeURIComponent`-ed value (see [`body`](#body)). For `<form>` elements on **any** method (POST, PUT, PATCH, DELETE), fields are auto-serialized via `FormData` and `body` is ignored |
| `success` | Template ID to render on success. Variable name resolved via [Template var Priority](#template-var-priority) |
| `error` | Template ID to render on error. Variable name resolved via [Template var Priority](#template-var-priority) |
| `loading` | Template ID to show during request |
| `confirm` | Show browser `confirm()` dialog before sending |
| `redirect` | URL to navigate to on success (SPA route) |
| `then` | Expression to execute on success (e.g. `"users.push(result)"`) |
| `into` | Write response to a named global store, under the `as` key: `$store.<into>.<as>` |
| `cached` | Cache responses (memory/local/session) |
| `retry` | Number of retry attempts on failure. Default: value from `NoJS.config({ retries })` |
| `retry-delay` | Delay in ms between retries. Default: `1000` |
| `var` | Variable name for response data in success/error templates. See [Template var Priority](#template-var-priority) |

**Request lifecycle:** `[idle] -> [loading] -> [success | error]`

> **`body`/`headers` and `query`:** the `body` and `headers` attributes are shared with the [`query`](#query) directive. `query` sends a `body` too (that is its whole purpose — a body-carrying read), but it is a **safe read method, not a mutation**: state-changing companions like `confirm` and `redirect` are meant for the mutation verbs above, whereas `query` behaves like `get` (auto-fires on mount, reactive, cacheable, CSRF-exempt).

### `as`

Name for fetched data in the local context.

**Syntax:** `<element get="/data" as="varName">`

Default value is `"data"`. The response data becomes available in the context under this name for all child elements.

```html
<div get="/users/1" as="user">
  <h1 bind="user.name"></h1>
</div>
```

### `body`

Request body for POST/PUT/PATCH/DELETE requests, and for the safe `query` read.

**Syntax:** `<element post="/api" body='{"key": "{value}"}'>`, `body="{ key: value }"` or `body="key={value}"`

How the body is built:

| Form | Example | Sent |
|------|---------|------|
| JSON template | `body='{"name": "{user.name}", "qty": {qty}, "items": {$store.cart.items}}'` | JSON (`Content-Type: application/json`). A placeholder inside a JSON string is inserted escaped (`""` for `null`/`undefined`); a placeholder outside a string is serialized as a JSON value (`null` for `undefined`) |
| Object literal | `body="{ id: item.id, name: name }"`, `body="{ email, password }"` | The object as JSON |
| Single placeholder holding an object | `body="{payload}"` | The object as JSON |
| Any other text | `body="email={email}&role={role}"` | Each `{expression}` is replaced with its value encoded by `encodeURIComponent`. If the result parses as JSON it is sent as JSON; otherwise it is sent as is, so set the content type with `headers` |

A single-key shorthand `body="{ email }"` cannot be told apart from the placeholder `{email}`: it sends the URL-encoded value as text. Write `{ email: email }` or `'{"email": "{email}"}'`.

Inputs need a `name` attribute to be serialized; `model` alone is not enough. For `<form>` elements on any method, fields are always auto-serialized via `FormData` and `body` is ignored. The fields are sent as a JSON object, so `<input type="file">` values are not uploaded (a file is sent as `{}`); see [File Upload Form](../patterns/forms.md#file-upload-form). The fields are read before the `loading` template replaces the form's content, so a form with `loading` still sends its values. `query` is the one **read** method that carries a `body` — see [`query`](#query).

### `headers`

Custom request headers.

**Syntax:** `<element get="/api" headers='{"Authorization": "Bearer token"}'>`

Provided as a JSON string. Merged with global headers from `NoJS.config()`.

> **Note:** Global `NoJS.config({ headers })` are sent with every request, including requests to other origins (v1.21.1 behavior). Set `scopeHeaders: true` to send them only to trusted origins: the page, the `baseApiUrl` origin and the origin of the nearest `base` attribute. Per-request `headers` attributes still apply to any origin.

> **Note:** Inline sensitive headers (`Authorization`, `Cookie`, `X-CSRF-Token`, `X-API-Key`) trigger an unconditional console warning. Prefer `NoJS.config({ headers })` or interceptors for sensitive headers.

### `params`

Query parameters appended to the URL.

**Syntax:** `<element get="/search" params="{ q: query, page: 1 }">`

Expression that resolves to an object. Keys become query string parameters.

### `cached`

Cache HTTP responses.

**Syntax:** `<element get="/data" cached>` or `<element get="/data" cached="local">`

| Value | Storage |
|-------|---------|
| `cached` (no value) | In-memory cache |
| `cached="memory"` | In-memory cache |
| `cached="local"` | localStorage |
| `cached="session"` | sessionStorage |

### `into`

Write response to a named global store.

**Syntax:** `<element get="/user" into="currentUser">`

The store does not need to be pre-defined -- `into` creates it automatically if it doesn't exist. The response is stored under the `as` key (`data` when `as` is omitted), so it is accessible via `$store.<into>.<as>` from anywhere. The response fields are not merged into the store itself.

```html
<div get="/me" as="user" into="currentUser">
  <p bind="user.name"></p>
</div>
<!-- Accessible from anywhere: $store.<into>.<as> -->
<span bind="$store.currentUser.user.name"></span>

<!-- Without `as`, the key is `data` -->
<div get="/settings" into="prefs"></div>
<span bind="$store.prefs.data.theme"></span>
```

- `into` takes a plain store name. `into="user.profile"` creates a store literally named `user.profile`; it does not write to `$store.user.profile`.
- `call` and `sse` follow the same rule.

### `debounce`

Debounce reactive URL refetches (milliseconds).

**Syntax:** `<element get="/search?q={query}" debounce="300">`

Useful when a `get` URL contains reactive variables that change frequently (e.g. search input).

### `refresh`

Auto-refresh interval for polling (milliseconds).

**Syntax:** `<element get="/status" refresh="5000">`

The element re-fetches its URL at the specified interval. Polling stops automatically when the element disconnects from the DOM.

```html
<div get="/api/status" refresh="5000" as="status">
  <span bind="status.healthy ? 'Online' : 'Degraded'"></span>
</div>
```

### `retry`

Number of retry attempts on failure.

**Syntax:** `<element get="/data" retry="3">`

Default: value from `NoJS.config({ retries })`. Set `retry="0"` to disable retries for a specific request.

### `retry-delay`

Delay in milliseconds between retry attempts.

**Syntax:** `<element get="/data" retry="3" retry-delay="1000">`

Default: `1000` ms (or value from `NoJS.config({ retryDelay })`).

```html
<div get="/api/unreliable" retry="3" retry-delay="1000" as="data">
  <span bind="data.value"></span>
</div>
```

### Programmatic Refresh

Every HTTP element exposes a `.refresh()` method on the DOM element. Use it to re-trigger the fetch programmatically via `$refs`:

```html
<div get="/notifications" as="notes" ref="notifPanel">
  <span bind="notes.length"></span>
</div>
<button on:click="$refs.notifPanel.refresh()">Reload</button>
```

The method is available on all directives (`get`, `post`, `put`, `patch`, `delete`, `query`). It is cleaned up automatically when the element is disposed.

### Template var Priority

The variable name exposed inside `success` and `error` templates follows a priority chain:

**Success template:**

1. The `<template>` element's own `var` attribute (highest priority)
2. The directive element's `var` attribute
3. Falls back to `"result"`

**Error template:**

1. The `<template>` element's own `var` attribute (highest priority)
2. Falls back to `"err"`

```html
<!-- Template's own var wins: data is exposed as "user" -->
<template id="ok" var="user">
  <p bind="user.name"></p>
</template>

<form post="/login" success="#ok"><input name="email"><button>Go</button></form>
```

### Trigger Behavior

| Directive | `<form>` element | Any other element |
|-----------|-----------------|-------------------|
| `get` | Fetches on mount | Fetches on mount |
| `post` | Intercepts `submit` | Attaches `click` listener |
| `put` | Intercepts `submit` | Attaches `click` listener |
| `patch` | Intercepts `submit` | Attaches `click` listener |
| `delete` | Intercepts `submit` | Attaches `click` listener |
| `query` | Intercepts `submit` | Fetches on mount (reactive re-fetch); `query-trigger` overrides |

For `<form>` elements, the `submit` event is prevented (`e.preventDefault()`) and the request fires instead.

### Pagination & Fetch Triggers

Extend the `get` directive with declarative pagination and fetch trigger control. These attributes compose together — `get-trigger` controls WHEN to fetch, `get-insert` controls WHERE to place content.

#### `get-trigger`

Controls when the GET request fires.

**Syntax:** `<element get="/url" get-trigger="scroll|button|visible|hover|none">`

| Value | Behavior |
|-------|----------|
| (absent) | Fetches immediately on mount (default `get` behavior) |
| `visible` | Fetches when element becomes visible in its scroll container via IntersectionObserver |
| `hover` | Fetches on first `mouseenter` event |
| `none` | Suppresses auto-fetch; use `.refresh()` to trigger manually |
| `scroll` | Infinite scroll — fetches next page when sentinel becomes visible in the scroll container. Requires `get-insert` |
| `button` | Renders a "Load More" button. Requires `get-insert` |

```html
<!-- Lazy load on scroll into view -->
<div get="/api/stats" get-trigger="visible" as="stats">
  <p bind="stats.total"></p>
</div>

<!-- Prefetch on hover -->
<div get="/api/preview/{id}" get-trigger="hover" as="preview">
  <p bind="preview.summary"></p>
</div>

<!-- Manual trigger only -->
<div get="/api/data" get-trigger="none" as="data" ref="dataEl">
  <p bind="data.value"></p>
</div>
<button on:click="$refs.dataEl.refresh()">Load Data</button>
```

#### `get-trigger-label`

Custom label for the auto-generated "Load More" button when `get-trigger="button"`.

**Syntax:** `<element get="/url" get-trigger="button" get-trigger-label="Show More">`

Default: `"Load More"`.

#### `get-insert`

Controls how fetched content is inserted into the container.

**Syntax:** `<element get="/url" get-insert="append|prepend">`

| Value | Behavior |
|-------|----------|
| (absent) | Replaces all content (default `get` behavior) |
| `append` | Inserts new content after existing content |
| `prepend` | Inserts new content before existing content (preserves scroll position) |

When `get-insert` is set, fetched data accumulates in the context as an array. Each response's items are concatenated onto the existing array.

#### `get-page`

Offset-based pagination. Sets the initial page number and auto-increments on each fetch.

**Syntax:** `<element get="/url?page={page}" get-page="1">`

The `{page}` token in the URL resolves to the current page value. The page number is exposed as `page` in the element's context for use in expressions.

```html
<!-- Infinite scroll with page-based pagination -->
<div get="/api/items?page={page}"
     get-trigger="scroll"
     get-insert="append"
     get-page="1"
     as="items">
  <div each="item in items">
    <h3 bind="item.title"></h3>
  </div>
</div>
```

**End-of-data:** When the server returns an empty response body or an empty array, pagination stops automatically.

#### `get-cursor`

Cursor-based pagination. Mutually exclusive with `get-page`.

**Syntax:** `<element get="/url?cursor={cursor}" get-cursor>`

The cursor value is extracted from each response and used in the next request. The `{cursor}` token in the URL resolves to the current cursor. Initially empty string (first request has no cursor).

**Cursor extraction order:**

1. Custom field via `get-cursor-field` (supports dot notation)
2. Response header `X-Cursor`
3. Auto-detect from common JSON field names: `nextCursor`, `next_cursor`, `cursor`, `nextPageToken`, `next_page_token`, `pageToken`, `after`, `endCursor`, `end_cursor`

**End-of-data:** When no cursor is found in the response, pagination stops.

#### `get-cursor-field`

Dot-notation path to the cursor value in the JSON response.

**Syntax:** `<element get="/url" get-cursor get-cursor-field="meta.pagination.next">`

Used when the cursor is in a nested field. Supports standard dot notation (e.g., `meta.nextCursor`, `pagination.cursor`).

```html
<!-- Cursor pagination with custom field -->
<div get="/api/feed?after={cursor}"
     get-trigger="scroll"
     get-insert="append"
     get-cursor
     get-cursor-field="paging.cursors.after"
     as="posts">
  <div each="post in posts">
    <p bind="post.content"></p>
  </div>
</div>
```

#### `get-threshold`

IntersectionObserver `rootMargin` for `scroll` and `visible` triggers.

**Syntax:** `<element get="/url" get-trigger="visible" get-threshold="200px">`

Controls how early the trigger fires. Default: `200px` for `scroll`, `0px` for `visible`.

**Observer root:** The IntersectionObservers used by `get-trigger="scroll"` (sentinel observer) and `get-trigger="visible"` -- as well as the fallback observer used when `get-trigger="scroll"` is set without an insert mode -- all resolve the nearest ancestor element with computed `overflow-y: auto` or `overflow-y: scroll` as the observer root. If no scrollable ancestor is found, the document (viewport) is used. Because the root is the scroll container, `get-threshold` is relative to that container's bounds, not the browser viewport.

**Fill-until-overflow:** When `get-trigger="scroll"` targets a container that has not yet overflowed (content is shorter than the container), the sentinel is immediately visible within the scroll container. This causes successive loads until content grows enough to push the sentinel out of view -- correct infinite-scroll semantics. Once the container overflows, loads pause and only resume when actual scrolling brings the sentinel back into view.

```html
<!-- Start loading 500px before element scrolls into view -->
<div get="/api/heavy-data"
     get-trigger="visible"
     get-threshold="500px"
     as="data">
  ...
</div>
```

#### Composition Rules

- `get-trigger="scroll"` and `get-trigger="button"` **require** `get-insert` (append or prepend). Without it, a warning is issued and they fall back to simpler behavior.
- `get-cursor` and `get-page` are **mutually exclusive**. If both are present, cursor wins with a warning.
- `scroll`/`button` triggers are **mutually exclusive with `refresh`**. If `refresh` is also set, it's ignored with a warning.
- `get-trigger="none"` suppresses the initial auto-fetch. Use `.refresh()` via `$refs` to trigger manually.

### SwitchMap / Abort Behavior

When a new request is triggered while a previous one is still in flight, the in-flight request is aborted (switchMap pattern). This prevents race conditions from rapid interactions -- only the latest request's response is rendered.

Aborted requests fail silently (the `AbortError` is caught and ignored, no error template is shown).

---

## Error Boundary

Catch errors in a subtree with the `error-boundary` directive. Priority 1 (same as HTTP directives).

**Syntax:** `<element error-boundary="#fallbackTemplateId">`

The boundary intercepts two kinds of errors:

1. **Expression evaluation errors** -- dispatched as `nojs:error` CustomEvents that bubble up from handler expressions (e.g. a `bind` or `on:click` expression throws).
2. **Window-level errors** -- uncaught JS errors and resource load failures (e.g. an `<img>` 404) that originate from elements inside the boundary.

> **Note:** `error-boundary` does **not** catch failed HTTP requests made by `get`/`post`/`put`/`patch`/`delete`/`query` directives. Use the `error` attribute on the fetch element for per-request error handling, or `NoJS.on('fetch:error', ...)` for global HTTP error handling.

```html
<div error-boundary="#errorFallback">
  <div get="/api/fragile-endpoint" as="data">
    <span bind="data.deep.nested.value"></span>
  </div>
</div>

<template id="errorFallback" var="err">
  <div class="error-boundary">
    <h3>Something went wrong</h3>
    <pre bind="err.message"></pre>
  </div>
</template>
```

When an error is caught, the boundary replaces its children with the fallback template. The `nojs:error` CustomEvent carries the error details in `event.detail`.

### Global Error Handler

Use `NoJS.on()` to listen for errors globally -- useful for logging, analytics, or session management. The `url` in `fetch:success`, `fetch:error` and `error` payloads, and in the `GET <url> failed:` console warning, is the raw request URL by default (query and fragment included). With `NoJS.config({ strictRedaction: true })` it is redacted: the `#fragment` is dropped and the values of sensitive query parameters (`token`, `api_key`, `password`, ...) become `[REDACTED]`.

```html
<script>
  // Catch all framework errors
  NoJS.on('error', ({ url, error }) => {
    console.error('[No.JS Error]', error);
  });

  // Catch HTTP-specific errors
  NoJS.on('fetch:error', ({ url, error }) => {
    if (error.status === 401) {
      NoJS.store.auth.user = null;
      NoJS.notify();
      NoJS.router.push('/login');
    }
  });
</script>
```
