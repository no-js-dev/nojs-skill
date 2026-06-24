# Scroll Spy

Highlights navigation links based on which section is currently visible in the viewport. Works with anchor links (`<a href="#section">`) and arbitrary elements (`<button spy="section">`). Uses standard HTML elements with NoJS directive attributes -- no custom element registration required.

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
  - [Scroll Spy with Tabs Layout](#scroll-spy-with-tabs-layout)
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

Add the `spy` attribute to navigation elements, pointing to the ID of the section they track. For `<a>` elements, the `href` attribute is used automatically -- no `spy` attribute needed.

```html
<nav>
  <a href="#introduction">Introduction</a>
  <a href="#features">Features</a>
  <a href="#installation">Installation</a>
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

The `.active` class is applied to whichever spy element's target section is the topmost visible section in the viewport.

---

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `spy` | string | -- | Target section ID (with or without `#` prefix). For `<a>` elements, the `href` attribute is used instead |
| `spy-offset` | number | `0` | Pixel offset from the top of the viewport. Use to compensate for fixed headers |
| `spy-threshold` | number (0-1) | `0.1` | Fraction of the target section that must be visible to trigger activation |

The `spy` attribute is placed on navigation elements. For `<a>` elements with `href="#section-id"`, the target is derived from the href -- no `spy` attribute is needed. For non-anchor elements (`<button>`, `<span>`, etc.), use `spy="section-id"`.

---

## Events

No custom events are emitted. Use standard NoJS `on:click` on spy elements for navigation behavior.

```html
<nav>
  <a href="#about" on:click="trackSection('about')">About</a>
  <button spy="contact" on:click="scrollTo('contact')">Contact</button>
</nav>
```

---

## CSS Classes

| Class | Applied to | Description |
|-------|-----------|-------------|
| `.active` | Spy element | Applied to the spy element whose target is the topmost visible section |

### Built-in Styles

No built-in visual styles are applied. The `.active` class is a hook for your own CSS.

```css
/* Style the active spy element */
nav a.active,
nav [spy].active {
  color: #0EA5E9;
  font-weight: 600;
  border-left: 3px solid #0EA5E9;
  padding-left: 0.75rem;
}
```

---

## Accessibility

NoJS automatically applies:

- `aria-current="true"` set on the active spy element
- `aria-current` removed when the element is deactivated
- Native `<a>` keyboard navigation preserved

### Progressive Enhancement

Because scroll spy builds on standard links and buttons, navigation remains functional without JavaScript:

- **Without NoJS:** links navigate to anchors via native browser behavior, no `.active` highlighting
- **With NoJS:** viewport-aware `.active` class, offset compensation, threshold detection, `aria-current` management

---

## Grouping

By default all `[spy]` elements and `<a>` elements with `href="#..."` on the page form a single group. Only one element across the entire page has `.active` at a time -- whichever target section is topmost in the viewport.

---

## Dynamic Targets

Scroll spy automatically detects sections added or removed from the DOM via MutationObserver. New sections are tracked immediately without any manual re-initialization.

```html
<div state="{ sections: [] }" get="/api/sections | sections">
  <nav>
    <a each="section in sections"
       key="section.id"
       bind-href="'#' + section.id"
       bind="section.title"></a>
  </nav>

  <section each="section in sections"
           key="section.id"
           bind-id="section.id">
    <h2 bind="section.title"></h2>
    <p bind="section.content"></p>
  </section>
</div>
```

---

## Examples

### Sidebar Navigation with Fixed Header Offset

A docs-style sidebar that accounts for a 64px fixed header.

```html
<style>
  header { position: fixed; top: 0; height: 64px; width: 100%; }
  .docs-layout { display: flex; margin-top: 64px; }
  .sidebar { position: sticky; top: 80px; width: 240px; }
  .sidebar a { display: block; padding: 0.5rem 1rem; color: #64748B; }
  .sidebar a.active { color: #0EA5E9; font-weight: 600; border-left: 3px solid #0EA5E9; }
  .content { flex: 1; padding: 2rem; }
</style>

<header>Site Header</header>

<div class="docs-layout">
  <nav class="sidebar">
    <a href="#overview" spy-offset="64">Overview</a>
    <a href="#api" spy-offset="64">API</a>
    <a href="#examples" spy-offset="64">Examples</a>
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

Both `<a>` elements (using `href`) and `<button>` elements (using `spy`) can participate in the same scroll spy group.

```html
<nav>
  <a href="#intro">Intro</a>
  <button spy="features" on:click="document.getElementById('features').scrollIntoView({ behavior: 'smooth' })">
    Features
  </button>
  <a href="#pricing">Pricing</a>
</nav>

<section id="intro"><h2>Intro</h2><p>Welcome.</p></section>
<section id="features"><h2>Features</h2><p>What we offer.</p></section>
<section id="pricing"><h2>Pricing</h2><p>Our plans.</p></section>
```

### Scroll Spy with Tabs Layout

A documentation page where scroll spy highlights tab-style navigation at the top of the content area.

```html
<style>
  .tab-nav { display: flex; gap: 0; border-bottom: 2px solid #E2E8F0; }
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
    font-weight: 500;
  }
</style>

<nav class="tab-nav">
  <a href="#setup" spy-threshold="0.2">Setup</a>
  <a href="#usage" spy-threshold="0.2">Usage</a>
  <a href="#advanced" spy-threshold="0.2">Advanced</a>
</nav>

<div style="max-height: 500px; overflow-y: auto;">
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
</div>
```

---

## Composition with NoJS Directives

Scroll spy works with any NoJS directive for dynamic navigation:

```html
<div state="{ navItems: [], activeSection: '' }"
     get="/api/docs/nav | navItems">
  <nav>
    <a each="item in navItems"
       key="item.id"
       bind-href="'#' + item.id"
       bind="item.label"
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

- Use `each` / `foreach` / `for` to render dynamic navigation items and sections
- Use `bind` for dynamic labels and content
- Use `if` / `show` to conditionally display navigation items
- Use `state` on a parent to share data between nav and sections
- Use `on:click` for custom scroll behavior or analytics tracking
- Use `class-*` for additional conditional styling beyond `.active`
