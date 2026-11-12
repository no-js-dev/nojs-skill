# Stepper

Multi-step wizard/process flow. Two directives: `stepper` (container) and `step` (content panel). Supports linear (sequential, with optional validation gates) and free (any order) navigation modes. Provides a `$stepper` context API for programmatic control.

## Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Attributes](#attributes)
  - [Stepper Container](#stepper-container)
  - [Step Panel](#step-panel)
- [$stepper Context API](#stepper-context-api)
- [Events](#events)
- [Validation Gate](#validation-gate)
- [Navigation Modes](#navigation-modes)
- [CSS Classes](#css-classes)
- [Accessibility](#accessibility)
- [Examples](#examples)
  - [Linear Stepper with Validation Gate](#linear-stepper-with-validation-gate)
  - [Free-Mode Stepper](#free-mode-stepper)
  - [Stepper with Form Validation and Custom Events](#stepper-with-form-validation-and-custom-events)
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

Place the `stepper` attribute on a container element and add `step` children inside it. The stepper adds a progress indicator and Previous/Next buttons; with `stepper-nav="false"` you place your own buttons and navigate with the `$stepper` context API.

```html
<div stepper stepper-nav="false">
  <div step>
    <p>Step 1 content</p>
    <button type="button" on:click="$stepper.next()">Next</button>
  </div>
  <div step>
    <p>Step 2 content</p>
    <button type="button" on:click="$stepper.prev()">Back</button>
    <button type="button" on:click="$stepper.next()">Next</button>
  </div>
  <div step>
    <p>Step 3 content</p>
    <button type="button" on:click="$stepper.prev()">Back</button>
    <button type="button" on:click="$stepper.next()">Finish</button>
  </div>
</div>
```

Only the active step is visible at a time. By default, navigation is linear (sequential).

---

## Attributes

### Stepper Container

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `stepper` | number | `0` | Declares the stepper container; the value is the initial step index (0-based) |
| `stepper-mode` | `"linear"` \| `"free"` | `"linear"` | Navigation mode |
| `stepper-indicator` | `"true"` \| `"false"` | `"true"` | Shows or hides the progress indicator (step numbers/labels) |
| `stepper-nav` | `"true"` \| `"false"` | `"true"` | Shows or hides the built-in Previous/Next buttons |
| `aria-label` | string | `"Stepper"` | Accessible label of the stepper container |

### Step Panel

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `step` | boolean attr | -- | Declares a step panel |
| `step-label` | string | -- | Label displayed in the step indicator |
| `step-validate` | expression | -- | Expression that must be truthy for forward navigation |
| `stepper-validate` | boolean attr | -- | Blocks forward navigation until the step's `<form validate>` is valid |

---

## $stepper Context API

Available inside any element within the stepper container.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `$stepper.current` | number | Current step index (0-based) |
| `$stepper.total` | number | Total number of steps |
| `$stepper.isFirst` | boolean | Whether on the first step |
| `$stepper.isLast` | boolean | Whether on the last step |

### Methods

| Method | Description |
|--------|-------------|
| `$stepper.next()` | Go to the next step (respects validation gates). On the last step it dispatches `nojs:stepper-complete` instead. Returns `false` when blocked or on the last step |
| `$stepper.prev()` | Go to the previous step. Returns `false` on the first step |
| `$stepper.goTo(index)` | Go to a specific step (validates each step in between in linear mode). Returns `false` when out of range or blocked |

---

## Events

All three bubble. Listen with `on:` followed by the full event name.

| Event | `$event.detail` | Description |
|-------|-----------------|-------------|
| `nojs:stepper-change` | `{ current, total }` | Fired when the active step changes (`current` is the new 0-based index) |
| `nojs:stepper-complete` | `{ current, total }` | Fired when `$stepper.next()` is called on the last step (the built-in Next button reads "Finish" there). In linear mode the last step must validate first |
| `stepper:validation-blocked` | `{ step, form }` | Fired when a `stepper-validate` step's form is invalid and blocks forward navigation |

```html
<div stepper state="{ done: false }"
     on:nojs:stepper-change="console.log('Step', $event.detail.current + 1, 'of', $event.detail.total)"
     on:nojs:stepper-complete="done = true">
  <!-- steps -->
</div>
```

The stepper also dispatches a non-bubbling `nojs:stepper-change` for the starting step while it sets up, before `on:` listeners on the stepper are attached, so `on:nojs:stepper-change` sees only the changes that follow. Before v1.15.0 the events were named `step-change` and `step-complete`; those names are no longer dispatched.

---

## Validation Gate

Place `stepper-validate` on a step that contains a `<form validate>`. Forward navigation is blocked until `$form.valid` is true. When blocked, all fields are touched (making errors visible).

`stepper-validate` (form-based) and `step-validate` (expression-based) can be used together on the same step. Both must pass for forward navigation.

Backward navigation is never blocked.

```html
<div step stepper-validate step-validate="agreedToTerms">
  <form validate>
    <input name="email" validate="required|email" />
  </form>
  <label>
    <input type="checkbox" model="agreedToTerms" /> I agree to the terms
  </label>
</div>
```

---

## Navigation Modes

### Linear Mode

Steps must be visited sequentially. Forward navigation cannot skip ahead unless validation passes for all intermediate steps. This is the default mode.

### Free Mode

Steps can be visited in any order. Step indicator items are clickable, allowing direct navigation to any step. Validation gates are not enforced.

```html
<div stepper stepper-mode="free">
  <!-- Steps can be visited in any order -->
</div>
```

---

## CSS Classes

| Class | When Applied |
|-------|-------------|
| `.nojs-stepper` | On the stepper container |
| `.nojs-stepper-indicator` | On the progress indicator bar |
| `.nojs-stepper-indicator-item` | On each step in the indicator; `[aria-selected="true"]` marks the active one, `[data-completed]` the completed ones, `[data-clickable]` the clickable ones in free mode |
| `.nojs-stepper-separator` | On the line between indicator items |
| `.nojs-step` | On each step panel; inactive panels have `[aria-hidden="true"]` |
| `.nojs-step-invalid` | On a step's indicator item while its `stepper-validate` gate blocks navigation |
| `.nojs-stepper-nav`, `.nojs-stepper-prev`, `.nojs-stepper-next` | On the built-in navigation container and its Previous/Next buttons |

---

## Accessibility

NoJS automatically applies:

- `role="group"` and `aria-label` on the stepper container
- Step indicator uses `role="tablist"` with `role="tab"` items and `aria-selected`
- Step panels use `role="tabpanel"`, linked to their indicator items with `aria-controls` / `aria-labelledby`
- `aria-current="step"` on the active step panel
- Inactive steps are hidden with `aria-hidden="true"` and `inert`

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `ArrowRight` / `ArrowLeft` | Move between step indicators (navigates in free mode) |
| `Home` / `End` | Move to the first / last step indicator (navigates in free mode) |

---

## Examples

### Linear Stepper with Validation Gate

Steps must be completed in order. The first step uses form validation, the second uses an expression gate.

```html
<div stepper stepper-nav="false">
  <div step step-label="Account" stepper-validate>
    <form validate>
      <input name="email" validate="required|email" placeholder="Email" />
      <button type="button" on:click="$stepper.next()">Next</button>
    </form>
  </div>
  <div step step-label="Profile" step-validate="name">
    <input model="name" placeholder="Name" />
    <button type="button" on:click="$stepper.prev()">Back</button>
    <button type="button" on:click="$stepper.next()">Next</button>
  </div>
  <div step step-label="Confirm">
    <p>Welcome, <span bind="name"></span>!</p>
    <button type="button" on:click="$stepper.prev()">Back</button>
  </div>
</div>
```

### Free-Mode Stepper

Steps can be visited in any order by clicking the step indicator.

```html
<div stepper stepper-mode="free">
  <div step step-label="General">General settings</div>
  <div step step-label="Security">Security settings</div>
  <div step step-label="Notifications">Notification preferences</div>
</div>
```

### Stepper with Form Validation and Custom Events

Combines form validation, expression validation, and event handlers for a complete checkout flow.

```html
<div state="{ paymentMethod: '', paid: false }" stepper stepper-nav="false"
     on:nojs:stepper-change="console.log('Step changed:', $event.detail.current)"
     on:nojs:stepper-complete="paid = true">
  <div step step-label="Payment" stepper-validate step-validate="paymentMethod !== ''">
    <form validate>
      <select name="method" model="paymentMethod" validate="required">
        <option value="">Select method</option>
        <option value="card">Credit Card</option>
        <option value="paypal">PayPal</option>
      </select>
    </form>
    <button type="button" on:click="$stepper.next()">Continue</button>
  </div>
  <div step step-label="Review">
    <p>Payment: <span bind="paymentMethod"></span></p>
    <button type="button" on:click="$stepper.prev()">Back</button>
    <button type="button" on:click="$stepper.next()" bind-disabled="paid">Submit</button>
    <p if="paid">Payment confirmed.</p>
  </div>
</div>
```

---

## Composition with NoJS Directives

The stepper works with any NoJS directive inside its steps:

```html
<div state="{ user: {}, registered: false }"
     stepper stepper-nav="false"
     on:nojs:stepper-complete="registered = true">
  <div step step-label="Info" stepper-validate>
    <form validate>
      <input name="name" model="user.name" validate="required" placeholder="Name" />
      <input name="email" model="user.email" validate="required|email" placeholder="Email" />
      <button type="button" on:click="$stepper.next()">Next</button>
    </form>
  </div>
  <div step step-label="Review">
    <p>Name: <span bind="user.name"></span></p>
    <p>Email: <span bind="user.email"></span></p>
    <button type="button" on:click="$stepper.prev()">Back</button>
    <button type="button" on:click="$stepper.next()" bind-disabled="registered">
      <span if="!registered">Submit</span>
      <span if="registered">Registered</span>
    </button>
  </div>
</div>
```

Expressions cannot call `post()` or other request functions. To send the data, use the HTTP directives (`post="/api/register"` on a form or button) or a JavaScript listener on `nojs:stepper-complete`.

- Use `stepper-validate` with `<form validate>` for built-in form validation gates
- Use `step-validate` for custom expression-based validation
- Use `$stepper.next()` / `$stepper.prev()` for navigation controls
- Use `bind` / `bind-html` for dynamic content within steps
- Use `if` / `show` for conditional content per step
- Use `state` on the stepper or a parent to share data across steps
- Use `on:nojs:stepper-complete` to react when the user finishes the last step
