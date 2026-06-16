# Dropdown

Accessible dropdown menu with keyboard navigation. Four directives: `dropdown` (container), `dropdown-toggle` (trigger button), `dropdown-menu` (menu panel), `dropdown-item` (actionable items). Uses standard HTML elements with NoJS directive attributes -- not custom elements.

## Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Attributes](#attributes)
- [CSS Classes](#css-classes)
- [Accessibility](#accessibility)
- [Examples](#examples)
  - [Basic File Menu](#basic-file-menu)
  - [Dropdown with Links](#dropdown-with-links)
  - [Dropdown with Disabled Items](#dropdown-with-disabled-items)
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

Place the `dropdown` attribute on a container element. Inside it, mark the trigger with `dropdown-toggle`, the menu panel with `dropdown-menu`, and each actionable entry with `dropdown-item`.

```html
<div dropdown>
  <button dropdown-toggle>Options</button>
  <div dropdown-menu>
    <button dropdown-item>Edit</button>
    <button dropdown-item>Duplicate</button>
    <button dropdown-item>Delete</button>
  </div>
</div>
```

Clicking the toggle opens the menu. Clicking outside (light-dismiss), pressing `Escape`, or pressing `Tab` closes it.

---

## Attributes

### Container

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `dropdown` | boolean attr | -- | Declares the dropdown container |
| `dropdown-position` | `"bottom-start"` \| `"bottom-end"` \| `"top-start"` \| `"top-end"` | `"bottom-start"` | Menu placement relative to toggle |
| `dropdown-align` | `"start"` \| `"end"` | `"start"` | Horizontal alignment of the menu |

### Toggle

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `dropdown-toggle` | boolean attr | -- | Marks the trigger button |

### Menu

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `dropdown-menu` | boolean attr | -- | Marks the menu panel |

### Item

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `dropdown-item` | boolean attr | -- | Marks an actionable menu item |
| `disabled` | boolean attr | -- | Disables the item (grayed out, skipped by keyboard) |

---

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Enter` / `Space` | Open menu (on toggle) or activate item |
| `ArrowDown` | Move to next item (opens menu if closed) |
| `ArrowUp` | Move to previous item |
| `Home` | Move to first item |
| `End` | Move to last item |
| `Escape` | Close menu and return focus to toggle |
| `Tab` | Close menu and move focus out |

---

## CSS Classes

| Class | When Applied |
|-------|-------------|
| `.nojs-dropdown-menu` | On the menu element |
| `.nojs-dropdown-item` | On each item element |
| `.nojs-dropdown-item[aria-disabled="true"]` | On disabled items |
| `.nojs-dropdown-item:focus-visible` | On the currently focused item |

### Built-in Styles

| Selector | Style |
|----------|-------|
| `.nojs-dropdown-menu` | `position: fixed; z-index: 9999; min-width: max-content` |
| `.nojs-dropdown-item[aria-disabled="true"]` | `pointer-events: none; opacity: 0.5` |

The menu uses `position: fixed` and repositions on scroll and resize while open.

---

## Accessibility

NoJS automatically applies:

- `role="menu"` on the menu element
- `role="menuitem"` on each item
- `aria-haspopup="menu"` on the toggle
- `aria-expanded="true"` / `"false"` on the toggle
- `aria-disabled="true"` on disabled items
- Clicking outside closes the menu (light-dismiss)

No custom events are emitted.

---

## Examples

### Basic File Menu

A simple dropdown with action buttons.

```html
<div dropdown>
  <button dropdown-toggle>File</button>
  <div dropdown-menu>
    <button dropdown-item>New</button>
    <button dropdown-item>Open</button>
    <button dropdown-item>Save</button>
    <button dropdown-item>Save As...</button>
  </div>
</div>
```

### Dropdown with Links

Items can be anchor elements instead of buttons.

```html
<nav dropdown>
  <button dropdown-toggle>Account</button>
  <div dropdown-menu>
    <a dropdown-item href="/profile">Profile</a>
    <a dropdown-item href="/settings">Settings</a>
    <a dropdown-item href="/billing">Billing</a>
    <a dropdown-item href="/logout">Log Out</a>
  </div>
</nav>
```

### Dropdown with Disabled Items

Use the `disabled` attribute to gray out items and skip them during keyboard navigation.

```html
<div dropdown>
  <button dropdown-toggle>Edit</button>
  <div dropdown-menu>
    <button dropdown-item>Undo</button>
    <button dropdown-item disabled>Redo</button>
    <button dropdown-item>Cut</button>
    <button dropdown-item>Copy</button>
    <button dropdown-item disabled>Paste</button>
  </div>
</div>
```

---

## Composition with NoJS Directives

The dropdown works with any NoJS directive inside its menu:

```html
<div state="{ actions: [
  { label: 'Edit', enabled: true },
  { label: 'Duplicate', enabled: true },
  { label: 'Archive', enabled: false },
  { label: 'Delete', enabled: true }
] }">
  <div dropdown dropdown-position="bottom-end">
    <button dropdown-toggle>Actions</button>
    <div dropdown-menu>
      <button dropdown-item
              each="action in actions"
              key="action.label"
              bind="action.label"
              disabled="!action.enabled">
      </button>
    </div>
  </div>
</div>
```

- Use `each` / `foreach` / `for` to render dynamic items
- Use `bind` for dynamic item labels
- Use `if` / `show` inside items for conditional content
- Use `on:click` on items to handle selection
- Use `state` on a parent to share data across the menu
