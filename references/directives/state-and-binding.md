# State, Binding and Styling Directives

Local and global reactive state, one-way/two-way data binding, and dynamic CSS classes/styles.

## Contents

- [State Management](#state-management) -- local and global reactive state
  - [state](#state) -- create local reactive state (priority 0)
  - [store](#store) -- define or access global reactive store (priority 0)
  - [computed](#computed) -- derived reactive value (priority 2)
  - [watch](#watch) -- react to value changes (priority 2)
  - [persist](#persist) -- persist state to storage
  - [persist-key](#persist-key) -- custom storage key
  - [persist-fields](#persist-fields) -- limit persisted fields
  - [persist-schema](#persist-schema) -- type-safe restoration of persisted state
  - [Mutating Stores from JavaScript](#mutating-stores-from-javascript) -- NoJS.notify() for external changes
- [Rendering and Binding](#rendering-and-binding) -- one-way and two-way data binding (priority 20)
  - [bind](#bind) -- one-way text binding
  - [bind-html](#bind-html) -- sanitized HTML binding
  - [bind-*](#bind-1) -- bind any HTML attribute
  - [model](#model) -- two-way input binding
- [Styling](#styling) -- dynamic CSS classes and inline styles (priority 20)
  - [class-*](#class-1) -- toggle CSS class by condition
  - [class-map](#class-map) -- apply multiple classes from object
  - [class-list](#class-list) -- apply classes from array
  - [style-*](#style-1) -- set inline style dynamically
  - [style-map](#style-map) -- apply multiple inline styles from object

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

Executes the `on:change` handler whenever the watched property changes. The handler receives two special variables: `$old` (previous value) and `$new` (current value).

```html
<div state="{ search: '' }"
     watch="search"
     on:change="console.log('Changed from', $old, 'to', $new)">
  <input model="search" />
</div>
```

```html
<div state="{ count: 0 }"
     watch="count"
     on:change="$new > 10 ? alert('Limit reached!') : null">
  <button on:click="count++">+1</button>
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

**Required** storage key for persisted state. If omitted, persistence is skipped and a warning is logged.

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

> **Sensitive key warning:** State keys whose names contain `token`, `password`, `secret`, `key`, `auth`, `credential`, or `session` trigger a console warning when persisted, suggesting the use of `persist-fields` to exclude them.

### `persist-schema`

Enable type-safe restoration of persisted state. When present, restoring ignores keys not in the initial state and warns on type mismatches.

**Syntax:** `<element state="{...}" persist="localStorage" persist-key="key" persist-schema>`

```html
<div state="{ count: 0, name: 'World' }"
     persist="localStorage"
     persist-key="myState"
     persist-schema>
  <!-- Unknown keys in storage are ignored; type mismatches log warnings -->
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

> **Debug mode:** When `NoJS.config({ debug: true })` or `devtools` is enabled, dynamic expressions (non-literal strings) trigger a console warning reminding you to ensure the value is trusted.

```html
<div bind-html="article.content"></div>
<div bind-html="`<em>${user.bio}</em>`"></div>
```

### `bind-*`

Bind any HTML attribute to an expression.

**Syntax:** `<element bind-attr="expression">`

Works with any attribute: `src`, `href`, `alt`, `title`, `disabled`, `checked`, `data-*`, etc.

**Two-way `bind-value`:** On `<input>`, `<textarea>`, and `<select>`, `bind-value` is **two-way** -- it also attaches an `input` event listener that writes the element's value back to the expression. For `type="number"` inputs, the value is coerced to `Number`.

**Boolean attributes:** The following attributes receive special boolean handling -- truthy values set the attribute (empty string), falsy values remove it, and the corresponding DOM property is also toggled:
`disabled`, `readonly`, `checked`, `selected`, `hidden`, `required`

**URL sanitization:** For URL-bearing attributes (`href`, `src`, `action`, `formaction`, `poster`, `data`), `javascript:` and `vbscript:` URIs are blocked (replaced with `#`). Non-image `data:` URIs are also blocked; `data:image/svg+xml` URIs are sanitized by stripping scripts and event handlers.

```html
<img bind-src="user.avatarUrl" bind-alt="user.name + ' avatar'" />
<a bind-href="'/users/' + user.id">Profile</a>
<button bind-disabled="!form.isValid">Submit</button>
<input type="checkbox" bind-checked="user.isActive" />
<div bind-data-id="user.id" bind-data-role="user.role"></div>

<!-- Two-way bind-value -->
<input bind-value="username" />
```

### `model`

Two-way binding for input elements.

**Syntax:** `<input model="property">`

Creates automatic two-way data binding between a form input and a state property. Works with text inputs, number inputs, range inputs, checkboxes, radio buttons, selects, and textareas.

| Input type | Value coercion | Event |
|------------|---------------|-------|
| `text`, `textarea` | String | `input` |
| `number`, `range` | `Number()` | `input` |
| `checkbox` | Boolean (`el.checked`) | `change` |
| `radio` | String (`el.value`) | `change` |
| `select` | String | `change` |

```html
<div state="{ name: '', age: 0, agreed: false, role: 'user', volume: 50 }">
  <input type="text" model="name" />
  <input type="number" model="age" />
  <input type="range" model="volume" min="0" max="100" />
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

## Styling

Dynamic CSS classes and inline styles.

### `class-*`

Toggle a CSS class based on a condition.

**Syntax:** `<element class-className="condition">`

> **i18n reactivity:** Expressions referencing `$i18n` or `NoJS.locale` also re-evaluate on locale changes.

```html
<div class-active="isActive"
     class-disabled="!isEnabled"
     class-highlighted="score > 90">
</div>

<!-- Re-evaluates when locale changes -->
<div class-rtl="$i18n.dir === 'rtl'"></div>
```

### `class-map`

Apply multiple CSS classes from an object expression.

**Syntax:** `<element class-map="{ className: condition }">`

Keys can be **space-separated** class names -- all classes in the key are toggled together:

```html
<div class-map="{ active: isActive, 'text-bold': isBold, error: hasError }"></div>

<!-- Space-separated keys: toggle multiple Tailwind classes at once -->
<div class-map="{ 'bg-sky-500 text-white font-bold': isSelected }"></div>
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
