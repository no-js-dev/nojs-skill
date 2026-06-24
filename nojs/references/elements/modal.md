# Modal

Overlay dialog using the native Popover API (`popover="manual"`). Features focus trapping, stacking (nested modals), backdrop, and full ARIA support. Three directives: `modal` (content), `modal-open` (open trigger), and `modal-close` (close trigger).

## Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Attributes](#attributes)
- [Events](#events)
- [CSS Classes](#css-classes)
- [Accessibility](#accessibility)
- [Examples](#examples)
  - [Confirmation Dialog](#confirmation-dialog)
  - [Edit Form Modal](#edit-form-modal)
  - [Nested (Stacked) Modals](#nested-stacked-modals)
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

Create a trigger button with `modal-open` pointing to a modal ID, and a content element with the matching `modal` attribute. Include one or more `modal-close` buttons inside the modal to dismiss it.

```html
<button modal-open="my-modal">Open Modal</button>

<div modal="my-modal">
  <h2>Modal Title</h2>
  <p>Modal content goes here.</p>
  <button modal-close>Close</button>
</div>
```

The modal opens as a centered overlay with a semi-transparent backdrop. Pressing Escape or clicking the backdrop closes it by default.

---

## Attributes

### Modal Content

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `modal` | string (ID) | *required* | Unique modal identifier |
| `modal-class` | string | -- | Additional CSS class(es) added to the modal wrapper |
| `modal-escape` | `"true"` \| `"false"` | `"true"` | Whether pressing Escape closes the modal |
| `modal-backdrop` | `"true"` \| `"false"` | `"true"` | Whether clicking the backdrop closes the modal (light-dismiss) |

### Modal Open

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `modal-open` | string (ID) | *required* | The `modal` ID to open |

### Modal Close

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `modal-close` | string (ID) \| boolean | -- | Closes the specified modal, or the nearest ancestor modal if no ID given |

---

## Events

No custom events emitted. Use `on:click` on `modal-close` buttons for side effects.

---

## CSS Classes

| Class | Applied to | Description |
|-------|-----------|-------------|
| `.nojs-modal` | Modal content element | Applied to all modal elements |
| `.nojs-modal::backdrop` | Native backdrop overlay | Dark semi-transparent backdrop |

### Built-in Styles

```css
.nojs-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  margin: 0;
  border: none;
  padding: 0;
  max-width: 100dvw;
  max-height: 100dvh;
  background: transparent;
}
.nojs-modal::backdrop {
  background: rgb(0 0 0 / 0.5);
}
.nojs-modal[data-nojs-no-backdrop]::backdrop {
  background: transparent;
}
```

Override in your own stylesheet to customize the modal container or backdrop:

```css
/* Example: narrower modal with rounded card */
.nojs-modal > * {
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 480px;
  width: 90%;
  box-shadow: 0 8px 32px rgb(0 0 0 / 0.2);
}
```

---

## Template Usage

Modal content is processed as a NoJS template. All directives (`bind`, `if`, `each`, `state`, etc.) work inside modals.

---

## Stacking (Nested Modals)

Opening a modal from inside another modal stacks them. Each gets an incremented `z-index`. Closing the inner modal returns focus to the outer modal.

```html
<button modal-open="outer">Open Outer</button>

<div modal="outer">
  <h2>Outer Modal</h2>
  <p>This is the first modal.</p>
  <button modal-open="inner">Open Inner</button>
  <button modal-close>Close Outer</button>
</div>

<div modal="inner">
  <h2>Inner Modal</h2>
  <p>This is stacked on top of the outer modal.</p>
  <button modal-close>Close Inner</button>
</div>
```

---

## Accessibility

NoJS automatically applies:

- `role="dialog"` on the modal element
- `aria-modal="true"` on the modal element
- Focus is trapped inside the open modal (Tab / Shift+Tab cycle)
- Focus returns to the trigger element when the modal closes
- Escape key closes the modal (unless `modal-escape="false"`)

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Escape` | Close the topmost modal (unless disabled via `modal-escape="false"`) |
| `Tab` | Cycle focus forward through focusable elements inside the modal |
| `Shift+Tab` | Cycle focus backward through focusable elements inside the modal |

### Focus Trap

When a modal opens, focus moves to the first focusable element inside. Tab and Shift+Tab wrap around within the modal boundaries. Focus is restored to the opening trigger when the modal closes.

---

## Examples

### Confirmation Dialog

A simple confirmation dialog with cancel and confirm actions.

```html
<div state="{ itemToDelete: 'Report Q4' }">
  <button modal-open="confirm-delete">Delete Item</button>

  <div modal="confirm-delete">
    <div style="background: white; padding: 24px; border-radius: 8px; max-width: 400px;">
      <h2>Confirm Delete</h2>
      <p>Are you sure you want to delete "<span bind="itemToDelete"></span>"?</p>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <button modal-close>Cancel</button>
        <button modal-close
                on:click="console.log('Deleted:', itemToDelete)"
                style="background: #e53e3e; color: white;">
          Delete
        </button>
      </div>
    </div>
  </div>
</div>
```

### Edit Form Modal

A modal containing a reactive form with NoJS directives.

```html
<div state="{ user: { name: 'Jane Doe', email: 'jane@example.com' } }">
  <p>Name: <span bind="user.name"></span></p>
  <p>Email: <span bind="user.email"></span></p>
  <button modal-open="edit-user">Edit Profile</button>

  <div modal="edit-user">
    <div style="background: white; padding: 24px; border-radius: 8px; max-width: 480px;">
      <h2>Edit Profile</h2>
      <form>
        <label>
          Name
          <input type="text" model="user.name">
        </label>
        <label>
          Email
          <input type="email" model="user.email">
        </label>
        <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px;">
          <button type="button" modal-close>Cancel</button>
          <button type="button" modal-close
                  on:click="console.log('Saved:', user)">
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
```

### Nested (Stacked) Modals

Opening a second modal from inside the first stacks them with increasing z-index.

```html
<button modal-open="settings">Settings</button>

<div modal="settings">
  <div style="background: white; padding: 24px; border-radius: 8px; max-width: 500px;">
    <h2>Settings</h2>
    <p>Configure your preferences.</p>
    <button modal-open="advanced">Advanced Settings</button>
    <button modal-close style="margin-left: 8px;">Close</button>
  </div>
</div>

<div modal="advanced">
  <div style="background: white; padding: 24px; border-radius: 8px; max-width: 400px;">
    <h2>Advanced Settings</h2>
    <p>These settings are for power users.</p>
    <button modal-close>Back to Settings</button>
  </div>
</div>
```

Closing the "Advanced Settings" modal returns focus to the "Advanced Settings" button in the outer modal.

---

## Composition with NoJS Directives

Modals work with any NoJS directive inside their content:

```html
<div state="{ users: [], loading: true }"
     get="/api/users | users"
     get-success="loading = false">

  <button modal-open="user-list">View All Users</button>

  <div modal="user-list" modal-class="wide-modal">
    <div style="background: white; padding: 24px; border-radius: 8px; max-width: 600px;">
      <h2>Users</h2>
      <p if="loading">Loading users...</p>
      <ul if="!loading">
        <li each="user in users" key="user.id">
          <strong bind="user.name"></strong> -- <span bind="user.email"></span>
        </li>
      </ul>
      <p if="!loading && users.length === 0">No users found.</p>
      <button modal-close style="margin-top: 16px;">Close</button>
    </div>
  </div>
</div>
```

- Use `if` / `show` inside the modal for conditional content
- Use `bind` / `bind-html` for dynamic text
- Use `each` / `foreach` / `for` to render lists inside the modal
- Use `model` for two-way form bindings
- Use `get` / `post` to fetch or submit data
- Use `on:click` on `modal-close` buttons for side effects (save, delete, etc.)
- Use `state` on a parent to share data between the page and modal content
- Use `modal-class` to add custom CSS classes for styling variants
