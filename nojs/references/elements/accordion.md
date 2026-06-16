# Accordion

Collapsible content sections built on native `<details>` / `<summary>` elements. Only one section open at a time (single mode) or multiple sections open simultaneously (multi mode). Progressive enhancement ensures content is fully accessible even without JavaScript.

## Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Attributes](#attributes)
- [Events](#events)
- [CSS Classes](#css-classes)
- [CSS Custom Properties](#css-custom-properties)
- [Accessibility](#accessibility)
- [Examples](#examples)
  - [Single Mode (default)](#single-mode-default)
  - [Multi Mode](#multi-mode)
  - [Pre-opened Section](#pre-opened-section)
  - [Nested Accordions](#nested-accordions)
  - [Dynamically Added Sections](#dynamically-added-sections)
- [Composition with NoJS Directives](#composition-with-nojs-directives)

---

## Installation

```html
<!-- CDN (auto-installs, no registration needed) -->
<script src="https://unpkg.com/@nickeljs/elements"></script>

<!-- ESM (register the full plugin or just the accordion) -->
<script type="module">
  import NoJSElements from '@nickeljs/elements';
  NoJS.use(NoJSElements);

  // Or register only the accordion element
  import { accordion } from '@nickeljs/elements';
  NoJS.use(accordion);
</script>
```

Requires No.JS >= 1.13.0.

---

## Basic Usage

Wrap one or more `<details>` elements inside a container with the `accordion` attribute. Each `<details>` must have a `<summary>` child.

```html
<div accordion>
  <details>
    <summary>Section One</summary>
    <p>Content for section one.</p>
  </details>
  <details>
    <summary>Section Two</summary>
    <p>Content for section two.</p>
  </details>
  <details>
    <summary>Section Three</summary>
    <p>Content for section three.</p>
  </details>
</div>
```

By default only one section can be open at a time (single mode). Opening a section automatically closes the previously open one.

---

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `accordion` | `"single"` \| `"multi"` | `"single"` | Whether one or multiple sections can be open at a time |

The `accordion` attribute is placed on the container element. Individual sections are standard `<details>` elements -- no special attributes are needed on them.

---

## Events

| Event | `$event.detail` | Description |
|-------|-----------------|-------------|
| `accordion-change` | `{ element, open, index }` | Fired on the container when a section opens or closes |

- `element` -- the `<details>` element that changed
- `open` -- `true` if the section was opened, `false` if closed
- `index` -- zero-based index of the section within the accordion

```html
<div accordion on:accordion-change="console.log($event.detail)">
  <details>
    <summary>Section One</summary>
    <p>Content</p>
  </details>
</div>
```

---

## CSS Classes

| Class | Applied to | Description |
|-------|-----------|-------------|
| `nojs-accordion-content` | Generated wrapper `<div>` | Wraps content after `<summary>` (used for fallback animation) |

### Built-in Styles

| Selector | Style |
|----------|-------|
| `[accordion]` | `display: flex; flex-direction: column; gap: var(--nojs-accordion-gap)` |
| `[accordion] > details > summary` | `cursor: pointer; list-style: none` (marker removed) |
| `[accordion] > details > summary::-webkit-details-marker` | `display: none` |
| `[accordion] > details > summary::marker` | `content: none` |

---

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--nojs-accordion-duration` | `0.3s` | Duration of the open/close transition |
| `--nojs-accordion-easing` | `ease` | Easing function for the transition |
| `--nojs-accordion-gap` | `0` | Gap between `<details>` elements |

```css
/* Customize accordion timing and spacing */
.my-accordion {
  --nojs-accordion-duration: 0.25s;
  --nojs-accordion-easing: cubic-bezier(0.4, 0, 0.2, 1);
  --nojs-accordion-gap: 8px;
}
```

### Animation Strategy

The accordion uses the Web Animations API (`element.animate()`) when available. It measures the content height dynamically and animates `height` + `opacity` for smooth open/close transitions. On browsers that do not support `element.animate()`, it falls back to wrapping content in a `.nojs-accordion-content` div with CSS transitions.

---

## Accessibility

NoJS automatically applies:

- `role="group"` on the accordion container
- Native `<details>` / `<summary>` semantics provide built-in disclosure behavior
- Keyboard navigation between summaries (arrow keys, Home, End)
- Focus management respects only direct `<summary>` children of direct `<details>` children

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `ArrowDown` | Move focus to the next summary |
| `ArrowUp` | Move focus to the previous summary |
| `Home` | Move focus to the first summary |
| `End` | Move focus to the last summary |
| `Enter` / `Space` | Toggle the focused section (native `<details>` behavior) |

### Progressive Enhancement

Because the accordion builds on native `<details>` / `<summary>`, the content is fully accessible and functional even without JavaScript:

- **Without NoJS:** all sections toggle independently (browser default), no animation
- **With NoJS:** single/multi mode enforcement, smooth animated transitions, keyboard navigation between summaries, `accordion-change` events

---

## Examples

### Single Mode (default)

Only one section open at a time. Opening a new section closes the currently open one.

```html
<div accordion>
  <details>
    <summary>What is NoJS?</summary>
    <p>NoJS is an HTML-first reactive framework.</p>
  </details>
  <details>
    <summary>How do I install it?</summary>
    <p>Include the CDN script tag or install via npm.</p>
  </details>
  <details>
    <summary>Is it accessible?</summary>
    <p>Yes, full ARIA support and keyboard navigation out of the box.</p>
  </details>
</div>
```

### Multi Mode

Multiple sections can be open simultaneously.

```html
<div accordion="multi">
  <details>
    <summary>Features</summary>
    <p>HTML-first, reactive, zero JavaScript required from developers.</p>
  </details>
  <details>
    <summary>Performance</summary>
    <p>No virtual DOM, no build step, no runtime overhead.</p>
  </details>
  <details>
    <summary>Accessibility</summary>
    <p>Built-in ARIA roles, keyboard navigation, and screen reader support.</p>
  </details>
</div>
```

### Pre-opened Section

Use the native `open` attribute on a `<details>` element to have it expanded when the page loads.

```html
<div accordion>
  <details open>
    <summary>This section starts open</summary>
    <p>This content is visible on load.</p>
  </details>
  <details>
    <summary>This section starts closed</summary>
    <p>Click to reveal.</p>
  </details>
</div>
```

### Nested Accordions

Accordions can be nested. Each container manages its own children independently.

```html
<div accordion>
  <details>
    <summary>Parent Section</summary>
    <div accordion="multi">
      <details>
        <summary>Child A</summary>
        <p>Nested content A</p>
      </details>
      <details>
        <summary>Child B</summary>
        <p>Nested content B</p>
      </details>
    </div>
  </details>
</div>
```

### Dynamically Added Sections

Sections added via NoJS loops are automatically picked up by the accordion.

```html
<div state="{ faqs: [
  { q: 'What is it?', a: 'A framework.' },
  { q: 'How does it work?', a: 'HTML attributes.' }
] }">
  <div accordion>
    <details each="faq in faqs" key="faq.q">
      <summary bind="faq.q"></summary>
      <p bind="faq.a"></p>
    </details>
  </div>
</div>
```

---

## Composition with NoJS Directives

The accordion works with any NoJS directive inside its sections:

```html
<div state="{ sections: [], loading: true }"
     get="/api/sections | sections"
     get-success="loading = false">
  <div accordion on:accordion-change="console.log('Changed:', $event.detail.index)">
    <details each="section in sections" key="section.id">
      <summary bind="section.title"></summary>
      <div bind-html="section.content"></div>
    </details>
  </div>
</div>
```

- Use `each` / `foreach` / `for` to render dynamic sections
- Use `bind` / `bind-html` for dynamic content
- Use `if` / `show` inside sections for conditional content
- Use `on:accordion-change` to react to state changes
- Use `state` on a parent to share data across sections
