# Popover

Rich content popover anchored to a trigger element. Uses three directives: `popover` (content), `popover-trigger` (open button), and `popover-dismiss` (close button inside). Supports light-dismiss (clicking outside closes the popover) and Escape key dismissal.

## Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Attributes](#attributes)
- [Events](#events)
- [CSS Classes](#css-classes)
- [Accessibility](#accessibility)
- [Examples](#examples)
  - [Basic Popover](#basic-popover)
  - [Navigation Menu Popover](#navigation-menu-popover)
  - [Right-positioned Popover](#right-positioned-popover)
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

Create a trigger button with `popover-trigger` and a content element with `popover`. Optionally include a `popover-dismiss` button inside the content to close it.

```html
<button popover-trigger>Open Menu</button>

<div popover>
  <p>Popover content goes here.</p>
  <button popover-dismiss>Close</button>
</div>
```

The trigger and content are linked automatically when no explicit ID is provided. The popover appears below the trigger by default.

---

## Attributes

### Popover Content

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `popover` | string (ID) | auto | Unique ID linking this element to its trigger(s). Auto-generated if omitted |
| `popover-position` | `"top"` \| `"bottom"` \| `"left"` \| `"right"` | `"bottom"` | Placement relative to the trigger element |

### Popover Trigger

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `popover-trigger` | string (ID) | auto | The `popover` ID to toggle. Finds nearest popover if omitted |

### Popover Dismiss

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `popover-dismiss` | boolean attr | -- | Closes the containing popover when clicked |

When linking explicitly, set matching IDs on the trigger and content:

```html
<button popover-trigger="my-menu">Open</button>
<div popover="my-menu">...</div>
```

---

## Events

No custom events emitted.

---

## CSS Classes

| Class | Applied to | Description |
|-------|-----------|-------------|
| `.nojs-popover` | Popover content element | Applied to the element with the `popover` attribute |

### Built-in Styles

Override in your own stylesheet to customize appearance:

```css
/* Example: card-style popover */
.nojs-popover {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.1);
}
```

### Positioning

Same viewport-aware positioning as tooltip:

1. Placed relative to the trigger based on `popover-position`
2. 8px gap separates the popover from the trigger element
3. Position clamped to keep a 4px margin from viewport edges

---

## Accessibility

NoJS automatically applies:

- `aria-haspopup="true"` on the trigger
- `aria-expanded="true"` / `"false"` on the trigger (reflects open state)
- `aria-controls` on the trigger pointing to the popover's ID
- `role="dialog"` on the popover content element
- Light-dismiss: clicking outside the popover closes it
- Escape key closes the popover

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Enter` / `Space` | Toggle the popover (on trigger) |
| `Escape` | Close the popover |

---

## Examples

### Basic Popover

A simple popover with a trigger and dismiss button.

```html
<button popover-trigger="info">More Info</button>

<div popover="info">
  <h3>Additional Details</h3>
  <p>This popover contains rich HTML content.</p>
  <button popover-dismiss>Got it</button>
</div>
```

### Navigation Menu Popover

A dropdown-style navigation menu using popover.

```html
<button popover-trigger="nav-menu">Menu</button>

<nav popover="nav-menu" popover-position="bottom">
  <ul style="list-style: none; padding: 0; margin: 0;">
    <li><a href="/dashboard">Dashboard</a></li>
    <li><a href="/settings">Settings</a></li>
    <li><a href="/profile">Profile</a></li>
  </ul>
</nav>
```

### Right-positioned Popover

A popover placed to the right of its trigger, useful for sidebar layouts.

```html
<button popover-trigger="details" style="display: block;">
  View Details
</button>

<div popover="details" popover-position="right">
  <h4>Item Details</h4>
  <p>Name: Widget Pro</p>
  <p>Price: $29.99</p>
  <button popover-dismiss>Close</button>
</div>
```

---

## Composition with NoJS Directives

Popovers work with any NoJS directive inside their content:

```html
<div state="{ user: null, loading: false }"
     get="/api/user | user"
     get-success="loading = false">

  <button popover-trigger="user-card">View Profile</button>

  <div popover="user-card" popover-position="bottom">
    <p if="loading">Loading...</p>
    <div if="user">
      <h3 bind="user.name"></h3>
      <p bind="user.email"></p>
      <p>Role: <span bind="user.role"></span></p>
    </div>
    <button popover-dismiss>Close</button>
  </div>
</div>
```

- Use `if` / `show` inside the popover for conditional content
- Use `bind` / `bind-html` for dynamic text
- Use `each` / `foreach` / `for` to render lists inside the popover
- Use `get` / `post` to fetch data when the popover opens
- Use `on:click` on elements inside the popover for actions
- Use `state` on a parent to share data between the trigger and popover content
