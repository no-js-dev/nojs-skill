# Head Management and SEO Directives

Reactive `<head>` updates for document title, meta description, canonical URL, and structured data. Priority 1.

## Contents

- [page-title](#page-title) -- reactive document title
- [page-description](#page-description) -- reactive meta description
- [page-canonical](#page-canonical) -- reactive canonical link
- [page-jsonld](#page-jsonld) -- reactive JSON-LD structured data
- [Body Directives vs Route Attributes](#body-directives-vs-route-attributes) -- two ways to set head metadata
- [Route Head Attributes](#route-head-attributes) -- page-title, page-description, page-canonical, page-jsonld on routes

---

## Syntax Reference

| Directive | Syntax | Description |
|-----------|--------|-------------|
| `page-title` | `page-title="expression"` | Set `document.title` reactively |
| `page-description` | `page-description="expression"` | Set `<meta name="description">` |
| `page-canonical` | `page-canonical="expression"` | Set `<link rel="canonical">` |
| `page-jsonld` | `page-jsonld` (with JSON text content) | Set `<script type="application/ld+json">` |

---

## Body Directives

Priority 1 directives placed on `<div hidden>` in the page body. They update `<head>` elements reactively when surrounding state changes. Use for non-routing pages (product pages, landing pages without a router). For SPA routing, use [Route Head Attributes](#route-head-attributes) instead.

> **Note:** `<script>` elements are skipped by `processTree`, so use `<div hidden>` as the host element for all head management directives.

---

## `page-title`

Reactively set the document `<title>`. Value is a No.JS expression.

**Syntax:** `<div hidden page-title="expression">`

```html
<div hidden page-title="product.name + ' | My Store'"></div>
<div hidden page-title="'About Us | My Store'"></div>
```

Watches the expression and updates `<title>` whenever the reactive context changes.

### Edge Cases

- String literals require single quotes inside the double-quoted attribute: `page-title="'My Title'"`.
- Backtick template literals are not valid in HTML attributes.
- If multiple `page-title` directives exist, whichever runs last wins.

### Complete Example

```html
<div state="{ pageTitle: 'Dashboard' }">
  <div hidden page-title="pageTitle + ' | MyApp'"></div>

  <h1 bind="pageTitle"></h1>
  <button on:click="pageTitle = 'Settings'">Go to Settings</button>
  <button on:click="pageTitle = 'Dashboard'">Go to Dashboard</button>
</div>
```

---

## `page-description`

Reactively set `<meta name="description">` in `<head>`. Creates the tag if it doesn't exist.

**Syntax:** `<div hidden page-description="expression">`

```html
<div hidden page-description="product.description"></div>
```

### Complete Example

```html
<div state="{ product: { name: 'Widget', description: 'The best widget for your needs.' } }">
  <div hidden page-description="product.description"></div>
  <h1 bind="product.name"></h1>
  <p bind="product.description"></p>
</div>
```

---

## `page-canonical`

Reactively set `<link rel="canonical">` in `<head>`. Creates the tag if it doesn't exist.

**Syntax:** `<div hidden page-canonical="expression">`

```html
<div hidden page-canonical="'/products/' + product.slug"></div>
```

### Complete Example

```html
<div state="{ slug: 'premium-widget' }">
  <div hidden page-canonical="'/products/' + slug"></div>
  <p>Canonical URL points to: /products/<span bind="slug"></span></p>
</div>
```

---

## `page-jsonld`

Reactively set `<script type="application/ld+json" data-nojs>` in `<head>`. Value is a JSON string with `{interpolation}` placeholders in the element's text content.

**Syntax:** `<div hidden page-jsonld>{ JSON template with {placeholders} }</div>`

```html
<div hidden page-jsonld>
  { "@type": "Product", "name": "{product.name}", "price": "{product.price}" }
</div>
```

The `data-nojs` marker on the generated `<script>` tag distinguishes it from hand-written JSON-LD so they can coexist.

### Edge Cases

- Placeholders use `{expression}` syntax (single curly braces), not template literals.
- The JSON must be valid after interpolation. Ensure string values are properly quoted.
- Multiple `page-jsonld` directives can coexist; each manages its own `<script>` tag.

### Complete Example

```html
<div state='{"product": null}'>
  <div get="/api/products/{slug}" as="product"></div>

  <div hidden page-title="product.name + ' | My Store'"></div>
  <div hidden page-description="product.description"></div>
  <div hidden page-canonical="'/products/' + product.slug"></div>
  <div hidden page-jsonld>
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "{product.name}",
      "description": "{product.description}",
      "offers": {
        "@type": "Offer",
        "price": "{product.price}",
        "priceCurrency": "USD"
      }
    }
  </div>

  <h1 bind="product.name"></h1>
  <p bind="product.description"></p>
  <p>$<span bind="product.price"></span></p>
</div>
```

---

## Body Directives vs Route Attributes

There are two ways to manage `<head>` metadata:

| Method | Where | Reactivity | Use Case |
|--------|-------|------------|----------|
| Body directives | `<div hidden page-title="...">` in body | Continuously reactive | Non-routing pages, dynamic content |
| Route attributes | `page-title="..."` on `<template route>` | Evaluated once per navigation | SPA with router |

If both a body directive and a route attribute target the same head element, whichever runs last wins.

---

## Route Head Attributes

Set `<head>` metadata declaratively on each `<template route>`. Updated on every navigation. Expressions can use `$route` and `$store`.

| Attribute | Description |
|-----------|-------------|
| `page-title` | Sets `document.title`. Value is a No.JS expression |
| `page-description` | Creates/updates `<meta name="description">` |
| `page-canonical` | Creates/updates `<link rel="canonical">` |
| `page-jsonld` | Creates/updates `<script type="application/ld+json" data-nojs>`. Value is a JSON string with `{placeholder}` interpolation |

```html
<!-- Static title -->
<template route="/about" page-title="'About Us | My Store'">
  <h1>About</h1>
</template>

<!-- Dynamic from route params -->
<template route="/products/:id"
          page-title="'Product ' + $route.params.id + ' | Store'"
          page-description="'View product ' + $route.params.id"
          page-canonical="'/products/' + $route.params.id"
          page-jsonld='{"@type":"Product","name":"{$route.params.id}"}'>
  <h1>Product Detail</h1>
</template>

<!-- Expression from global store -->
<template route="/account" page-title="$store.user.name + ' — My Account'">
  <h1>Account</h1>
</template>
```

### Edge Cases

- Route head attributes are evaluated once per navigation (not continuously reactive -- `$store` changes after navigation do not re-update the title).
- String literals require single quotes inside the double-quoted attribute: `page-title="'My Title'"`.
- Default outlet only -- secondary outlets do not update head metadata.
