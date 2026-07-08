# No.JS Template Validation Reference

Rules, common mistakes, and a checklist for validating No.JS templates. Based on the NoJS validation rules.

## Contents

- [1. Common Mistakes -- Directive Typos](#1-common-mistakes----directive-typos) — Frequently misspelled directives
- [2. Syntax Rules](#2-syntax-rules) — Correct directive syntax requirements
  - [`foreach`/`each`/`for` requires "in"](#foreacheachfor-requires-in) — Iteration syntax rules
  - [`model` only on form inputs](#model-only-on-form-inputs) — Valid model targets
- [3. Event Modifier Validation](#3-event-modifier-validation) — Valid and invalid event modifiers
  - [Valid Modifiers](#valid-modifiers) — Supported event modifier list
  - [Invalid Modifiers](#invalid-modifiers) — Unsupported modifiers
- [4. Directive Incompatibility Diagnostics](#4-directive-incompatibility-diagnostics) — Incompatible directive combinations
  - [`case`/`default` + loop](#casedefault--loop) — switch becomes inert
  - [`if` + loop](#if--loop) — condition cannot filter items
  - [`ref` + loop](#ref--loop) — last clone wins
  - [`bind-value` + `model`](#bind-value--model) — redundant two-way bindings
  - [`watch` + `on:change`](#watch--onchange) — event conflict on form controls
  - [`t` + `bind`](#t--bind) — double text-writer
- [5. Deprecation Warnings](#5-deprecation-warnings) — Deprecated features and alternatives
  - [Router `mode` is deprecated](#router-mode-is-deprecated) — Migration from mode attribute
- [6. Security](#6-security) — Template security considerations
  - [`bind-html` sanitization warning](#bind-html-sanitization-warning) — XSS risk with raw HTML binding
  - [Expression evaluator security](#expression-evaluator-security) — Safe expression evaluation
  - [CSRF protection](#csrf-protection) — Cross-site request forgery setup
- [7. Quick Validation Checklist](#7-quick-validation-checklist) — Categorized checklist for reviews
  - [Directives & Syntax](#directives--syntax) — Directive usage checks
  - [Events](#events) — Event handler checks
  - [Security](#security) — Security verification items
  - [State & Data](#state--data) — State management checks
  - [Loops](#loops) — Iteration directive checks
  - [Routing](#routing) — Router configuration checks
  - [Templates](#templates) — Template usage checks
  - [Forms](#forms) — Form validation checks
  - [Performance](#performance) — Performance optimization checks

---

## 1. Common Mistakes -- Directive Typos

The validator catches frequent misspellings and suggests the correct directive. If you encounter an unknown attribute that resembles a No.JS directive, check this table first:

| Typo | Correction | Notes |
|------|-----------|-------|
| `bnd` | `bind` | Missing vowel |
| `bing` | `bind` | Transposed letter |
| `binde` | `bind` | Extra trailing letter |
| `bind-htm` | `bind-html` | Truncated attribute name |
| `iff` | `if` | Doubled letter |
| `els` | `else` | Missing trailing letter |
| `else-iff` | `else-if` | Doubled letter in suffix |
| `shw` | `show` | Missing vowel |
| `hid` | `hide` | Truncated |
| `ech` | `each` | Missing leading vowel |
| `forech` | `foreach` | Missing letter |
| `fo` | `for` | Truncated |
| `fro` | `for` | Transposed letters |
| `modle` | `model` | Transposed letters |
| `stat` | `state` | Truncated |
| `stor` | `store` | Truncated |
| `rout` | `route` | Truncated |
| `route-vew` | `route-view` | Missing letter |
| `validat` | `validate` | Truncated |
| `animat` | `animate` | Truncated |
| `on-click` | `on:click` | Wrong separator (dash instead of colon) |
| `on-submit` | `on:submit` | Wrong separator (dash instead of colon) |
| `on-input` | `on:input` | Wrong separator (dash instead of colon) |

**Key rule:** All event bindings use the **colon** separator: `on:click`, `on:submit`, `on:input`, `on:keydown`, etc. Using a dash (`on-click`) is always wrong.

---

## 2. Syntax Rules

### `foreach`/`each`/`for` requires "in"

The `foreach`, `each`, and `for` directives all use the format `"item in items"`. Omitting the `in` keyword is a validation error. (`each` and `for` are aliases for `foreach` -- all three share the same handler.)

```html
<!-- CORRECT -->
<li foreach="item in menuItems" key="item.id">
  <span bind="item.label"></span>
</li>
<li each="user in users" key="user.id">
  <span bind="user.name"></span>
</li>
<li for="task in tasks" key="task.id">
  <span bind="task.title"></span>
</li>

<!-- WRONG - missing "in" keyword -->
<li foreach="menuItems">...</li>
<li each="users">...</li>
<li for="task, tasks">...</li>
<div each="user of users">...</div>
```

### `model` only on form inputs

The `model` directive creates two-way data binding and is designed for interactive form elements. Using it on non-input elements produces a warning.

**Valid elements for `model`:**

- `<input>` (text, email, password, number, checkbox, radio, etc.)
- `<select>`
- `<textarea>`

**Invalid elements (triggers warning):**

- `<div>`, `<span>`, `<p>`, `<h1>`-`<h6>`
- `<section>`, `<article>`, `<main>`, `<header>`, `<footer>`

```html
<!-- CORRECT -->
<input model="name" type="text" />
<select model="role">...</select>
<textarea model="bio"></textarea>

<!-- WARNING - model on non-input element -->
<div model="name">...</div>
<span model="value">...</span>
<p model="text">...</p>
```

---

## 3. Event Modifier Validation

Event handlers support modifiers chained with dots after the event name: `on:event.modifier1.modifier2`.

### Valid Modifiers

| Modifier | Category | Description |
|----------|----------|-------------|
| `prevent` | Event | Calls `preventDefault()` |
| `stop` | Event | Calls `stopPropagation()` |
| `once` | Listener | Fires only once, then removes listener |
| `self` | Target | Only fires if `event.target` is the element itself |
| `enter` | Key | Enter key |
| `escape` | Key | Escape key |
| `tab` | Key | Tab key |
| `space` | Key | Space bar |
| `delete` | Key | Delete/Backspace |
| `backspace` | Key | Backspace |
| `up` | Key | Arrow Up |
| `down` | Key | Arrow Down |
| `left` | Key | Arrow Left |
| `right` | Key | Arrow Right |
| `ctrl` | Modifier Key | Ctrl key held |
| `alt` | Modifier Key | Alt key held |
| `shift` | Modifier Key | Shift key held |
| `meta` | Modifier Key | Meta/Cmd key held |

### Examples

```html
<!-- Single modifier -->
<form on:submit.prevent="handleSubmit()">

<!-- Multiple modifiers -->
<form on:submit.prevent.once="register()">

<!-- Key + modifier key combination -->
<input on:keydown.ctrl.enter="save()" />
<input on:keydown.shift.enter="submitAndContinue()" />

<!-- Self modifier for overlay close -->
<div class="overlay" on:click.self="closeModal()">
```

### Invalid Modifiers

Unknown modifiers are silently ignored by the runtime. Validation tooling like NoJS-LSP flags unsupported modifiers during development.

```html
<!-- Silently ignored by runtime, flagged by NoJS-LSP -->
<button on:click.capture="...">     <!-- "capture" is not valid -->
<button on:click.passive="...">     <!-- "passive" is not valid -->
```

**Note:** `delete` matches both the Delete and Backspace keys. `backspace` matches only the Backspace key. Both are valid key modifiers.

### Additional Modifiers (supported in framework, not in strict validation)

Note that `debounce` and `throttle` are also supported by the framework runtime for event handlers:

```html
<input on:input.debounce.300="search($event.target.value)" />
<div on:scroll.throttle.100="handleScroll()">
```

---


## 4. Directive Incompatibility Diagnostics

The NoJS LSP detects directive combinations that produce unexpected behavior at runtime. These are emitted as warnings during development.

### `case`/`default` + loop

Placing `case` or `default` on an element that also has `each`/`foreach`/`for` causes the switch/case logic to become inert -- all branches render regardless of the switch value.

```html
<!-- WARNING: switch becomes inert -->
<div switch="status">
  <span each="item in items" case="'active'" bind="item.name"></span>
</div>

<!-- CORRECT: loop inside the case branch -->
<div switch="status">
  <div case="'active'">
    <span each="item in items" bind="item.name"></span>
  </div>
</div>
```

### `if` + loop

Placing `if` and a loop on the same element is unreliable -- the condition cannot remove individual items. Use the loop's `filter` attribute for per-item filtering, or wrap the loop in a container with `if`.

```html
<!-- WARNING: condition cannot filter items -->
<li if="showActive" each="item in items" bind="item.name"></li>

<!-- CORRECT: filter attribute -->
<li each="item in items" filter="item.active" bind="item.name"></li>

<!-- CORRECT: wrapper element -->
<div if="showItems">
  <li each="item in items" bind="item.name"></li>
</div>
```

### `ref` + loop

Using `ref` on a looped element means every clone re-registers the same ref name. `$refs.name` will point to the last clone only.

```html
<!-- WARNING: $refs.card points to last clone only -->
<div each="item in items" ref="card" bind="item.name"></div>
```

### `bind-value` + `model`

Both `bind-value` and `model` create two-way bindings with separate input listeners. Using both is redundant and they may conflict, especially on `type="number"` inputs where they use different coercion policies.

```html
<!-- WARNING: redundant two-way bindings -->
<input bind-value="name" model="name">

<!-- CORRECT: use one or the other -->
<input model="name">
<input bind-value="name">
```

### `watch` + `on:change`

On form controls (`input`, `textarea`, `select`), both `watch` (via its `on:change` companion) and an explicit `on:change` event handler claim the change event and may conflict.

```html
<!-- WARNING: both claim change event -->
<input watch="value" on:change="save()">

<!-- CORRECT: use watch with its companion -->
<input watch="value" on:change="console.log($old, $new)">

<!-- CORRECT: use standalone event handler -->
<input on:change="save()">
```

### `t` + `bind`

Both `t` and `bind` write text content to the element. The last-processed directive wins silently, which depends on attribute order.

```html
<!-- WARNING: double text-writer -->
<span t="greeting" bind="name"></span>

<!-- CORRECT: use one text source -->
<span t="greeting" t-name="name"></span>
<span bind="name"></span>
```

---

## 5. Deprecation Warnings

### Router `mode` is deprecated

The `mode="hash"` and `mode="history"` router attributes are deprecated. Use the `useHash` configuration option instead.

```html
<!-- DEPRECATED -->
<div mode="hash">...</div>
<div mode="history">...</div>

<!-- CORRECT -->
<script>
  NoJS.config({
    router: {
      useHash: true   // replaces mode="hash"
      // useHash: false is the default (history mode)
    }
  });
</script>
```

---

## 6. Security

### `bind-html` sanitization warning

Any use of `bind-html` triggers a security warning because it renders raw HTML content. While No.JS includes a built-in DOMParser-based structural sanitizer by default, you should still ensure the content source is trusted.

```html
<!-- WARNING: renders raw HTML, ensure content is sanitized -->
<div bind-html="article.content"></div>
<div bind-html="`<em>${user.bio}</em>`"></div>
```

**Safe by default:** `bind` (without `-html`) always uses `textContent` and is immune to XSS.

```html
<!-- SAFE: always escapes HTML -->
<span bind="user.name"></span>
```

**Debug/devtools warning:** When `debug` or `devtools` mode is enabled, `bind-html` with a dynamic expression (one that doesn't start with a quote character) logs a console warning: `[Security] bind-html used with dynamic expression: "..."`. This reminds you to ensure the value is trusted or sanitized.

### Expression evaluator security

No.JS uses a sandboxed expression parser with an allow-list approach. `_SAFE_GLOBALS` exposes JS built-ins (Math, Date, Object, Array, etc.) and `_BROWSER_GLOBALS` exposes curated browser APIs (document, console, navigator, etc.). `fetch`, `XMLHttpRequest`, `localStorage`, `sessionStorage`, `WebSocket`, and `indexedDB` are NOT on the allow-list. Spread operations filter `_FORBIDDEN_PROPS` (`__proto__`, `constructor`, `prototype`) to prevent prototype pollution.

There is no `eval()` or `Function()` constructor usage, making No.JS fully CSP-compliant without `unsafe-eval`.

### CSRF protection

For mutating requests, configure CSRF tokens globally:

```html
<script>
  NoJS.config({
    csrf: {
      header: 'X-CSRF-Token',
      token: document.querySelector('meta[name="csrf-token"]').content
    }
  });
</script>
```

---

## 7. Quick Validation Checklist

Use this checklist when reviewing No.JS templates:

### Directives & Syntax

- [ ] All event bindings use colon syntax (`on:click`, not `on-click`)
- [ ] `foreach`/`each`/`for` values contain the `in` keyword (`"item in items"`)
- [ ] `model` is only used on `<input>`, `<select>`, or `<textarea>`
- [ ] No misspelled directive names (see typo table above)

### Events

- [ ] Event modifiers are from the valid set (prevent, stop, once, self, enter, escape, tab, space, delete, backspace, up, down, left, right, ctrl, alt, shift, meta)
- [ ] Key modifiers are only used on keyboard events (`on:keydown`, `on:keyup`, `on:keypress`)

### Security

- [ ] Every `bind-html` usage has its content source reviewed for XSS safety
- [ ] No prototype-access patterns in expressions (`__proto__`, `constructor`)
- [ ] CSRF is configured for apps that make mutating requests

### State & Data

- [ ] Local UI state uses `state`; shared cross-route data uses `store`
- [ ] Stores that are read before being defined are pre-initialized via `NoJS.config({ stores })`
- [ ] `$store.name` is used in expressions to access global stores

### Loops

- [ ] `key` attribute is present on loop elements for efficient DOM diffing
- [ ] Loop variable names do not shadow parent scope variables unintentionally

### Routing

- [ ] `route-view` is present in the layout to render route content
- [ ] Protected routes use `guard` and `redirect` attributes
- [ ] Router does not use deprecated `mode` attribute (use `useHash` config instead)

### Templates

- [ ] `<template>` elements have unique `id` attributes
- [ ] Error/success/loading templates use `var` to receive data when needed
- [ ] Remote templates (`src`) paths are correct and accessible

### Forms

- [ ] `<form>` elements that need No.JS validation have the `validate` attribute
- [ ] Custom error messages use `error-{rule}` pattern (e.g., `error-required`, `error-email`)
- [ ] Submit buttons rely on auto-disable (automatic) or use `bind-disabled="!$form.valid"`
- [ ] Use `$form.submitting` to show loading state during form submission
- [ ] Use `$form.reset()` where form reset functionality is needed
- [ ] Conditional fields use `validate-if` to skip validation when hidden/irrelevant
- [ ] Use `validate-on="blur"` for progressive validation (errors appear after user interaction)

### Performance

- [ ] Frequently toggled content uses `show`/`hide` instead of `if`
- [ ] Static GET data uses `cached` to avoid redundant fetches
- [ ] User-input-driven URLs use `debounce` to limit request frequency
- [ ] Heavy route templates use `lazy="ondemand"`
