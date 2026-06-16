# Split

Resizable split pane layout. A container with `split` holds two or more `pane` children separated by draggable gutters. Supports horizontal and vertical splits, min/max constraints, collapsible panes, persisted layout, and nested splits.

## Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Attributes](#attributes)
  - [Split Container](#split-container)
  - [Pane](#pane)
- [Events](#events)
- [CSS Classes](#css-classes)
- [CSS Custom Properties](#css-custom-properties)
- [Accessibility](#accessibility)
- [Examples](#examples)
  - [Basic Horizontal Split](#basic-horizontal-split)
  - [Persisted Vertical Split with Collapsible Pane](#persisted-vertical-split-with-collapsible-pane)
  - [Nested Splits (IDE Layout)](#nested-splits-ide-layout)
- [Composition with NoJS Directives](#composition-with-nojs-directives)

---

## Installation

```html
<!-- CDN (auto-installs, no registration needed) -->
<script src="https://unpkg.com/@nickeljs/elements"></script>

<!-- ESM -->
<script type="module">
  import NoJSElements from '@nickeljs/elements';
  NoJS.use(NoJSElements);
</script>
```

Requires No.JS >= 1.13.0.

---

## Basic Usage

Place the `split` attribute on a container element and add `pane` children inside it. Gutters are automatically generated between panes.

```html
<div split>
  <div pane="250px">
    <nav>Sidebar</nav>
  </div>
  <div pane>
    <main>Main Content</main>
  </div>
</div>
```

By default the split is horizontal (side by side). Panes without a size value fill the remaining space.

---

## Attributes

### Split Container

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `split` | `"horizontal"` \| `"vertical"` | `"horizontal"` | Split direction |
| `split-persist` | string | -- | localStorage key to persist pane sizes |

### Pane

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `pane` | string (CSS size) | -- | Initial size (`"250px"`, `"30%"`). Omit for flexible fill |
| `pane-min` | number (px) | `0` | Minimum pane size in pixels |
| `pane-max` | number (px) | `Infinity` | Maximum pane size in pixels |
| `pane-collapsible` | `"true"` | -- | Enables collapse/expand via double-click on adjacent gutter |

---

## Events

| Event | `$event.detail` | Description |
|-------|-----------------|-------------|
| `split:resize` | `{ sizes: number[] }` | Fired on the container when panes are resized |

```html
<div split on:split:resize="console.log($event.detail.sizes)">
  <div pane="50%">Left</div>
  <div pane>Right</div>
</div>
```

---

## CSS Classes

| Class | When Applied |
|-------|-------------|
| `.nojs-split` | On the split container |
| `.nojs-split-gutter` | On each gutter element between panes |
| `.nojs-pane` | On each pane |

---

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--nojs-gutter-size` | `8px` | Width of the gutter (draggable divider) |

```css
/* Customize gutter width */
.my-split {
  --nojs-gutter-size: 4px;
}
```

### Default Gutter Styles

The gutter has `cursor: col-resize` (horizontal) or `cursor: row-resize` (vertical), centered flex alignment, and a subtle background. The cursor changes automatically based on the split direction.

---

## Accessibility

NoJS automatically applies:

- `role="separator"` on each gutter
- `aria-orientation` matching the split direction
- `aria-valuemin`, `aria-valuemax`, `aria-valuenow` on gutters for assistive technology
- `tabindex="0"` on gutters for keyboard access

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `ArrowRight` (horizontal) / `ArrowDown` (vertical) | Expand preceding pane by 10px |
| `ArrowLeft` (horizontal) / `ArrowUp` (vertical) | Shrink preceding pane by 10px |
| `Home` | Collapse preceding pane to minimum |
| `End` | Expand preceding pane to maximum |

All keyboard resizes respect `pane-min` / `pane-max` constraints and trigger persistence when `split-persist` is set.

---

## Examples

### Basic Horizontal Split

Sidebar and main content side by side with min/max constraints.

```html
<div split>
  <div pane="250px" pane-min="150" pane-max="400">
    <nav>Sidebar</nav>
  </div>
  <div pane>
    <main>Main Content</main>
  </div>
</div>
```

### Persisted Vertical Split with Collapsible Pane

Layout sizes are saved to localStorage and restored on page load. The bottom pane can be collapsed by double-clicking the gutter.

```html
<div split="vertical" split-persist="my-app-layout">
  <div pane="60%" pane-min="200">
    <div>Editor</div>
  </div>
  <div pane pane-min="100" pane-collapsible="true">
    <div>Terminal</div>
  </div>
</div>
```

### Nested Splits (IDE Layout)

Splits can be nested to create complex layouts. Each split container manages its own children independently.

```html
<div split>
  <div pane="200px" pane-min="150">
    <nav>File Explorer</nav>
  </div>
  <div pane>
    <div split="vertical">
      <div pane="70%">
        <div>Code Editor</div>
      </div>
      <div pane pane-collapsible="true">
        <div>Terminal</div>
      </div>
    </div>
  </div>
</div>
```

---

## Composition with NoJS Directives

The split element works with any NoJS directive inside its panes:

```html
<div state="{ files: [], activeFile: null }"
     get="/api/files | files">
  <div split split-persist="editor-layout"
       on:split:resize="console.log('Resized:', $event.detail.sizes)">
    <div pane="200px" pane-min="150" pane-max="350">
      <ul>
        <li each="file in files" key="file.id"
            on:click="activeFile = file"
            bind="file.name"></li>
      </ul>
    </div>
    <div pane>
      <div if="activeFile" bind-html="activeFile.content"></div>
      <div if="!activeFile">Select a file</div>
    </div>
  </div>
</div>
```

- Use `each` / `foreach` / `for` to render dynamic content inside panes
- Use `bind` / `bind-html` for reactive pane content
- Use `if` / `show` for conditional pane content
- Use `on:split:resize` to react to layout changes
- Use `state` on a parent to share data across panes
