# Skeleton

Loading placeholder with shimmer animation. Shows a skeleton overlay while a reactive condition is truthy, hiding actual content underneath. Supports text, circle, and rectangle shapes. Dark mode compatible via `currentColor` shimmer.

## Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Attributes](#attributes)
- [CSS Classes](#css-classes)
- [Shimmer Animation](#shimmer-animation)
- [Accessibility](#accessibility)
- [Examples](#examples)
  - [Reactive Loading Skeleton](#reactive-loading-skeleton)
  - [Text Skeleton with Multiple Lines](#text-skeleton-with-multiple-lines)
  - [Circle Avatar Skeleton](#circle-avatar-skeleton)
  - [Card Skeleton](#card-skeleton)
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

Add the `skeleton` attribute to any element with a reactive expression. While the expression is truthy, the element displays a skeleton placeholder instead of its content.

```html
<div state="{ loading: true }">
  <div skeleton="loading">
    <p>This content is hidden while loading is true.</p>
  </div>
</div>
```

When `loading` becomes falsy, the skeleton deactivates and the actual content is revealed.

---

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `skeleton` | expression | *required* | Reactive expression -- shows skeleton while truthy |
| `skeleton-type` | `"text"` \| `"circle"` \| `"rect"` | `"text"` | Shape of the placeholder |
| `skeleton-lines` | number | -- | Number of simulated text lines. Last line is 60% width |
| `skeleton-size` | number \| string | -- | Explicit dimension (width and height) for circle/rect. Appends `px` if bare number |

The `skeleton` attribute is placed on standard HTML elements. `skeleton-type`, `skeleton-lines`, and `skeleton-size` modify the appearance of the placeholder.

---

## CSS Classes

| Class | When Applied |
|-------|-------------|
| `.nojs-skeleton` | On the element while skeleton is active |
| `.nojs-skeleton > *` | Children invisible (`opacity: 0`, `pointer-events: none`) |
| `.nojs-skeleton::after` | Shimmer animation overlay |
| `.nojs-skeleton-circle` | With `skeleton-type="circle"` -- forces `border-radius: 50%` |
| `.nojs-skeleton-fade` | Transition class during deactivation (`opacity 0.3s ease`) |
| `.nojs-skeleton-line` | Generated text line placeholders (`0.8em` height, `0.6em` margin) |
| `.nojs-skeleton-line:last-child` | Last line is `60%` width for natural paragraph look |

---

## Shimmer Animation

Uses `@keyframes nojs-shimmer` -- a `linear-gradient` sweeping right to left over `1.5s` with `ease-in-out` timing, repeating infinitely. The gradient uses `color-mix(in srgb, currentColor %, transparent)` for automatic dark mode compatibility -- the shimmer adapts to the inherited `color` property.

```css
/* The shimmer inherits from currentColor, so dark mode works automatically */
.dark-theme {
  color: #e0e0e0; /* Shimmer adapts to this */
}
```

---

## Accessibility

NoJS automatically applies:

- `aria-busy="true"` on the element while the skeleton is active
- `aria-busy` is removed when the skeleton deactivates
- Screen readers announce the loading state

No custom events are emitted by the skeleton element.

---

## Examples

### Reactive Loading Skeleton

Skeleton shows while data is being fetched, then reveals the content.

```html
<div state="{ loading: true, user: null }"
     get="/api/user | user"
     get-success="loading = false">
  <div skeleton="loading">
    <h2 bind="user.name"></h2>
    <p bind="user.bio"></p>
  </div>
</div>
```

### Text Skeleton with Multiple Lines

Simulates a paragraph with multiple lines. The last line renders at 60% width for a natural look.

```html
<div skeleton="loading" skeleton-type="text" skeleton-lines="4">
  <p bind="article.body"></p>
</div>
```

### Circle Avatar Skeleton

Displays a circular placeholder for avatar images.

```html
<div skeleton="loading" skeleton-type="circle" skeleton-size="64">
  <img bind-src="user.avatar" alt="Avatar" />
</div>
```

### Card Skeleton

Combines multiple skeleton types to simulate a full card layout.

```html
<div skeleton="loading" style="width: 300px">
  <div skeleton-type="rect" skeleton-size="300">
    <img bind-src="card.image" />
  </div>
  <div skeleton-type="text" skeleton-lines="3">
    <h3 bind="card.title"></h3>
    <p bind="card.description"></p>
  </div>
</div>
```

---

## Composition with NoJS Directives

The skeleton works with any NoJS directive inside its content:

```html
<div state="{ loading: true, items: [] }"
     get="/api/items | items"
     get-success="loading = false">
  <div skeleton="loading">
    <ul>
      <li each="item in items" key="item.id" bind="item.name"></li>
    </ul>
  </div>
</div>
```

- Use `skeleton` with `get` / `post` to show loading state during HTTP requests
- Use `bind` / `bind-html` for dynamic content revealed after loading
- Use `each` / `foreach` / `for` inside skeleton containers for list content
- Use `state` on a parent to control the loading flag across multiple skeletons
