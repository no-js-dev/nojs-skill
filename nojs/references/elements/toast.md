# Toast

Non-blocking notification messages with auto-dismiss and type-based styling. Two approaches: declarative (`toast` attribute) and programmatic (`$toast()` global function). Uses standard HTML elements with NoJS directive attributes -- not custom elements.

## Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Attributes](#attributes)
- [Global Function: $toast()](#global-function-toast)
- [Toast Positions](#toast-positions)
- [Auto-Dismiss](#auto-dismiss)
- [CSS Classes](#css-classes)
- [Accessibility](#accessibility)
- [Examples](#examples)
  - [Programmatic Toast from Button Click](#programmatic-toast-from-button-click)
  - [Declarative Toast on Form Submit](#declarative-toast-on-form-submit)
  - [Multiple Containers at Different Positions](#multiple-containers-at-different-positions)
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

Add a `toast-container` element to position notifications on screen. Then use `$toast()` to show messages programmatically, or the `toast` attribute for declarative toasts tied to reactive expressions.

```html
<!-- Container (place once in the page) -->
<div toast-container toast-position="top-right"></div>

<!-- Trigger a toast on click -->
<button on:click="$toast('File saved!', 'success')">Save</button>
```

If no container exists when `$toast()` is called, one is automatically created at the `top-right` position.

---

## Attributes

### Container

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `toast-container` | boolean attr | -- | Declares a toast container |
| `toast-position` | `"top-right"` \| `"top-left"` \| `"top-center"` \| `"bottom-right"` \| `"bottom-left"` \| `"bottom-center"` | `"top-right"` | Screen position |
| `toast-max` | number | `5` | Maximum visible toasts (oldest dismissed when exceeded) |

### Declarative Toast

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `toast` | expression | *required* | Shows the toast when the expression becomes truthy |
| `toast-type` | `"info"` \| `"success"` \| `"warning"` \| `"error"` | `"info"` | Visual type |
| `toast-duration` | number (ms) | `3000` | Auto-dismiss delay. `0` for permanent |
| `toast-dismiss` | boolean attr | -- | Shows a dismiss button |

---

## Global Function: `$toast()`

```
$toast(message, type?, duration?) -> HTMLElement
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `message` | string | *required* | Toast text content |
| `type` | `"info"` \| `"success"` \| `"warning"` \| `"error"` | `"info"` | Visual type |
| `duration` | number (ms) | `3000` | Auto-dismiss delay. `0` for permanent |

- Always shows a dismiss button
- Uses the first registered `toast-container`, or auto-creates a `top-right` container if none exists
- Returns the created toast DOM element

---

## Toast Positions

Six positions are supported:

| Position | Description |
|----------|-------------|
| `top-right` | Top-right corner (default) |
| `top-left` | Top-left corner |
| `top-center` | Top-center |
| `bottom-right` | Bottom-right corner |
| `bottom-left` | Bottom-left corner |
| `bottom-center` | Bottom-center |

---

## Auto-Dismiss

Toasts auto-dismiss after `toast-duration` milliseconds (default `3000`). Set duration to `0` for permanent toasts that must be manually dismissed via the dismiss button.

---

## CSS Classes

| Class / Selector | When Applied |
|------------------|-------------|
| `.nojs-toast-container` | On each toast container element |
| `.nojs-toast-container[data-position="top-right"]` | Positions at top-right corner |
| `.nojs-toast-container[data-position="top-left"]` | Positions at top-left corner |
| `.nojs-toast-container[data-position="top-center"]` | Positions at top-center |
| `.nojs-toast-container[data-position="bottom-right"]` | Positions at bottom-right corner |
| `.nojs-toast-container[data-position="bottom-left"]` | Positions at bottom-left corner |
| `.nojs-toast-container[data-position="bottom-center"]` | Positions at bottom-center |
| `.nojs-toast` | On each individual toast element |
| `.nojs-toast[data-type="info"]` | Style hook for info toasts |
| `.nojs-toast[data-type="success"]` | Style hook for success toasts |
| `.nojs-toast[data-type="warning"]` | Style hook for warning toasts |
| `.nojs-toast[data-type="error"]` | Style hook for error toasts |
| `.nojs-toast-dismiss` | On the dismiss button |

### Built-in Styles

| Selector | Style |
|----------|-------|
| `.nojs-toast-container` | `position: fixed; z-index: 10001; max-width: min(24rem, calc(100vw - 2rem))` |
| `.nojs-toast` | Uses `popover="manual"` for stacking |

---

## Accessibility

NoJS automatically applies:

- `role="status"` and `aria-live="polite"` on the container for screen reader announcements
- `aria-relevant="additions"` to announce new toasts
- Dismiss buttons are keyboard-accessible

No custom events are emitted.

---

## Examples

### Programmatic Toast from Button Click

Use `$toast()` to show notifications from event handlers.

```html
<div toast-container toast-position="top-right"></div>

<button on:click="$toast('Item saved successfully', 'success')">
  Save
</button>
<button on:click="$toast('Something went wrong', 'error', 5000)">
  Trigger Error
</button>
<button on:click="$toast('This stays until dismissed', 'warning', 0)">
  Permanent Toast
</button>
```

### Declarative Toast on Form Submit

Show a toast reactively when a state value becomes truthy.

```html
<div state="{ submitted: false }">
  <div toast-container toast-position="bottom-center"></div>

  <span toast="submitted"
        toast-type="success"
        toast-duration="4000"
        toast-dismiss>
    Form submitted successfully!
  </span>

  <form on:submit.prevent="submitted = true">
    <input type="text" placeholder="Your name" required>
    <button type="submit">Submit</button>
  </form>
</div>
```

### Multiple Containers at Different Positions

Place containers at different screen positions for different notification types.

```html
<!-- Errors at top-center -->
<div toast-container toast-position="top-center" toast-max="3"></div>

<!-- Success messages at bottom-right -->
<div toast-container toast-position="bottom-right" toast-max="5"></div>

<div state="{ }">
  <button on:click="$toast('Operation completed', 'success')">
    Success Action
  </button>
  <button on:click="$toast('Connection lost', 'error', 0)">
    Error Action
  </button>
</div>
```

---

## Composition with NoJS Directives

The toast system works with any NoJS directive:

```html
<div state="{ notifications: [], fetchError: false }"
     get="/api/data | notifications"
     get-error="fetchError = true">

  <div toast-container toast-position="top-right" toast-max="3"></div>

  <span toast="fetchError"
        toast-type="error"
        toast-duration="0"
        toast-dismiss>
    Failed to load data. Please try again.
  </span>

  <button on:click="$toast('Refreshing...', 'info', 1500)"
          get="/api/data | notifications">
    Refresh
  </button>

  <ul>
    <li each="item in notifications" key="item.id" bind="item.message"></li>
  </ul>
</div>
```

- Use `$toast()` in `on:click`, `get-success`, or `get-error` handlers
- Use declarative `toast` with reactive expressions for condition-based notifications
- Use `state` on a parent to drive toast visibility from shared data
- Combine with `get` / `post` to show toasts on API success or failure
