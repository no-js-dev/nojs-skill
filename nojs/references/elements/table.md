# Table

Sortable table with fixed headers, sticky columns, and drag-and-drop row reordering. Built on standard `<table>` HTML with NoJS directive attributes -- no custom elements needed. Directives: `sortable` (on `<table>`), `sort` (on `<th>`), `fixed-header` (on `<table>`), `fixed-col` (on `<td>`/`<th>`), `table-reorder` (on `<table>`).

## Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Attributes](#attributes)
- [Sort Behavior](#sort-behavior)
- [Row Reorder Events](#row-reorder-events)
- [CSS Classes](#css-classes)
- [Sort Indicator Styles](#sort-indicator-styles)
- [Z-Index Stacking](#z-index-stacking)
- [Accessibility](#accessibility)
- [Examples](#examples)
  - [Sortable Table with Typed Columns](#sortable-table-with-typed-columns)
  - [Fixed Header and Fixed Column](#fixed-header-and-fixed-column)
  - [Row Reorder with Drag Handle](#row-reorder-with-drag-handle)
- [Composition with NoJS Directives](#composition-with-nojs-directives)

---

## Installation

```html
<!-- CDN (auto-installs, no registration needed) -->
<script src="https://cdn-elements.no-js.dev/nojs-elements.iife.js"></script>
```

Requires No.JS >= 1.13.0.

---

## Basic Usage

Add the `sortable` attribute to a `<table>` and `sort` attributes to each `<th>` that should be sortable. Clicking a column header sorts the table rows by that column.

```html
<table sortable>
  <thead>
    <tr>
      <th sort="name">Name</th>
      <th sort="age" sort-type="number">Age</th>
    </tr>
  </thead>
  <tbody>
    <tr each="user in users" key="user.id">
      <td bind="user.name"></td>
      <td bind="user.age"></td>
    </tr>
  </tbody>
</table>
```

---

## Attributes

### Sortable Table

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `sortable` | boolean attr | -- | Enables table sorting |

### Sort Column

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `sort` | string | *required* | Column key used for sorting (matches data property name) |
| `sort-type` | `"string"` \| `"number"` \| `"date"` | `"string"` | Sort comparison type |
| `sort-default` | `"asc"` \| `"desc"` | -- | Default sort direction on load |

### Fixed Header

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `fixed-header` | boolean attr | -- | Makes `<thead>` sticky at top of scrollable container |

### Fixed Column

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `fixed-col` | boolean attr | -- | Makes the column sticky on horizontal scroll |

### Row Reorder (Drag-and-Drop)

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `table-reorder` | path | *required* | Path to array in state (rows data source) |
| `table-reorder-handle` | CSS selector | -- | Restricts drag handle to matching child element |
| `table-reorder-key` | string | -- | Unique key property for stable row identity |

---

## Sort Behavior

### Sort Cycling

Clicking a column header cycles through three states: unsorted -> ascending -> descending -> unsorted.

### Typed Sorting

The `sort-type` attribute determines the comparison function:

- `"string"` -- uses `localeCompare()` for locale-aware text sorting
- `"number"` -- numeric comparison (parses cell text as numbers)
- `"date"` -- `Date` constructor comparison

### How Sorting Works

Sorting reads `<td>` cell text content by column index and applies the comparison function based on `sort-type`. The DOM rows are physically reordered (no virtual DOM).

### Interaction with Row Reorder

When both `sortable` and `table-reorder` are active on the same table, manual row reorder clears any active column sort (reverts to unsorted state).

---

## Row Reorder Events

| Event | `$event.detail` | Description |
|-------|-----------------|-------------|
| `on:reorder` | `{ list, item, from, to }` | Fired when a row is dropped into a new position |

- `list` -- the reordered array
- `item` -- the item that was moved
- `from` -- original index
- `to` -- new index

---

## CSS Classes

| Class / Attribute | When Applied |
|-------------------|-------------|
| `.nojs-sortable` | On the table element |
| `data-sortable` | On sortable `<th>` elements |
| `data-sort-dir="asc"` / `data-sort-dir="desc"` | On the active sort column |
| `.nojs-fixed-header` | On tables with fixed header |
| `.nojs-fixed-col` | On sticky column cells |
| `.nojs-row-dragging` | On the row being dragged |
| `.nojs-reorder-insert-before` | On the row above the drop position |
| `.nojs-reorder-insert-after` | On the row below the drop position |

---

## Sort Indicator Styles

Built-in CSS adds sort direction indicators via `::after` pseudo-elements on `<th>`:

| State | Icon | Opacity |
|-------|------|---------|
| Unsorted | `⇅` (up-down arrows) | 0.3 |
| Ascending | `▲` (up triangle) | 1.0 |
| Descending | `▼` (down triangle) | 1.0 |

---

## Z-Index Stacking

When combining fixed headers and fixed columns, the z-index stacking ensures correct overlap:

| Element | `z-index` |
|---------|-----------|
| `.nojs-fixed-col` | 1 |
| `.nojs-fixed-header` | 2 |
| `.nojs-fixed-header .nojs-fixed-col` | 3 |

---

## Accessibility

NoJS automatically applies:

- Sortable `<th>` elements get `aria-sort="ascending"`, `"descending"`, or `"none"`
- `role="columnheader"` is preserved on `<th>` elements
- Sort columns are keyboard-accessible (focusable and activated by Enter/Space)
- Row reorder uses `aria-grabbed` and `aria-dropeffect`

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Enter` / `Space` | Activate sort on the focused column header |
| `Tab` | Move focus between sortable column headers |

---

## Examples

### Sortable Table with Typed Columns

```html
<table sortable>
  <thead>
    <tr>
      <th sort="name" sort-type="string">Name</th>
      <th sort="age" sort-type="number">Age</th>
      <th sort="joined" sort-type="date" sort-default="desc">Joined</th>
    </tr>
  </thead>
  <tbody>
    <tr each="user in users" key="user.id">
      <td bind="user.name"></td>
      <td bind="user.age"></td>
      <td bind="user.joined"></td>
    </tr>
  </tbody>
</table>
```

### Fixed Header and Fixed Column

Wrap the table in a scrollable container for fixed-header behavior:

```html
<div style="height: 400px; overflow: auto">
  <table sortable fixed-header>
    <thead>
      <tr>
        <th sort="id" fixed-col>ID</th>
        <th sort="name">Name</th>
        <th sort="email">Email</th>
        <th sort="role">Role</th>
      </tr>
    </thead>
    <tbody>
      <tr each="user in users" key="user.id">
        <td fixed-col bind="user.id"></td>
        <td bind="user.name"></td>
        <td bind="user.email"></td>
        <td bind="user.role"></td>
      </tr>
    </tbody>
  </table>
</div>
```

### Row Reorder with Drag Handle

Use `table-reorder-handle` to restrict the drag interaction to a specific element within the row:

```html
<div state="{ tasks: [{id:1,name:'Task A'},{id:2,name:'Task B'},{id:3,name:'Task C'}] }">
  <table table-reorder="tasks" table-reorder-key="id" table-reorder-handle=".drag-handle"
         on:reorder="console.log('Reordered:', $event.detail)">
    <thead><tr><th></th><th>Task</th></tr></thead>
    <tbody>
      <tr each="task in tasks" key="task.id">
        <td><span class="drag-handle">&#9776;</span></td>
        <td bind="task.name"></td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## Composition with NoJS Directives

The table directives work with any NoJS directive:

```html
<div state="{ users: [], loading: true, sortInfo: '' }"
     get="/api/users | users"
     get-success="loading = false">
  <p if="loading">Loading users...</p>
  <table sortable fixed-header if="!loading">
    <thead>
      <tr>
        <th sort="name" sort-type="string">Name</th>
        <th sort="email" sort-type="string">Email</th>
        <th sort="role" sort-type="string">Role</th>
      </tr>
    </thead>
    <tbody>
      <tr each="user in users" key="user.id">
        <td bind="user.name"></td>
        <td bind="user.email"></td>
        <td bind="user.role"></td>
      </tr>
    </tbody>
  </table>
</div>
```

- Use `each` / `foreach` / `for` to render rows from data
- Use `bind` / `bind-html` for dynamic cell content
- Use `if` / `show` for conditional rows or columns
- Use `on:reorder` to react to row reorder events
- Use `state` on a parent to share data across the table
