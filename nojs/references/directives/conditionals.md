# Conditional Directives

Conditional rendering and visibility control. Structural conditionals (`if`, `else-if`, `else`, `switch`) have priority 10. Visibility directives (`show`, `hide`) have priority 20.

## Contents

- [if](#if) -- conditionally render element
- [else-if](#else-if) -- chained conditional
- [else](#else) -- fallback block
- [then](#then) -- template to render when truthy
- [show](#show) -- toggle visibility via CSS display
- [hide](#hide) -- inverse of show
- [if vs show](#if-vs-show) -- comparison table
- [switch](#switch) -- switch/case rendering
- [case](#case) -- case match inside switch
- [default](#default) -- default case inside switch

---

## Syntax Reference

| Directive | Syntax | Description |
|-----------|--------|-------------|
| `if` | `if="condition"` | Conditionally render element (adds/removes from DOM) |
| `else-if` | `else-if="condition"` | Chained conditional after `if` |
| `else` | `else` or `else="templateId"` | Fallback block |
| `then` | `then="templateId"` | Template to render when condition is true |
| `show` | `show="condition"` | Toggle CSS `display` (element stays in DOM) |
| `hide` | `hide="condition"` | Inverse of `show` |
| `switch` | `switch="expression"` | Switch/case rendering |
| `case` | `case="'value'"` | Case match inside `switch` |
| `default` | `default` | Default case inside `switch` |

---

## `if`

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

### Edge Cases

- When `if` is false, the element and all its children are removed from the DOM entirely. Event listeners and component state are lost.
- When `if` becomes true again, the element is re-created from scratch (directives re-initialize).
- Expressions that evaluate to `0`, `""`, `null`, `undefined`, or `false` are all falsy.

### Complete Example

```html
<div state="{ status: 'loading' }">
  <div if="status === 'loading'">
    <p>Loading your data...</p>
  </div>
  <div if="status === 'ready'">
    <p>Data loaded successfully!</p>
  </div>

  <button on:click="status = 'ready'">Simulate Load</button>
  <button on:click="status = 'loading'">Reset</button>
</div>
```

---

## `else-if`

Chained conditional following an `if`.

**Syntax:** `<element else-if="condition">` or `<element else-if="condition" then="templateId">`

Must follow an element with `if` or another `else-if`.

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `else-if` | Condition expression |
| `then` | Template ID to render when this condition is true |

```html
<div if="status === 'loading'" then="loadingTpl"></div>
<div else-if="status === 'error'" then="errorTpl"></div>
<div else-if="status === 'empty'" then="emptyTpl"></div>
<div else then="contentTpl"></div>
```

### Edge Cases

- `else-if` must be an immediate sibling of the preceding `if` or `else-if` element. Intervening elements break the chain.
- An orphan `else-if` (with no preceding `if`) logs a console warning.

---

## `else`

Fallback branch for conditionals (element placed after `if`/`else-if`) **or** empty-state fallback for loops (companion attribute on the loop element itself). References a template ID.

**Syntax:** `<element else>` or `<element else="templateId">`

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `else` | Template ID rendered when the loop's list is empty or null/undefined/non-array (on loops) |
| `then` | Template ID to render as fallback content |

**Usage with conditionals:** follows an `if` or `else-if` element as the fallback branch.

**Usage with loops:** see the [Loops](loops.md) reference for the companion `else` attribute on loop elements.

> **Breaking change (v1.15):** The sibling else pattern (`<li else>` placed after a loop element) has been removed. Use the companion attribute `else="templateId"` on the loop element instead.

---

## `then`

Template to render when condition is truthy.

**Syntax:** `<element if="condition" then="templateId">`

References a `<template id="...">` to clone and render when the condition is true.

---

## `show`

Toggle element visibility via CSS `display`. Element stays in DOM.

**Syntax:** `<element show="condition">`

Better than `if` for frequently toggled content because it preserves element state.

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `show` | Condition expression |
| `animate-enter` | CSS class applied when element becomes visible |
| `animate-leave` | CSS class applied when element is hidden |
| `animate` | Shorthand for `animate-enter` (used when entering) |
| `transition` | CSS transition class applied on both enter and leave |
| `animate-duration` | Duration in ms to wait before removing animation classes |

```html
<div show="user.isLoggedIn">Welcome!</div>
<button show="!editing" on:click="editing = true">Edit</button>
<button show="editing" on:click="editing = false">Save</button>

<!-- With animations -->
<div show="isVisible" animate-enter="fadeIn" animate-leave="fadeOut" animate-duration="300">
  Animated content
</div>
```

### Edge Cases

- `show` sets `display: none` when the condition is falsy. The original `display` value is restored when the condition becomes truthy.
- The element and its children remain in the DOM and retain their state (form values, scroll position, etc.).
- Animation attributes on `show` are optional. Without them, the visibility toggles instantly.

### Complete Example

```html
<div state="{ showDetails: false, showToast: false }">
  <button on:click="showDetails = !showDetails">
    <span bind="showDetails ? 'Hide' : 'Show'"></span> Details
  </button>
  <div show="showDetails">
    <p>These are the details that toggle visibility.</p>
  </div>

  <button on:click="showToast = true">Show Toast</button>
  <div show="showToast"
       animate-enter="fadeInUp"
       animate-leave="fadeOutDown"
       animate-duration="300"
       class="toast">
    <p>Operation completed!</p>
    <button on:click="showToast = false">Dismiss</button>
  </div>
</div>
```

---

## `hide`

Inverse of `show` -- hides element when condition is true.

**Syntax:** `<element hide="condition">`

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `hide` | Condition expression (hides when truthy) |
| `animate-enter` | CSS class applied when element becomes visible (condition turns false) |
| `animate-leave` | CSS class applied when element is hidden (condition turns true) |
| `animate` | Shorthand for `animate-enter` |
| `transition` | CSS transition class applied on both enter and leave |
| `animate-duration` | Duration in ms to wait before removing animation classes |

```html
<div hide="user.isLoggedIn">Please log in.</div>

<!-- With transition -->
<div hide="collapsed" transition="slide" animate-duration="200">
  Collapsible content
</div>
```

---

## `if` vs `show`

| | `if` | `show` |
|--|------|--------|
| Mechanism | Adds/removes DOM elements | Toggles CSS `display` |
| Best for | Rarely toggled content | Frequently toggled content |
| Preserves state | No (re-creates) | Yes |

---

## `switch`

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

### Complete Example

```html
<div state="{ status: 'pending' }">
  <select model="status">
    <option value="pending">Pending</option>
    <option value="active">Active</option>
    <option value="suspended">Suspended</option>
  </select>

  <div switch="status">
    <div case="'pending'">
      <span class="badge warn">Awaiting approval</span>
    </div>
    <div case="'active'">
      <span class="badge success">Account active</span>
    </div>
    <div case="'suspended'">
      <span class="badge error">Account suspended</span>
    </div>
    <div default>
      <span class="badge">Unknown status</span>
    </div>
  </div>
</div>
```

---

## `case`

Case match inside a `switch` block.

**Syntax:** `<element case="'value'">` or `<element case="'value'" then="templateId">`

Supports multi-value matching with comma separation.

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `case` | Value expression to match against the `switch` expression |
| `then` | Template ID to render when this case matches |

```html
<!-- Single value -->
<span case="'pending'" class="badge warn">Pending</span>

<!-- Multi-value -->
<div case="'admin','superadmin'" then="adminPanel"></div>
```

### Edge Cases

- Multi-value matching uses comma separation inside the attribute value, not multiple `case` attributes.
- Values are compared using loose equality (`==`), so `case="'1'"` matches the number `1`.

---

## `default`

Default case inside a `switch` block. Renders when no `case` matches.

**Syntax:** `<element default>` or `<element default then="templateId">`

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `default` | Marks this child as the default case |
| `then` | Template ID to render as default content |

```html
<div switch="order.status">
  <span case="'pending'">Pending</span>
  <span case="'shipped'">Shipped</span>
  <span default>Unknown</span>
</div>
```
