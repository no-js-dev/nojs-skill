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

Place the `stepper` attribute on a container element and add `step` children inside it. Use the `$stepper` context API to navigate between steps.

```html
<div stepper>
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
    <button type="button">Finish</button>
  </div>
</div>
```

Only the active step is visible at a time. By default, navigation is linear (sequential).

---

## Attributes

### Stepper Container

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `stepper` | boolean attr | -- | Declares the stepper container |
| `stepper-mode` | `"linear"` \| `"free"` | `"linear"` | Navigation mode |
| `stepper-indicator` | boolean attr | -- | Shows a step indicator (step numbers/labels) |

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
| `$stepper.next()` | Go to the next step (respects validation gates) |
| `$stepper.prev()` | Go to the previous step |
| `$stepper.goTo(index)` | Go to a specific step (respects validation in linear mode) |
| `$stepper.reset()` | Reset to the first step |

---

## Events

| Event | `$event.detail` | Description |
|-------|-----------------|-------------|
| `stepper:change` | `{ from, to, step }` | Fired when the active step changes |
| `stepper:complete` | `{ steps }` | Fired when the user advances past the last step |
| `stepper:validation-blocked` | `{ step, form }` | Fired when forward navigation is blocked by validation |

```html
<div stepper
     on:stepper:change="console.log('Changed:', $event.detail)"
     on:stepper:complete="submitForm()">
  <!-- steps -->
</div>
```

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
<div stepper stepper-mode="free" stepper-indicator>
  <!-- Steps can be visited in any order -->
</div>
```

---

## CSS Classes

| Class | When Applied |
|-------|-------------|
| `.nojs-stepper` | On the stepper container |
| `.nojs-step` | On each step panel |
| `.nojs-step-active` | On the currently visible step |
| `.nojs-step-complete` | On steps that have been completed |
| `.nojs-step-indicator` | On the step indicator bar |
| `.nojs-step-invalid` | On a step when validation blocks navigation |

---

## Accessibility

NoJS automatically applies:

- Step indicator uses `role="tablist"` with `role="tab"` items
- Step panels use `role="tabpanel"`
- `aria-current="step"` on the active indicator item
- Inactive steps are hidden with `aria-hidden="true"`

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `ArrowRight` / `ArrowLeft` | Navigate between step indicators (free mode) |

---

## Examples

### Linear Stepper with Validation Gate

Steps must be completed in order. The first step uses form validation, the second uses an expression gate.

```html
<div stepper stepper-indicator>
  <div step step-label="Account" stepper-validate>
    <form validate>
      <input name="email" validate="required|email" placeholder="Email" />
      <button type="button" on:click="$stepper.next()">Next</button>
    </form>
  </div>
  <div step step-label="Profile" step-validate="name !== ''">
    <input model="name" placeholder="Name" />
    <button type="button" on:click="$stepper.prev()">Back</button>
    <button type="button" on:click="$stepper.next()">Next</button>
  </div>
  <div step step-label="Confirm">
    <p>Welcome, <span bind="name"></span>!</p>
    <button type="button" on:click="$stepper.prev()">Back</button>
    <button type="button">Finish</button>
  </div>
</div>
```

### Free-Mode Stepper

Steps can be visited in any order by clicking the step indicator.

```html
<div stepper stepper-mode="free" stepper-indicator>
  <div step step-label="General">General settings</div>
  <div step step-label="Security">Security settings</div>
  <div step step-label="Notifications">Notification preferences</div>
</div>
```

### Stepper with Form Validation and Custom Events

Combines form validation, expression validation, and event handlers for a complete checkout flow.

```html
<div stepper stepper-indicator
     on:stepper:change="console.log('Step changed:', $event.detail)"
     on:stepper:complete="submitForm()">
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
    <button type="button" on:click="$stepper.next()">Submit</button>
  </div>
</div>
```

---

## Composition with NoJS Directives

The stepper works with any NoJS directive inside its steps:

```html
<div state="{ user: {}, loading: false }"
     stepper stepper-indicator
     on:stepper:complete="loading = true; post('/api/register', user)">
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
    <button type="button" on:click="$stepper.next()" bind-disabled="loading">
      <span if="!loading">Submit</span>
      <span if="loading">Submitting...</span>
    </button>
  </div>
</div>
```

- Use `stepper-validate` with `<form validate>` for built-in form validation gates
- Use `step-validate` for custom expression-based validation
- Use `$stepper.next()` / `$stepper.prev()` for navigation controls
- Use `bind` / `bind-html` for dynamic content within steps
- Use `if` / `show` for conditional content per step
- Use `state` on the stepper or a parent to share data across steps
- Use `on:stepper:complete` to handle form submission
