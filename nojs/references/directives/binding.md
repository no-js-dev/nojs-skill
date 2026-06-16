# Binding Directives

One-way and two-way data binding for text, HTML, attributes, and form inputs. Priority 20.

## Contents

- [bind](#bind) -- one-way text binding
- [bind-html](#bind-html) -- sanitized HTML binding
- [bind-*](#bind-1) -- bind any HTML attribute
- [model](#model) -- two-way input binding

---

## Syntax Reference

| Directive | Syntax | Description |
|-----------|--------|-------------|
| `bind` | `bind="expression"` | Set element `textContent` from expression |
| `bind-html` | `bind-html="expression"` | Set `innerHTML` (sanitized) from expression |
| `bind-*` | `bind-attr="expression"` | Bind any HTML attribute dynamically |
| `bind-value` | `bind-value="expression"` | Two-way attribute binding on inputs |
| `model` | `model="property"` | Two-way binding for form inputs |

---

## `bind`

One-way data binding -- sets element `textContent`.

**Syntax:** `<element bind="expression">`

Replaces the element's text content with the evaluated expression. Supports pipes/filters with `|`.

```html
<h1 bind="user.name"></h1>
<span bind="'Total: ' + items.length"></span>
<span bind="user.age >= 18 ? 'Adult' : 'Minor'"></span>
<span bind="user.name | uppercase"></span>
<span bind="price | currency"></span>
```

### Edge Cases

- When the expression evaluates to `null` or `undefined`, the text content is set to an empty string.
- Pipe expressions are evaluated left to right: `bind="value | filterA | filterB"` passes the result of `filterA` into `filterB`.
- HTML entities in the expression result are rendered as literal text (not HTML). Use `bind-html` for HTML output.

### Complete Example

```html
<div state="{ user: { name: 'Erick', age: 30 }, price: 49.99 }">
  <h1>Hello, <span bind="user.name"></span>!</h1>
  <p>Age: <span bind="user.age"></span></p>
  <p>Status: <span bind="user.age >= 18 ? 'Adult' : 'Minor'"></span></p>
  <p>Price: <span bind="price | currency"></span></p>
  <p>Name (upper): <span bind="user.name | uppercase"></span></p>
</div>
```

---

## `bind-html`

Set innerHTML (sanitized) from an expression.

**Syntax:** `<element bind-html="expression">`

Renders the expression result as HTML. Sanitized by default (DOMPurify-compatible) to prevent XSS.

> **Debug mode:** When `NoJS.config({ debug: true })` or `devtools` is enabled, dynamic expressions (non-literal strings) trigger a console warning reminding you to ensure the value is trusted.

```html
<div bind-html="article.content"></div>
<div bind-html="`<em>${user.bio}</em>`"></div>
```

### Edge Cases

- Script tags and event handlers are stripped during sanitization.
- Literal string expressions (e.g. `bind-html="'<b>Bold</b>'"`) do not trigger the debug warning.
- If the expression evaluates to `null` or `undefined`, the element's HTML is cleared.

### Complete Example

```html
<div state="{ content: '<p>This is <strong>rich</strong> content.</p>' }">
  <article bind-html="content"></article>

  <!-- With template literal -->
  <div bind-html="`<span class='badge'>${status}</span>`"></div>
</div>
```

---

## `bind-*`

Bind any HTML attribute to an expression.

**Syntax:** `<element bind-attr="expression">`

Works with any attribute: `src`, `href`, `alt`, `title`, `disabled`, `checked`, `data-*`, etc.

### Two-Way `bind-value`

On `<input>`, `<textarea>`, and `<select>`, `bind-value` is **two-way** -- it also attaches an `input` event listener that writes the element's value back to the expression. For `type="number"` inputs, the value is coerced to `Number`.

### Boolean Attributes

The following attributes receive special boolean handling -- truthy values set the attribute (empty string), falsy values remove it, and the corresponding DOM property is also toggled:
`disabled`, `readonly`, `checked`, `selected`, `hidden`, `required`

### URL Sanitization

For URL-bearing attributes (`href`, `src`, `action`, `formaction`, `poster`, `data`), `javascript:` and `vbscript:` URIs are blocked (replaced with `#`). Non-image `data:` URIs are also blocked; `data:image/svg+xml` URIs are sanitized by stripping scripts and event handlers.

```html
<img bind-src="user.avatarUrl" bind-alt="user.name + ' avatar'" />
<a bind-href="'/users/' + user.id">Profile</a>
<button bind-disabled="!form.isValid">Submit</button>
<input type="checkbox" bind-checked="user.isActive" />
<div bind-data-id="user.id" bind-data-role="user.role"></div>

<!-- Two-way bind-value -->
<input bind-value="username" />
```

### Edge Cases

- `bind-class` and `bind-style` set the entire attribute value. For conditional class toggling, use `class-*` or `class-map` instead.
- Boolean attributes are removed entirely when falsy (not set to `"false"`).
- `bind-value` on a `<select>` sets the selected option by matching option values.

### Complete Example

```html
<div state="{ user: { name: 'Erick', avatar: '/img/erick.jpg', id: 42 }, isValid: true }">
  <img bind-src="user.avatar"
       bind-alt="user.name + ' profile photo'"
       bind-title="'View ' + user.name" />

  <a bind-href="'/users/' + user.id"
     bind-data-user-id="user.id">
    View Profile
  </a>

  <button bind-disabled="!isValid">Submit</button>

  <!-- Two-way bind-value syncs back to state -->
  <input type="text" bind-value="user.name" />
  <p>Editing: <span bind="user.name"></span></p>
</div>
```

---

## `model`

Two-way binding for input elements.

**Syntax:** `<input model="property">`

Creates automatic two-way data binding between a form input and a state property. Works with text inputs, number inputs, range inputs, checkboxes, radio buttons, selects, and textareas.

### Input Type Coercion

| Input type | Value coercion | Event |
|------------|---------------|-------|
| `text`, `textarea` | String | `input` |
| `number`, `range` | `Number()` | `input` |
| `checkbox` | Boolean (`el.checked`) | `change` |
| `radio` | String (`el.value`) | `change` |
| `select` | String | `change` |

### Edge Cases

- `model` is only valid on `<input>`, `<select>`, and `<textarea>` elements. Using it on non-input elements produces a validation warning.
- For radio buttons, multiple radios with the same `model` property share the value -- selecting one updates the property for all.
- For `type="number"`, the value is coerced via `Number()`. If the input is empty, the value becomes `NaN` -- use `0` as the initial state to avoid this.

### Complete Example

```html
<div state="{ name: '', age: 0, agreed: false, role: 'user', volume: 50, bio: '' }">
  <label>Name: <input type="text" model="name" /></label>
  <label>Age: <input type="number" model="age" /></label>
  <label>Volume: <input type="range" model="volume" min="0" max="100" /></label>
  <label><input type="checkbox" model="agreed" /> I agree</label>

  <label><input type="radio" model="role" value="admin" /> Admin</label>
  <label><input type="radio" model="role" value="user" /> User</label>

  <label>Role:
    <select model="role">
      <option value="admin">Admin</option>
      <option value="user">User</option>
    </select>
  </label>

  <label>Bio: <textarea model="bio"></textarea></label>

  <p>Hello, <span bind="name"></span>! You are <span bind="age"></span> years old.</p>
  <p>Role: <span bind="role"></span></p>
  <p>Volume: <span bind="volume"></span></p>
  <p show="agreed">You have agreed to the terms.</p>
</div>
```
