# Tabs

Tabbed content panels with roving tabindex keyboard navigation. Three directives: `tabs` (container), `tab` (tab button), `panel` (content panel). Supports top, bottom, left, and right tab positions and disabled tabs. Uses standard HTML elements with NoJS directive attributes -- not custom elements.

## Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Attributes](#attributes)
- [Tab Positions](#tab-positions)
- [Disabled Tabs](#disabled-tabs)
- [Keyboard Navigation](#keyboard-navigation)
- [CSS Classes](#css-classes)
- [Accessibility](#accessibility)
- [Examples](#examples)
  - [Basic Horizontal Tabs](#basic-horizontal-tabs)
  - [Vertical Tabs with Disabled Tab](#vertical-tabs-with-disabled-tab)
  - [Dynamic Tabs from Data Array](#dynamic-tabs-from-data-array)
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

Place the `tabs` attribute on a container element. Inside it, add buttons with `tab` attributes and content elements with matching `panel` attributes. The `tab` and `panel` values must match to link them together.

```html
<div tabs>
  <button tab="overview">Overview</button>
  <button tab="features">Features</button>
  <button tab="pricing">Pricing</button>

  <div panel="overview">
    <p>Welcome to the overview.</p>
  </div>
  <div panel="features">
    <p>Here are the features.</p>
  </div>
  <div panel="pricing">
    <p>Pricing details here.</p>
  </div>
</div>
```

The first tab is selected by default. Only the active panel is visible; inactive panels are hidden.

---

## Attributes

### Container

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `tabs` | boolean attr | -- | Declares the tab container |
| `tab-position` | `"top"` \| `"bottom"` \| `"left"` \| `"right"` | `"top"` | Position of the tab list relative to panels |

### Tab Button

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `tab` | string | *required* | Tab identifier (must match a `panel` value) |
| `tab-disabled` | expression | -- | Reactive expression. When truthy, disables the tab |

### Panel

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `panel` | string | *required* | Panel identifier (must match a `tab` value) |

---

## Tab Positions

| Position | Description |
|----------|-------------|
| `"top"` (default) | Tabs above panels (horizontal tab list) |
| `"bottom"` | Tabs below panels (reversed column layout) |
| `"left"` | Tabs to the left of panels (horizontal flex, vertical tab list) |
| `"right"` | Tabs to the right of panels (horizontal flex, vertical tab list) |

---

## Disabled Tabs

Tabs with `tab-disabled` set to a truthy expression are grayed out, skipped by keyboard navigation, and cannot be activated.

```html
<div tabs>
  <button tab="active">Active</button>
  <button tab="locked" tab-disabled="true">Locked</button>
  <button tab="other">Other</button>

  <div panel="active"><p>Active content.</p></div>
  <div panel="locked"><p>Locked content.</p></div>
  <div panel="other"><p>Other content.</p></div>
</div>
```

Because `tab-disabled` accepts a reactive expression, it can be bound to state:

```html
<div state="{ isPremium: false }" tabs>
  <button tab="free">Free</button>
  <button tab="premium" tab-disabled="!isPremium">Premium</button>

  <div panel="free"><p>Free content.</p></div>
  <div panel="premium"><p>Premium content.</p></div>
</div>
```

---

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `ArrowRight` (horizontal) / `ArrowDown` (vertical) | Move to next tab |
| `ArrowLeft` (horizontal) / `ArrowUp` (vertical) | Move to previous tab |
| `Home` | Move to first tab |
| `End` | Move to last tab |
| `Enter` / `Space` | Activate focused tab (if using manual activation) |

Arrow direction depends on tab position: horizontal arrows for `top` / `bottom`, vertical arrows for `left` / `right`.

---

## CSS Classes

| Class | When Applied |
|-------|-------------|
| `.nojs-tabs` | On the container |
| `.nojs-tablist` | On the generated tab list wrapper |
| `.nojs-tab` | On each tab button |
| `.nojs-panel` | On each panel |

### Built-in Styles

| Selector | Style |
|----------|-------|
| `.nojs-tab[aria-disabled="true"]` | `pointer-events: none; opacity: 0.5` |
| `.nojs-panel[aria-hidden="true"]` | `display: none` |
| `.nojs-tabs[data-position="left"]`, `.nojs-tabs[data-position="right"]` | `flex-direction: row` |
| `.nojs-tabs[data-position="bottom"]` | Reversed column layout |
| `.nojs-tabs[data-position="left"] .nojs-tablist`, `.nojs-tabs[data-position="right"] .nojs-tablist` | `flex-direction: column` |

---

## Accessibility

NoJS automatically applies:

- `role="tablist"` on the generated tab list wrapper
- `role="tab"` on each tab, with `aria-selected` and `aria-controls`
- `role="tabpanel"` on each panel, with `aria-labelledby`
- `tabindex="0"` on the active tab, `tabindex="-1"` on inactive tabs (roving tabindex)
- `tabindex="0"` on each panel for keyboard access
- `aria-hidden="true"` and `inert` on inactive panels
- `aria-disabled="true"` on disabled tabs

No custom events are emitted.

---

## Examples

### Basic Horizontal Tabs

Tabs above the content panels (default position).

```html
<div tabs>
  <button tab="about">About</button>
  <button tab="team">Team</button>
  <button tab="contact">Contact</button>

  <div panel="about">
    <h3>About Us</h3>
    <p>We build HTML-first tools for the modern web.</p>
  </div>
  <div panel="team">
    <h3>Our Team</h3>
    <p>A small team passionate about simplicity.</p>
  </div>
  <div panel="contact">
    <h3>Contact</h3>
    <p>Email us at hello@example.com.</p>
  </div>
</div>
```

### Vertical Tabs with Disabled Tab

Tabs on the left with one tab disabled via a reactive expression.

```html
<div state="{ hasPermission: false }">
  <div tabs tab-position="left">
    <button tab="general">General</button>
    <button tab="security">Security</button>
    <button tab="admin" tab-disabled="!hasPermission">Admin</button>

    <div panel="general">
      <h3>General Settings</h3>
      <p>Basic configuration options.</p>
    </div>
    <div panel="security">
      <h3>Security Settings</h3>
      <p>Two-factor authentication and password policies.</p>
    </div>
    <div panel="admin">
      <h3>Admin Panel</h3>
      <p>Restricted to authorized users.</p>
    </div>
  </div>
</div>
```

### Dynamic Tabs from Data Array

Tabs generated from a data array using the `each` directive.

```html
<div state="{ sections: [
  { id: 'html', title: 'HTML', content: 'Structure your content.' },
  { id: 'css', title: 'CSS', content: 'Style your pages.' },
  { id: 'nojs', title: 'NoJS', content: 'Add reactivity with attributes.' }
] }">
  <div tabs>
    <button each="section in sections"
            key="section.id"
            tab="section.id"
            bind="section.title">
    </button>

    <div each="section in sections"
         key="section.id"
         panel="section.id">
      <p bind="section.content"></p>
    </div>
  </div>
</div>
```

---

## Composition with NoJS Directives

The tabs element works with any NoJS directive inside its panels:

```html
<div state="{ activeUsers: [], logs: [], loading: true }"
     get="/api/users | activeUsers"
     get-success="loading = false">
  <div tabs tab-position="top">
    <button tab="users">Users</button>
    <button tab="logs">Activity Logs</button>

    <div panel="users">
      <p if="loading">Loading users...</p>
      <ul if="!loading">
        <li each="user in activeUsers" key="user.id" bind="user.name"></li>
      </ul>
    </div>
    <div panel="logs" state="{ logs: [] }" get="/api/logs | logs">
      <table>
        <tr each="log in logs" key="log.id">
          <td bind="log.timestamp"></td>
          <td bind="log.action"></td>
        </tr>
      </table>
    </div>
  </div>
</div>
```

- Use `each` / `foreach` / `for` to render dynamic tabs and panels
- Use `bind` / `bind-html` for dynamic content inside panels
- Use `if` / `show` for conditional content within panels
- Use `get` / `post` to load panel content on demand
- Use `state` on a parent to share data across panels
