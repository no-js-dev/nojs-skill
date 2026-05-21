# Template Directives

Element references, template instantiation, slots, remote templates, and the `call` action directive.

## Contents

- [ref](#ref) -- named element reference via $refs (priority 5)
- [use](#use) -- instantiate a template inline (priority 10)
- [include](#include) -- synchronously clone an inline template
- [Template Slots](#template-slots) -- projected content via named slots
- [Remote Templates (src)](#remote-templates-src) -- load templates from external files
- [Template Variables (var)](#template-variables-var) -- declare expected variables
- [call](#call) -- trigger API call on click (priority 20)

---

## Refs and Templates

Element references, template instantiation, slots, and remote templates.

### `ref`

Named element reference accessible via `$refs`.

**Syntax:** `<element ref="name">`

```html
<input ref="searchInput" type="text" />
<button on:click="$refs.searchInput.focus()">Focus Search</button>

<video ref="player" src="video.mp4"></video>
<button on:click="$refs.player.play()">Play</button>
<button on:click="$refs.player.pause()">Pause</button>
```

### `use`

Instantiate a template inline. Clones the referenced template into the element.

**Syntax:** `<element use="templateId">`

```html
<template id="counter-component" var="config">
  <div state="{ count: config.initial || 0 }">
    <span bind="config.label + ': '"></span>
    <button on:click="count--">-</button>
    <span bind="count"></span>
    <button on:click="count++">+</button>
  </div>
</template>

<div use="counter-component" var-config="{ label: 'Apples', initial: 5 }"></div>
<div use="counter-component" var-config="{ label: 'Oranges', initial: 3 }"></div>
```

### `include`

Synchronously clone an inline template into the current position. Useful for reusable markup that needs no network request.

**Syntax:** `<template include="#fragmentId">`

```html
<template include="#icon-set"></template>

<template id="icon-set">
  <svg hidden>...</svg>
</template>
```

Each `include` creates a fresh independent clone. Both plain IDs and `#id` syntax are accepted.

### Template Slots

Templates can accept projected content via named `<slot>` elements:

```html
<template id="card">
  <div class="card">
    <div class="card-header"><slot name="header"></slot></div>
    <div class="card-body"><slot></slot></div>
    <div class="card-footer"><slot name="footer"></slot></div>
  </div>
</template>

<div use="card">
  <span slot="header">My Title</span>
  <p>Main content goes here</p>
  <span slot="footer">Footer info</span>
</div>
```

### Remote Templates (`src`)

Load templates from external HTML files. Resolved recursively.

**Syntax:** `<template id="name" src="/path/to/file.html">`

```html
<template id="header" src="/templates/header.html"></template>
<template id="footer" src="/templates/footer.html"></template>
```

**Loading placeholder** -- show a placeholder while the remote template loads:

```html
<template src="./dashboard.tpl" loading="#spinner"></template>
<template id="spinner">
  <div class="skeleton">Loading...</div>
</template>
```

### Template Variables (`var`)

Templates can declare which variable they expect:

```html
<template id="loginOk" var="result">
  <p>Welcome, <span bind="result.user.name"></span>!</p>
</template>
```

---

## Miscellaneous

### `call`

Trigger an API call on click, with loading/error/success templates.

**Syntax:** `<button call="/api/action" method="post">`

Supports the same attributes as HTTP directives. Rapid clicks automatically abort the previous in-flight request (switchMap behavior).

**Attributes:**

| Attribute | Type | Description |
|-----------|------|-------------|
| `call` | string | URL for the request (supports `{variable}` interpolation) |
| `method` | string | HTTP method. Default: `"get"` |
| `as` | string | Name for response data in context. Default: `"data"` |
| `into` | string | Write response to a named global store |
| `body` | string | Request body (JSON with `{variable}` interpolation) |
| `loading` | string | Template ID shown during request |
| `success` | string | Template ID rendered on success |
| `error` | string | Template ID rendered on error |
| `then` | string | Expression to execute on success |
| `confirm` | string | Show browser `confirm()` dialog before sending |
| `redirect` | string | SPA route to navigate to on success |
| `headers` | string | JSON string of request headers |

```html
<!-- Logout button -->
<a call="/api/logout" method="post"
   confirm="Are you sure you want to logout?"
   success="#loggedOut">
  Logout
</a>

<!-- Like button -->
<button call="/api/posts/{post.id}/like" method="post" then="post.likes++">
  Like <span bind="post.likes"></span>
</button>

<!-- Delete with confirmation -->
<button call="/api/items/{item.id}" method="delete"
        confirm="Delete this item?"
        then="items.splice($index, 1)">
  Delete
</button>

<!-- With loading state and redirect -->
<button call="/api/publish" method="post"
        loading="#spinner" redirect="/dashboard">
  Publish
</button>
```

**Loading state disables button:** While the loading template is displayed, the button/element is set to `disabled = true`. It is re-enabled after the response returns.

**Sensitive header warning:** If inline `headers` contain credentials (e.g. `Authorization`, `X-Auth-*`, `X-Api-*`), a console warning is emitted advising the use of `NoJS.config({ headers })` or an interceptor instead of exposing credentials in HTML source.

**Success template target:** The success template is **appended** to `el.closest("[route-view]") || el.parentElement` -- it does NOT replace the button content. The response data is available inside the success template under the variable declared by `var` on the template (defaults to `"result"`).

**Request lifecycle:** `click -> [confirm?] -> [loading] -> [success | error]`

**Events emitted:** `fetch:success` (`{ url, data }`) and `fetch:error` (`{ url, error }`) on the document.
