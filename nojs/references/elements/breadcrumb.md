# Breadcrumb

Navigation breadcrumb trail with two modes: manual (child elements define crumbs) and auto-track (empty container auto-generates crumbs from the current route path). Uses standard HTML elements with NoJS directive attributes -- no custom element registration required.

## Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Attributes](#attributes)
- [Label Priority](#label-priority)
- [Auto-Track Mode](#auto-track-mode)
- [Manual Mode](#manual-mode)
- [Events](#events)
- [CSS Classes](#css-classes)
- [CSS Custom Properties](#css-custom-properties)
- [Accessibility](#accessibility)
- [Examples](#examples)
  - [Manual Breadcrumb with Links](#manual-breadcrumb-with-links)
  - [Auto-Track with Router](#auto-track-with-router)
  - [Custom Separator](#custom-separator)
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

Add the `breadcrumb` attribute to a container element. In manual mode, provide child elements (`<a>`, `<span>`, etc.) for each crumb. The last child automatically becomes the current page indicator.

```html
<nav breadcrumb>
  <a href="/">Home</a>
  <a href="/products">Products</a>
  <span>Widget Pro</span>
</nav>
```

For auto-track mode, use an empty container -- crumbs are generated automatically from the current route path.

```html
<nav breadcrumb></nav>
```

---

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `breadcrumb` | string | -- | Declares the element as a breadcrumb container. Value is ignored for the container; use on child elements to set a custom label |

The `breadcrumb` attribute is placed on the container element. In manual mode, child elements define each crumb. In auto-track mode, the container is left empty and crumbs are generated from the route.

---

## Label Priority

When determining the display label for each crumb (child elements in manual mode), the following priority applies:

1. `breadcrumb` attribute value (highest)
2. `title` attribute value
3. Text content (fallback)

```html
<nav breadcrumb>
  <a href="/settings" breadcrumb="Preferences">Account Settings</a>
  <!-- Displays "Preferences", not "Account Settings" -->

  <a href="/billing" title="Billing & Payments">Billing</a>
  <!-- Displays "Billing & Payments", not "Billing" -->

  <span>Current Page</span>
  <!-- Displays "Current Page" (text content fallback) -->
</nav>
```

---

## Auto-Track Mode

Activates when the container has no child elements AND `NoJS.router` exists. The breadcrumb subscribes to route changes and rebuilds on every navigation.

Path segments are converted to labels by replacing hyphens and underscores with spaces and capitalizing the first letter. The root path `/` renders a single "Home" crumb.

| Path | Rendered Breadcrumb |
|------|---------------------|
| `/` | Home |
| `/products` | Home / Products |
| `/user-settings/billing-info` | Home / User settings / Billing info |
| `/docs/api_reference` | Home / Api reference |

```html
<!-- Auto-track: crumbs generated from router -->
<nav breadcrumb></nav>
```

---

## Manual Mode

Child elements (`<a>`, `<span>`, etc.) define each crumb explicitly. The last child automatically receives `aria-current="page"` and becomes non-clickable.

```html
<nav breadcrumb>
  <a href="/">Home</a>
  <a href="/docs">Documentation</a>
  <a href="/docs/elements">Elements</a>
  <span>Breadcrumb</span>
</nav>
```

---

## Events

No custom events are emitted. Use standard NoJS `on:click` on child elements to handle crumb interactions.

```html
<nav breadcrumb>
  <a href="/" on:click="trackNav('home')">Home</a>
  <a href="/products" on:click="trackNav('products')">Products</a>
  <span>Current</span>
</nav>
```

---

## CSS Classes

| Class | Applied to | Description |
|-------|-----------|-------------|
| `.nojs-breadcrumb` | Generated `<ol>` element | The ordered list wrapping the breadcrumb items |

### Built-in Styles

| Selector | Style |
|----------|-------|
| `.nojs-breadcrumb` | `display: flex; align-items: center; flex-wrap: wrap; list-style: none; margin: 0; padding: 0; font-size: 0.875rem` |
| `.nojs-breadcrumb li` | `display: flex; align-items: center; gap: var(--nojs-breadcrumb-gap)` |
| `.nojs-breadcrumb li + li::before` | `content: var(--nojs-breadcrumb-separator); color: #94A3B8` |
| `.nojs-breadcrumb a` | `color: #0EA5E9; text-decoration: none; transition: color 0.15s` |
| `.nojs-breadcrumb a:hover` | `color: #0284C7; text-decoration: underline` |
| `.nojs-breadcrumb [aria-current="page"]` | `color: var(--nojs-breadcrumb-active-color); font-weight: 500; pointer-events: none` |

---

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--nojs-breadcrumb-separator` | `"/"` | Separator character displayed between crumbs |
| `--nojs-breadcrumb-gap` | `0.5rem` | Gap between a crumb and its separator |
| `--nojs-breadcrumb-active-color` | `#1E293B` | Color of the current (last) crumb |

```css
/* Customize breadcrumb appearance */
.my-breadcrumb {
  --nojs-breadcrumb-separator: ">";
  --nojs-breadcrumb-gap: 0.75rem;
  --nojs-breadcrumb-active-color: #0F172A;
}
```

---

## Accessibility

NoJS automatically applies:

- `role="navigation"` on the breadcrumb container
- `aria-label="Breadcrumb"` on the container
- Generated list uses `<ol>` for ordered semantics
- Last crumb receives `aria-current="page"`
- Links are keyboard-navigable via native `<a>` behavior

### Progressive Enhancement

Because the breadcrumb builds on standard `<a>` and `<nav>` elements, it remains fully functional without JavaScript:

- **Without NoJS:** links work as normal navigation, no auto-track
- **With NoJS:** auto-track mode, label priority resolution, ARIA attributes, separator styling

---

## Examples

### Manual Breadcrumb with Links

Standard breadcrumb trail with explicit links for each level.

```html
<nav breadcrumb>
  <a href="/">Home</a>
  <a href="/docs">Documentation</a>
  <a href="/docs/elements">Elements</a>
  <span>Breadcrumb</span>
</nav>
```

### Auto-Track with Router

Empty container that auto-generates crumbs from the current route. Requires `NoJS.router` to be active.

```html
<div state="{}">
  <nav breadcrumb></nav>

  <main route="/">
    <h1>Home</h1>
  </main>
  <main route="/products">
    <h1>Products</h1>
  </main>
  <main route="/products/:id">
    <h1 bind="$route.params.id"></h1>
  </main>
</div>
```

### Custom Separator

Override the default `/` separator with a custom character and adjust spacing.

```html
<style>
  .arrow-breadcrumb {
    --nojs-breadcrumb-separator: "\203A";  /* single right-pointing angle */
    --nojs-breadcrumb-gap: 0.75rem;
    --nojs-breadcrumb-active-color: #1E40AF;
  }
</style>

<nav breadcrumb class="arrow-breadcrumb">
  <a href="/">Home</a>
  <a href="/settings">Settings</a>
  <span>Profile</span>
</nav>
```

---

## Composition with NoJS Directives

The breadcrumb works with any NoJS directive for dynamic content:

```html
<div state="{ crumbs: [], user: {} }"
     get="/api/breadcrumbs | crumbs">
  <nav breadcrumb>
    <a href="/">Home</a>
    <a each="crumb in crumbs"
       key="crumb.path"
       bind-href="crumb.path"
       bind="crumb.label"></a>
    <span bind="user.name" if="user.name"></span>
  </nav>
</div>
```

- Use `each` / `foreach` / `for` to render dynamic crumbs from data
- Use `bind` for dynamic labels
- Use `if` / `show` for conditional crumbs (e.g., show user name only when logged in)
- Use `route` alongside auto-track mode for automatic breadcrumb generation
- Use `state` on a parent to share navigation data across components
