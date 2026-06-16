# Loop Directives

List rendering with iteration, filtering, sorting, and pagination. Priority 10.

## Contents

- [foreach](#foreach) -- primary iteration directive
- [each](#each) -- alias for foreach
- [for](#for) -- alias for foreach
- [Loop Attributes](#loop-attributes) -- template, index, key, filter, sort, limit, offset
- [Loop Context Variables](#loop-context-variables) -- $index, $count, $first, $last, $even, $odd
- [Animation Attributes](#animation-attributes) -- animate-enter, animate-leave, animate-stagger, animate-duration
- [Empty-List Fallback (else)](#empty-list-fallback-else) -- companion attribute pattern
- [Nested Loops](#nested-loops) -- parent scope access

---

## Syntax Reference

| Directive | Syntax | Description |
|-----------|--------|-------------|
| `foreach` | `foreach="item in items"` | Iterate over arrays (primary directive) |
| `each` | `each="item in items"` | Alias for `foreach` |
| `for` | `for="item in items"` | Alias for `foreach` |
| `template` | `template="tplId"` | Template to clone for each item |
| `index` | `index="i"` | Custom index variable name |
| `key` | `key="item.id"` | Unique key for DOM diffing |
| `filter` | `filter="item.active"` | Filter expression |
| `sort` | `sort="item.name"` | Sort property (prefix `-` for descending) |
| `limit` | `limit="10"` | Max items to render |
| `offset` | `offset="5"` | Items to skip |
| `else` | `else="templateId"` | Template when list is empty/null |
| `animate-enter` | `animate-enter="fadeIn"` | CSS class for entering items |
| `animate-leave` | `animate-leave="fadeOut"` | CSS class for leaving items |
| `animate` | `animate="fadeIn"` | Shorthand for `animate-enter` |
| `animate-stagger` | `animate-stagger="50"` | Delay in ms between each item's animation |
| `animate-duration` | `animate-duration="300"` | Duration in ms for enter/leave animations |

---

## Self-Repeating Pattern

Loops use a **self-repeating pattern**: the element with the loop directive IS the repeating template. At runtime, the original element is removed from the DOM and replaced by comment markers (`<!--foreach-->` / `<!--/foreach-->`). Clones are inserted between the markers as siblings.

---

## `foreach`

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
| `else` | Template ID or `#id` reference to render when the list is empty or null/undefined/non-array |
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

<!-- With else attribute for empty-list fallback -->
<ul>
  <li foreach="item in menuItems" key="item.id" else="noMenuTpl" bind="item.label"></li>
</ul>
<template id="noMenuTpl"><li>No menu items available.</li></template>

<!-- With template reference -->
<div foreach="post in posts" template="postCard"></div>
<template id="postCard">
  <article>
    <h2 bind="post.title"></h2>
    <span bind="'#' + $index"></span>
  </article>
</template>
```

---

## `each`

Alias for `foreach`. Identical handler, identical behavior. Self-repeating pattern -- the element with `each` is cloned for each item.

**Syntax:** `<element each="item in items">`

```html
<ul>
  <li each="user in users" key="user.id" else="noUsersTpl">
    <span bind="user.name"></span>
  </li>
</ul>
<template id="noUsersTpl"><li>No users found.</li></template>
```

All `foreach` attributes (`filter`, `sort`, `limit`, `offset`, `key`, `else`, `template`, `index`, `animate-*`) work on `each`.

---

## `for`

Alias for `foreach`. Identical handler, identical behavior. Self-repeating pattern -- the element with `for` is cloned for each item.

**Syntax:** `<element for="item in items">`

```html
<ul>
  <li for="task in tasks" key="task.id" filter="!task.done" else="noPendingTpl">
    <span bind="task.title"></span>
  </li>
</ul>
<template id="noPendingTpl"><li>No pending tasks.</li></template>
```

All `foreach` attributes (`filter`, `sort`, `limit`, `offset`, `key`, `else`, `template`, `index`, `animate-*`) work on `for`.

---

## Loop Attributes

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

The expression is evaluated for each item. Only items where the expression is truthy are rendered.

### `sort`

Sort property. Prefix with `-` for descending order.

**Syntax:** `<element foreach="item in items" sort="item.name">` or `sort="-item.date">`

### `limit`

Maximum number of items to render.

**Syntax:** `<element foreach="item in items" limit="10">`

Applied after filtering and sorting.

### `offset`

Number of items to skip.

**Syntax:** `<element foreach="item in items" offset="5">`

Applied after filtering and sorting, before limit.

---

## Loop Context Variables

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

---

## Animation Attributes

Loop items support enter/leave animations with staggered timing:

```html
<div each="item in items"
     template="itemTpl"
     animate-enter="fadeInUp"
     animate-leave="fadeOutDown"
     animate-stagger="50"
     animate-duration="300">
</div>
```

See the [Animations](animations.md) reference for the full list of built-in animation names.

---

## Empty-List Fallback (else)

When a loop's source list is empty (`[]`) **or** null/undefined/non-array, an `else` fallback is displayed -- e.g. API state before the first fetch resolves.

**Companion attribute** -- `else="templateId"` or `else="#templateId"` on the loop element references a `<template>` that renders when the list is empty or null/undefined/non-array. Both bare ID and `#id` syntax are accepted:

```html
<!-- Bare ID syntax -->
<li each="item in items" key="item.id" else="noItemsTpl" bind="item.name"></li>
<template id="noItemsTpl">
  <li class="empty-state">No items match your criteria.</li>
</template>

<!-- #id syntax -->
<article foreach="item in items" else="#no-items">
  <h2 bind="item.title"></h2>
</article>
<template id="no-items"><span>No items found</span></template>
```

> **Breaking change (v1.15):** The sibling else pattern (`<el else>` as a separate element after the loop) has been removed. Migrate by wrapping inline fallback content in a `<template id="...">` and referencing it with `else="templateId"` on the loop element. Also changed in v1.15: null/undefined/non-array lists now render the else template (previously they rendered nothing).

The companion attribute is **reactive**: when items are added to an empty array, the else content is automatically removed and the loop clones appear. When all items are removed, the else content reappears.

### Edge Cases

- An orphan `else` element (one with no preceding `if`/`else-if` sibling) logs a one-time console warning mentioning the v1.15 removal.
- The `else` template is cloned once (not per-item). It replaces all loop clones.
- `null`, `undefined`, and non-array values all trigger the else fallback.

---

## Nested Loops

Child loops can access parent scope variables. Each loop element is self-repeating -- the inner loop produces sibling clones inside each outer clone:

```html
<div each="category in categories">
  <h3 bind="category.name"></h3>
  <p each="product in category.products" else="noProdTpl">
    <span bind="category.name"></span>: <span bind="product.name"></span>
  </p>
</div>
<template id="noProdTpl"><p>No products in this category.</p></template>
```

---

## Complete Example -- Filtered, Sorted, Paginated List

```html
<div state="{ tasks: [
  {id: 1, title: 'Buy groceries', done: false, priority: 2},
  {id: 2, title: 'Write docs', done: true, priority: 1},
  {id: 3, title: 'Fix bug', done: false, priority: 1},
  {id: 4, title: 'Deploy app', done: false, priority: 3}
], showDone: false, page: 0 }">

  <label>
    <input type="checkbox" model="showDone" /> Show completed
  </label>

  <ul>
    <li foreach="task in tasks"
        key="task.id"
        filter="showDone || !task.done"
        sort="task.priority"
        limit="3"
        offset="page * 3"
        else="noTasksTpl"
        animate-enter="fadeInUp"
        animate-stagger="50">
      <span bind="task.title"></span>
      <span show="task.done" class="badge">(done)</span>
    </li>
  </ul>
  <template id="noTasksTpl"><li>No tasks match your filter.</li></template>

  <button on:click="page = Math.max(0, page - 1)">Previous</button>
  <button on:click="page++">Next</button>
</div>
```

---

## Combined with Data Fetching

```html
<ul get="/api/tasks" as="tasks">
  <li each="task in tasks" key="task.id" else="noTasksTpl">
    <span bind="task.title"></span>
  </li>
</ul>
<template id="noTasksTpl"><li>You have no tasks yet. Create one to get started.</li></template>
```
