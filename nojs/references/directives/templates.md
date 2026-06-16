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

## Syntax Reference

| Directive | Syntax | Description |
|-----------|--------|-------------|
| `ref` | `ref="name"` | Named element reference accessible via `$refs` |
| `use` | `use="templateId"` | Clone and instantiate a template inline |
| `include` | `include="#fragmentId"` | Synchronously clone an inline template |
| `slot` | `<slot name="slotName">` | Define insertion point for projected content |
| `src` | `src="/path/to/file.html"` | Load template from external file |
| `var` | `var="variableName"` | Declare expected template variable |
| `var-*` | `var-config="expression"` | Pass variable to template on instantiation |
| `call` | `call="/api/action"` | Trigger API call on click |

---

## `ref`

Named element reference accessible via `$refs`.

**Syntax:** `<element ref="name">`

```html
<input ref="searchInput" type="text" />
<button on:click="$refs.searchInput.focus()">Focus Search</button>

<video ref="player" src="video.mp4"></video>
<button on:click="$refs.player.play()">Play</button>
<button on:click="$refs.player.pause()">Pause</button>
```

### Edge Cases

- `$refs` is scoped to the reactive context. Refs defined inside a template are not accessible from outside.
- If the referenced element is removed from the DOM (e.g. by `if`), the ref becomes stale. Re-adding the element creates a fresh ref.
- Refs on loop items refer to the last rendered item with that ref name.

### Complete Example

```html
<div state="{ message: '' }">
  <input ref="msgInput" type="text" model="message" />
  <button on:click="$refs.msgInput.focus(); $refs.msgInput.select()">
    Edit Message
  </button>
  <p>Message: <span bind="message"></span></p>
</div>
```

---

## `use`

Instantiate a template inline. Clones the referenced template into the element.

**Syntax:** `<element use="templateId">`

Pass variables to the template using `var-*` attributes.

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

### Edge Cases

- Each `use` creates an independent instance with its own state.
- The `var` attribute on the `<template>` declares what variable name the template expects.
- The `var-*` attribute on the `use` element passes the value.

### Complete Example -- Reusable Card Component

```html
<template id="info-card" var="data">
  <div class="card">
    <h3 bind="data.title"></h3>
    <p bind="data.description"></p>
    <a bind-href="data.link">Learn More</a>
  </div>
</template>

<div use="info-card" var-data="{ title: 'No.JS', description: 'HTML-first framework', link: '/docs' }"></div>
<div use="info-card" var-data="{ title: 'Elements', description: 'UI components', link: '/elements' }"></div>
<div use="info-card" var-data="{ title: 'CLI', description: 'Command-line tools', link: '/cli' }"></div>
```

---

## `include`

Synchronously clone an inline template into the current position. Useful for reusable markup that needs no network request.

**Syntax:** `<template include="#fragmentId">`

```html
<template include="#icon-set"></template>

<template id="icon-set">
  <svg hidden>...</svg>
</template>
```

Each `include` creates a fresh independent clone. Both plain IDs and `#id` syntax are accepted.

### Edge Cases

- Unlike `use`, `include` does not support variable passing. It is a simple clone.
- The `include` element is replaced by the cloned content.
- Circular includes (A includes B, B includes A) are not detected and will cause infinite loops.

---

## Template Slots

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

### Edge Cases

- The unnamed `<slot>` (default slot) receives all projected content that does not have a `slot` attribute.
- Named slots match by `slot="name"` on the projected elements to `name="name"` on the `<slot>`.
- If no content is projected for a slot, the slot's default children (if any) are rendered.

### Complete Example -- Layout Template

```html
<template id="page-layout">
  <header class="page-header"><slot name="header"></slot></header>
  <main class="page-body"><slot></slot></main>
  <footer class="page-footer"><slot name="footer"></slot></footer>
</template>

<div use="page-layout">
  <nav slot="header">
    <a route="/">Home</a>
    <a route="/about">About</a>
  </nav>

  <h1>Welcome to My App</h1>
  <p>This content goes in the default slot.</p>

  <p slot="footer">Copyright 2026</p>
</div>
```

---

## Remote Templates (`src`)

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

### Edge Cases

- Remote templates are cached after the first fetch. Subsequent uses do not trigger additional network requests.
- If the remote file returns HTTP 404, the template remains empty.
- Templates loaded via `src` can themselves reference other templates (resolved recursively).

---

## Template Variables (`var`)

Templates can declare which variable they expect:

```html
<template id="loginOk" var="result">
  <p>Welcome, <span bind="result.user.name"></span>!</p>
</template>
```

The `var` attribute names the variable that will be available inside the template when it is instantiated (via `use`, `success`, `error`, or loop `template`).

---

## `call`

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

### Behavior Details

- **Loading state disables button:** While the loading template is displayed, the button/element is set to `disabled = true`. Re-enabled after the response returns.
- **Sensitive header warning:** If inline `headers` contain credentials (e.g. `Authorization`, `X-Auth-*`), a console warning is emitted.
- **Success template target:** The success template is **appended** to `el.closest("[route-view]") || el.parentElement` -- it does NOT replace the button content.
- **Request lifecycle:** `click -> [confirm?] -> [loading] -> [success | error]`
- **Events emitted:** `fetch:success` (`{ url, data }`) and `fetch:error` (`{ url, error }`) on the document.

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

### Edge Cases

- `call` always triggers on `click`, regardless of element type (even `<a>` or `<form>`).
- SwitchMap behavior: rapid clicks abort the previous in-flight request. Only the latest response is rendered.
- The `method` attribute defaults to `"get"` if omitted.

### Complete Example -- CRUD Actions

```html
<div state="{ items: [] }" get="/api/items" as="items">
  <div each="item in items" key="item.id">
    <span bind="item.name"></span>

    <button call="/api/items/{item.id}" method="delete"
            confirm="Delete this item?"
            then="items.splice($index, 1)">
      Delete
    </button>
  </div>

  <button call="/api/items" method="post"
          body="{ name: 'New Item' }"
          then="items.push(result)"
          loading="#spinner">
    Add Item
  </button>
</div>

<template id="spinner">
  <span class="spinner">Loading...</span>
</template>
```
