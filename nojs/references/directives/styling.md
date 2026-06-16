# Styling Directives

Dynamic CSS classes and inline styles. Priority 20.

## Contents

- [class-*](#class-1) -- toggle CSS class by condition
- [class-map](#class-map) -- apply multiple classes from object
- [class-list](#class-list) -- apply classes from array
- [style-*](#style-1) -- set inline style dynamically
- [style-map](#style-map) -- apply multiple inline styles from object

---

## Syntax Reference

| Directive | Syntax | Description |
|-----------|--------|-------------|
| `class-*` | `class-active="condition"` | Toggle CSS class by condition |
| `class-map` | `class-map="{ class: condition }"` | Apply multiple classes from object |
| `class-list` | `class-list="[expressions]"` | Apply classes from array |
| `style-*` | `style-color="expression"` | Set inline style property dynamically |
| `style-map` | `style-map="{ property: value }"` | Apply multiple inline styles from object |

---

## `class-*`

Toggle a CSS class based on a condition.

**Syntax:** `<element class-className="condition">`

The part after `class-` is the CSS class name. The attribute value is a boolean expression.

> **i18n reactivity:** Expressions referencing `$i18n` or `NoJS.locale` also re-evaluate on locale changes.

```html
<div class-active="isActive"
     class-disabled="!isEnabled"
     class-highlighted="score > 90">
</div>

<!-- Re-evaluates when locale changes -->
<div class-rtl="$i18n.dir === 'rtl'"></div>
```

### Edge Cases

- Class names with hyphens work naturally: `class-is-selected="selected"` toggles the `is-selected` class.
- Static classes on the same element are preserved. `class-*` only manages the specific class it names.
- Multiple `class-*` attributes on the same element work independently.

### Complete Example

```html
<div state="{ isActive: false, isAdmin: true, score: 95 }">
  <div class-active="isActive"
       class-admin="isAdmin"
       class-high-score="score >= 90"
       class="base-card">
    <p>This card has dynamic classes alongside the static "base-card" class.</p>
  </div>

  <button on:click="isActive = !isActive"
          class-btn-primary="isActive"
          class-btn-outline="!isActive">
    <span bind="isActive ? 'Deactivate' : 'Activate'"></span>
  </button>
</div>
```

---

## `class-map`

Apply multiple CSS classes from an object expression.

**Syntax:** `<element class-map="{ className: condition }">`

Keys can be **space-separated** class names -- all classes in the key are toggled together:

```html
<div class-map="{ active: isActive, 'text-bold': isBold, error: hasError }"></div>

<!-- Space-separated keys: toggle multiple Tailwind classes at once -->
<div class-map="{ 'bg-sky-500 text-white font-bold': isSelected }"></div>
```

### Edge Cases

- Space-separated keys toggle all listed classes as a group. If the condition is false, all classes in the key are removed.
- Keys must be quoted if they contain hyphens or spaces: `{ 'my-class': condition }`.
- `class-map` can coexist with `class-*` and static `class` attributes.

### Complete Example

```html
<div state="{ type: 'success', isLarge: false }">
  <div class-map="{
    alert: true,
    'alert-success': type === 'success',
    'alert-error': type === 'error',
    'alert-lg': isLarge
  }">
    <span bind="'Status: ' + type"></span>
  </div>

  <select model="type">
    <option value="success">Success</option>
    <option value="error">Error</option>
  </select>
  <label><input type="checkbox" model="isLarge" /> Large</label>
</div>
```

---

## `class-list`

Apply CSS classes from an array expression.

**Syntax:** `<element class-list="[expressions]">`

Array elements that evaluate to falsy are ignored.

```html
<div class-list="['base-class', isAdmin ? 'admin' : 'user']"></div>
```

### Edge Cases

- Falsy values (`null`, `undefined`, `false`, `0`, `""`) in the array are silently skipped.
- The array is re-evaluated on every reactive update, so the classes stay in sync with state.

### Complete Example

```html
<div state="{ size: 'md', variant: 'primary', isRounded: true }">
  <button class-list="[
    'btn',
    'btn-' + size,
    'btn-' + variant,
    isRounded && 'rounded-full'
  ]">
    Dynamic Button
  </button>

  <select model="size">
    <option value="sm">Small</option>
    <option value="md">Medium</option>
    <option value="lg">Large</option>
  </select>
  <select model="variant">
    <option value="primary">Primary</option>
    <option value="secondary">Secondary</option>
  </select>
  <label><input type="checkbox" model="isRounded" /> Rounded</label>
</div>
```

---

## `style-*`

Set an inline style property dynamically.

**Syntax:** `<element style-property="expression">`

Use kebab-case for CSS property names.

```html
<div style-color="isError ? 'red' : 'green'"
     style-font-size="fontSize + 'px'"
     style-opacity="isVisible ? 1 : 0.5">
</div>
```

### Edge Cases

- Property names use kebab-case in the attribute: `style-font-size`, `style-background-color`, `style-border-radius`.
- Setting a style to an empty string or `null` removes that inline style.
- `style-*` sets properties on `el.style`, so they have higher specificity than stylesheet rules.

### Complete Example

```html
<div state="{ color: '#3b82f6', size: 16, rotation: 0 }">
  <div style-color="color"
       style-font-size="size + 'px'"
       style-transform="'rotate(' + rotation + 'deg)'"
       style-transition="'all 0.3s ease'">
    Styled dynamically
  </div>

  <input type="color" model="color" />
  <input type="range" model="size" min="10" max="48" />
  <input type="range" model="rotation" min="0" max="360" />
</div>
```

---

## `style-map`

Apply multiple inline styles from an object expression.

**Syntax:** `<element style-map="{ property: value }">`

```html
<div style-map="{
  color: textColor,
  fontSize: size + 'px',
  transform: 'rotate(' + rotation + 'deg)'
}"></div>
```

### Edge Cases

- Property names in `style-map` use **camelCase** (JavaScript style object convention): `fontSize`, `backgroundColor`, `borderRadius`.
- Setting a property value to `null` or `undefined` removes that style.
- `style-map` can coexist with `style-*` attributes. Individual `style-*` attributes take precedence over conflicting properties in `style-map`.

### Complete Example

```html
<div state="{ theme: { bg: '#1e293b', text: '#f8fafc', radius: '8px', shadow: '0 4px 6px rgba(0,0,0,0.1)' } }">
  <div style-map="{
    backgroundColor: theme.bg,
    color: theme.text,
    borderRadius: theme.radius,
    boxShadow: theme.shadow,
    padding: '24px'
  }">
    <h2>Themed Card</h2>
    <p>All styles applied from a single object expression.</p>
  </div>

  <div style="margin-top: 16px">
    <label>Background: <input type="color" bind-value="theme.bg" /></label>
    <label>Text: <input type="color" bind-value="theme.text" /></label>
  </div>
</div>
```
