# Validate

Comprehensive form validation system driven by HTML attributes. Add `validate` to a `<form>` to enable automatic validation, error display, and submit handling. Supports built-in validators, custom validators, per-field error messages, conditional validation, and a reactive `$form` context API. Also supports standalone field validation outside forms.

## Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Form Attributes](#form-attributes)
- [Field Validation Rules](#field-validation-rules)
  - [Built-in Validators](#built-in-validators)
  - [Field Attributes](#field-attributes)
- [Validation Triggers](#validation-triggers)
- [Conditional Validation](#conditional-validation)
- [$form Context API](#form-context-api)
  - [Properties](#properties)
  - [Methods](#methods)
  - [Per-Field State](#per-field-state)
- [Error Display](#error-display)
  - [Inline Error Messages](#inline-error-messages)
  - [Custom Error Messages](#custom-error-messages)
  - [Error Templates](#error-templates)
  - [Error Class](#error-class)
- [Exposed Field State](#exposed-field-state)
- [Custom Validators](#custom-validators)
- [Auto-Disable Submit Buttons](#auto-disable-submit-buttons)
- [Standalone Field Validation](#standalone-field-validation)
- [Submit Handling](#submit-handling)
- [CSS Classes](#css-classes)
- [Accessibility](#accessibility)
- [Examples](#examples)
  - [Registration Form](#registration-form)
  - [Multi-Step Form with Stepper](#multi-step-form-with-stepper)
  - [Dynamic Conditional Fields](#dynamic-conditional-fields)
- [Composition with NoJS Directives](#composition-with-nojs-directives)
- [Template Validation Checklist](#template-validation-checklist)

---

## Installation

```html
<!-- CDN (auto-installs, no registration needed) -->
<script src="https://cdn-elements.no-js.dev/nojs-elements.iife.js"></script>
```

Requires No.JS >= 1.13.0. The Validation module is included in NoJS Elements. When using the CDN, it is auto-installed -- no separate registration needed.

---

## Basic Usage

Add `validate` to a `<form>` element. Add `validate` with pipe-separated (`|`) rules on each field, and use native HTML attributes (`minlength`, `maxlength`, `pattern`, `type`) for length, format and type checks. Validation reads each field's value directly, so `model` is not needed; leave it off fields that rely on native attributes (`minlength`, `pattern`), because with NoJS Elements 1.21.1 a `model` binding inside `<form validate>` can hide those native errors.

```html
<form validate post="/api/signup" success="#signed-up">
  <input name="email" type="email"
         validate="required|email"
         placeholder="Email address" />

  <input name="password" type="password"
         minlength="8" validate="required"
         placeholder="Password" />

  <button type="submit">Sign Up</button>
</form>

<template id="signed-up"><p>Welcome aboard!</p></template>
```

---

## Form Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `validate` | boolean attr | -- | Enables validation on the form |
| `validate-on` | space-separated list of `input`, `focusout` / `blur`, `submit` | see [Validation Triggers](#validation-triggers) | When errors become visible (form-wide default) |

---

## Field Validation Rules

### `validate` Attribute

Add validation rules to individual fields using pipe-separated syntax. Rules separated with a comma are read as one unknown rule and ignored:

```html
<input name="email" validate="required|email" />
<input name="qty" type="number" validate="required|min:1|max:50" />
<input name="code" pattern="[A-Z].*" validate="required" />
```

### Built-in Validators

| Validator | Description |
|-----------|-------------|
| `required` | Field must not be empty |
| `email` | Must be a valid email address |
| `url` | Must be a valid URL |
| `min:n` | Minimum **numeric** value (`Number(value) < n` fails). Not a length check |
| `max:n` | Maximum **numeric** value. Not a length check |
| `custom:name` / `name` | A validator registered with `NoJS.validator()` (see [Custom Validators](#custom-validators)) |

Any other rule name in `validate=""` (for example `minlength:8`, `pattern:...`, `match:...`, `number`, `alpha`) is not a built-in rule and is silently ignored. You cannot add these names yourself either: `required`, `email`, `url`, `min`, `max`, `minlength`, `maxlength`, `pattern`, `match`, `number`, `integer`, `alpha` and `alphanumeric` are reserved by Core, and `NoJS.validator()` refuses to register them (it logs a warning and does nothing). Register custom rules under another name, such as `samePassword`. For length, format and type checks, use the native attributes; NoJS Elements reads them through the browser's validity state, and `error-{rule}` uses the native rule name:

| Native attribute | `error-{rule}` attribute |
|------------------|--------------------------|
| `required` | `error-required` |
| `minlength="n"` / `maxlength="n"` | `error-minlength` / `error-maxlength` |
| `pattern="regex"` | `error-pattern` |
| `type="email"` / `type="url"` | `error-email` / `error-url` |
| `min="n"` / `max="n"` / `step="n"` (number inputs) | `error-min` / `error-max` / `error-step` |

Browsers stop the user from typing past `maxlength` and do not flag values set from script, so in practice `error-maxlength` never appears; `maxlength` simply caps the input.

### Field Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `validate` | string | -- | Pipe-separated validation rules |
| `validate-on` | string | form default | Per-field override for when validation runs |
| `validate-if` | expression | -- | Skip validation when expression is falsy |
| `error-{rule}` | string | -- | Custom error message for a specific rule |
| `error` | string \| `#templateId` | -- | One message for every rule, or `#templateId` to render an [error template](#error-templates) |
| `error-class` | string | -- | CSS class applied to the field when invalid |
| `as` | string | -- | Expose field validation state as a named variable |

---

## Validation Triggers

Control when validation runs and errors become visible using `validate-on`.

```html
<!-- Form-wide: validate on blur only -->
<form validate validate-on="focusout">
  <input name="email" validate="required|email" />
</form>

<!-- Per-field override -->
<form validate>
  <input name="name" validate="required" validate-on="input" />
  <input name="email" validate="required|email" validate-on="focusout" />
  <input name="code" validate="required" validate-on="submit" />
</form>
```

| Trigger | Error becomes visible |
|---------|-----------------------|
| `input` | As soon as the field has been edited |
| `focusout` / `blur` | After the field loses focus |
| `submit` | After the field loses focus, or when the form is submitted |

Combine triggers with spaces (`validate-on="input focusout"`). The value is split on whitespace, so a comma-separated value such as `"input,focusout"` is one unknown trigger and errors never become visible. `change` is not a supported trigger either: a field with `validate-on="change"` never shows its errors.

Without any `validate-on` on the form or its fields, the form listens for `input`, `change` and `focusout`, and a field's error becomes visible once the field has been edited or has lost focus. As soon as the form or any field has `validate-on`, a field without its own value uses the form's value, or `input focusout` when the form has none.

Regardless of the `validate-on` setting, `$form.valid` always reflects real-time validity (for submit button state). The trigger only controls when `$form.errors`, `error-class` and error templates show the error. A submit attempt marks every field as touched.

---

## Conditional Validation

Skip validation when a field is irrelevant using `validate-if`:

```html
<form validate>
  <select name="method">
    <option value="email">Email</option>
    <option value="phone">Phone</option>
  </select>

  <input name="email"
         validate="required|email"
         validate-if="$form.values.method === 'email'"
         placeholder="Email" />

  <input name="phone"
         pattern="\+?[0-9]{10,}" validate="required"
         validate-if="$form.values.method === 'phone'"
         placeholder="Phone number" />
</form>
```

When `validate-if` evaluates to `false`, the field is treated as valid and its errors are cleared. Read other fields through `$form.values` instead of a `model` binding: with NoJS Elements 1.21.1, `<select model>` inside `<form validate>` does not keep the selected value.

---

## `$form` Context API

Available inside any element within a `<form validate>`. Provides reactive access to form-level and per-field validation state.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `$form.valid` | boolean | `true` when all fields pass validation (use `!$form.valid` for the invalid case) |
| `$form.dirty` | boolean | `true` when any field value has changed |
| `$form.touched` | boolean | `true` when any field has been interacted with |
| `$form.submitting` | boolean | `true` from a valid submit until the form's own request (`post`, `put`, ...) finishes, or until you call `$form.endSubmit()` |
| `$form.pending` | boolean | Always `false`: async validators are not supported |
| `$form.errors` | object | Map of field names to their current error message (only fields the user has interacted with) |
| `$form.firstError` | string \| null | The first visible error message |
| `$form.errorCount` | number | Number of visible errors |
| `$form.values` | object | Map of field names to their values |
| `$form.fields` | object | Map of field names to per-field state objects |

### Methods

| Method | Description |
|--------|-------------|
| `$form.reset()` | Reset all fields to their initial values and clear validation state |
| `$form.endSubmit()` | Set `$form.submitting` back to `false` (needed for forms handled only by `on:submit`, see [Submit Handling](#submit-handling)) |

### Per-Field State

Access individual field state via `$form.fields.<name>`:

| Property | Type | Description |
|----------|------|-------------|
| `$form.fields.<name>.valid` | boolean | Field passes all rules |
| `$form.fields.<name>.error` | string \| null | First error message, or `null` if valid |
| `$form.fields.<name>.dirty` | boolean | Value has changed |
| `$form.fields.<name>.touched` | boolean | Field has been interacted with |
| `$form.fields.<name>.value` | string | Current value |

`$form.fields.<name>` does not exist until the form has evaluated that field, so prefer `show` (or `bind`) over `if` for expressions that read it; an `if` whose first evaluation fails does not re-render later.

```html
<form validate>
  <input name="email" validate="required|email" />
  <span show="$form.fields.email?.touched && $form.fields.email?.error"
        bind="$form.fields.email?.error"
        style="color: red"></span>
</form>
```

---

## Error Display

### Inline Error Messages

Validation does not insert any error text by itself. When an interacted field is invalid, it only gets `aria-invalid="true"` (plus `error-class`, if set). Show the message yourself with `$form.errors`, `$form.fields.<name>.error`, an `as` variable, or an [error template](#error-templates). The message is the one from the first failing rule.

### Custom Error Messages

Override default messages with `error-{rule}` attributes, or set one message for every rule with `error="..."`:

```html
<input name="email"
       validate="required|email"
       error-required="Please enter your email address"
       error-email="That does not look like a valid email" />
```

### Error Templates

Use a `<template>` for rich error display, referenced with `error="#templateId"`:

```html
<form validate>
  <input name="username" minlength="3" validate="required"
         error="#username-errors" />

  <template id="username-errors">
    <div class="error-box" if="$error">
      <span bind="$error"></span>
    </div>
  </template>
</form>
```

The template receives `$error` (the message) and `$rule` (the failing rule name). It is rendered right after the `<template>` element (not after the field), inside a wrapper with `aria-live="polite"`, when the error becomes visible, and it is removed when the field becomes valid.

### Error Class

Apply a CSS class to the field itself when invalid:

```html
<input name="email" validate="required|email"
       error-class="field-invalid" />
```

The class is added when the field is invalid AND the error is visible (respects `validate-on` triggers).

---

## Exposed Field State

Use the `as` attribute to expose a field's validation state as a named variable in the parent scope:

```html
<form validate>
  <input name="password" type="password" minlength="8" validate="required" as="pw" />
  <div show="pw.dirty && !pw.valid" class="hint">
    Password must be at least 8 characters
  </div>
  <div show="pw.valid" class="success">
    Password strength: OK
  </div>
</form>
```

`as` works on fields inside a `<form validate>`. The exposed object has the per-field state properties (`valid`, `error`, `dirty`, `touched`, `value`); there is no `invalid` property, so use `!pw.valid`.

---

## Custom Validators

Register custom validators with `NoJS.validator()`. NoJS Elements reads the registered validators when it installs, so register them in a script **between** the core and the Elements `<script>` tags; a validator registered later is ignored:

```html
<script src="https://cdn.no-js.dev/"></script>
<script>
  NoJS.validator('samePassword', (value, values) =>
    value === values.password || 'Passwords do not match');
  NoJS.validator('startsWith', (value, prefix, values) =>
    value.startsWith(prefix) || 'Must start with ' + prefix);
</script>
<script src="https://cdn-elements.no-js.dev/"></script>

<input name="confirmPassword" type="password" validate="required|samePassword" />
<input name="code" validate="required|startsWith:A" />
```

### Validator Function Signature

```
(value: string, ...params: string[], values: object) => true | string
```

- `params` are the colon-separated arguments (`startsWith:A` passes `"A"`); `values` maps every field name in the form to its value
- Return a string for invalid, with that string as the message
- Return `true` for valid. Any falsy return (`false`, `null`, `undefined`, `""`, `0`) also counts as valid, so returning `false` does not fail the field: return a message string instead
- Validators must be synchronous: a returned Promise is treated as an error (the message shows as `[object Promise]`). Async validators are not supported, and `$form.pending` is always `false`

---

## Auto-Disable Submit Buttons

Submit buttons inside a `<form validate>` are automatically disabled when `$form.valid` is `false`. No extra attributes needed.

```html
<form validate>
  <input name="email" validate="required|email" />
  <!-- This button is automatically disabled until the form is valid -->
  <button type="submit">Submit</button>
</form>
```

Every submit button in the form (`button` without `type="button"`, and `input[type="submit"]`) is managed this way, and `bind-disabled` does not opt a button out. Buttons with `type="button"` are left alone. The buttons are also disabled while `$form.submitting` is `true`.

---

## Standalone Field Validation

Use `validate` on a single field outside a `<form>` for isolated validation:

```html
<input name="search" validate="required" error="#search-error" />

<template id="search-error">
  <span bind="err.message" class="error"></span>
</template>
```

In standalone mode, validation runs on `input` events and checks only the rules in `validate=""`; native attributes such as `minlength` or `pattern` are not checked outside a form. The template is rendered right after the field while it is invalid and receives `err.message` (note: `err`, not `$error` or `$form`).

---

## Submit Handling

When a `<form validate>` is submitted:

1. All fields are marked as touched (making all errors visible)
2. If any field is invalid, submission is blocked
3. If all fields are valid, `$form.submitting` becomes `true` and the `on:submit` handler (or the form's `post` / `put` / ... request) runs
4. When the form's own request (`post`, `put`, ...) finishes, `$form.submitting` goes back to `false`. A form handled only by `on:submit` stays in the submitting state, with its submit buttons disabled, until you call `$form.endSubmit()`. Put it after the rest of the handler: if an earlier statement fails, the statement stops and `endSubmit()` never runs

```html
<form validate post="/api/register" success="#registered">
  <input name="email" validate="required|email" />
  <button type="submit">
    <span hide="$form.submitting">Register</span>
    <span show="$form.submitting">Submitting...</span>
  </button>
</form>

<template id="registered"><p>Thanks for registering!</p></template>

<!-- Handled by on:submit only: end the submitting state yourself -->
<div state="{ draft: null }">
  <form validate on:submit.prevent="draft = $form.values; $form.endSubmit()">
    <input name="title" validate="required" />
    <button type="submit">Save</button>
  </form>
  <p show="draft">Draft saved: <span bind="draft.title"></span></p>
</div>
```

---

## CSS Classes

The validation module does not inject global CSS classes. Styling is controlled through:

- `error-class` attribute on fields -- applies your chosen class when invalid
- Error templates -- fully customizable via `<template>`
- `$form` / `$form.fields` -- bind classes conditionally

---

## Accessibility

- Invalid fields get `aria-invalid="true"`. With `validate-on`, it can appear while the user types, before the error is visible, because a field's own `validate=""` rules also set it on every `input` event
- Error templates are rendered inside a wrapper with `aria-live="polite"`, so screen readers announce them
- `aria-describedby` and `role="alert"` are not set for you; add them to your own error markup if needed
- Native HTML5 constraint validation attributes (`required`, `type="email"`, etc.) are preserved alongside NoJS validation; the form gets `novalidate`, so the browser's own popups do not appear

---

## Examples

### Registration Form

Complete registration form with multiple validation rules, custom messages, and submit handling. The form posts its named fields, and `$form.submitting` goes back to `false` when the request finishes.

```html
<form validate post="/api/register" success="#welcome">
  <div>
    <label>Username</label>
    <input name="username"
           minlength="3" maxlength="20" pattern="[A-Za-z0-9]+"
           validate="required"
           error-required="Username is required"
           error-minlength="At least 3 characters"
           error-pattern="Letters and numbers only"
           error-class="input-error"
           placeholder="Choose a username" />
    <span show="$form.fields.username?.touched && $form.fields.username?.error"
          bind="$form.fields.username?.error" class="error-text"></span>
  </div>

  <div>
    <label>Email</label>
    <input name="email" type="email"
           validate="required|email"
           error-class="input-error"
           placeholder="your@email.com" />
    <span show="$form.fields.email?.touched && $form.fields.email?.error"
          bind="$form.fields.email?.error" class="error-text"></span>
  </div>

  <div>
    <label>Password</label>
    <input name="password" type="password"
           minlength="8" validate="required"
           error-class="input-error"
           placeholder="At least 8 characters" />
  </div>

  <div>
    <label>Confirm Password</label>
    <!-- samePassword: a custom validator, see Custom Validators -->
    <input name="confirmPassword" type="password"
           validate="required|samePassword"
           error-class="input-error" />
  </div>

  <button type="submit">
    <span hide="$form.submitting">Create Account</span>
    <span show="$form.submitting">Creating...</span>
  </button>
</form>

<template id="welcome"><p>Account created. Welcome!</p></template>
```

### Multi-Step Form with Stepper

Combine validation with the stepper element for multi-step wizards.

```html
<div state="{ email: '', name: '', acceptedTerms: false }">
  <div stepper stepper-indicator>
    <div step step-label="Account" stepper-validate>
      <form validate>
        <input name="email" model="email" type="email"
               validate="required|email" placeholder="Email" />
        <span show="$form.fields.email?.touched && $form.fields.email?.error"
              bind="$form.fields.email?.error" style="color: red"></span>
      </form>
      <button type="button" on:click="$stepper.next()">Next</button>
    </div>

    <div step step-label="Profile" step-validate="name !== ''">
      <input model="name" placeholder="Your name" />
      <button type="button" on:click="$stepper.prev()">Back</button>
      <button type="button" on:click="$stepper.next()">Next</button>
    </div>

    <div step step-label="Terms" step-validate="acceptedTerms">
      <label>
        <input type="checkbox" model="acceptedTerms" />
        I accept the terms and conditions
      </label>
      <button type="button" on:click="$stepper.prev()">Back</button>
      <button type="button">Finish</button>
    </div>
  </div>
</div>
```

### Dynamic Conditional Fields

Show and validate fields based on user selection.

```html
<div state="{ account: null }">
  <form validate on:submit.prevent="account = $form.values; $form.endSubmit()">
    <select name="accountType">
      <option value="personal">Personal</option>
      <option value="business">Business</option>
    </select>

    <div show="$form.values.accountType === 'business'">
      <input name="companyName"
             minlength="2" validate="required"
             validate-if="$form.values.accountType === 'business'"
             placeholder="Company name" />

      <input name="taxId"
             pattern="[0-9]{2}\.[0-9]{3}\.[0-9]{3}/[0-9]{4}-[0-9]{2}" validate="required"
             validate-if="$form.values.accountType === 'business'"
             error-pattern="Enter a valid CNPJ"
             placeholder="Tax ID (CNPJ)" />
    </div>

    <button type="submit">Create Account</button>
  </form>
  <p show="account">Created: <span bind="account.accountType"></span></p>
</div>
```

---

## Composition with NoJS Directives

Validation integrates with the full NoJS directive system:

- **`model`** -- optional two-way binding; validation reads each field's value directly. With NoJS Elements 1.21.1, `model` combined with `validate-on` clears typed values, so leave `model` off fields that use `validate-on`
- **`state`** -- reactive state for form data
- **`if` / `show`** -- conditionally display error messages and conditional fields
- **`bind`** -- display error messages and field state
- **`on:submit.prevent`** -- handle form submission
- **`validate-if`** -- skip validation based on reactive expressions
- **`each`** -- render dynamic field lists with per-field validation
- **`get` / `post`** -- submit the form (`<form validate post="...">`)
- **`class-*`** -- apply conditional CSS classes based on `$form` state

```html
<div state="{ fields: [
  { name: 'firstName', label: 'First Name', rules: 'required' },
  { name: 'lastName', label: 'Last Name', rules: 'required' },
  { name: 'email', label: 'Email', rules: 'required|email' }
] }">
  <form validate post="/api/profile" success="#profile-saved">
    <div each="field in fields" key="field.name">
      <label bind="field.label"></label>
      <input bind-name="field.name"
             bind-validate="field.rules"
             bind-placeholder="field.label" />
    </div>
    <button type="submit">Save</button>
  </form>
</div>

<template id="profile-saved"><p>Profile saved.</p></template>
```

---

## Template Validation Checklist

Use this checklist when reviewing NoJS templates that use validation:

### Forms

- [ ] `<form>` elements that need validation have the `validate` attribute
- [ ] All validated fields have a `name` attribute (required for `$form.fields` access)
- [ ] Custom error messages use `error-{rule}` pattern (e.g., `error-required`, `error-email`)
- [ ] Submit buttons rely on auto-disable (automatic) or use `bind-disabled="!$form.valid"`
- [ ] Use `$form.submitting` to show loading state during form submission
- [ ] Use `$form.reset()` where form reset functionality is needed
- [ ] Conditional fields use `validate-if` to skip validation when hidden/irrelevant
- [ ] Use `validate-on="focusout"` for progressive validation (errors appear after user interaction)

### Common Mistakes

- [ ] All event bindings use colon syntax (`on:click`, not `on-click`)
- [ ] `model` is only used on `<input>`, `<select>`, or `<textarea>`
- [ ] Error display checks both `touched` and `error` (`$form.fields.email?.touched && $form.fields.email?.error`)

### Security

- [ ] Every `bind-html` usage has its content source reviewed for XSS safety
- [ ] CSRF is configured for apps that make mutating requests
