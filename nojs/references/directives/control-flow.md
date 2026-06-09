# Control Flow Directives

Conditional rendering, visibility control, and list iteration.

## Contents

- [Conditionals](#conditionals) -- conditional rendering and visibility (priority 10 for structural, priority 20 for visibility)
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
- [Loops](#loops) -- list rendering with iteration, filtering, sorting, pagination (priority 10)
  - [foreach](#foreach) -- primary iteration directive
  - [each](#each) -- alias for foreach
  - [for](#for) -- alias for foreach
  - [template](#template) -- template ID for each iteration
  - [index](#index) -- custom index variable name
  - [key](#key) -- unique key for DOM diffing
  - [filter](#filter) -- filter expression
  - [sort](#sort) -- sort property
  - [limit](#limit) -- max items to render
  - [offset](#offset) -- items to skip
  - [Loop Context Variables](#loop-context-variables) -- $index, $count, $first, $last, $even, $odd
  - [Nested Loops](#nested-loops) -- parent scope access
  - [Empty-List Fallback (else)](#empty-list-fallback-else) -- companion attribute and sibling element patterns

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

### `else`

Fallback block after `if`, `else-if`, **or a loop element**. Can reference a template ID or contain inline content.

**Syntax:** `<element else>` or `<element else="templateId">`

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `else` | Optional template ID for empty list fallback (on loops) |
| `then` | Template ID to render as fallback content |

**Usage with conditionals:** follows an `if` or `else-if` element as the fallback branch.

**Usage with loops (two patterns):**

1. **Companion attribute** -- `else="templateId"` on the loop element itself. References a `<template>` to show when the array is empty, null, or undefined:
   ```html
   <li each="item in items" else="emptyTpl">...</li>
   <template id="emptyTpl"><li>No items found.</li></template>
   ```

2. **Sibling element** -- a separate element with `else` placed immediately after the loop element. Shows inline content when the array is empty, null, or undefined. Reactively hides when items exist:
   ```html
   <li each="item in items" bind="item.name"></li>
   <li else>No items found.</li>
   ```

Both patterns are reactive: the else content appears/disappears as the array changes.

### `then`

Template to render when condition is truthy.

**Syntax:** `<element if="condition" then="templateId">`

References a `<template id="...">` to clone and render when the condition is true.

### `show`

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

### `hide`

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

### `default`

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

---

## Loops

List rendering with iteration, filtering, sorting, and pagination.

`foreach` is the **primary** iteration directive. `each` and `for` are **aliases** -- all three share the same handler and support identical features.

Loops use a **self-repeating pattern**: the element with the loop directive IS the repeating template. At runtime, the original element is removed from the DOM and replaced by comment markers (`<!--foreach-->` / `<!--/foreach-->`). Clones are inserted between the markers as siblings.

### `foreach`

Iterate over an array with full support for filtering, sorting, pagination, and custom variable names.

**Syntax:** `<element foreach="item in items">`

The `in` keyword separates the loop variable from the source array expression. The element itself is the template that gets cloned for each item.

> **Deprecated:** The legacy syntax `<element foreach="item" from="list">` still works but logs a deprecation warning. Use the `item in list` syntax instead.

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `foreach` | `"variable in arrayExpression"` |
| `index` | Variable name for the index (default: `$index`) |
| `key` | Unique key expression for DOM diffing |
| `else` | Template ID to render when array is empty (companion attribute) |
| `template` | Template ID to clone for each iteration |
| `filter` | Expression to filter items |
| `sort` | Property path to sort by (prefix with `-` for descending) |
| `limit` | Maximum number of items to render |
| `offset` | Number of items to skip |
| `animate-enter` | CSS class for entering items |
| `animate-leave` | CSS class for leaving items |
| `animate` | Shorthand for `animate-enter` |
| `animate-stagger` | Delay in ms between each item's animation |
| `animate-duration` | Duration in ms for enter/leave animations |

The element with `foreach` IS the repeating template -- its children are part of each clone:

```html
<!-- Self-repeating: the <li> is cloned for each todo -->
<ul>
  <li foreach="todo in todos" bind="todo.text"></li>
</ul>

<!-- With companion attributes -->
<ul>
  <li foreach="item in menuItems"
      index="idx"
      key="item.id"
      filter="item.active"
      sort="item.order"
      limit="10"
      offset="0"
      else="noItems">
    <span bind="idx + 1"></span> - <span bind="item.label"></span>
  </li>
</ul>

<!-- With sibling else for empty-list fallback -->
<ul>
  <li foreach="item in menuItems" key="item.id" bind="item.label"></li>
  <li else>No menu items available.</li>
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

Alias for `foreach`. Identical handler, identical behavior. Self-repeating pattern -- the element with `each` is cloned for each item.

**Syntax:** `<element each="item in items">`

```html
<ul>
  <li each="user in users" key="user.id">
    <span bind="user.name"></span>
  </li>
  <li else>No users found.</li>
</ul>
```

All `foreach` attributes (`filter`, `sort`, `limit`, `offset`, `key`, `else`, `template`, `index`, `animate-*`) work on `each`.

### `for`

Alias for `foreach`. Identical handler, identical behavior. Self-repeating pattern -- the element with `for` is cloned for each item.

**Syntax:** `<element for="item in items">`

```html
<ul>
  <li for="task in tasks" key="task.id" filter="!task.done">
    <span bind="task.title"></span>
  </li>
  <li else>No pending tasks.</li>
</ul>
```

All `foreach` attributes (`filter`, `sort`, `limit`, `offset`, `key`, `else`, `template`, `index`, `animate-*`) work on `for`.

### `template`

Template ID to clone for each iteration. When set, the referenced `<template>` content is used instead of the element's own children.

**Syntax:** `<element foreach="item in items" template="templateId">`

Works with `foreach`, `each`, and `for`.

### `index`

Custom variable name for the current index.

**Syntax:** `<element foreach="item in items" index="i">`

Default loop index variable is `$index`. When a custom `index` name is set (e.g. `index="i"`), **both** the custom name (`i`) and `$index` are available inside the loop body.

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

Inside any loop (`foreach`, `each`, or `for`), these variables are automatically available in the cloned elements:

| Variable | Description |
|----------|-------------|
| `$index` | Current index (0-based) |
| `$count` | Total number of items |
| `$first` | `true` if first item |
| `$last` | `true` if last item |
| `$even` | `true` if index is even |
| `$odd` | `true` if index is odd |

```html
<div each="item in items"
     class-first="$first" class-last="$last" class-striped="$odd">
  <span bind="($index + 1) + ' of ' + $count"></span>
  <span bind="item.name"></span>
</div>
```

### Nested Loops

Child loops can access parent scope variables. Each loop element is self-repeating -- the inner loop produces sibling clones inside each outer clone:

```html
<div each="category in categories">
  <h3 bind="category.name"></h3>
  <p each="product in category.products">
    <span bind="category.name"></span>: <span bind="product.name"></span>
  </p>
  <p else>No products in this category.</p>
</div>
```

### Empty-List Fallback (else)

When a loop's source array is empty, null, or undefined, an `else` fallback is displayed. There are two patterns:

**1. Companion attribute** -- `else="templateId"` on the loop element references a `<template>` for the fallback:

```html
<li each="item in items" key="item.id" else="noItemsTpl" bind="item.name"></li>
<template id="noItemsTpl">
  <li class="empty-state">No items match your criteria.</li>
</template>
```

**2. Sibling element** -- a separate element with `else` placed immediately after the loop element provides inline fallback content:

```html
<ul get="/api/users" as="users">
  <li each="user in users" key="user.id" bind="user.name"></li>
  <li else>No users found.</li>
</ul>
```

Both patterns are **reactive**: when items are added to an empty array, the else content is automatically removed and the loop clones appear. When all items are removed, the else content reappears.

**Combined with data fetching:**

```html
<ul get="/api/tasks" as="tasks">
  <li each="task in tasks" key="task.id">
    <span bind="task.title"></span>
  </li>
  <li else>You have no tasks yet. Create one to get started.</li>
</ul>
```
