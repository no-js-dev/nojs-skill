# State Directives

Local and global reactive state management. All state is Proxy-backed and changes propagate automatically to bound elements.

## Contents

- [state](#state) -- create local reactive state (priority 0)
- [store](#store) -- define or access global reactive store (priority 0)
- [computed](#computed) -- derived reactive value (priority 2)
- [watch](#watch) -- react to value changes (priority 2)
- [persist](#persist) -- persist state to storage
- [persist-key](#persist-key) -- custom storage key
- [persist-fields](#persist-fields) -- limit persisted fields
- [persist-schema](#persist-schema) -- type-safe restoration of persisted state
- [Mutating Stores from JavaScript](#mutating-stores-from-javascript) -- NoJS.notify() for external changes

---

## Syntax Reference

| Directive | Syntax | Description |
|-----------|--------|-------------|
| `state` | `state="{ key: value }"` | Create local reactive state |
| `store` | `store="name" value="{...}"` | Define/access global store |
| `computed` | `computed="name" expr="expression"` | Derived reactive value |
| `watch` | `watch="property" on:change="handler"` | React to value changes |
| `persist` | `persist="localStorage"` | Persist state to storage |
| `persist-key` | `persist-key="key"` | Storage key for persistence |
| `persist-fields` | `persist-fields="field1,field2"` | Comma-separated fields to persist |
| `persist-schema` | `persist-schema` | Validate restored keys against initial state |

---

## `state`

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

### Edge Cases

- State must be a valid JavaScript object expression. Arrays and nested objects are supported.
- State is scoped to the declaring element and its descendants. Sibling elements cannot access it.
- Multiple `state` directives can be nested -- inner state shadows outer state with the same key names.
- State initialization runs once when the directive is first processed. Re-evaluation does not occur on DOM re-insertion.

### Complete Example -- Nested State Scoping

```html
<div state="{ theme: 'dark' }">
  <p>Theme: <span bind="theme"></span></p>

  <div state="{ count: 0 }">
    <!-- Can access both own state and parent state -->
    <p>Count: <span bind="count"></span>, Theme: <span bind="theme"></span></p>
    <button on:click="count++">+1</button>
  </div>
</div>
```

---

## `store`

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

### Edge Cases

- Store names must be unique. Attempting to redefine a store that was created via `NoJS.config()` is silently ignored.
- Store values are deeply reactive -- nested property changes propagate automatically.
- Stores persist across route navigations (they are global, not scoped to any element).

### Complete Example -- Auth Store

```html
<!-- Define auth store -->
<div store="auth" value="{ user: null, token: null }"></div>

<!-- Login form writes to store -->
<form post="/api/login" then="$store.auth.user = result.user; $store.auth.token = result.token">
  <input model="email" type="email" placeholder="Email" />
  <input model="password" type="password" placeholder="Password" />
  <button>Login</button>
</form>

<!-- Conditional display based on store -->
<div if="$store.auth.user">
  <p>Welcome, <span bind="$store.auth.user.name"></span>!</p>
  <button on:click="$store.auth.user = null; $store.auth.token = null">Logout</button>
</div>
<div if="!$store.auth.user">
  <p>Please log in.</p>
</div>
```

---

## `computed`

Derived reactive value, recomputed when dependencies change.

**Syntax:** `<element computed="name" expr="expression">`

```html
<div state="{ price: 100, quantity: 2, taxRate: 0.1 }">
  <div computed="subtotal" expr="price * quantity"></div>
  <div computed="tax" expr="subtotal * taxRate"></div>
  <div computed="total" expr="subtotal + tax"></div>

  <p>Subtotal: $<span bind="subtotal"></span></p>
  <p>Tax: $<span bind="tax"></span></p>
  <p>Total: $<span bind="total"></span></p>
  <input type="number" model="quantity" />
</div>
```

### Edge Cases

- Computed values can depend on other computed values (as shown above with `total` depending on `subtotal`).
- The `computed` element itself is not visually rendered -- it only registers the computed property in the context.
- Circular dependencies between computed values will cause an infinite loop.

### Complete Example -- Shopping Cart

```html
<div state="{ items: [{name: 'Apple', price: 1.5, qty: 3}, {name: 'Banana', price: 0.75, qty: 5}] }">
  <div computed="totalItems" expr="items.reduce((sum, i) => sum + i.qty, 0)"></div>
  <div computed="totalPrice" expr="items.reduce((sum, i) => sum + i.price * i.qty, 0)"></div>

  <div each="item in items" key="item.name">
    <span bind="item.name"></span>: <span bind="item.qty"></span> x $<span bind="item.price"></span>
  </div>

  <p>Total items: <span bind="totalItems"></span></p>
  <p>Total price: $<span bind="totalPrice"></span></p>
</div>
```

---

## `watch`

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

### Edge Cases

- The `on:change` handler fires asynchronously after the state update completes.
- `$old` and `$new` are only available inside the `on:change` handler, not in other expressions.
- Watching a nested property path (e.g. `watch="user.name"`) is not supported -- watch the top-level property instead.

### Complete Example -- Debounced Search

```html
<div state="{ search: '', results: [] }"
     watch="search"
     on:change="console.log('Searching for:', $new)">
  <input model="search" placeholder="Type to search..." />
  <div get="/api/search?q={search}" as="results" debounce="300">
    <p each="result in results" bind="result.title"></p>
    <p show="results.length === 0">No results found.</p>
  </div>
</div>
```

---

## `persist`

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

---

## `persist-key`

**Required** storage key for persisted state. If omitted, persistence is skipped and a warning is logged.

**Syntax:** `<element state="{...}" persist="localStorage" persist-key="my-key">`

---

## `persist-fields`

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

---

## `persist-schema`

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

### Edge Cases

- Without `persist-schema`, all keys from storage are restored, even if they no longer exist in the initial state object.
- Type mismatches (e.g. stored string where number is expected) log a console warning but do not throw.
- `persist-schema` has no effect without `persist` and `persist-key`.

### Complete Example -- Persisted Settings

```html
<div state="{ theme: 'light', fontSize: 14, notifications: true, tempCache: {} }"
     persist="localStorage"
     persist-key="user-settings"
     persist-fields="theme,fontSize,notifications"
     persist-schema>

  <label>Theme:
    <select model="theme">
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>

  <label>Font size:
    <input type="range" model="fontSize" min="10" max="24" />
    <span bind="fontSize + 'px'"></span>
  </label>

  <label>
    <input type="checkbox" model="notifications" /> Enable notifications
  </label>

  <p>Settings are saved automatically and restored on page reload.</p>
</div>
```

---

## Mutating Stores from JavaScript

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

### When `notify()` Is Required

| Context | `notify()` needed? |
|---------|-------------------|
| `on:click` / `on:submit` / any `on:*` handler | No |
| `bind` / `computed` / `watch` expressions | No |
| `<script>` block modifying `NoJS.store.*` | Yes |
| Interceptor callback | Yes |
| `setTimeout` / `setInterval` callback | Yes |
| Third-party library callback | Yes |
