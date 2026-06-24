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

Add `validate` to a `<form>` element. Add `validate` with pipe-separated rules on each field.

```html
<form validate on:submit.prevent="handleSubmit()">
  <input name="email" model="email" type="email"
         validate="required|email"
         placeholder="Email address" />

  <input name="password" model="password" type="password"
         validate="required|min:8"
         placeholder="Password" />

  <button type="submit">Sign Up</button>
</form>
```

---

## Form Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `validate` | boolean attr | -- | Enables validation on the form |
| `validate-on` | `"input"` \| `"change"` \| `"focusout"` \| `"submit"` | `"input,change,focusout"` | When to trigger validation and show errors (form-wide default) |

---

## Field Validation Rules

### `validate` Attribute

Add validation rules to individual fields using pipe-separated syntax:

```html
<input validate="required|email" />
<input validate="required|min:3|max:50" />
<input validate="required|pattern:^[A-Z]" />
```

### Built-in Validators

| Validator | Description |
|-----------|-------------|
| `required` | Field must not be empty |
| `email` | Must be a valid email address |
| `url` | Must be a valid URL |
| `min:n` | Minimum length (string) or minimum value (number) |
| `max:n` | Maximum length (string) or maximum value (number) |
| `minlength:n` | Minimum character length |
| `maxlength:n` | Maximum character length |
| `pattern:regex` | Must match the regular expression |
| `match:fieldName` | Must match another field's value (password confirmation) |
| `number` | Must be a valid number |
| `integer` | Must be an integer |
| `alpha` | Letters only |
| `alphanumeric` | Letters and numbers only |

### Field Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `validate` | string | -- | Pipe-separated validation rules |
| `validate-on` | string | form default | Per-field override for when validation runs |
| `validate-if` | expression | -- | Skip validation when expression is falsy |
| `error-{rule}` | string | -- | Custom error message for a specific rule |
| `error-class` | string | -- | CSS class applied to the field when invalid |
| `error-template` | template ID | -- | Template to render for error display |
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

| Trigger | Behavior |
|---------|----------|
| `input` | Validates on every keystroke |
| `change` | Validates when the field value is committed (select change, checkbox toggle) |
| `focusout` / `blur` | Validates when the field loses focus |
| `submit` | Validates only on form submission |

The default triggers are `input`, `change`, and `focusout`. When `validate-on` is set on the form, it applies to all fields unless overridden per-field.

Regardless of the `validate-on` setting, `$form.valid` always reflects real-time validity (for submit button state). The trigger only controls when error messages and `error-class` become visible.

---

## Conditional Validation

Skip validation when a field is irrelevant using `validate-if`:

```html
<form validate>
  <select model="contactMethod" name="method">
    <option value="email">Email</option>
    <option value="phone">Phone</option>
  </select>

  <input name="email" model="email"
         validate="required|email"
         validate-if="contactMethod === 'email'"
         placeholder="Email" />

  <input name="phone" model="phone"
         validate="required|pattern:^\\+?[0-9]{10,}"
         validate-if="contactMethod === 'phone'"
         placeholder="Phone number" />
</form>
```

When `validate-if` evaluates to `false`, the field is treated as valid and its errors are cleared.

---

## `$form` Context API

Available inside any element within a `<form validate>`. Provides reactive access to form-level and per-field validation state.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `$form.valid` | boolean | `true` when all fields pass validation |
| `$form.invalid` | boolean | `true` when any field fails validation |
| `$form.dirty` | boolean | `true` when any field value has changed from its initial value |
| `$form.pristine` | boolean | `true` when no field values have changed |
| `$form.touched` | boolean | `true` when any field has been interacted with |
| `$form.untouched` | boolean | `true` when no fields have been interacted with |
| `$form.submitting` | boolean | `true` while the form is being submitted (async submit) |
| `$form.errors` | object | Map of field names to their current error messages |
| `$form.fields` | object | Map of field names to per-field state objects |

### Methods

| Method | Description |
|--------|-------------|
| `$form.reset()` | Reset all fields to their initial values and clear validation state |

### Per-Field State

Access individual field state via `$form.fields.<name>`:

| Property | Type | Description |
|----------|------|-------------|
| `$form.fields.<name>.valid` | boolean | Field passes all rules |
| `$form.fields.<name>.invalid` | boolean | Field fails at least one rule |
| `$form.fields.<name>.error` | string \| null | First error message, or `null` if valid |
| `$form.fields.<name>.errors` | string[] | All error messages |
| `$form.fields.<name>.dirty` | boolean | Value has changed from initial |
| `$form.fields.<name>.pristine` | boolean | Value unchanged |
| `$form.fields.<name>.touched` | boolean | Field has been interacted with |
| `$form.fields.<name>.untouched` | boolean | Field has not been interacted with |

```html
<form validate>
  <input name="email" validate="required|email" />
  <span if="$form.fields.email?.touched && $form.fields.email?.error"
        bind="$form.fields.email.error"
        style="color: red"></span>
</form>
```

---

## Error Display

### Inline Error Messages

By default, validation errors are shown as inline text below the field. The first failing rule's message is displayed.

### Custom Error Messages

Override default messages with `error-{rule}` attributes:

```html
<input name="email"
       validate="required|email"
       error-required="Please enter your email address"
       error-email="That does not look like a valid email" />
```

### Error Templates

Use a `<template>` for rich error display:

```html
<input name="username" validate="required|min:3"
       error-template="username-errors" />

<template id="username-errors">
  <div class="error-box" if="$err">
    <span bind="$err.message"></span>
  </div>
</template>
```

The template receives `$err` with `$err.message` (the error string) and `$err.rule` (the failing rule name).

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
<input name="password" validate="required|min:8" as="pw" />
<div if="pw.touched && pw.invalid" class="hint">
  Password must be at least 8 characters
</div>
<div if="pw.valid" class="success">
  Password strength: OK
</div>
```

---

## Custom Validators

Register custom validators with `NoJS.validator()`:

```html
<script>
  NoJS.validator('unique-email', async (value, param, field) => {
    if (!value) return true;
    const res = await fetch(`/api/check-email?email=${value}`);
    const data = await res.json();
    return data.available || 'This email is already taken';
  });
</script>

<input name="email" validate="required|email|unique-email" />
```

### Validator Function Signature

```
(value: string, param: string | undefined, field: HTMLElement) => boolean | string | Promise<boolean | string>
```

- Return `true` for valid
- Return `false` for invalid (uses default message)
- Return a string for invalid with custom message
- Return a Promise for async validation

The `param` argument receives the value after the colon (e.g., `min:8` passes `"8"` as param).

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

To opt out, bind the `disabled` attribute explicitly:

```html
<button type="submit" bind-disabled="false">Always Enabled</button>
```

---

## Standalone Field Validation

Use `validate` on a single field outside a `<form>` for isolated validation:

```html
<input name="search" validate="required|min:3"
       error-template="search-error" />

<template id="search-error">
  <span if="$err" bind="$err.message" class="error"></span>
</template>
```

In standalone mode, validation runs on `input` events. The error template receives `$err.message` (note: `$err`, not `$form`).

---

## Submit Handling

When a `<form validate>` is submitted:

1. All fields are marked as touched (making all errors visible)
2. If any field is invalid, submission is blocked
3. If all fields are valid, the `on:submit` handler executes
4. `$form.submitting` is set to `true` during async submit, then `false` when complete

```html
<form validate on:submit.prevent="submitRegistration()">
  <input name="email" model="email" validate="required|email" />
  <button type="submit">
    <span hide="$form.submitting">Register</span>
    <span show="$form.submitting">Submitting...</span>
  </button>
</form>
```

---

## CSS Classes

The validation module does not inject global CSS classes. Styling is controlled through:

- `error-class` attribute on fields -- applies your chosen class when invalid
- Error templates -- fully customizable via `<template>`
- `$form` / `$form.fields` -- bind classes conditionally

---

## Accessibility

- Error messages are associated with fields via `aria-describedby`
- Invalid fields get `aria-invalid="true"`
- Error messages use `role="alert"` for screen reader announcements
- Native HTML5 constraint validation attributes (`required`, `type="email"`, etc.) are preserved alongside NoJS validation

---

## Examples

### Registration Form

Complete registration form with multiple validation rules, custom messages, and submit handling.

```html
<div state="{ username: '', email: '', password: '', confirmPassword: '' }">
  <form validate on:submit.prevent="register()">
    <div>
      <label>Username</label>
      <input name="username" model="username"
             validate="required|min:3|max:20|alphanumeric"
             error-required="Username is required"
             error-min="At least 3 characters"
             error-class="input-error"
             placeholder="Choose a username" />
      <span if="$form.fields.username?.touched && $form.fields.username?.error"
            bind="$form.fields.username.error" class="error-text"></span>
    </div>

    <div>
      <label>Email</label>
      <input name="email" model="email" type="email"
             validate="required|email"
             error-class="input-error"
             placeholder="your@email.com" />
      <span if="$form.fields.email?.touched && $form.fields.email?.error"
            bind="$form.fields.email.error" class="error-text"></span>
    </div>

    <div>
      <label>Password</label>
      <input name="password" model="password" type="password"
             validate="required|min:8"
             error-class="input-error"
             placeholder="At least 8 characters" />
    </div>

    <div>
      <label>Confirm Password</label>
      <input name="confirmPassword" model="confirmPassword" type="password"
             validate="required|match:password"
             error-match="Passwords do not match"
             error-class="input-error" />
    </div>

    <button type="submit">
      <span hide="$form.submitting">Create Account</span>
      <span show="$form.submitting">Creating...</span>
    </button>
  </form>
</div>
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
        <span if="$form.fields.email?.touched && $form.fields.email?.error"
              bind="$form.fields.email.error" style="color: red"></span>
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
<div state="{ accountType: 'personal', companyName: '', taxId: '' }">
  <form validate on:submit.prevent="createAccount()">
    <select name="accountType" model="accountType">
      <option value="personal">Personal</option>
      <option value="business">Business</option>
    </select>

    <div show="accountType === 'business'">
      <input name="companyName" model="companyName"
             validate="required|min:2"
             validate-if="accountType === 'business'"
             placeholder="Company name" />

      <input name="taxId" model="taxId"
             validate="required|pattern:^[0-9]{2}\\.[0-9]{3}\\.[0-9]{3}\\/[0-9]{4}\\-[0-9]{2}$"
             validate-if="accountType === 'business'"
             error-pattern="Enter a valid CNPJ"
             placeholder="Tax ID (CNPJ)" />
    </div>

    <button type="submit">Create Account</button>
  </form>
</div>
```

---

## Composition with NoJS Directives

Validation integrates with the full NoJS directive system:

- **`model`** -- two-way binding on form fields (required for validation to track values)
- **`state`** -- reactive state for form data
- **`if` / `show`** -- conditionally display error messages and conditional fields
- **`bind`** -- display error messages and field state
- **`on:submit.prevent`** -- handle form submission
- **`validate-if`** -- skip validation based on reactive expressions
- **`each`** -- render dynamic field lists with per-field validation
- **`get` / `post`** -- async data fetching for custom async validators
- **`class-*`** -- apply conditional CSS classes based on `$form` state

```html
<div state="{ fields: [
  { name: 'firstName', label: 'First Name', rules: 'required' },
  { name: 'lastName', label: 'Last Name', rules: 'required' },
  { name: 'email', label: 'Email', rules: 'required|email' }
] }">
  <form validate on:submit.prevent="save()">
    <div each="field in fields" key="field.name">
      <label bind="field.label"></label>
      <input bind-name="field.name"
             bind-validate="field.rules"
             bind-placeholder="field.label" />
    </div>
    <button type="submit">Save</button>
  </form>
</div>
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
