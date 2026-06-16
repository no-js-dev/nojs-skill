# Virtual List

Renders only the visible portion of large lists and tables for performance. Supports fixed-height and auto-height modes. Works with `<ul>`, `<ol>`, `<table>`, `<dl>`, and any block container. Uses standard HTML elements with NoJS directive attributes -- no custom element registration required.

## Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Attributes](#attributes)
- [Fixed Height Mode](#fixed-height-mode)
- [Auto Height Mode](#auto-height-mode)
- [Table Virtualization](#table-virtualization)
- [Loop Context Variables](#loop-context-variables)
- [Events](#events)
- [CSS Classes](#css-classes)
- [CSS Custom Properties](#css-custom-properties)
- [Accessibility](#accessibility)
- [Examples](#examples)
  - [Large List with Fixed Item Height](#large-list-with-fixed-item-height)
  - [Table Virtualization with Dynamic Data](#table-virtualization-with-dynamic-data)
  - [Definition List with Auto Height](#definition-list-with-auto-height)
- [Composition with NoJS Directives](#composition-with-nojs-directives)

---

## Installation

```html
<!-- CDN (auto-installs, no registration needed) -->
<script src="https://unpkg.com/@nickeljs/elements"></script>

<!-- ESM (register the full plugin or individually) -->
<script type="module">
  import NoJSElements from '@nickeljs/elements';
  NoJS.use(NoJSElements);
</script>
```

Requires No.JS >= 1.13.0.

---

## Basic Usage

Add the `virtual-list` attribute to a container, pointing to the array in state. Provide a single child element as the item template -- it will be repeated for each visible item.

```html
<div state="{ items: [] }" get="/api/items | items">
  <ul virtual-list="items" virtual-list-item-size="48" virtual-list-height="300px">
    <li bind="item.label"></li>
  </ul>
</div>
```

The virtual list renders only the items visible in the scrollable area plus a configurable buffer above and below, keeping DOM node count low regardless of list size.

---

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `virtual-list` | path | *required* | Path to array in state (same syntax as `each` / `foreach`) |
| `virtual-list-height` | CSS value | `"auto"` | Container height. Use explicit height (`"400px"`) for fixed mode or `"auto"` for viewport-based |
| `virtual-list-item-size` | number | -- | Fixed item height in pixels. Required for fixed-height mode. Omit for auto-height mode |
| `virtual-list-buffer` | number | `5` | Number of extra items rendered above and below the visible area (overscan) |

The `virtual-list` attribute is placed on the container element (`<ul>`, `<ol>`, `<table>`, `<dl>`, or `<div>`). The first child element serves as the item template.

---

## Fixed Height Mode

Set `virtual-list-item-size` to a pixel value. All items are assumed to be the same height. This is the most performant mode because scroll positions can be calculated without measuring DOM elements.

```html
<ul virtual-list="items" virtual-list-item-size="48" virtual-list-height="400px">
  <li bind="item.name"></li>
</ul>
```

---

## Auto Height Mode

Omit `virtual-list-item-size`. Items are measured after first render via ResizeObserver. Supports variable-height items but has slightly more overhead than fixed-height mode.

```html
<ul virtual-list="items" virtual-list-height="400px">
  <li>
    <h3 bind="item.title"></h3>
    <p bind="item.description"></p>
  </li>
</ul>
```

---

## Table Virtualization

Works with `<table>`. The spacer elements become `<tr>` with `<td>` cells. Place the item template row inside `<tbody>`.

```html
<div state="{ rows: [] }" get="/api/large-dataset | rows">
  <table virtual-list="rows" virtual-list-item-size="40" virtual-list-height="500px">
    <thead><tr><th>Name</th><th>Email</th></tr></thead>
    <tbody>
      <tr>
        <td bind="item.name"></td>
        <td bind="item.email"></td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## Loop Context Variables

The virtual list provides the same context variables as standard NoJS loops:

| Variable | Description |
|----------|-------------|
| `$index` | Current index (0-based) |
| `$count` | Total number of items |
| `$first` | `true` if first item |
| `$last` | `true` if last item |
| `$even` | `true` if index is even |
| `$odd` | `true` if index is odd |

```html
<ul virtual-list="items" virtual-list-item-size="48" virtual-list-height="300px">
  <li class-even="$even" class-odd="$odd">
    <span bind="$index + 1"></span>. <span bind="item.name"></span>
    <span if="$first">(First)</span>
    <span if="$last">(Last)</span>
  </li>
</ul>
```

---

## Events

No custom events are emitted. Use standard NoJS `on:click` and other event directives on the item template.

```html
<ul virtual-list="items" virtual-list-item-size="48" virtual-list-height="300px">
  <li on:click="selectItem(item)" bind="item.name"></li>
</ul>
```

---

## CSS Classes

| Class / Selector | Applied to | Description |
|------------------|-----------|-------------|
| `[data-nojs-virtual]` | Container | Data attribute on the virtualized container |
| `.nojs-virtual-spacer` | Spacer elements | Invisible spacer elements above and below visible items |

### Built-in Styles

| Selector | Style |
|----------|-------|
| `[data-nojs-virtual]` | `overflow-y: auto; position: relative` |
| `.nojs-virtual-spacer` | `display: block; width: 100%; pointer-events: none; visibility: hidden` |
| `table .nojs-virtual-spacer` | `display: table-row` |
| `dl .nojs-virtual-spacer` | `display: list-item; list-style: none` |

---

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--nojs-virtual-list-height` | `auto` | Runtime container height (set programmatically) |

```css
/* Override container height via CSS */
.my-virtual-list {
  --nojs-virtual-list-height: 600px;
}
```

---

## Accessibility

NoJS preserves standard list and table semantics:

- `<ul>` / `<ol>` containers maintain list role
- `<table>` containers maintain table role with `<thead>` / `<tbody>` structure
- Screen readers see only the rendered items (not the full list)
- Keyboard scrolling works natively via the scrollable container (`overflow-y: auto`)
- Tab order follows the natural DOM order of visible items

### Progressive Enhancement

Because the virtual list builds on standard HTML containers, content is accessible without JavaScript:

- **Without NoJS:** all items render in the DOM (no virtualization), standard list/table behavior
- **With NoJS:** only visible items rendered, spacer elements maintain scroll height, smooth scrolling

---

## Examples

### Large List with Fixed Item Height

A performant list of 10,000 items using fixed 48px row height.

```html
<div state="{ users: [] }" get="/api/users | users">
  <ul virtual-list="users" virtual-list-item-size="48" virtual-list-height="400px">
    <li style="display: flex; align-items: center; padding: 0 1rem; height: 48px; border-bottom: 1px solid #E2E8F0;">
      <span bind="item.name" style="flex: 1;"></span>
      <span bind="item.email" style="color: #64748B;"></span>
    </li>
  </ul>
</div>
```

### Table Virtualization with Dynamic Data

A large dataset rendered as a virtualized table with sortable headers.

```html
<div state="{ rows: [], sortBy: 'name' }"
     get="/api/employees?sort={sortBy} | rows">
  <table virtual-list="rows" virtual-list-item-size="40" virtual-list-height="500px" virtual-list-buffer="10">
    <thead>
      <tr>
        <th on:click="sortBy = 'name'" style="cursor: pointer;">Name</th>
        <th on:click="sortBy = 'department'" style="cursor: pointer;">Department</th>
        <th on:click="sortBy = 'salary'" style="cursor: pointer;">Salary</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td bind="item.name"></td>
        <td bind="item.department"></td>
        <td bind="'$' + item.salary.toLocaleString()"></td>
      </tr>
    </tbody>
  </table>
</div>
```

### Definition List with Auto Height

A glossary with variable-height items using auto-height mode.

```html
<div state="{ terms: [] }" get="/api/glossary | terms">
  <dl virtual-list="terms" virtual-list-height="500px" virtual-list-buffer="3">
    <div>
      <dt bind="item.term" style="font-weight: 600;"></dt>
      <dd bind="item.definition" style="margin: 0 0 1rem 0; color: #475569;"></dd>
    </div>
  </dl>
</div>
```

---

## Composition with NoJS Directives

The virtual list works with any NoJS directive for dynamic, interactive content:

```html
<div state="{ products: [], filter: '', loading: true }"
     get="/api/products | products"
     get-success="loading = false">

  <input model="filter" placeholder="Search products..." />
  <p if="loading">Loading products...</p>

  <ul virtual-list="products | filterBy('name', filter)"
      virtual-list-item-size="64"
      virtual-list-height="400px"
      show="!loading">
    <li on:click="selectedProduct = item"
        class-selected="item.id === selectedProduct?.id">
      <strong bind="item.name"></strong>
      <span bind="'$' + item.price" style="color: #64748B;"></span>
      <span if="item.onSale" style="color: #EF4444;">Sale</span>
    </li>
  </ul>
</div>
```

- Use `state` and `get` to load large datasets
- Use `bind` for dynamic content in each item
- Use `on:click` for item selection and interaction
- Use `class-*` for conditional styling (selected, highlighted, etc.)
- Use `if` / `show` for conditional content within items
- Use `model` with filters to search/filter the virtualized list
- The `each` binding syntax also works: `<li each="item in largeArray">`
