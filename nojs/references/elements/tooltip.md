# Tooltip

Lightweight tooltip shown on hover/focus. Positioned relative to the trigger element with viewport-aware clamping. No JavaScript required from developers -- just add the `tooltip` attribute to any element.

## Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Attributes](#attributes)
- [Events](#events)
- [CSS Classes](#css-classes)
- [Accessibility](#accessibility)
- [Examples](#examples)
  - [Basic Tooltip](#basic-tooltip)
  - [Tooltip Positions](#tooltip-positions)
  - [Conditionally Disabled Tooltip](#conditionally-disabled-tooltip)
- [Composition with NoJS Directives](#composition-with-nojs-directives)

---

## Installation

```html
<!-- CDN (auto-installs, no registration needed) -->
<script src="https://unpkg.com/@nickeljs/elements"></script>

<!-- ESM (register the full plugin or just the tooltip) -->
<script type="module">
  import NoJSElements from '@nickeljs/elements';
  NoJS.use(NoJSElements);

  // Or register only the tooltip element
  import { tooltip } from '@nickeljs/elements';
  NoJS.use(tooltip);
</script>
```

Requires No.JS >= 1.13.0.

---

## Basic Usage

Add the `tooltip` attribute to any element. The attribute value becomes the tooltip text.

```html
<button tooltip="Save your changes">Save</button>
```

By default the tooltip appears above the element after a 300ms delay.

---

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `tooltip` | string | *required* | The text content displayed in the tooltip |
| `tooltip-position` | `"top"` \| `"bottom"` \| `"left"` \| `"right"` | `"top"` | Placement relative to the trigger element |
| `tooltip-delay` | number (ms) | `300` | Delay before the tooltip appears |
| `tooltip-disabled` | expression | -- | Reactive boolean expression. When truthy, prevents tooltip from showing |

All attributes are placed directly on the trigger element. No wrapper or container element is needed.

---

## Events

No custom events emitted.

---

## CSS Classes

| Class | Applied to | Description |
|-------|-----------|-------------|
| `.nojs-tooltip` | Generated tooltip element | The tooltip popup injected into the DOM (styled via `<style data-nojs-tooltip>`) |

### Built-in Styles

The tooltip injects a `<style data-nojs-tooltip>` block with default styles for `.nojs-tooltip`. Override in your own stylesheet to customize appearance:

```css
/* Example: dark theme tooltip */
.nojs-tooltip {
  background: #1a1a2e;
  color: #eee;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
}
```

### Positioning

Tooltips are positioned using viewport-aware calculations:

1. Placed relative to the trigger based on `tooltip-position`
2. 8px gap separates the tooltip from the trigger element
3. Position clamped to keep a 4px margin from viewport edges

---

## Accessibility

NoJS automatically applies:

- Generates a unique `id` for the tooltip element
- Sets `aria-describedby` on the trigger pointing to the tooltip's `id`
- Sets `role="tooltip"` on the tooltip element
- Tooltip appears on both `mouseenter` and `focus`, dismissed on `mouseleave` and `blur`

Because the tooltip responds to `focus` and `blur`, keyboard users can trigger tooltips by tabbing to the element.

---

## Examples

### Basic Tooltip

A simple tooltip on a button.

```html
<button tooltip="Save your changes">
  Save
</button>
```

### Tooltip Positions

Place the tooltip on any side of the trigger element.

```html
<button tooltip="Above" tooltip-position="top">Top</button>
<button tooltip="Below" tooltip-position="bottom">Bottom</button>
<button tooltip="Left side" tooltip-position="left">Left</button>
<button tooltip="Right side" tooltip-position="right">Right</button>
```

### Conditionally Disabled Tooltip

Disable the tooltip reactively based on state.

```html
<div state="{ showTips: true }">
  <label>
    <input type="checkbox" model="showTips"> Show tooltips
  </label>

  <button tooltip="Click to submit the form"
          tooltip-disabled="!showTips">
    Submit
  </button>
</div>
```

When `showTips` is `false`, the tooltip will not appear on hover or focus.

---

## Composition with NoJS Directives

Tooltips work with any NoJS directive on the same element or its ancestors:

```html
<div state="{ items: [
  { name: 'Edit', tip: 'Edit this item' },
  { name: 'Delete', tip: 'Permanently remove this item' }
] }">
  <button each="item in items"
          key="item.name"
          bind="item.name"
          tooltip="{{ item.tip }}"
          on:click="console.log(item.name)">
  </button>
</div>
```

- Use `each` / `foreach` / `for` to render dynamic tooltipped elements
- Use `bind` for dynamic trigger content
- Use `tooltip-disabled` with reactive expressions to toggle tooltips
- Use `if` / `show` on the trigger element for conditional rendering
- Use `state` on a parent to share data across tooltipped elements
