# No.JS Directives Reference

Complete reference for every No.JS directive, grouped by category. Directives execute by priority: state (0) > HTTP/error-boundary/i18n-ns/head-management (1) > computed/watch (2) > ref (5) > structural (10) > drag/drop (15) > drag-multiple (16) > rendering/events/actions (20) > validation (30).

Most directive values accept JavaScript expressions evaluated against the current reactive context. Contexts inherit from parent elements like lexical scoping.

> **Note:** The core directive registry is frozen after built-in directive registration. Custom directives registered via `NoJS.directive()` can only add **new** names -- they cannot override or replace built-in directives.

## Table of Contents

- [Data Fetching](#data-fetching) -- base, get, post, put, patch, delete, as, body, headers, params, cached, into, debounce, refresh
- [State Management](#state-management) -- state, store, computed, watch, persist, persist-key, persist-fields
- [Rendering and Binding](#rendering-and-binding) -- bind, bind-html, bind-\*, model
- [Conditionals](#conditionals) -- if, else-if, else, then, show, hide, switch, case, default
- [Loops](#loops) -- foreach, each, for, template, index, key, filter, sort, limit, offset, loop variables
- [Events](#events) -- on:\*, trigger, modifiers, lifecycle hooks
- [Styling](#styling) -- class-\*, class-map, class-list, style-\*, style-map
- [Forms and Validation](#forms-and-validation) -- validate, error-boundary, $form context, validators
- [Routing](#routing) -- route, route-view, route-active, guard, outlet, $route context, file-based routing, named outlets, anchor links, 404 handling
- [Animation](#animation) -- animate, transition, animate-enter, animate-leave, animate-stagger
- [Drag and Drop](#drag-and-drop) -- drag, drop, drag-list, drag-multiple, all sub-attributes
- [Internationalization](#internationalization) -- t, t-\*, i18n-ns, configuration
- [Refs and Templates](#refs-and-templates) -- ref, use, include, slots, remote templates
- [Head Management](#head-management) -- page-title, page-description, page-canonical, page-jsonld
- [Miscellaneous](#miscellaneous) -- error-boundary

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

**Reactive URLs** -- URLs referencing state variables re-fetch automatically when values change:

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

```html
<form post="/login" body="{ email, password }" as="result"
      success="#loginSuccess" error="#loginError" loading="#loginLoading">
  <input model="email">
  <input model="password" type="password">
  <button>Login</button>
</form>
```

### `put`

Update data via HTTP PUT request (full replacement).

**Syntax:** `<element put="/endpoint" body="{expression}">`

```html
<form put="/users/{user.id}" body='{"name": "{user.name}", "role": "{selectedRole}"}'>
  ...
</form>
```

### `patch`

Partial update via HTTP PATCH request.

**Syntax:** `<element patch="/endpoint" body="{expression}">`

### `delete`

Delete data via HTTP DELETE request.

**Syntax:** `<element delete="/endpoint">`

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
| `body` | Request body (JSON string with `{variable}` interpolation). For forms, auto-serializes fields |
| `success` | Template ID to render on success. Receives response as `var` |
| `error` | Template ID to render on error. Receives error as `var` |
| `loading` | Template ID to show during request |
| `confirm` | Show browser `confirm()` dialog before sending |
| `redirect` | URL to navigate to on success (SPA route) |
| `then` | Expression to execute on success (e.g. `"users.push(result)"`) |
| `into` | Write response to a named global store |
| `cached` | Cache responses (memory/local/session) |

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

Request body for POST/PUT/PATCH requests.

**Syntax:** `<element post="/api" body="{ key: value }">`

Accepts a JSON string with `{variable}` interpolation. For `<form>` elements, fields are auto-serialized if `body` is not specified.

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

---

## State Management

Local and global reactive state. All state is Proxy-backed and changes propagate automatically to bound elements.

### `state`

Create local reactive state on an element.

**Syntax:** `<element state="{ key: value }">`

Creates a reactive context scoped to the element and its children. Values are JavaScript expressions.

```html
<div state="{ count: 0, name: 'World' }">
  <h1>Hello, <span bind="name"></span>!</h1>
  <p>Count: <span bind="count"></span></p>
  <button on:click="count++">+1</button>
  <button on:click="count = 0">Reset</button>
</div>
```

### `store`

Define or access a global reactive store.

**Syntax:** `<element store="storeName" value="{...}">`

A global reactive store accessible from anywhere via `$store.storeName`. Ideal for auth state, theme, shared data.

```html
<!-- Define store (once, typically at the top of the page) -->
<div store="app" value="{
  user: null,
  theme: 'dark',
  lang: 'en'
}"></div>

<!-- Access from anywhere -->
<span bind="$store.app.user.name"></span>
<button on:click="$store.app.theme = $store.app.theme === 'dark' ? 'light' : 'dark'">
  Toggle Theme
</button>
```

Stores can also be pre-initialized via `NoJS.config()`. **Important:** stores created via `config()` will NOT be overwritten by a later `<div store>` with the same name:

```html
<script>
  NoJS.config({
    stores: {
      auth:  { user: null, token: localStorage.getItem('token') },
      cart:  { items: [], total: 0 }
    }
  });
</script>
```

### `computed`

Derived reactive value, recomputed when dependencies change.

**Syntax:** `<element computed="name" expr="expression">`

```html
<div state="{ price: 100, quantity: 2, taxRate: 0.1 }">
  <div computed="subtotal" expr="price * quantity"></div>
  <div computed="tax" expr="subtotal * taxRate"></div>
  <div computed="total" expr="subtotal + tax"></div>

  <p>Total: $<span bind="total"></span></p>
  <input type="number" model="quantity" />
</div>
```

### `watch`

React to value changes by executing an expression.

**Syntax:** `<element watch="property" on:change="handler">`

Executes the `on:change` handler whenever the watched property changes.

```html
<div state="{ search: '' }"
     watch="search"
     on:change="console.log('Search changed:', search)">
  <input model="search" />
</div>
```

### `persist`

Persist state to localStorage or sessionStorage across page reloads.

**Syntax:** `<element state="{...}" persist="localStorage">`

| Value | Storage |
|-------|---------|
| `persist="localStorage"` | Persists to localStorage |
| `persist="sessionStorage"` | Persists to sessionStorage |

```html
<div state="{ theme: 'dark', sidebar: true }"
     persist="localStorage"
     persist-key="app-settings">
  ...
</div>
```

### `persist-key`

Custom storage key for persisted state. Defaults to an auto-generated key if omitted.

**Syntax:** `<element state="{...}" persist="localStorage" persist-key="my-key">`

### `persist-fields`

Limit which state fields get persisted. Comma-separated list of field names.

**Syntax:** `<element state="{...}" persist="localStorage" persist-fields="theme,sidebar">`

When specified, only the listed fields are saved to and restored from storage. All other state fields use their initial values on page load.

```html
<div state="{ theme: 'dark', sidebar: true, tempData: null }"
     persist="localStorage"
     persist-key="prefs"
     persist-fields="theme,sidebar">
  <!-- Only theme and sidebar are persisted; tempData always starts as null -->
</div>
```

### Mutating Stores from JavaScript

When you modify a store from outside No.JS expressions (e.g., in a `<script>` block, interceptor, or third-party callback), you must call `NoJS.notify()` to flush the changes to the UI:

```html
<script>
  // Inside an interceptor or external callback
  NoJS.interceptor('response', (response, url) => {
    if (response.status === 401) {
      NoJS.store.auth.user = null;
      NoJS.store.auth.token = null;
      NoJS.notify();               // flush to UI
      NoJS.router.push('/login');
    }
    return response;
  });
</script>
```

When modifying stores via HTML expressions (e.g., `on:click="$store.cart.items.push(item)"`), `notify()` is NOT needed -- the Proxy system handles it automatically.

---

## Rendering and Binding

One-way and two-way data binding for text, HTML, attributes, and form inputs.

### `bind`

One-way data binding -- sets element `textContent`.

**Syntax:** `<element bind="expression">`

Replaces the element's text content with the evaluated expression. Supports pipes/filters with `|`.

```html
<h1 bind="user.name"></h1>
<span bind="'Total: ' + items.length"></span>
<span bind="user.age >= 18 ? 'Adult' : 'Minor'"></span>
<span bind="user.name | uppercase"></span>
<span bind="price | currency"></span>
```

### `bind-html`

Set innerHTML (sanitized) from an expression.

**Syntax:** `<element bind-html="expression">`

Renders the expression result as HTML. Sanitized by default (DOMPurify-compatible) to prevent XSS.

```html
<div bind-html="article.content"></div>
<div bind-html="`<em>${user.bio}</em>`"></div>
```

### `bind-*`

Bind any HTML attribute to an expression.

**Syntax:** `<element bind-attr="expression">`

Works with any attribute: `src`, `href`, `alt`, `title`, `disabled`, `checked`, `data-*`, etc.

```html
<img bind-src="user.avatarUrl" bind-alt="user.name + ' avatar'" />
<a bind-href="'/users/' + user.id">Profile</a>
<button bind-disabled="!form.isValid">Submit</button>
<input type="checkbox" bind-checked="user.isActive" />
<div bind-data-id="user.id" bind-data-role="user.role"></div>
```

### `model`

Two-way binding for input elements.

**Syntax:** `<input model="property">`

Creates automatic two-way data binding between a form input and a state property. Works with text inputs, number inputs, checkboxes, selects, and textareas.

```html
<div state="{ name: '', age: 0, agreed: false, role: 'user' }">
  <input type="text" model="name" />
  <input type="number" model="age" />
  <input type="checkbox" model="agreed" />
  <select model="role">
    <option value="admin">Admin</option>
    <option value="user">User</option>
  </select>
  <textarea model="bio"></textarea>

  <p>Hello, <span bind="name"></span>!</p>
</div>
```

---

## Conditionals

Conditional rendering and visibility control.

### `if`

Conditionally render element. Removes from DOM when condition is false; re-creates when true.

**Syntax:** `<element if="condition">` or `<element if="condition" then="templateId" else="templateId">`

```html
<!-- Inline content -->
<div if="user.isLoggedIn">
  <p>Welcome back!</p>
</div>

<!-- With template references -->
<div if="user.isAdmin" then="adminPanel" else="userPanel"></div>

<!-- Complex expressions -->
<div if="cart.items.length > 0" then="cartTpl" else="emptyCartTpl"></div>
```

### `else-if`

Chained conditional following an `if`.

**Syntax:** `<element else-if="condition">`

Must follow an element with `if` or another `else-if`.

```html
<div if="status === 'loading'" then="loadingTpl"></div>
<div else-if="status === 'error'" then="errorTpl"></div>
<div else-if="status === 'empty'" then="emptyTpl"></div>
<div else then="contentTpl"></div>
```

### `else`

Fallback block after `if` or `else-if`. Can reference a template ID or contain inline content.

**Syntax:** `<element else>` or `<element else="templateId">`

### `then`

Template to render when condition is truthy.

**Syntax:** `<element if="condition" then="templateId">`

References a `<template id="...">` to clone and render when the condition is true.

### `show`

Toggle element visibility via CSS `display`. Element stays in DOM.

**Syntax:** `<element show="condition">`

Better than `if` for frequently toggled content because it preserves element state.

```html
<div show="user.isLoggedIn">Welcome!</div>
<button show="!editing" on:click="editing = true">Edit</button>
<button show="editing" on:click="editing = false">Save</button>
```

### `hide`

Inverse of `show` -- hides element when condition is true.

**Syntax:** `<element hide="condition">`

```html
<div hide="user.isLoggedIn">Please log in.</div>
```

### `if` vs `show`

| | `if` | `show` |
|--|------|--------|
| Mechanism | Adds/removes DOM elements | Toggles CSS `display` |
| Best for | Rarely toggled content | Frequently toggled content |
| Preserves state | No (re-creates) | Yes |

### `switch`

Switch/case rendering based on a value.

**Syntax:** `<element switch="expression">`

Contains `case` and `default` children.

```html
<div switch="user.role">
  <div case="'admin'" then="adminDashboard"></div>
  <div case="'editor'" then="editorDashboard"></div>
  <div default then="guestDashboard"></div>
</div>
```

### `case`

Case match inside a `switch` block.

**Syntax:** `<element case="'value'">`

Supports multi-value matching with comma separation.

```html
<!-- Single value -->
<span case="'pending'" class="badge warn">Pending</span>

<!-- Multi-value -->
<div case="'admin','superadmin'" then="adminPanel"></div>
```

### `default`

Default case inside a `switch` block. Renders when no `case` matches.

**Syntax:** `<element default>`

```html
<div switch="order.status">
  <span case="'pending'">Pending</span>
  <span case="'shipped'">Shipped</span>
  <span default>Unknown</span>
</div>
```

---

## Loops

List rendering with iteration, filtering, sorting, and pagination.

`foreach` is the **primary** iteration directive. `each` and `for` are **aliases** -- all three share the same handler and support identical features.

### `foreach`

Iterate over an array with full support for filtering, sorting, pagination, and custom variable names.

**Syntax:** `<element foreach="item in items">`

The `in` keyword separates the loop variable from the source array expression.

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `foreach` | `"variable in arrayExpression"` |
| `index` | Variable name for the index (default: `$index`) |
| `key` | Unique key expression for DOM diffing |
| `else` | Template ID to render when array is empty |
| `template` | Template ID to clone for each iteration |
| `filter` | Expression to filter items |
| `sort` | Property path to sort by (prefix with `-` for descending) |
| `limit` | Maximum number of items to render |
| `offset` | Number of items to skip |

**Inline children as template** -- when no `template` attribute is present, the element's children serve as the repeating template:

```html
<!-- Inline children (most common) -->
<ul>
  <li foreach="todo in todos" bind="todo.text"></li>
</ul>

<!-- Inline children with multiple child elements -->
<ul>
  <li foreach="item in menuItems"
      index="idx"
      key="item.id"
      filter="item.active"
      sort="item.order"
      limit="10"
      offset="0"
      else="#noItems">
    <span bind="idx + 1"></span> - <span bind="item.label"></span>
  </li>
</ul>

<!-- With template reference -->
<div foreach="post in posts" template="postCard"></div>
<template id="postCard">
  <article>
    <h2 bind="post.title"></h2>
    <span bind="'#' + $index"></span>
  </article>
</template>
```

### `each`

Alias for `foreach`. Identical handler, identical behavior.

**Syntax:** `<element each="item in items">`

```html
<ul>
  <li each="user in users" key="user.id">
    <span bind="user.name"></span>
  </li>
</ul>
```

All `foreach` attributes (`filter`, `sort`, `limit`, `offset`, `key`, `else`, `template`, `index`, `animate-*`) work on `each`.

### `for`

Alias for `foreach`. Identical handler, identical behavior.

**Syntax:** `<element for="item in items">`

```html
<ul>
  <li for="task in tasks" key="task.id" filter="!task.done">
    <span bind="task.title"></span>
  </li>
</ul>
```

All `foreach` attributes (`filter`, `sort`, `limit`, `offset`, `key`, `else`, `template`, `index`, `animate-*`) work on `for`.

### `template`

Template ID to clone for each iteration.

**Syntax:** `<element foreach="item in items" template="templateId">`

Works with `foreach`, `each`, and `for`.

### `index`

Custom variable name for the current index.

**Syntax:** `<element foreach="item in items" index="i">`

Default loop index variable is `$index`.

### `key`

Unique key for efficient list diffing.

**Syntax:** `<element foreach="item in items" key="item.id">`

Enables stable DOM identity across re-renders. Use a unique property like `id`.

### `filter`

Filter expression -- only render matching items.

**Syntax:** `<element foreach="item in items" filter="item.active">`

### `sort`

Sort property. Prefix with `-` for descending order.

**Syntax:** `<element foreach="item in items" sort="item.name">` or `sort="-item.date">`

### `limit`

Maximum number of items to render.

**Syntax:** `<element foreach="item in items" limit="10">`

### `offset`

Number of items to skip.

**Syntax:** `<element foreach="item in items" offset="5">`

### Loop Context Variables

Inside any loop (`foreach`, `each`, or `for`), these variables are automatically available:

| Variable | Description |
|----------|-------------|
| `$index` | Current index (0-based) |
| `$count` | Total number of items |
| `$first` | `true` if first item |
| `$last` | `true` if last item |
| `$even` | `true` if index is even |
| `$odd` | `true` if index is odd |

```html
<div each="item in items">
  <div class-first="$first" class-last="$last" class-striped="$odd">
    <span bind="($index + 1) + ' of ' + $count"></span>
    <span bind="item.name"></span>
  </div>
</div>
```

### Nested Loops

Child loops can access parent scope variables:

```html
<div each="category in categories">
  <h3 bind="category.name"></h3>
  <div each="product in category.products">
    <p><span bind="category.name"></span>: <span bind="product.name"></span></p>
  </div>
</div>
```

---

## Events

Event handling, modifiers, and lifecycle hooks.

### `on:*`

Event handler -- supports all DOM events plus lifecycle hooks.

**Syntax:** `<element on:event="expression">` or `<element on:event.modifier="expression">`

```html
<button on:click="count++">Click me</button>
<form on:submit.prevent="handleSubmit()">
<input on:keydown.enter="search()">
<input on:input="name = $event.target.value" />
<div on:mouseenter="hovered = true" on:mouseleave="hovered = false">
```

### Event Modifiers

| Modifier | Description |
|----------|-------------|
| `.prevent` | Calls `preventDefault()` |
| `.stop` | Calls `stopPropagation()` |
| `.once` | Listener fires only once |
| `.self` | Only fires if target is the element itself |
| `.debounce.{ms}` | Debounce the handler (e.g. `.debounce.300`) |
| `.throttle.{ms}` | Throttle the handler (e.g. `.throttle.100`) |

### Key Modifiers

| Modifier | Key |
|----------|-----|
| `.enter` | Enter |
| `.escape` | Escape |
| `.tab` | Tab |
| `.space` | Space |
| `.delete` | Delete/Backspace |
| `.backspace` | Backspace |
| `.up` | ArrowUp |
| `.down` | ArrowDown |
| `.left` | ArrowLeft |
| `.right` | ArrowRight |
| `.ctrl` | Control |
| `.alt` | Alt |
| `.shift` | Shift |
| `.meta` | Meta/Command |

Modifiers can be combined: `on:submit.prevent.once="register()"`, `on:keydown.ctrl.s="save()"`

```html
<input on:input.debounce.300="search($event.target.value)" />
<div on:scroll.throttle.100="handleScroll()">
<input on:keydown.ctrl.s="save()" />
```

### `$event` and `$el`

Inside any `on:*` handler:
- `$event` -- the native DOM event object
- `$el` -- the current element

```html
<input on:input="name = $event.target.value" />
<input on:focus="$el.select()" />
```

### Lifecycle Hooks

| Hook | When |
|------|------|
| `on:init` | Directive first processed |
| `on:mounted` | Element inserted into visible DOM |
| `on:updated` | Any reactive dependency changed |
| `on:unmounted` | Element removed from DOM |
| `on:error` | Any error in this element's subtree |

```html
<div on:mounted="initChart($el)">
  <canvas ref="chart"></canvas>
</div>
<div on:unmounted="cleanup()"></div>
<div on:init="fetchInitialData()"></div>
```

### `trigger`

Emit a custom event from the element.

**Syntax:** `<element trigger="event-name" trigger-data="expression">`

The parent can listen with `on:event-name`.

```html
<!-- Child emits -->
<button on:click trigger="item-selected" trigger-data="item">Select</button>

<!-- Parent listens -->
<div on:item-selected="handleSelection($event.detail)">
  <div each="item in items" template="itemTpl"></div>
</div>
```

---

## Styling

Dynamic CSS classes and inline styles.

### `class-*`

Toggle a CSS class based on a condition.

**Syntax:** `<element class-className="condition">`

```html
<div class-active="isActive"
     class-disabled="!isEnabled"
     class-highlighted="score > 90">
</div>
```

### `class-map`

Apply multiple CSS classes from an object expression.

**Syntax:** `<element class-map="{ className: condition }">`

```html
<div class-map="{ active: isActive, 'text-bold': isBold, error: hasError }"></div>
```

### `class-list`

Apply CSS classes from an array expression.

**Syntax:** `<element class-list="[expressions]">`

```html
<div class-list="['base-class', isAdmin ? 'admin' : 'user']"></div>
```

### `style-*`

Set an inline style property dynamically.

**Syntax:** `<element style-property="expression">`

Use kebab-case for CSS property names.

```html
<div style-color="isError ? 'red' : 'green'"
     style-font-size="fontSize + 'px'"
     style-opacity="isVisible ? 1 : 0.5">
</div>
```

### `style-map`

Apply multiple inline styles from an object expression.

**Syntax:** `<element style-map="{ property: value }">`

```html
<div style-map="{
  color: textColor,
  fontSize: size + 'px',
  transform: 'rotate(' + rotation + 'deg)'
}"></div>
```

---

## Forms and Validation

Built-in form validation with `$form` context. No.JS automatically detects native HTML5 validation attributes. The `validate` attribute is needed only for framework-specific validators.

### `validate`

Enable validation on a form or field.

**Syntax:** `<form validate>` (on form) or `<input validate="validatorName">` (on field)

Native HTML5 attributes (`required`, `minlength`, `maxlength`, `type="email"`, `type="url"`, `min`, `max`, `pattern`) work automatically.

```html
<form validate state="{ email: '', password: '' }">
  <input model="email" validate="required,email"
         error-required="Email is required"
         error-email="Please enter a valid email">
  <input model="password" type="password" validate="required"
         error-required="Password is required">
  <button if="$form.valid">Submit</button>
  <p if="$form.firstError" bind="$form.firstError" class="error"></p>
</form>
```

### Per-Rule Error Messages

Use `error-{rule}` attributes for specific rules, or `error` for a generic fallback:

```html
<input type="email" name="email" required
       error-required="Email is required"
       error-email="Please enter a valid email"
       error="This field is invalid" />
```

### Error Templates

Point an `error` attribute to a `<template>` using a `#` prefix:

```html
<input type="email" name="email" required error="#emailError" />
<template id="emailError">
  <span class="field-error" bind="$error"></span>
</template>
```

Inside the template, `$error` contains the error message and `$rule` contains the failing rule name.

### Error CSS Class

Use `error-class` on the form or on individual fields to toggle a CSS class when a field is invalid and touched:

```html
<form validate error-class="is-invalid">
  <input name="email" required />  <!-- gets .is-invalid when invalid + touched -->
</form>
```

### `$form` Context

Inside any `<form>` with the `validate` attribute:

| Property | Type | Description |
|----------|------|-------------|
| `$form.valid` | boolean | `true` if all fields pass validation |
| `$form.dirty` | boolean | `true` if any field has been modified |
| `$form.touched` | boolean | `true` if any field has been focused and blurred |
| `$form.submitting` | boolean | `true` while the request is in flight |
| `$form.pending` | boolean | `true` while async validators are running |
| `$form.errors` | object | Map of field names to error messages |
| `$form.values` | object | Current form values |
| `$form.firstError` | string or null | Error message of the first invalid field (DOM order) |
| `$form.errorCount` | number | Number of fields currently failing validation |
| `$form.fields` | object | Per-field state (see below) |
| `$form.reset()` | function | Reset form to initial values, clear errors and classes |

### `$form.fields` -- Per-Field State

| Property | Type | Description |
|----------|------|-------------|
| `$form.fields.{name}.valid` | boolean | Whether this field passes validation |
| `$form.fields.{name}.error` | string or null | Error message for this field |
| `$form.fields.{name}.dirty` | boolean | Whether this field has been modified |
| `$form.fields.{name}.touched` | boolean | Whether this field has been focused and blurred |

Field aliases: use the `as` attribute on an input to expose its state under a custom name:

```html
<input type="email" name="email" required as="emailField" />
<p show="!emailField.valid && emailField.touched" bind="emailField.error"></p>
```

### Validation Triggers (`validate-on`)

Control when visual feedback appears. Default: `input` and `focusout`.

```html
<form validate validate-on="blur">
  <input name="email" required />
</form>
```

### Conditional Validation (`validate-if`)

Skip validation for a field based on a condition:

```html
<input name="company" required validate-if="hasCompany" />
```

When `validate-if` is false, the field is treated as valid and excluded from `$form.errors`.

### Auto-Disable Submit Buttons

Submit buttons are automatically disabled when the form is invalid. No `bind-disabled` needed. Buttons with `type="button"` are not affected.

### Custom Validators

Register custom validators with `NoJS.validator()`:

```html
<script>
  NoJS.validator('strongPassword', (value) => {
    if (value.length < 8) return 'Must be at least 8 characters';
    if (!/[A-Z]/.test(value)) return 'Must contain uppercase';
    if (!/[0-9]/.test(value)) return 'Must contain a number';
    return true;
  });
</script>
<input type="password" validate="strongPassword" />
```

### `error-boundary`

Error boundary -- renders fallback template on error within a subtree.

**Syntax:** `<element error-boundary="#fallbackTemplate">`

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

---

## Routing

Client-side SPA routing with params, guards, nested routes, file-based routing, and named outlets.

### `route`

Define a route or create a navigation link.

**Syntax:** `<a route="/path">` (navigation link) or `<template route="/path">` (route definition)

Route patterns support `:param` placeholders and `*` wildcard for catch-all/404.

```html
<!-- Navigation links -->
<a route="/">Home</a>
<a route="/about">About</a>
<a route="/users/:id">User Detail</a>

<!-- Route templates -->
<template route="/">
  <h1>Home</h1>
</template>

<template route="/users/:id">
  <div get="/api/users/{$route.params.id}" as="user">
    <h1 bind="user.name"></h1>
  </div>
</template>

<!-- Catch-all 404 -->
<template route="*">
  <h1>404 -- Page Not Found</h1>
  <p>Path <code bind="$route.path"></code> does not exist.</p>
</template>
```

### `route-view`

Route outlet that renders the matched route template.

**Syntax:** `<main route-view>` or `<aside route-view="name">`

**Attributes:**

| Attribute | Default | Description |
|-----------|---------|-------------|
| `route-view` | (default outlet) | Renders matched route. Value = outlet name for named outlets |
| `src` | `"pages"` | Base folder for file-based routing |
| `route-index` | `"index"` | Filename for the root route `/` |
| `ext` | `".tpl"` | File extension (fallback: `".html"`) |
| `i18n-ns` | -- | When present, auto-derives i18n namespace from filename |

```html
<!-- Standard outlet -->
<main route-view></main>

<!-- File-based routing -->
<main route-view src="./pages/" route-index="overview"></main>

<!-- Named outlets -->
<main route-view></main>
<aside route-view="sidebar"></aside>
```

### File-Based Routing

Point `route-view` at a folder and No.JS resolves routes to template files automatically:

```html
<main route-view src="./pages/" route-index="overview"></main>
```

Given this folder structure:
```
pages/
  overview.tpl    -> /
  analytics.tpl   -> /analytics
  users.tpl       -> /users
  settings.tpl    -> /settings
```

Explicit `<template route="...">` declarations always take priority, so you can mix both approaches.

### `route-active`

CSS class added to active route links.

**Syntax:** `<a route="/path" route-active="active-class">`

```html
<a route="/" route-active="active">Home</a>
<a route="/about" route-active="active">About</a>
<!-- Exact match only (won't match /users/123) -->
<a route="/users" route-active-exact="active">Users</a>
```

### `guard`

Route guard -- prevents navigation if condition is falsy. Redirects to specified path.

**Syntax:** `<template route="/admin" guard="expression" redirect="/login">`

```html
<template route="/dashboard" guard="$store.auth.user" redirect="/login">
  <h1>Dashboard</h1>
</template>

<template route="/login" guard="!$store.auth.user" redirect="/dashboard">
  <form post="/api/login">...</form>
</template>
```

### `lazy`

Control when route templates are fetched.

**Syntax:** `<template route="/path" lazy="ondemand">` or `lazy="priority"`

| Value | Phase | Behaviour |
|-------|-------|-----------|
| (absent) | Auto | Active route loads before first render; others preload silently after |
| `lazy="priority"` | 0 | Fetched first, before all other templates |
| `lazy="ondemand"` | On demand | Only fetched the first time the user navigates to that route |

```html
<template route="/heavy" src="./pages/heavy.tpl" lazy="ondemand"></template>
<template route="/critical" src="./critical.tpl" lazy="priority"></template>
```

### `$route` Context

| Property | Description |
|----------|-------------|
| `$route.path` | Current path (e.g. `"/users/42"`) |
| `$route.params` | Route parameters (e.g. `{ id: "42" }`) |
| `$route.query` | Query string params (e.g. `{ q: "hello" }`) |
| `$route.hash` | URL hash (e.g. `"#section"`) |
| `$route.matched` | `true` if an explicit route matched, `false` for wildcard/fallback |

### Programmatic Navigation

```html
<button on:click="$router.push('/users/42')">Go to User</button>
<button on:click="$router.back()">Go Back</button>
<button on:click="$router.replace('/new-path')">Replace</button>
```

### Nested Routes

```html
<template route="/settings">
  <nav>
    <a route="/settings/profile">Profile</a>
    <a route="/settings/security">Security</a>
  </nav>
  <div route-view></div>  <!-- Nested route content -->
</template>
<template route="/settings/profile">
  <h2>Profile Settings</h2>
</template>
```

### Named Outlets

```html
<main route-view></main>
<aside route-view="sidebar"></aside>

<template route="/home">
  <h1>Home page</h1>
</template>
<template route="/home" outlet="sidebar">
  <nav>Home navigation</nav>
</template>
```

Outlets with no matching template for the active route are cleared on navigation.

### `outlet` Attribute

Assign a route template to a specific named outlet.

**Syntax:** `<template route="/path" outlet="outletName">`

```html
<template route="/dashboard" outlet="sidebar">
  <nav>Dashboard Nav</nav>
</template>
```

If omitted, the template renders in the default (unnamed) `route-view`.

### Anchor Links

When using hash mode (`useHash: true`), anchor links with `#` are handled automatically with smooth scrolling. Active anchor links receive the `.active` class.

```html
<a route="#features">Features</a>
<a route="#pricing">Pricing</a>

<section id="features">...</section>
<section id="pricing">...</section>
```

### Programmatic Route Registration

Register routes programmatically via the router:

```javascript
NoJS.router.register('/path', templateElement, 'outletName');
```

### `$router.push()` and `$router.replace()` Return Promises

Programmatic navigation is asynchronous:

```html
<button on:click="await $router.push('/users/42')">Navigate</button>
```

### Automatic 404 Fallback

If no `route="*"` wildcard is defined, No.JS automatically shows a minimal 404 message. Define your own for a custom fallback:

```html
<template route="*">
  <h1>Page not found</h1>
  <a route="/">Go home</a>
</template>
```

### Remote 404 Templates

Wildcard routes support `src` for remote template loading:

```html
<template route="*" src="/templates/404.html"></template>
```

### File-Based Routing 404

When file-based routing gets an HTTP 404 for a template file, it triggers the wildcard route fallback chain.

### Named Outlet Wildcards

Named outlets support their own wildcards with a fallback chain: local outlet wildcard → global wildcard → built-in empty.

```html
<template route="*" outlet="sidebar">
  <p>No sidebar for this page</p>
</template>
```

### `$route.matched`

Use `$route.matched` to check if an explicit route was matched (vs wildcard fallback):

```html
<template route="*">
  <div if="!$route.matched">
    <h1>404 - <span bind="$route.path"></span> not found</h1>
  </div>
</template>
```

### Route Head Attributes

Set `<head>` metadata declaratively on each `<template route>`. Updated on every navigation. Expressions can use `$route` and `$store`.

| Attribute | Description |
|-----------|-------------|
| `page-title` | Sets `document.title`. Value is a No.JS expression (single-quoted strings: `'About | Site'`) |
| `page-description` | Creates/updates `<meta name="description">` |
| `page-canonical` | Creates/updates `<link rel="canonical">` |
| `page-jsonld` | Creates/updates `<script type="application/ld+json" data-nojs>`. Value is a JSON string with `{placeholder}` interpolation |

```html
<!-- Static title -->
<template route="/about" page-title="'About Us | My Store'">
  <h1>About</h1>
</template>

<!-- Dynamic from route params -->
<template route="/products/:id"
          page-title="'Product ' + $route.params.id + ' | Store'"
          page-description="'View product ' + $route.params.id"
          page-canonical="'/products/' + $route.params.id"
          page-jsonld='{"@type":"Product","name":"{$route.params.id}"}'>
  <h1>Product Detail</h1>
</template>

<!-- Expression from global store -->
<template route="/account" page-title="$store.user.name + ' — My Account'">
  <h1>Account</h1>
</template>
```

- Evaluated once per navigation (not continuously reactive — `$store` changes after navigation do not re-update the title)
- String literals require single quotes inside the double-quoted attribute: `page-title="'My Title'"` ✅, backticks are not valid in HTML attributes
- Default outlet only — secondary outlets do not update head metadata
- If a `<div hidden page-title>` body directive is also present, whichever runs last wins

### Accessibility — `focusBehavior`

Enable automatic focus management after SPA navigation:

```javascript
NoJS.config({ router: { focusBehavior: 'auto' } });
```

When `'auto'`, focus moves to the first suitable target in this order: `[autofocus]` → `[tabindex="-1"]` → `h1` → outlet element. Default is `'none'` (no change to focus).

### Hash Mode Warning

Enabling `useHash: true` logs a console warning about SEO impact (hash URLs are not indexed by search engines). Silence it with:

```javascript
NoJS.config({ router: { useHash: true, suppressHashWarning: true } });
```

### SPA Deployment Fallback

History mode requires the server to return `index.html` for all routes. Common configs:

```nginx
# nginx
location / { try_files $uri $uri/ /index.html; }
```

```apache
# Apache .htaccess
RewriteRule ^ index.html [L]
```

```
# Netlify _redirects
/*  /index.html  200
```

```json
// Vercel vercel.json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

---

## Head Management (Body Directives)

Priority 20 directives placed on `<div hidden>` in the page body. Update `<head>` elements reactively when surrounding state changes. Use for non-routing pages (product pages, landing pages without a router). For SPA routing use route head attributes on `<template route>` instead.

### `page-title`

Updates `document.title` reactively.

**Syntax:** `<div hidden page-title="expression"></div>`

```html
<div state='{"product": {"name": "Sneaker X"}}'>
  <div hidden page-title="product.name + ' | My Store'"></div>
  <h1 bind="product.name"></h1>
</div>
```

### `page-description`

Creates or updates `<meta name="description" content="...">` in `<head>`.

**Syntax:** `<div hidden page-description="expression"></div>`

```html
<div hidden page-description="product.description"></div>
```

### `page-canonical`

Creates or updates `<link rel="canonical" href="...">` in `<head>`.

**Syntax:** `<div hidden page-canonical="expression"></div>`

```html
<div hidden page-canonical="'/products/' + product.slug"></div>
```

### `page-jsonld`

Creates or updates `<script type="application/ld+json" data-nojs>` in `<head>`. Write the JSON template as the **element body** with `{placeholder}` expressions.

**Syntax:** `<div hidden page-jsonld>{ "name": "{product.name}" }</div>`

```html
<div hidden page-jsonld>
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "{product.name}",
    "offers": { "@type": "Offer", "price": "{product.price}" }
  }
</div>
```

> Note: `{placeholder}` expressions skip JSON structural braces (only top-level `{key}` patterns matching a variable name are interpolated). The `data-nojs` marker distinguishes this tag from hand-written JSON-LD blocks.

---

## Animation

Enter/leave animations and CSS transitions. No.JS ships with built-in CSS animation names.

### `animate`

Apply a CSS animation on element entry.

**Syntax:** `<element animate="animationName">`

```html
<div if="visible" animate="fadeIn">Content</div>
```

### `animate-enter`

CSS animation for entering the DOM.

**Syntax:** `<element animate-enter="slideInRight">`

### `animate-leave`

CSS animation for leaving the DOM.

**Syntax:** `<element animate-leave="slideOutLeft">`

```html
<div if="visible"
     animate-enter="slideInRight"
     animate-leave="slideOutLeft"
     animate-duration="300">
  Content
</div>
```

### `animate-duration`

Animation duration in milliseconds.

**Syntax:** `<element animate="fadeIn" animate-duration="300">`

### `animate-stagger`

Stagger delay between animated list items (milliseconds).

**Syntax:** `<element each="item in items" animate="fadeIn" animate-stagger="50">`

Adds an incremental delay between each item in a loop animation.

```html
<div each="item in items"
     template="itemTpl"
     animate-enter="fadeInUp"
     animate-leave="fadeOutDown"
     animate-stagger="50">
</div>
```

### `transition`

Apply CSS transition classes for route/conditional changes. Follows a convention similar to Vue's transition system.

**Syntax:** `<element if="condition" transition="name">`

No.JS adds/removes these classes during the transition:

| Class | When |
|-------|------|
| `{name}-enter` | Start state of enter |
| `{name}-enter-active` | Active state of enter |
| `{name}-enter-to` | End state of enter |
| `{name}-leave` | Start state of leave |
| `{name}-leave-active` | Active state of leave |
| `{name}-leave-to` | End state of leave |

```html
<div if="show" transition="fade">Content</div>
```

```css
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
```

### Built-in Animation Names

No.JS ships with these CSS animations: `fadeIn`, `fadeOut`, `slideInLeft`, `slideInRight`, `slideInUp`, `slideInDown`, `slideOutLeft`, `slideOutRight`, `slideOutUp`, `slideOutDown`, `zoomIn`, `zoomOut`, `bounceIn`, `flipIn`

---

## Drag and Drop

Declarative drag-and-drop system with sortable lists and multi-select.

### `drag`

Make an element draggable.

**Syntax:** `<element drag="expression">`

The expression value is the data being dragged, available as `$drag` in drop expressions.

**Attributes:**

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `drag` | expression | required | The value being dragged |
| `drag-type` | string | `"default"` | Named type -- only matching `drop-accept` zones respond |
| `drag-effect` | string | `"move"` | `"copy"`, `"move"`, `"link"` -- maps to `dataTransfer.effectAllowed` |
| `drag-handle` | CSS selector | -- | Restricts grab area to a child element |
| `drag-image` | CSS selector or `"none"` | -- | Custom drag ghost element |
| `drag-image-offset` | `"x,y"` | `"0,0"` | Pixel offset for custom drag image |
| `drag-disabled` | expression | `false` | When truthy, disables dragging |
| `drag-class` | string | `"nojs-dragging"` | Class added while dragging |
| `drag-ghost-class` | string | -- | Class added to the drag image element |
| `drag-axis` | `"x"` or `"y"` | -- | Constrain drag direction. Sets `touch-action: pan-y` (x) or `pan-x` (y) |
| `drag-group` | string | -- | Group name for multi-select |

```html
<!-- Basic draggable -->
<div drag="item">Drag me</div>

<!-- With type and handle -->
<div drag="task" drag-type="task" drag-handle=".grip">
  <span class="grip">&#x2801;&#x2801;</span>
  <span bind="task.name"></span>
</div>

<!-- Conditionally disabled -->
<div drag="item" drag-disabled="isLocked">Locked item</div>
```

### `drop`

Make an element a drop zone.

**Syntax:** `<element drop="expression">`

The `drop` expression executes when an item is dropped. Use `$drag` to access the dragged value.

**Attributes:**

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `drop` | statement | required | Expression executed on drop |
| `drop-accept` | string | `"default"` | Accepted `drag-type`(s), comma-separated. `"*"` for any |
| `drop-effect` | string | `"move"` | `"copy"`, `"move"`, `"link"` |
| `drop-class` | string | `"nojs-drag-over"` | Class added when valid item hovers |
| `drop-reject-class` | string | `"nojs-drop-reject"` | Class when item is rejected |
| `drop-disabled` | expression | `false` | When truthy, disables dropping |
| `drop-max` | expression | Infinity | Max items the zone accepts |
| `drop-sort` | string | -- | `"vertical"`, `"horizontal"`, or `"grid"` -- enables sortable reorder |
| `drop-placeholder` | template ID or `"auto"` | -- | Shows placeholder at insertion point |
| `drop-placeholder-class` | string | `"nojs-drop-placeholder"` | Class for the placeholder |
| `drop-settle-class` | string | `"nojs-drop-settle"` | CSS class for settle animation |
| `drop-empty-class` | string | `"nojs-drag-list-empty"` | CSS class for empty state |

```html
<div drop="items = [...items, $drag]" drop-accept="task">
  Drop tasks here
</div>

<!-- With sortable positioning -->
<div drop="items.splice($dropIndex, 0, $drag)"
     drop-accept="task"
     drop-sort="vertical"
     drop-placeholder="auto">
</div>
```

### `drag-list`

High-level shorthand for sortable lists bound to state arrays. Combines `each` + `drag` + `drop`.

**Syntax:** `<element drag-list="arrayPath" template="tplId" drag-list-key="keyProp">`

**Attributes:**

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `drag-list` | path | required | Path to array in state |
| `template` | template ID | -- | Template for each item |
| `drag-list-key` | property name | -- | Unique key per item for stable identity |
| `drag-list-item` | variable name | `"item"` | Loop variable name in template |
| `drop-sort` | string | `"vertical"` | `"vertical"`, `"horizontal"`, or `"grid"` |
| `drop-accept` | string | self | Types accepted |
| `drag-list-copy` | boolean | -- | Copy items instead of moving |
| `drag-list-remove` | boolean | -- | Remove items when dragged out |
| `drag-disabled` | expression | `false` | Disables dragging from this list |
| `drop-disabled` | expression | `false` | Disables dropping into this list |
| `drop-max` | expression | Infinity | Max items allowed |
| `drop-settle-class` | string | `"nojs-drop-settle"` | CSS class for settle animation |
| `drop-empty-class` | string | `"nojs-drag-list-empty"` | CSS class for empty state |
| `drop-placeholder` | template ID or `"auto"` | -- | Placeholder at drop position |

```html
<!-- Basic sortable list -->
<div state="{ tasks: [{id:1,text:'A'},{id:2,text:'B'}] }">
  <div drag-list="tasks" template="task-tpl" drag-list-key="id" drop-sort="vertical"></div>
</div>
<template id="task-tpl">
  <div class="card" bind="item.text"></div>
</template>
```

**Kanban (two-list transfer):**

```html
<div state="{ todo: [...], done: [] }">
  <div drag-list="todo" template="task-tpl" drag-list-key="id"
       drag-type="task" drop-accept="task" drop-sort="vertical" drag-list-remove
       on:reorder="console.log('reordered')">
  </div>
  <div drag-list="done" template="task-tpl" drag-list-key="id"
       drag-type="task" drop-accept="task" drop-sort="vertical" drag-list-remove
       on:receive="console.log('received', $event.detail.item)">
  </div>
</div>
```

**Drag-List Events:**

| Event | `$event.detail` | Description |
|-------|-----------------|-------------|
| `on:reorder` | `{ list, item, from, to }` | Item reordered within same list |
| `on:receive` | `{ list, item, from, fromList }` | Item received from another list |
| `on:remove` | `{ list, item, index }` | Item removed (dragged out) |

### `drag-multiple`

Enable lasso/multi-select on children.

**Syntax:** `<element drag drag-multiple drag-group="groupName">`

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `drag-multiple` | boolean | -- | Enables click-to-select |
| `drag-multiple-class` | string | `"nojs-selected"` | Class added to selected items |
| `drag-group` | string | required | Group name -- all selected items move together |

Interactions:
- Click selects a single item (replaces previous selection)
- Ctrl/Cmd+Click adds to selection
- Escape clears the selection
- When dragging a selected item, `$drag` becomes an array of all selected items

### Implicit Drop Variables

Available inside `drop` expressions:

| Variable | Type | Description |
|----------|------|-------------|
| `$drag` | any | The dragged value. Array if multi-select |
| `$dragType` | string | The `drag-type` of the item |
| `$dragEffect` | string | The `drag-effect` |
| `$dropIndex` | number | Insertion index within the drop zone |
| `$source` | object or null | `{ list, index, el }` -- source info |
| `$target` | object or null | `{ list, index, el }` -- target info |

### Automatic CSS Classes

| Class | When applied |
|-------|-------------|
| `.nojs-dragging` | On source element while dragging |
| `.nojs-drag-over` | On drop zone while a valid item hovers |
| `.nojs-drop-reject` | On drop zone when item is rejected |
| `.nojs-drop-placeholder` | On the insertion placeholder |
| `.nojs-selected` | On multi-selected items |
| `.nojs-drop-settle` | Brief settle animation on drop |
| `.nojs-drag-list-empty` | On a `drag-list` when it has no items |

### Accessibility

Automatic ARIA attributes: `draggable="true"`, `aria-grabbed`, `aria-dropeffect`, `role="listbox"` on containers, `role="option"` on items, `tabindex="0"` for keyboard access. Keyboard: Space to grab, Escape to cancel, Arrow keys to navigate, Enter to drop.

---

## Internationalization

Translation directives for multi-language apps.

### `t`

Translate element content using an i18n key.

**Syntax:** `<element t="namespace.key">`

```html
<h1 t="landing.hero.title"></h1>
<a route="/" t="nav.home"></a>
```

### `t-*`

Pass parameters to translation strings.

**Syntax:** `<element t="key" t-paramName="expression">`

```html
<!-- Translation: "Hello, {name}!" -->
<h1 t="greeting" t-name="user.name"></h1>

<!-- Pluralization: "{count} item | {count} items" -->
<span t="items" t-count="cart.items.length"></span>
```

### `t-html`

Render the translation value as sanitized HTML instead of plain text. Companion to `t`.

**Syntax:** `<element t="key" t-html>`

```html
<!-- Translation: "Read our <a href='/terms'>terms</a>" -->
<div t="legal.notice" t-html></div>
```

The output is sanitized via `_sanitizeHtml()` to prevent XSS.

### `i18n-ns`

Set the i18n namespace for an element and its descendants. Triggers loading of the namespace JSON file.

**Syntax:** `<element i18n-ns="namespace">` or `<element i18n-ns>` (auto-derive from route)

```html
<!-- Explicit namespace -->
<div i18n-ns="settings">
  <h2 t="settings.title"></h2>
</div>

<!-- Auto-derive on route-view -->
<main route-view src="templates/" route-index="landing" i18n-ns></main>
```

### i18n Configuration

```html
<script>
  NoJS.i18n({
    defaultLocale: 'en',
    fallbackLocale: 'en',
    locales: {
      en: {
        greeting: 'Hello, {name}!',
        items: '{count} item | {count} items'  // pluralization with |
      },
      'pt-BR': {
        greeting: 'Ola, {name}!',
        items: '{count} item | {count} itens'
      }
    }
  });
</script>
```

**External locale files (flat mode):**

```html
<script>
  NoJS.i18n({
    defaultLocale: 'en',
    loadPath: '/locales/{locale}.json'
  });
</script>
```

**Namespace mode** -- split translations by feature, loaded on demand:

```html
<script>
  NoJS.i18n({
    defaultLocale: 'en',
    loadPath: '/locales/{locale}/{ns}.json',
    ns: ['common']  // namespaces to load at startup
  });
</script>
```

Folder structure:

```text
locales/
  en/
    common.json
    settings.json
    dashboard.json
  pt-BR/
    common.json
    settings.json
    dashboard.json
```

Use `i18n-ns` on elements to trigger namespace loading. On `route-view` with `i18n-ns` (no value), the namespace is auto-derived from the route filename.

**Caching:**

Locale files are cached in memory by default. Disable for development:

```html
<script>
  NoJS.i18n({ cache: false });
</script>
```

**Number & date formatting filters:**

```html
<span bind="price | currency"></span>          <!-- $1,234.56 -->
<span bind="price | currency:'BRL'"></span>    <!-- R$ 1.234,56 -->
<span bind="total | number"></span>            <!-- 1,234.56 -->
<span bind="ratio | percent"></span>           <!-- 85% -->
<span bind="createdAt | date"></span>          <!-- Mar 23, 2026 -->
<span bind="createdAt | date:'long'"></span>   <!-- March 23, 2026 -->
<span bind="createdAt | datetime"></span>      <!-- Mar 23, 2026, 2:30 PM -->
<span bind="updatedAt | relative"></span>      <!-- 2 hours ago -->
```

These filters are locale-aware and use `Intl` APIs under the hood.

**Switch locale at runtime:**

```html
<button on:click="$i18n.locale = 'pt-BR'">Portugues</button>
<span bind="$i18n.locale"></span>
```

**`$i18n` context variable:**

| Property                | Description                      |
|-------------------------|----------------------------------|
| `$i18n.locale`          | Current active locale (get/set)  |
| `$i18n.t(key, params)`  | Translate a key programmatically |

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

Utility directives for API calls and error handling.

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

**Request lifecycle:** `click -> [confirm?] -> [loading] -> [success | error]`

**Events emitted:** `fetch:success` (`{ url, data }`) and `fetch:error` (`{ url, error }`) on the document.

---

## Head Management

Reactive directives that update `<head>` elements (title, meta, canonical, JSON-LD) from the page body. Place on `<div hidden>` host elements. Priority 1.

### `page-title`

Reactively set the document `<title>`. Value is a No.JS expression.

**Syntax:** `<div hidden page-title="expression">`

```html
<div hidden page-title="product.name + ' | My Store'"></div>
<div hidden page-title="'About Us | My Store'"></div>
```

Watches the expression and updates `<title>` whenever the reactive context changes.

### `page-description`

Reactively set `<meta name="description">` in `<head>`. Creates the tag if it doesn't exist.

**Syntax:** `<div hidden page-description="expression">`

```html
<div hidden page-description="product.description"></div>
```

### `page-canonical`

Reactively set `<link rel="canonical">` in `<head>`. Creates the tag if it doesn't exist.

**Syntax:** `<div hidden page-canonical="expression">`

```html
<div hidden page-canonical="'/products/' + product.slug"></div>
```

### `page-jsonld`

Reactively set `<script type="application/ld+json" data-nojs>` in `<head>`. Value is either a No.JS expression that evaluates to an object (JSON.stringify is applied) or a JSON string with `{interpolation}` placeholders in the element's text content.

**Syntax:** `<div hidden page-jsonld>{ JSON template with {placeholders} }</div>`

```html
<div hidden page-jsonld>
  { "@type": "Product", "name": "{product.name}", "price": "{product.price}" }
</div>
```

The `data-nojs` marker on the generated `<script>` tag distinguishes it from hand-written JSON-LD so they can coexist.

> **Note:** `<script>` elements are skipped by `processTree`, so use `<div hidden>` as the host element for all head management directives.

---

## Miscellaneous

### `error-boundary`

Error boundary -- renders fallback template when any error occurs in the subtree. See [Forms and Validation > error-boundary](#error-boundary) above.
