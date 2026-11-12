# Validate

Form validation driven by HTML attributes. Add `validate` to a `<form>` to enable validation, error display and submit blocking. Supports built-in rules, native HTML5 constraints, custom validators, per-rule error messages, error templates, conditional validation, opt-in empty-value skipping and a reactive `$form` context. Also supports standalone field validation outside forms.

## Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Form Attributes](#form-attributes)
- [Field Validation Rules](#field-validation-rules)
  - [Built-in Validators](#built-in-validators)
  - [Empty Values (`validate-empty`)](#empty-values-validate-empty)
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
<script src="https://cdn.no-js.dev/"></script>
<script src="https://cdn-elements.no-js.dev/"></script>
```

Requires No.JS >= 1.13.0. The Validation module is included in NoJS Elements. When using the CDN, it is auto-installed -- no separate registration needed. Without Elements, core's `validate` is a stub and nothing is validated.

---

## Basic Usage

Add `validate` to a `<form>`. Give every validated field a `name` and pipe-separated rules in its own `validate` attribute.

```html
<div state="{ sent: false }">
  <form validate on:submit.prevent="sent = true; $form.endSubmit()">
    <input name="email" type="email" validate="required|email" placeholder="Email address" />
    <span if="$form.errors.email" bind="$form.errors.email"></span>

    <input name="password" type="password" minlength="8" validate="required" placeholder="Password" />
    <span if="$form.errors.password" bind="$form.errors.password"></span>

    <button type="submit">Sign Up</button>
  </form>
  <p show="sent">Thanks for signing up!</p>
</div>
```

The handler runs only when the form is valid. It calls `$form.endSubmit()` because an `on:submit` form stays in the submitting state (submit buttons disabled) until it does; see [Submit Handling](#submit-handling). Native browser validation popups are disabled (`novalidate` is set on the form).

---

## Form Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `validate` | boolean attr | -- | Enables form-level validation and creates the `$form` context |
| `validate-on` | string | `"input change focusout"` | Space-separated events that show errors (form-wide default, overridden per field). See [Validation Triggers](#validation-triggers) |
| `error-class` | string | -- | Class(es) applied to invalid fields after interaction (form-wide default, overridden per field) |
| `validate-empty` | `"check"` \| `"skip"` | `"check"` | Opt-in `"skip"`: an empty value passes `min`, `max` and `url` (form-wide default, overridden per field). See [Empty Values](#empty-values-validate-empty) |

---

## Field Validation Rules

### `validate` Attribute

Add rules to `<input>`, `<textarea>` or `<select>` fields using pipe-separated syntax. Rule arguments follow `:` (`min:18`).

```html
<input name="email" validate="required|email" />
<input name="age" type="number" validate="required|min:18|max:120" />
<input name="code" validate="required" minlength="3" pattern="[A-Z].*" />
```

### Built-in Validators

The `validate` attribute has five built-in rules plus `custom`. The five names are reserved: `NoJS.validator()` refuses to override them.

| Rule | Error message | Description |
|------|---------------|-------------|
| `required` | `"Required"` | Value must not be empty (whitespace-only counts as empty) |
| `email` | `"Invalid email"` | Must match `user@domain.tld`. An empty value passes |
| `url` | `"Invalid URL"` | Must parse with `new URL()`. Fails `""` unless `validate-empty="skip"` |
| `min:n` | `"Minimum value is n"` | Numeric value must be at least `n` (not a length check). An empty value counts as `0` unless `validate-empty="skip"` |
| `max:n` | `"Maximum value is n"` | Numeric value must be at most `n` (not a length check) |
| `custom:name` | from the validator | Runs the registered validator `name` with `(value, formValues)` -- no rule arguments are passed |

Native HTML attributes are also validated through the browser's `ValidityState` and reported under these rule names (usable in `error-{rule}`): `required`, `minlength`, `maxlength`, `pattern`, `min`, `max`, `step`, and the input `type` (`email`, `url`, `number`, `date`, ...). Their message is the browser's `validationMessage`. When a `validate` rule and a native attribute report the same rule name, the `validate` rule's message wins. When a field has several errors, `required` is shown first.

There is no built-in `minlength:n`, `maxlength:n`, `pattern:regex`, `match`, `number`, `integer`, `alpha` or `alphanumeric` rule. These names are free: register your own with `NoJS.validator()` in a script that runs before NoJS Elements loads, because Elements reads the validator registry when it installs:

```html
<script src="https://cdn.no-js.dev/"></script>
<script>
  NoJS.validator('match', (value, other, values) =>
    value === (values || {})[other] || 'Values do not match');
  NoJS.validator('alphanumeric', (value) =>
    /^[a-z0-9]*$/i.test(value) || 'Letters and numbers only');
</script>
<script src="https://cdn-elements.no-js.dev/"></script>

<form validate>
  <input name="password" type="password" minlength="8" validate="required" />
  <input name="confirm" type="password" validate="required|match:password" />
</form>
```

A validator used as a rule name receives `(value, ...ruleArgs, formValues)`: `match:password` passes `"password"` as the first rule argument. Arguments are split on `:` only (`rule:a:b`), so `rule:a,b` passes the single string `"a,b"`. Return an error string to fail; `true` or any falsy value passes. See [Custom Validators](#custom-validators).

### Empty Values (`validate-empty`)

By default (`validate-empty="check"`, the v1.21.1 behavior), `min`, `max` and `url` also check an empty field: `min:N` and `max:N` compare the empty value as `0`, so `min:1` fails an empty field, and `url` fails because `""` is not a URL. A form can rely on this: `validate="min:1"` without `required` blocks an empty submit.

To make these rules ignore an empty field, set the opt-in `validate-empty="skip"` on the form or on a field. The field attribute wins over the form attribute.

```html
<form validate validate-empty="skip">
  <!-- Optional: empty passes, 1 to 17 fails -->
  <input name="age" type="number" validate="min:18" />
  <!-- Mandatory: `required` reports the empty value -->
  <input name="site" validate="required|url" />
  <!-- This field keeps the default -->
  <input name="qty" type="number" validate="min:1" validate-empty="check" />
</form>
```

| Value | Behavior |
|-------|----------|
| `check` (default) | `min`, `max` and `url` check the empty value, as in v1.21.1 |
| `skip` | An empty or whitespace-only value passes `min`, `max` and `url`. Only `required` reports it |

`email` already ignores empty values. Custom validators always receive the value, empty or not, and native constraints (`min="18"` attribute, `type="url"`) are not affected. `validate-empty` also works on standalone fields. The default is planned to become `skip` in the next major version; to keep the current behavior after that, add `required` to the field or set `validate-empty="check"`.

### Field Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `name` | string | *required* | Key in `$form.fields`, `$form.values` and `$form.errors`. Fields without `name` are ignored by the form |
| `validate` | string | -- | Pipe-separated validation rules |
| `validate-on` | string | form default | Per-field override of the events that show errors |
| `validate-if` | expression | -- | Field is validated only while the expression is truthy |
| `validate-empty` | `"check"` \| `"skip"` | form default | Opt-in `"skip"`: an empty value passes `min`, `max` and `url` |
| `error` | string \| `"#templateId"` | -- | Message for any rule, or a template reference |
| `error-{rule}` | string \| `"#templateId"` | -- | Message or template for one rule (`error-required`, `error-minlength`, ...) |
| `error-class` | string | form default | Class(es) applied to the field when invalid and interacted with |
| `as` | string | -- | Expose the field state as a named variable |

---

## Validation Triggers

`validate-on` controls when errors become visible (in `$form.errors`, `error-class`, error templates and `aria-invalid`). Values are space-separated event names.

```html
<!-- Form-wide: show errors on blur only -->
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
| `input` | After the user changes the value |
| `focusout` / `blur` | After the field loses focus |
| `submit` | After a submit attempt (every submit marks all fields as touched) |

Without any `validate-on` in the form, a field shows its error once it has been changed or has lost focus (`input`, `change` and `focusout` are listened to on the form). Once the form or any of its fields has `validate-on`, each field uses its own value, then the form's, and a field with neither shows errors on `input` and `focusout`.

> **Caveat: `model` on a select, checkbox or radio.** In a `<form validate>` with no `validate-on` on the form or any field, these controls do not update their `model` state: the form re-renders on the `input` event before `model` syncs on `change`, so the control snaps back to the old value. Text inputs are not affected. Add `validate-on` to the form (`validate-on="input focusout"` gives the same error display as the default) whenever it contains a `model` select, checkbox or radio.

Regardless of the trigger, the form re-validates on every input, and `$form.valid` and `$form.fields.<name>.valid` / `.error` always reflect real-time validity (submit buttons stay disabled while the form is invalid). The trigger only controls visibility.

---

## Conditional Validation

Skip validation when a field is irrelevant using `validate-if`:

```html
<div state="{ contactMethod: 'email' }">
  <form validate validate-on="input focusout">
    <select model="contactMethod" name="method">
      <option value="email">Email</option>
      <option value="phone">Phone</option>
    </select>

    <input name="email" validate="required|email"
           validate-if="contactMethod === 'email'" placeholder="Email" />

    <input name="phone" validate="required" pattern="\+?[0-9]{10,}"
           validate-if="contactMethod === 'phone'" placeholder="Phone number" />
  </form>
</div>
```

When `validate-if` is falsy, the field is treated as valid and left out of `$form.errors`. If the expression throws, the field is validated. An `aria-invalid` or `error-class` the field already had is not removed when it becomes excluded.

The form has `validate-on` because of the `<select model>`: see the caveat in [Validation Triggers](#validation-triggers).

---

## `$form` Context API

Available in expressions inside a `<form validate>`. When the form has an ancestor with a context (`state`, `store`), `$form` is set on that context, so it is also readable next to the form inside that ancestor.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `$form.valid` | boolean | `true` when all fields pass validation. Reflects real validity regardless of touched/dirty state |
| `$form.dirty` | boolean | `true` when any field value has changed |
| `$form.touched` | boolean | `true` when any field has lost focus (or after a submit attempt) |
| `$form.submitting` | boolean | `true` from a valid submit until the form's `post` / `put` / `patch` / `delete` request settles, or until `$form.endSubmit()` runs |
| `$form.pending` | boolean | Reserved for async validators; stays `false` (validators run synchronously) |
| `$form.errors` | object | Field name to error message, only for fields whose error is visible (see [Validation Triggers](#validation-triggers)) |
| `$form.values` | object | Field name to current value. Checkboxes map to `true` / `false`; radio groups to the checked value or `""` |
| `$form.firstError` | string \| null | The first visible error message, or `null` |
| `$form.errorCount` | number | Number of fields with a visible error |
| `$form.fields` | object | Per-field state objects (see below) |

There is no `$form.invalid`, `$form.pristine` or `$form.untouched`: use `!$form.valid`, `!$form.dirty` and `!$form.touched`.

### Methods

| Method | Description |
|--------|-------------|
| `$form.reset()` | Clears dirty / touched / submitting state, calls the native `form.reset()` and re-validates. `model` state is not reset: a `model` field shows its state value again, so reset the state too (`on:click="name = ''; $form.reset()"`) |
| `$form.endSubmit()` | Sets `$form.submitting` back to `false` and re-validates, which re-enables the submit buttons. Call it from an `on:submit` handler; an HTTP directive on the form calls it for you |

`$form.reset()` calls the form's own `reset()` method: a field or button named or with the id `reset` inside the form replaces that method in the DOM and breaks it.

### Per-Field State

Each named field gets a state object at `$form.fields.<name>`:

| Property | Type | Description |
|----------|------|-------------|
| `valid` | boolean | `true` when this field passes all rules (always real-time) |
| `dirty` | boolean | `true` when this field's value has changed |
| `touched` | boolean | `true` when this field has lost focus (or after a submit attempt) |
| `error` | string \| null | The highest-priority error message, or `null`. Set even before interaction: gate it with `touched` / `dirty`, or read `$form.errors.<name>` instead |
| `value` | any | Current field value |

There is no `errors` array, `invalid`, `pristine` or `untouched` property on a field.

```html
<form validate>
  <input name="email" validate="required|email" />
  <span if="$form.fields.email?.touched && $form.fields.email?.error"
        bind="$form.fields.email.error"
        style="color: red"></span>
</form>
```

Use optional chaining (`?.`): `$form.fields` is filled by the first validation pass, one animation frame after the form initializes.

---

## Error Display

### Inline Error Messages

No error text is inserted automatically. Show errors with `bind` on `$form.errors.<name>` (visible errors only) or on `$form.fields.<name>.error` gated by `touched`:

```html
<form validate>
  <input name="email" validate="required|email" />
  <span if="$form.errors.email" bind="$form.errors.email" class="error"></span>
</form>
```

### Custom Error Messages

Override default messages per field or per rule:

```html
<input name="email"
       validate="required|email"
       error="Please enter a valid email"
       error-required="Email is required"
       error-email="That does not look like a valid email" />
```

Resolution order: `error-{rule}`, then `error` (when it is not a `#template` reference), then the built-in or browser message.

### Error Templates

Point `error` or `error-{rule}` at a `<template>` with `#id`:

```html
<form validate>
  <input name="username" validate="required" minlength="3" error="#username-error" />
  <template id="username-error">
    <div class="error-box">
      <span bind="$rule + ': ' + $error"></span>
    </div>
  </template>
</form>
```

Inside a `<form validate>`, the template:

- receives `$error` (the message), `$rule` (the failing rule name) and `err.message` (same as `$error`, so a template written for a [standalone field](#standalone-field-validation) also works in a form)
- renders **once per field**, right after the `<template>` element, wrapped in `<div style="display: contents" aria-live="polite">`
- appears when the field's `validate-on` triggers make its error visible, re-renders only when the message or rule changes, and is removed when the field becomes valid

`error-{rule}="#id"` takes precedence over `error="#id"` for that rule.

### Error Class

Apply class(es) to the field itself when invalid:

```html
<form validate error-class="border-red">
  <input name="name" validate="required" />
  <input name="email" validate="required|email" error-class="bg-red-50 border-red" />
</form>
```

The class is added only while the field's error is visible (it respects `validate-on`) and removed when the field becomes valid.

---

## Exposed Field State

The `as` attribute exposes a field's state object (same shape as `$form.fields.<name>`) as a named variable on the form's context:

```html
<form validate>
  <input name="password" type="password" validate="required" minlength="8" as="pw" />
  <div show="pw?.touched && !pw?.valid" class="hint">
    Password must be at least 8 characters
  </div>
  <div show="pw?.valid" class="success">Password length: OK</div>
</form>
```

---

## Custom Validators

Register custom validators with `NoJS.validator()` before NoJS Elements loads:

```html
<script src="https://cdn.no-js.dev/"></script>
<script>
  NoJS.validator('phone', (value) => {
    if (!value) return true; // let "required" handle empty
    return /^\+?[\d\s\-()]{7,}$/.test(value) || 'Invalid phone number';
  });
  NoJS.validator('match', (value, other, values) =>
    value === (values || {})[other] || 'Values do not match');
</script>
<script src="https://cdn-elements.no-js.dev/"></script>

<form validate>
  <input name="phone" validate="required|phone" />
  <input name="password" type="password" />
  <input name="confirm" type="password" validate="required|match:password" />
</form>
```

### Validator Function Signature

```text
// Used as a rule name: validate="name" or validate="name:arg1:arg2"
(value: string, ...ruleArgs: string[], formValues: object) => true | string | falsy

// Used through custom: validate="custom:name"
(value: string, formValues: object) => true | string | falsy
```

- `true`, `null`, `undefined`, `false` or `""` -- valid
- A non-empty string -- invalid, used as the error message (overridable with `error-{name}`)
- Validators run synchronously. A returned Promise is not awaited: it counts as an error. Check a value against the server with a `get` directive instead
- Outside a form (standalone field), `formValues` is `{}`

---

## Auto-Disable Submit Buttons

Submit buttons inside a `<form validate>` (`<button>` without `type="button"`, and `<input type="submit">`) are disabled while the form is invalid and while `$form.submitting` is `true`. No extra attributes needed.

```html
<form validate>
  <input name="email" validate="required|email" />
  <!-- Disabled until the form is valid -->
  <button type="submit">Submit</button>
</form>
```

There is no attribute that opts a submit button out. `bind-disabled` does not: the module overwrites the button's `disabled` property on every validation. A plain `disabled="<expression>"` attribute is not evaluated by core and keeps the button disabled for good. Use `type="button"` for buttons that must stay enabled (they do not submit).

---

## Standalone Field Validation

A field with `validate` outside any `<form validate>` validates itself on `input` events:

```html
<div state="{ code: '' }">
  <input model="code" validate="required" error="#code-err" />
  <template id="code-err">
    <span class="error" bind="err.message"></span>
  </template>
</div>
```

In standalone mode:

- validation runs on `input` only (`validate-on` and `validate-if` are not read); `validate-empty` is
- only the `validate` rules are checked, not native attributes such as `minlength`; there is no `$form`
- the template from `error` receives `err.message` (not `$error` / `$rule`) and renders right after the field; `error-{rule}` is not used
- `aria-invalid="true"` is set while the value is invalid

A field inside a `<form validate>` is not standalone: the form validates it and renders its template (see [Error Templates](#error-templates)).

---

## Submit Handling

On every submit, the `validate` directive (in the capture phase, before `on:submit` and HTTP directives):

1. Marks all fields as touched, so every error becomes visible, and re-validates
2. If the form is invalid, cancels the submit (`preventDefault` + `stopImmediatePropagation`): `on:submit` and `post` do not run
3. If it is valid, sets `$form.submitting = true`, which also disables the submit buttons

An HTTP directive on the form (`post`, `put`, `patch`, `delete`) sets `$form.submitting` back to `false` when its request settles. A form handled by `on:submit` keeps it `true` until the handler calls `$form.endSubmit()`.

```html
<form validate post="/api/register" into="registration">
  <input name="email" validate="required|email" />
  <button type="submit">
    <span hide="$form.submitting">Register</span>
    <span show="$form.submitting">Submitting...</span>
  </button>
</form>

<div state="{ sent: false }">
  <form validate on:submit.prevent="sent = true; $form.endSubmit()">
    <input name="email" validate="required|email" />
    <button type="submit">Subscribe</button>
  </form>
  <p show="sent">Subscribed!</p>
</div>
```

A form with `post` sends its named fields as a JSON object; `body` is ignored on a `<form>`.

---

## CSS Classes

The validation module does not inject CSS or add classes on its own. Styling is controlled through:

- `error-class` on the form or fields -- your class(es) while the error is visible
- Error templates -- fully customizable `<template>` markup
- `$form` / `$form.fields` -- bind classes conditionally (`class-invalid="$form.errors.email"`)
- `[aria-invalid="true"]` selectors (see below)

---

## Accessibility

- Invalid fields get `aria-invalid="true"` while their error is visible (standalone fields: while invalid); it is removed when the field becomes valid
- Form error-template wrappers have `aria-live="polite"`, so screen readers announce the message
- No `aria-describedby` or `role="alert"` is added: link your own error element with `aria-describedby` if needed
- Native constraint attributes (`required`, `type="email"`, ...) are kept and validated; only the browser's popups are disabled (`novalidate`)

---

## Examples

### Registration Form

Multiple rules, custom messages, error classes and submit handling. `alphanumeric` and `match` are not built-in rules: they are registered before NoJS Elements loads.

```html
<script src="https://cdn.no-js.dev/"></script>
<script>
  NoJS.validator('alphanumeric', (value) => /^[a-z0-9]*$/i.test(value) || 'Letters and numbers only');
  NoJS.validator('match', (value, other, values) => value === (values || {})[other] || 'Values do not match');
</script>
<script src="https://cdn-elements.no-js.dev/"></script>

<div state="{ created: false }">
  <form validate validate-on="focusout" error-class="input-error"
        on:submit.prevent="created = true; $form.endSubmit()">
    <div>
      <label>Username</label>
      <input name="username"
             validate="required|alphanumeric" minlength="3" maxlength="20"
             error-required="Username is required"
             error-minlength="At least 3 characters"
             placeholder="Choose a username" />
      <span if="$form.errors.username" bind="$form.errors.username" class="error-text"></span>
    </div>

    <div>
      <label>Email</label>
      <input name="email" type="email" validate="required|email" placeholder="your@email.com" />
      <span if="$form.errors.email" bind="$form.errors.email" class="error-text"></span>
    </div>

    <div>
      <label>Password</label>
      <input name="password" type="password" validate="required" minlength="8"
             error-minlength="At least 8 characters" placeholder="At least 8 characters" />
      <span if="$form.errors.password" bind="$form.errors.password" class="error-text"></span>
    </div>

    <div>
      <label>Confirm Password</label>
      <input name="confirmPassword" type="password"
             validate="required|match:password"
             error-match="Passwords do not match" />
      <span if="$form.errors.confirmPassword" bind="$form.errors.confirmPassword" class="error-text"></span>
    </div>

    <button type="submit">Create Account</button>
  </form>
  <p show="created">Account created!</p>
</div>
```

`minlength` / `maxlength` only report an error for a value the user typed (browsers do not flag a value set by script).

### Multi-Step Form with Stepper

Combine validation with the stepper element. `stepper-validate` on a step blocks the stepper's Next button (and `$stepper.next()` / `goTo()`) until the `<form validate>` inside that step is valid, and touches all its fields so the errors show. `step-validate` gates a step with an expression. The stepper renders its own indicator and Previous / Next buttons.

```html
<div state="{ name: '', acceptedTerms: false }">
  <div stepper>
    <div step step-label="Account" stepper-validate>
      <form validate>
        <input name="email" type="email" validate="required|email" placeholder="Email" />
        <span if="$form.errors.email" bind="$form.errors.email" style="color: red"></span>
      </form>
    </div>

    <div step step-label="Profile">
      <input model="name" required placeholder="Your name" />
    </div>

    <div step step-label="Terms" step-validate="acceptedTerms">
      <label>
        <input type="checkbox" model="acceptedTerms" />
        I accept the terms and conditions
      </label>
    </div>
  </div>
</div>
```

In linear mode (the default) the stepper also checks the native constraints (`required`, `type`, ...) of the inputs in the current step.

### Dynamic Conditional Fields

Show and validate fields based on user selection.

```html
<div state="{ accountType: 'personal', saved: false }">
  <form validate validate-on="input focusout" on:submit.prevent="saved = true; $form.endSubmit()">
    <select name="accountType" model="accountType">
      <option value="personal">Personal</option>
      <option value="business">Business</option>
    </select>

    <div show="accountType === 'business'">
      <input name="companyName"
             validate="required" minlength="2"
             validate-if="accountType === 'business'"
             placeholder="Company name" />

      <input name="taxId"
             validate="required" pattern="[0-9]{2}\.[0-9]{3}\.[0-9]{3}/[0-9]{4}-[0-9]{2}"
             validate-if="accountType === 'business'"
             error-pattern="Enter a valid CNPJ"
             placeholder="Tax ID (CNPJ)" />
    </div>

    <button type="submit">Create Account</button>
  </form>
  <p show="saved">Saved</p>
</div>
```

---

## Composition with NoJS Directives

Validation reads the field values from the DOM, so `model` is optional; use it when the value is also needed in your state.

- **`model`** -- two-way binding to state (not required for validation)
- **`state`** -- reactive state for form data; `$form` is set on the nearest ancestor context
- **`if` / `show`** -- conditionally display error messages and conditional fields
- **`bind`** -- display error messages and field state
- **`on:submit.prevent`** -- handle submission; call `$form.endSubmit()` at the end
- **`post` / `put` / `patch` / `delete`** on the form -- send the named fields as JSON; `$form.submitting` resets when the request settles
- **`validate-if`** -- skip validation based on reactive expressions
- **`class-*`** -- apply conditional CSS classes based on `$form` state

Fields are looked up on every validation, so a field added later (by `each` or `if`) is validated. Its events, though, are wired only when the form has no `validate-on`, because the form then listens with delegated events; with `validate-on`, the listeners are attached per field when the form initializes.

---

## Template Validation Checklist

Use this checklist when reviewing NoJS templates that use validation:

### Forms

- [ ] NoJS Elements is loaded (core alone has only a `validate` stub)
- [ ] `<form>` elements that need validation have the `validate` attribute
- [ ] Every validated field has a `name` attribute (required for `$form.fields` / `$form.errors`)
- [ ] Rules are separated with `|` (`required|email`), not commas; lengths use native `minlength` / `maxlength`
- [ ] Only existing `$form` members are used: `valid`, `dirty`, `touched`, `submitting`, `pending`, `errors`, `values`, `firstError`, `errorCount`, `fields`, `reset()`, `endSubmit()`; per field `valid`, `dirty`, `touched`, `error`, `value`
- [ ] Custom error messages use `error-{rule}` (`error-required`, `error-email`, `error-minlength`)
- [ ] Error templates are referenced with `error="#id"` / `error-{rule}="#id"` and read `$error` / `$rule` (form) or `err.message` (standalone)
- [ ] An `on:submit` form calls `$form.endSubmit()`, or its submit buttons stay disabled after the first submit
- [ ] Submit buttons rely on auto-disable; buttons that must stay enabled use `type="button"`
- [ ] Optional `min` / `max` / `url` fields use `validate-empty="skip"` (opt-in, default `check`)
- [ ] Conditional fields use `validate-if` to skip validation when hidden/irrelevant
- [ ] Use `validate-on="focusout"` for progressive validation (errors appear after the user leaves the field)

### Common Mistakes

- [ ] All event bindings use colon syntax (`on:click`, not `on-click`)
- [ ] `model` is only used on `<input>`, `<select>`, or `<textarea>`
- [ ] Error display uses `$form.errors.<name>` or gates `$form.fields.<name>.error` with `touched`
- [ ] No field or button inside the form is named `reset` (it breaks `$form.reset()`)

### Security

- [ ] Every `bind-html` usage has its content source reviewed for XSS safety
- [ ] CSRF is configured for apps that make mutating requests
