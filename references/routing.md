# No.JS Routing Reference

Extended routing reference covering the View Transition API, route transitions, and advanced routing patterns.

---

## View Transition API

No.JS uses the [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) for route transitions by default. When a `route-view` outlet has a `transition` attribute, route changes are wrapped in `document.startViewTransition()` for smooth, native-quality page transitions.

### How It Works

1. **Outlet setup** -- No.JS dynamically sets `view-transition-name: route-content` on any `route-view` element that has a `transition` attribute.
2. **Navigation trigger** -- When the router navigates, the DOM swap (removing old content, inserting new content) is wrapped inside `document.startViewTransition({ update, types })`.
3. **Direction detection** -- The router tracks navigation direction (forward vs backward) and passes it as a type to `startViewTransition({ types: ['slide', 'forward'] })`. This enables direction-aware CSS animations.
4. **CSS animations** -- Built-in preset CSS targets `::view-transition-old(route-content)` and `::view-transition-new(route-content)` pseudo-elements with scoping via `:active-view-transition-type()`.
5. **Fallback** -- If the View Transition API is not supported by the browser, the DOM swap happens instantly without animation.

### Built-in Presets

| Preset | Description |
|--------|-------------|
| `slide` | Directional slide animation. Detects forward/backward navigation and slides content left/right accordingly. |
| `fade` | Cross-fade between the old and new route content. |
| `scale` | Old content scales down and fades out; new content scales up and fades in. |
| `none` | No transition animation. The DOM swap happens instantly. |

```html
<!-- Slide with automatic forward/backward direction -->
<main route-view transition="slide"></main>

<!-- Cross-fade -->
<main route-view transition="fade"></main>

<!-- Scale -->
<main route-view transition="scale"></main>

<!-- No animation -->
<main route-view transition="none"></main>
```

### Direction Detection

The `slide` preset automatically detects navigation direction:

- **Forward** -- triggered by `$router.push()`, clicking `<a route>` links, or `$router.forward()`
- **Backward** -- triggered by `$router.back()`, browser back button, or `popstate` events going backward in history

Direction types are passed to `document.startViewTransition({ types })`:
- Forward navigation: `types: ['slide', 'forward']`
- Backward navigation: `types: ['slide', 'backward']`

CSS rules use `:active-view-transition-type()` to scope animations by direction:

```css
:active-view-transition-type(forward) {
  &::view-transition-old(route-content) {
    animation: slide-out-left 0.3s ease;
  }
  &::view-transition-new(route-content) {
    animation: slide-in-right 0.3s ease;
  }
}

:active-view-transition-type(backward) {
  &::view-transition-old(route-content) {
    animation: slide-out-right 0.3s ease;
  }
  &::view-transition-new(route-content) {
    animation: slide-in-left 0.3s ease;
  }
}
```

### Custom CSS Animations

Override or extend built-in presets by targeting the View Transition pseudo-elements:

```css
/* Target the old (outgoing) and new (incoming) route content */
::view-transition-old(route-content) {
  animation: my-custom-out 0.4s ease-out;
}
::view-transition-new(route-content) {
  animation: my-custom-in 0.4s ease-in;
}

/* Scope to a specific preset */
:active-view-transition-type(fade) {
  &::view-transition-old(route-content) {
    animation: custom-fade-out 0.5s ease;
  }
  &::view-transition-new(route-content) {
    animation: custom-fade-in 0.5s ease;
  }
}

/* Define custom keyframes */
@keyframes my-custom-out {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-20px); }
}
@keyframes my-custom-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Accessibility

Built-in presets respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(route-content),
  ::view-transition-new(route-content) {
    animation-duration: 0.01s !important;
  }
}
```

Users who prefer reduced motion see instant transitions without jarring animations.

### Configuration

The View Transition API is enabled by default. Control it via `NoJS.config()`:

```javascript
// Default -- View Transition API enabled
NoJS.config({
  router: {
    viewTransition: true   // default
  }
});

// Opt-out -- fall back to legacy class-based transitions
NoJS.config({
  router: {
    viewTransition: false
  }
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `router.viewTransition` | boolean | `true` | Enable/disable View Transition API for route changes. When `false`, `transition` on `route-view` uses the legacy class-based system. |

### Legacy Class-Based Transitions (Deprecated for Routes)

When `router.viewTransition` is set to `false`, or for non-router elements, the `transition` attribute uses the class-based system:

| Class | When |
|-------|------|
| `{name}-enter` | Start state of enter |
| `{name}-enter-active` | Active state of enter |
| `{name}-enter-to` | End state of enter |
| `{name}-leave` | Start state of leave |
| `{name}-leave-active` | Active state of leave |
| `{name}-leave-to` | End state of leave |

Class-based transitions on `route-view` are deprecated in favor of the View Transition API. They remain the default for non-router elements (`if`, `show`, etc.).

---

## Quick Reference

### Minimal Route Transition Setup

```html
<script src="https://cdn.no-js.dev/"></script>

<nav>
  <a route="/">Home</a>
  <a route="/about">About</a>
</nav>

<!-- Just add transition="slide" to the outlet -->
<main route-view transition="slide"></main>

<template route="/">
  <h1>Home</h1>
</template>

<template route="/about">
  <h1>About</h1>
</template>
```

That is all you need. No JavaScript configuration required -- the View Transition API is enabled by default.
