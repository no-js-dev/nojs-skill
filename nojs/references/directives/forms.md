# Forms and Validation Directives

Built-in form validation with `$form` context. Priority 30 (validate), Priority 1 (error-boundary).

## Contents

- [validate](#validate) -- enable validation on form or field
- [Per-Rule Error Messages](#per-rule-error-messages) -- error-{rule} attributes
- [Error Templates](#error-templates) -- template-based error display
- [Error CSS Class](#error-css-class) -- toggle class on invalid fields
- [$form Context](#form-context) -- form-level validation state
- [$form.fields -- Per-Field State](#formfields----per-field-state) -- individual field state
- [Validation Triggers (validate-on)](#validation-triggers-validate-on) -- control when feedback appears
- [Conditional Validation (validate-if)](#conditional-validation-validate-if) -- skip validation by condition
- [Submit Behavior](#submit-behavior) -- marks all fields touched, $form.submitting lifecycle
- [Auto-Disable Submit Buttons](#auto-disable-submit-buttons) -- automatic submit button handling
- [Custom Validators](#custom-validators) -- NoJS.validator() registration
- [error-boundary](#error-boundary) -- render fallback template on error

---

## Forms and Validation

> **Note:** As of v1.13.0, the `validate` directive has moved to `@erickxavier/nojs-elements`. Install the Elements plugin and call `NoJS.use(NoJSElements)` to enable it. The `error-boundary` directive and `NoJS.validator()` remain in core.

Built-in form validation with `$form` context. No.JS automatically detects native HTML5 validation attributes. The `validate` attribute is needed only for framework-specific validators.

### `validate`

Enable validation on a form or field.

**Syntax:** `<form validate>` (on form) or `<input validate="rule1|rule2|rule3:arg">` (on field)

Rules are separated by `|` (pipe) and arguments by `:` (colon). Native HTML5 attributes (`required`, `minlength`, `maxlength`, `type="email"`, `type="url"`, `min`, `max`, `pattern`) work automatically.

Use the built-in `custom:` rule prefix to invoke a named validator registered with `NoJS.validator()`:

```html
<input validate="required|custom:strongPassword" />
```

The `custom:validatorName` syntax calls the validator function registered under that name, passing the current value and all form values. The validator should return `true` for valid, or an error message string for invalid.

```html
<form validate state="{ email: '', password: '' }">
  <input model="email" validate="required|email"
         error-required="Email is required"
         error-email="Please enter a valid email">
  <input model="password" type="password" validate="required"
         error-required="Password is required">
  <button if="$form.valid">Submit</button>
  <p if="$form.firstError" bind="$form.firstError" class="error"></p>
</form>
```

### Per-Rule Error Messages

Use `error-{rule}` attributes for specific rules, or `error` for a generic fallback:

```html
<input type="email" name="email" required
       error-required="Email is required"
       error-email="Please enter a valid email"
       error="This field is invalid" />
```

### Error Templates

The `error` and `error-{rule}` attributes use a `#` prefix to distinguish between template references and plain message strings:

- **With `#` prefix** (e.g. `error="#emailError"`) -- treated as a template selector, clones and renders the `<template>` with that ID
- **Without `#` prefix** (e.g. `error="This field is invalid"`) -- treated as a plain error message string

The same rule applies to per-rule attributes like `error-required="#tpl"` vs `error-required="Email is required"`.

```html
<!-- Template reference -->
<input type="email" name="email" required error="#emailError" />
<template id="emailError">
  <span class="field-error" bind="$error"></span>
</template>

<!-- Plain message -->
<input type="email" name="email" required error="Please fix this field" />
```

Inside the template, `$error` contains the error message and `$rule` contains the failing rule name.

### Error CSS Class

Use `error-class` on the form or on individual fields to toggle a CSS class when a field is invalid and touched:

```html
<form validate error-class="is-invalid">
  <input name="email" required />  <!-- gets .is-invalid when invalid + touched -->
</form>
```

### `$form` Context

Inside any `<form>` with the `validate` attribute:

| Property | Type | Description |
|----------|------|-------------|
| `$form.valid` | boolean | `true` if all fields pass validation |
| `$form.dirty` | boolean | `true` if any field has been modified |
| `$form.touched` | boolean | `true` if any field has been focused and blurred |
| `$form.submitting` | boolean | `true` while the request is in flight |
| `$form.pending` | boolean | `true` while async validators are running |
| `$form.errors` | object | Map of field names to error messages |
| `$form.values` | object | Current form values |
| `$form.firstError` | string or null | Error message of the first invalid field (DOM order) |
| `$form.errorCount` | number | Number of fields currently failing validation |
| `$form.fields` | object | Per-field state (see below) |
| `$form.reset()` | function | Reset form to initial values, clear errors and classes |

### `$form.fields` -- Per-Field State

| Property | Type | Description |
|----------|------|-------------|
| `$form.fields.{name}.valid` | boolean | Whether this field passes validation |
| `$form.fields.{name}.error` | string or null | Error message for this field |
| `$form.fields.{name}.dirty` | boolean | Whether this field has been modified |
| `$form.fields.{name}.touched` | boolean | Whether this field has been focused and blurred |
| `$form.fields.{name}.value` | any | Current value of this field |

Field aliases: use the `as` attribute on an input to expose its state under a custom name:

```html
<input type="email" name="email" required as="emailField" />
<p show="!emailField.valid && emailField.touched" bind="emailField.error"></p>
```

### Validation Triggers (`validate-on`)

Control when visual feedback appears. Default: `input` and `focusout`.

```html
<form validate validate-on="blur">
  <input name="email" required />
</form>
```

### Conditional Validation (`validate-if`)

Skip validation for a field based on a condition:

```html
<input name="company" required validate-if="hasCompany" />
```

When `validate-if` is false, the field is treated as valid and excluded from `$form.errors`.

### Submit Behavior

On form submit, No.JS automatically marks **all named fields as touched**, so any validation errors display immediately even if the user never interacted with a field. `$form.touched` is also set to `true`.

`$form.submitting` is set to `true` during submit and resets to `false` after a `requestAnimationFrame` cycle, providing a one-frame flag for submission state.

### Auto-Disable Submit Buttons

Submit buttons are automatically disabled when the form is invalid. No `bind-disabled` needed. Buttons with `type="button"` are not affected.

### Custom Validators

Register custom validators with `NoJS.validator()`:

```html
<script>
  NoJS.validator('strongPassword', (value) => {
    if (value.length < 8) return 'Must be at least 8 characters';
    if (!/[A-Z]/.test(value)) return 'Must contain uppercase';
    if (!/[0-9]/.test(value)) return 'Must contain a number';
    return true;
  });
</script>
<input type="password" validate="strongPassword" />
```

### `error-boundary`

Error boundary -- renders fallback template on error within a subtree.

**Syntax:** `<element error-boundary="#fallbackTemplate">`

```html
<div error-boundary="#errorFallback">
  <div get="/api/fragile-endpoint" as="data">
    <span bind="data.deep.nested.value"></span>
  </div>
</div>
<template id="errorFallback" var="err">
  <div class="error-boundary">
    <h3>Something went wrong</h3>
    <pre bind="err.message"></pre>
  </div>
</template>
```
