# Scroll Spy

Highlights navigation elements based on which section is currently visible in the viewport. The `spy` attribute turns an element into a spy: on `<a href="#section">` the target comes from the `href`, on any other element (`<button spy="section">`) from the attribute value. Uses standard HTML elements with NoJS directive attributes -- no custom element registration required.

## Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Attributes](#attributes)
- [Events](#events)
- [CSS Classes](#css-classes)
- [Accessibility](#accessibility)
- [Grouping](#grouping)
- [Dynamic Targets](#dynamic-targets)
- [Examples](#examples)
  - [Sidebar Navigation with Fixed Header Offset](#sidebar-navigation-with-fixed-header-offset)
  - [Mixed Link and Button Spies](#mixed-link-and-button-spies)
  - [Tab-Style Navigation](#tab-style-navigation)
- [Composition with NoJS Directives](#composition-with-nojs-directives)

---

## Installation

```html
<!-- CDN (auto-installs, no registration needed) -->
<script src="https://cdn.no-js.dev/"></script>
<script src="https://cdn-elements.no-js.dev/"></script>
```

Requires No.JS >= 1.13.0.

---

## Basic Usage

Add the `spy` attribute to each navigation element. On an `<a>` with a hash `href`, leave `spy` empty: the target section ID is read from the `href`. A plain `<a href="#section">` without `spy` is not tracked.

```html
<nav>
  <a href="#introduction" spy>Introduction</a>
  <a href="#features" spy>Features</a>
  <a href="#installation" spy>Installation</a>
</nav>

<section id="introduction">
  <h2>Introduction</h2>
  <p>Welcome to the documentation.</p>
</section>
<section id="features">
  <h2>Features</h2>
  <p>Here are the key features.</p>
</section>
<section id="installation">
  <h2>Installation</h2>
  <p>How to install the library.</p>
</section>
```

The `.active` class and `aria-current="true"` are applied to the spy element whose target is the topmost visible section in the viewport. When no target is visible, no element is active.

---

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `spy` | string | -- | Marks the element as a spy. Value: target section ID, with or without `#`. On `<a>`, a hash `href` wins over the value, so `spy` can stay empty |
| `spy-offset` | number | `0` | Pixel offset from the top of the viewport (applied as a negative top `rootMargin`). Use it to compensate for fixed headers |
| `spy-threshold` | number (0-1) | `0.1` | Fraction of the target section that must be visible to count it as visible (`IntersectionObserver` threshold). Values outside 0-1 fall back to `0.1` |

`spy-offset` and `spy-threshold` are per group: the values on the **first** spy element initialized on the page apply to every spy (see [Grouping](#grouping)). Put the same values on all spies, or at least on the first one.

A section taller than the viewport can never be more visible than `viewport height / section height`. Keep `spy-threshold` below that ratio, or the section never becomes visible.

A non-`<a>` element whose `spy` value is empty logs `[spy] could not resolve target ID`. An `<a>` without a hash `href` and without a `spy` value is skipped silently.

---

## Events

No custom events are emitted. Use `on:click` on spy elements for your own behavior, and plain `href="#id"` links for navigation.

```html
<div state="{ clicks: 0 }">
  <nav>
    <a href="#about" spy on:click="clicks++">About</a>
    <a href="#contact" spy on:click="clicks++">Contact</a>
  </nav>
  <p bind="'Navigation clicks: ' + clicks"></p>

  <section id="about"><h2>About</h2></section>
  <section id="contact"><h2>Contact</h2></section>
</div>
```

---

## CSS Classes

| Class | Applied to | Description |
|-------|-----------|-------------|
| `.active` | Spy element | Applied to the spy element whose target is the topmost visible section |

### Built-in Styles

Elements injects one rule (in `<style data-nojs-scroll-spy>`) on first use:

```css
[spy].active,
a[href^="#"].active {
  font-weight: 600;
}
```

Override it to match your design:

```css
nav [spy].active {
  color: #0EA5E9;
  font-weight: 600;
  border-left: 3px solid #0EA5E9;
  padding-left: 0.75rem;
}
```

---

## Accessibility

- The active spy element gets `aria-current="true"`
- `aria-current` is removed (not set to `"false"`) when the element is deactivated
- No roles are added; native `<a>` keyboard navigation is preserved

### Progressive Enhancement

Because scroll spy builds on standard links and buttons, navigation remains functional without JavaScript:

- **Without NoJS:** links navigate to anchors via native browser behavior, no `.active` highlighting
- **With NoJS:** viewport-aware `.active` class, offset compensation, threshold detection, `aria-current` management

---

## Grouping

All spy elements on the page form a single group, whatever container they are in. Only one element across the page has `.active` at a time: the one whose target section is topmost in the viewport. Several spies may point at the same section; the first one initialized gets `.active`.

Detection uses an `IntersectionObserver` on the viewport, so sections inside their own scrolling container (`overflow: auto`) are detected by their position in the viewport, not by the container's scroll position.

---

## Dynamic Targets

A `MutationObserver` on `<body>` rebuilds the observer whenever nodes are added or removed, so sections rendered later (by `if`, `each`, `get`) are tracked once they appear, and spy elements rendered by `each` join the group when they initialize.

```html
<div get="/api/sections" as="sections">
  <nav>
    <a each="section in sections" key="section.id"
       bind-href="'#' + section.id" spy
       bind="section.title"></a>
  </nav>

  <section each="section in sections" key="section.id" bind-id="section.id">
    <h2 bind="section.title"></h2>
    <p bind="section.content"></p>
  </section>
</div>
```

`/api/sections` returns an array such as `[{ "id": "intro", "title": "Intro", "content": "..." }]`. Each spy's target is read once, when the spy initializes; changing its `href` or `spy` value afterwards does not retarget it.

---

## Examples

### Sidebar Navigation with Fixed Header Offset

A docs-style sidebar that accounts for a 64px fixed header.

```html
<style>
  header { position: fixed; top: 0; height: 64px; width: 100%; background: #fff; }
  .docs-layout { display: flex; margin-top: 64px; }
  .sidebar { position: sticky; top: 80px; align-self: flex-start; width: 240px; }
  .sidebar a { display: block; padding: 0.5rem 1rem; color: #64748B; }
  .sidebar a.active { color: #0EA5E9; border-left: 3px solid #0EA5E9; }
  .content { flex: 1; padding: 2rem; }
</style>

<header>Site Header</header>

<div class="docs-layout">
  <nav class="sidebar">
    <a href="#overview" spy spy-offset="64">Overview</a>
    <a href="#api" spy spy-offset="64">API</a>
    <a href="#examples" spy spy-offset="64">Examples</a>
  </nav>

  <div class="content">
    <section id="overview">
      <h2>Overview</h2>
      <p>Introduction to the library.</p>
    </section>
    <section id="api">
      <h2>API</h2>
      <p>Full API reference.</p>
    </section>
    <section id="examples">
      <h2>Examples</h2>
      <p>Code examples and demos.</p>
    </section>
  </div>
</div>
```

### Mixed Link and Button Spies

`<a>` elements (target from `href`) and other elements (target from `spy`) share one group. Only the highlight comes from `spy`: a `<button>` or `<span>` spy does not scroll on click, so use `<a href="#id">` for anything the user clicks to navigate.

```html
<nav>
  <a href="#intro" spy>Intro</a>
  <span spy="features">Features</span>
  <a href="#pricing" spy>Pricing</a>
</nav>

<section id="intro"><h2>Intro</h2><p>Welcome.</p></section>
<section id="features"><h2>Features</h2><p>What we offer.</p></section>
<section id="pricing"><h2>Pricing</h2><p>Our plans.</p></section>
```

### Tab-Style Navigation

Scroll spy highlights tab-style links at the top of a long page.

```html
<style>
  .tab-nav { position: sticky; top: 0; display: flex; background: #fff; border-bottom: 2px solid #E2E8F0; }
  .tab-nav a {
    padding: 0.75rem 1.5rem;
    color: #64748B;
    text-decoration: none;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
  }
  .tab-nav a.active {
    color: #0EA5E9;
    border-bottom-color: #0EA5E9;
  }
</style>

<nav class="tab-nav">
  <a href="#setup" spy spy-offset="48" spy-threshold="0.2">Setup</a>
  <a href="#usage" spy spy-offset="48" spy-threshold="0.2">Usage</a>
  <a href="#advanced" spy spy-offset="48" spy-threshold="0.2">Advanced</a>
</nav>

<section id="setup">
  <h2>Setup</h2>
  <p>Installation and configuration steps.</p>
</section>
<section id="usage">
  <h2>Usage</h2>
  <p>Basic usage patterns and examples.</p>
</section>
<section id="advanced">
  <h2>Advanced</h2>
  <p>Advanced techniques and customization.</p>
</section>
```

---

## Composition with NoJS Directives

Scroll spy works with any NoJS directive for dynamic navigation:

```html
<div get="/api/docs/nav" as="navItems">
  <nav>
    <a each="item in navItems"
       key="item.id"
       bind-href="'#' + item.id"
       bind="item.label"
       spy
       spy-offset="64"
       spy-threshold="0.15"></a>
  </nav>

  <section each="item in navItems"
           key="item.id"
           bind-id="item.id">
    <h2 bind="item.label"></h2>
    <div bind-html="item.content"></div>
  </section>
</div>
```

- Use `each` / `foreach` / `for` to render dynamic navigation items and sections; add `spy` to the repeated element
- Use `get` + `as` to load them; `bind-html` content is sanitized
- Use `if` / `show` to conditionally display navigation items
- Use `on:click` for custom behavior or analytics tracking
- Use `class-*` for additional conditional styling beyond `.active`
