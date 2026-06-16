# HTTP Directives

Declarative HTTP requests via HTML attributes. Priority 1.

## Contents

- [Data Fetching](#data-fetching) -- base, get, post, put, patch, delete and all companion attributes
  - [base](#base) -- set API base URL for descendant HTTP directives
  - [get](#get) -- fetch data via HTTP GET
  - [post](#post) -- submit data via HTTP POST
  - [put](#put) -- update data via HTTP PUT (full replacement)
  - [patch](#patch) -- partial update via HTTP PATCH
  - [delete](#delete) -- delete data via HTTP DELETE
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
| `error-boundary` | `error-boundary="#fallbackId"` | Catch errors in a subtree and render fallback template |

---

## Data Fetching

Declarative HTTP requests via HTML attributes. Set a base URL on any ancestor and all descendant fetch directives resolve relative URLs against it.

### `base`

Set API base URL for all descendant HTTP directives.

**Syntax:** `<element base="https://api.example.com">`

All descendant `get`, `post`, `put`, `patch`, `delete` resolve relative URLs against this base. Absolute URLs skip base resolution. Can be overridden on nested elements.

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
| `into` | string | Write response to a named global store |
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

### `post`

Submit data via HTTP POST request.

**Syntax:** `<element post="/endpoint" body="{expression}">`

**Trigger:** On a `<form>`, intercepts the `submit` event. On any other element, attaches a `click` listener. When the host element is a `<form>`, fields are auto-serialized via `FormData` (overrides `body` if both are present).

```html
<form post="/login" body="{ email, password }" as="result"
      success="#loginSuccess" error="#loginError" loading="#loginLoading">
  <input model="email">
  <input model="password" type="password">
  <button>Login</button>
</form>

<!-- Non-form: triggers on click -->
<button post="/api/action" body="{ id: item.id }">Do it</button>
```

### `put`

Update data via HTTP PUT request (full replacement).

**Syntax:** `<element put="/endpoint" body="{expression}">`

**Trigger:** On a `<form>`, intercepts the `submit` event and auto-serializes fields via `FormData` (same as `post`). On any other element, attaches a `click` listener.

```html
<form put="/users/{user.id}" body='{"name": "{user.name}", "role": "{selectedRole}"}'>
  ...
</form>

<!-- Non-form: triggers on click -->
<button put="/users/{user.id}" body="{ role: 'admin' }">Promote</button>
```

### `patch`

Partial update via HTTP PATCH request.

**Syntax:** `<element patch="/endpoint" body="{expression}">`

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

### Mutation Attributes (post/put/patch/delete)

| Attribute | Description |
|-----------|-------------|
| `body` | Request body (JSON string with `{variable}` interpolation). For `<form>` elements on **any** method (POST, PUT, PATCH, DELETE), fields are auto-serialized via `FormData` and override `body` |
| `success` | Template ID to render on success. Variable name resolved via [Template var Priority](#template-var-priority) |
| `error` | Template ID to render on error. Variable name resolved via [Template var Priority](#template-var-priority) |
| `loading` | Template ID to show during request |
| `confirm` | Show browser `confirm()` dialog before sending |
| `redirect` | URL to navigate to on success (SPA route) |
| `then` | Expression to execute on success (e.g. `"users.push(result)"`) |
| `into` | Write response to a named global store |
| `cached` | Cache responses (memory/local/session) |
| `retry` | Number of retry attempts on failure. Default: value from `NoJS.config({ retries })` |
| `retry-delay` | Delay in ms between retries. Default: `1000` |
| `var` | Variable name for response data in success/error templates. See [Template var Priority](#template-var-priority) |

**Request lifecycle:** `[idle] -> [loading] -> [success | error]`

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

Request body for POST/PUT/PATCH/DELETE requests.

**Syntax:** `<element post="/api" body="{ key: value }">`

Accepts a JSON string with `{variable}` interpolation. For `<form>` elements on any method, fields are always auto-serialized via `FormData` (overrides `body`).

### `headers`

Custom request headers.

**Syntax:** `<element get="/api" headers='{"Authorization": "Bearer token"}'>`

Provided as a JSON string. Merged with global headers from `NoJS.config()`.

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

The store does not need to be pre-defined -- `into` creates it automatically if it doesn't exist. The data is accessible via `$store.storeName` from anywhere.

```html
<div get="/me" as="user" into="currentUser">
  <p bind="user.name"></p>
</div>
<!-- Accessible from anywhere -->
<span bind="$store.currentUser.name"></span>
```

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

**Syntax:** `<element get="/data" retry="3" retry-delay="2000">`

Default: `1000` ms (or value from `NoJS.config({ retryDelay })`).

```html
<div get="/api/unreliable" retry="3" retry-delay="2000" as="data">
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

The method is available on all directives (`get`, `post`, `put`, `patch`, `delete`). It is cleaned up automatically when the element is disposed.

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

<div post="/login" body="{ email }" success="#ok">...</div>
```

### Trigger Behavior

| Directive | `<form>` element | Any other element |
|-----------|-----------------|-------------------|
| `get` | Fetches on mount | Fetches on mount |
| `post` | Intercepts `submit` | Attaches `click` listener |
| `put` | Intercepts `submit` | Attaches `click` listener |
| `patch` | Intercepts `submit` | Attaches `click` listener |
| `delete` | Intercepts `submit` | Attaches `click` listener |

For `<form>` elements, the `submit` event is prevented (`e.preventDefault()`) and the request fires instead.

### Pagination & Fetch Triggers

Extend the `get` directive with declarative pagination and fetch trigger control. These attributes compose together — `get-trigger` controls WHEN to fetch, `get-insert` controls WHERE to place content.

#### `get-trigger`

Controls when the GET request fires.

**Syntax:** `<element get="/url" get-trigger="scroll|button|visible|hover|none">`

| Value | Behavior |
|-------|----------|
| (absent) | Fetches immediately on mount (default `get` behavior) |
| `visible` | Fetches when element enters viewport via IntersectionObserver |
| `hover` | Fetches on first `mouseenter` event |
| `none` | Suppresses auto-fetch; use `.refresh()` to trigger manually |
| `scroll` | Infinite scroll — fetches next page when sentinel enters viewport. Requires `get-insert` |
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

```html
<!-- Start loading 500px before element enters viewport -->
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

> **Note:** `error-boundary` does **not** catch failed HTTP requests made by `get`/`post`/`put`/`patch`/`delete` directives. Use the `error` attribute on the fetch element for per-request error handling, or `NoJS.on('fetch:error', ...)` for global HTTP error handling.

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

Use `NoJS.on()` to listen for errors globally -- useful for logging, analytics, or session management:

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
