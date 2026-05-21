# Data Fetching Directives

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
  - [SwitchMap / Abort Behavior](#switchmap--abort-behavior) -- rapid calls abort in-flight requests

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

### SwitchMap / Abort Behavior

When a new request is triggered while a previous one is still in flight, the in-flight request is aborted (switchMap pattern). This prevents race conditions from rapid interactions -- only the latest request's response is rendered.

Aborted requests fail silently (the `AbortError` is caught and ignored, no error template is shown).
