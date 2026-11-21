# Virtual List

Renders large datasets efficiently by virtualizing the DOM. Only the items visible within the scroll viewport (plus a configurable overscan buffer) are rendered at any time, while off-screen items are replaced by lightweight spacer elements. Works with any container/child HTML pattern: `<ul>/<li>`, `<table>/<tbody>/<tr>`, `<div>/<div>`, `<dl>`, and more.

## Contents

- [Basic Usage](#basic-usage)
- [Attributes](#attributes)
- [Fixed Height Mode](#fixed-height-mode)
- [Auto Height Mode](#auto-height-mode)
- [Table Virtualization](#table-virtualization)
- [List Virtualization](#list-virtualization)
- [Buffer (Overscan)](#buffer-overscan)
- [Loop Context Variables](#loop-context-variables)
- [CSS Classes](#css-classes)
  - [Built-in Styles](#built-in-styles)
- [CSS Custom Properties](#css-custom-properties)
- [Accessibility](#accessibility)
- [Advanced Examples](#advanced-examples)
  - [Virtualized Definition List](#virtualized-definition-list)
  - [Dynamic Data Updates](#dynamic-data-updates)
  - [Each Binding](#each-binding)
- [API Reference](#api-reference)
- [Server-Rendered Hosts](#server-rendered-hosts)

## Basic Usage

Add `virtual` (with `virtual-height`) to a container that has an `each` (or `foreach` / `for`) binding. The element intercepts the loop, manages scroll virtualization, and renders only the visible slice.

```html
<div state="{ items: Array.from({ length: 10000 }, (_, i) => ({ name: 'Item ' + i })) }">
  <ul virtual virtual-height="40" style="height: 400px;">
    <li each="item in items" bind="item.name"></li>
  </ul>
</div>
```

The container must have a fixed height (via CSS `height`, `max-height`, or flex/grid constraints) so the virtual scroller knows the viewport size.

---

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `virtual` | boolean attr | -- | Enables virtualization on the container. Required: `virtual-height` and `virtual-buffer` alone do nothing |
| `virtual-height` | number \| `"auto"` | `50` | Row height in pixels. Use a fixed number for uniform rows, or `"auto"` to measure each row dynamically. |
| `virtual-buffer` | number | `5` | Number of extra items rendered above and below the visible range (overscan). Higher values reduce flicker during fast scrolling. |

---

## Fixed Height Mode

When every row has the same height, set `virtual-height` to the pixel value. This is the most performant mode because scroll offsets are calculated arithmetically without measuring DOM nodes.

```html
<ul virtual virtual-height="50" virtual-buffer="3" style="height: 500px;">
  <li each="row in rows" bind="row.label"></li>
</ul>
```

---

## Auto Height Mode

When rows have variable heights, set `virtual-height="auto"`. Each rendered row is measured with a `ResizeObserver` and the measured height is stored for future offset calculations. An initial estimate of 50px is used for items not yet measured.

```html
<ul virtual virtual-height="auto" style="height: 600px;">
  <li each="item in items">
    <h3 bind="item.title"></h3>
    <p bind="item.description"></p>
  </li>
</ul>
```

---

## Table Virtualization

Virtual List supports `<table>` containers natively. Spacer elements are rendered as `<tr>` with a `<td>` whose `colspan` matches the number of columns in the first visible row.

```html
<table virtual virtual-height="36" style="height: 500px; display: block; overflow-y: auto;">
  <tbody>
    <tr each="user in users">
      <td bind="user.name"></td>
      <td bind="user.email"></td>
      <td bind="user.role"></td>
    </tr>
  </tbody>
</table>
```

---

## List Virtualization

Standard `<ul>` and `<ol>` containers work out of the box. Spacer elements are rendered as `<li>`.

```html
<ol virtual virtual-height="32" style="height: 300px;">
  <li each="entry in entries" bind="entry.text"></li>
</ol>
```

---

## Buffer (Overscan)

The `virtual-buffer` attribute controls how many extra items are rendered beyond the visible viewport in each direction. This prevents blank flashes during fast scrolling.

```html
<!-- Render 10 extra items above and below the viewport -->
<ul virtual virtual-height="40" virtual-buffer="10" style="height: 400px;">
  <li each="item in items" bind="item.name"></li>
</ul>
```

---

## Loop Context Variables

Each rendered item receives the same loop context variables as a standard NoJS `each` binding:

| Variable | Type | Description |
|----------|------|-------------|
| `$index` | number | Zero-based index of the item in the full array |
| `$count` | number | Total number of items in the array |
| `$first` | boolean | `true` for the first item |
| `$last` | boolean | `true` for the last item |
| `$even` | boolean | `true` for even-indexed items (0, 2, 4...) |
| `$odd` | boolean | `true` for odd-indexed items (1, 3, 5...) |

```html
<ul virtual virtual-height="40" style="height: 400px;">
  <li each="item in items">
    <span bind="$index + 1"></span>. <span bind="item.name"></span>
    <span show="$first"> (first)</span>
  </li>
</ul>
```

---

## CSS Classes

| Class / Attribute | Applied to | Description |
|-------------------|-----------|-------------|
| `data-nojs-virtual` | Container element | Marks the container as a virtual list |
| `nojs-virtual-spacer` | Generated spacer elements | Top and bottom spacers that maintain scroll height |

### Built-in Styles

| Selector | Style |
|----------|-------|
| `[data-nojs-virtual]` | `overflow-y: auto; position: relative` |
| `.nojs-virtual-spacer` | `display: block; visibility: hidden; pointer-events: none; margin/padding/border: 0` |
| `table .nojs-virtual-spacer`, `tr.nojs-virtual-spacer` | `display: table-row` (spacer rendered as `<tr>` with `<td>`) |
| `dl .nojs-virtual-spacer` | `display: list-item; list-style: none` |

---

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--nojs-virtual-list-height` | `auto` | Container height (can be set via CSS instead of inline styles) |

---

## Accessibility

- Spacer elements receive `aria-hidden="true"` so screen readers skip them.
- The container uses native scroll semantics; no ARIA roles are injected on the container itself.
- All rendered items retain their original semantics and ARIA attributes from the template.

---

## Advanced Examples

### Virtualized Definition List

```html
<dl virtual virtual-height="60" style="height: 400px;">
  <div each="entry in glossary">
    <dt bind="entry.term"></dt>
    <dd bind="entry.definition"></dd>
  </div>
</dl>
```

### Dynamic Data Updates

The virtual list polls the reactive context for array changes. When items are added, removed, or replaced, the visible range re-renders automatically.

```html
<div state="{ logs: [] }">
  <button on:click="logs = logs.concat({ msg: 'Entry ' + logs.length })">
    Add Log
  </button>

  <ul virtual virtual-height="30" virtual-buffer="5" style="height: 300px;">
    <li each="log in logs" bind="log.msg"></li>
  </ul>
</div>
```

### Each Binding

The `each` binding is placed on the child element that serves as the repeating template. This follows the self-repeating loop pattern where the element with `each` IS the template that gets cloned for each item.

```html
<ul virtual virtual-height="40" style="height: 400px;">
  <li each="item in items" bind="item.name"></li>
</ul>
```

---

## API Reference

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `virtual` | boolean attr | -- | Enables virtualization on the container. Required: `virtual-height` and `virtual-buffer` alone do nothing |
| `virtual-height` | number \| `"auto"` | `50` | Item height in pixels, or `"auto"` for variable-height rows |
| `virtual-buffer` | number | `5` | Number of overscan items above and below the visible range |
| `each` / `foreach` / `for` | expression | *required* | Loop binding expression (e.g., `item in items`) |

---

## Server-Rendered Hosts

This element also runs on hosts that implement the NoJS plugin host API (`NoJS.hostApi >= 1`), where expressions are evaluated on the server and the browser receives rendered HTML. With the CDN core nothing on this page changes. The server renders every row of the loop; the browser keeps only the visible window in the page (with the same spacers and ARIA). The page markup is the same, but the HTML sent to the browser holds the whole list.
