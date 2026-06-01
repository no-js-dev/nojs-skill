# Extra Directives

Animations, internationalization, drag and drop, head management, and related utilities.

## Contents

- [Animation](#animation) -- enter/leave animations and CSS transitions
  - [animate](#animate) -- CSS animation on entry
  - [animate-enter](#animate-enter) -- CSS animation for entering DOM
  - [animate-leave](#animate-leave) -- CSS animation for leaving DOM
  - [animate-duration](#animate-duration) -- animation duration in ms
  - [animate-stagger](#animate-stagger) -- stagger delay for list items
  - [transition](#transition) -- View Transition API (route-view) or class-based transitions (regular elements)
  - [Built-in Animation Names](#built-in-animation-names) -- shipped CSS animation names
- [Drag and Drop](#drag-and-drop) -- declarative DnD system (drag: priority 15, drop: priority 15, drag-list: priority 10, drag-multiple: priority 16)
  - [drag](#drag) -- make element draggable
  - [drop](#drop) -- make element a drop zone
  - [drag-list](#drag-list) -- sortable list shorthand
  - [drag-multiple](#drag-multiple) -- lasso/multi-select
  - [Implicit Drop Variables](#implicit-drop-variables) -- $drag, $dragType, $dropIndex, etc.
  - [Automatic CSS Classes](#automatic-css-classes) -- built-in DnD classes
  - [Custom DOM Events](#custom-dom-events) -- drag-start, drag-end, drag-enter, drag-leave, drag-over
  - [Multi-Drag Ghost](#multi-drag-ghost-stacked-cards) -- stacked-card visual for multi-select
  - [Accessibility](#accessibility) -- ARIA attributes and keyboard support
- [Internationalization](#internationalization) -- translation directives (t: priority 20, i18n-ns: priority 1)
  - [t](#t) -- translate element content
  - [t-*](#t-1) -- pass parameters to translations
  - [t-html](#t-html) -- render translation as HTML
  - [i18n-ns](#i18n-ns) -- set i18n namespace
  - [i18n Configuration](#i18n-configuration) -- setup and locale files
- [Head Management (Body Directives)](#head-management-body-directives) -- reactive head updates (priority 1)
  - [page-title](#page-title) -- reactive document title
  - [page-description](#page-description) -- reactive meta description
  - [page-canonical](#page-canonical) -- reactive canonical link
  - [page-jsonld](#page-jsonld) -- reactive JSON-LD structured data

---

## Animation

Enter/leave animations and CSS transitions. No.JS ships with built-in CSS animation names.

### `animate`

Apply a CSS animation on element entry.

**Syntax:** `<element animate="animationName">`

```html
<div if="visible" animate="fadeIn">Content</div>
```

### `animate-enter`

CSS animation for entering the DOM.

**Syntax:** `<element animate-enter="slideInRight">`

### `animate-leave`

CSS animation for leaving the DOM.

**Syntax:** `<element animate-leave="slideOutLeft">`

```html
<div if="visible"
     animate-enter="slideInRight"
     animate-leave="slideOutLeft"
     animate-duration="300">
  Content
</div>
```

### `animate-duration`

Animation duration in milliseconds.

**Syntax:** `<element animate="fadeIn" animate-duration="300">`

### `animate-stagger`

Stagger delay between animated list items (milliseconds).

**Syntax:** `<element each="item in items" animate="fadeIn" animate-stagger="50">`

Adds an incremental delay between each item in a loop animation.

```html
<div each="item in items"
     template="itemTpl"
     animate-enter="fadeInUp"
     animate-leave="fadeOutDown"
     animate-stagger="50">
</div>
```

### `transition`

Applies transitions when elements enter/leave the DOM. Behavior depends on context:

#### On `route-view` (View Transition API)

When used on a `route-view` outlet, `transition` uses the **View Transition API** (`document.startViewTransition()`) to animate route changes. This is the default behavior (enabled via `router.viewTransition: true`).

**Syntax:** `<main route-view transition="preset">`

**Built-in presets:**

| Preset | Description |
|--------|-------------|
| `slide` | Directional slide -- detects forward/backward navigation automatically |
| `fade` | Cross-fade between old and new content |
| `scale` | Scale down old content, scale up new content |
| `none` | Disables transition animation for this outlet |

```html
<!-- Recommended: slide with automatic direction detection -->
<main route-view transition="slide"></main>

<!-- Cross-fade between routes -->
<main route-view transition="fade"></main>

<!-- Scale transition -->
<main route-view transition="scale"></main>
```

**How it works:**
1. No.JS sets `view-transition-name: route-content` on the outlet element
2. The DOM swap is wrapped in `document.startViewTransition({ update, types })`
3. Direction types (`forward` or `backward`) are passed via `types` for the `slide` preset
4. CSS animations target `::view-transition-old(route-content)` and `::view-transition-new(route-content)`
5. `:active-view-transition-type(slide)`, `:active-view-transition-type(forward)`, etc. scope CSS rules to specific presets and directions

**Custom CSS:**

```css
/* Custom fade with longer duration */
::view-transition-old(route-content) {
  animation: fade-out 0.5s ease-out;
}
::view-transition-new(route-content) {
  animation: fade-in 0.5s ease-in;
}

/* Direction-aware slide */
:active-view-transition-type(forward) {
  &::view-transition-old(route-content) {
    animation: slide-out-left 0.3s ease;
  }
  &::view-transition-new(route-content) {
    animation: slide-in-right 0.3s ease;
  }
}
:active-view-transition-type(backward) {
  &::view-transition-old(route-content) {
    animation: slide-out-right 0.3s ease;
  }
  &::view-transition-new(route-content) {
    animation: slide-in-left 0.3s ease;
  }
}
```

**Accessibility:** Built-in presets respect `prefers-reduced-motion` via CSS media queries -- animations are disabled for users who prefer reduced motion.

**Opt-out:** Set `router: { viewTransition: false }` in `NoJS.config()` to fall back to legacy class-based transitions on `route-view`.

#### On regular elements (class-based transitions)

When used on non-router elements (e.g., with `if`, `show`), `transition` uses the **legacy class-based** system. This follows a convention similar to Vue's transition system.

**Syntax:** `<element if="condition" transition="name">`

No.JS adds/removes these classes during the transition:

| Class | When |
|-------|------|
| `{name}-enter` | Start state of enter |
| `{name}-enter-active` | Active state of enter |
| `{name}-enter-to` | End state of enter |
| `{name}-leave` | Start state of leave |
| `{name}-leave-active` | Active state of leave |
| `{name}-leave-to` | End state of leave |

```html
<div if="show" transition="fade">Content</div>
```

```css
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
```

> **Note:** Class-based transitions on `route-view` are deprecated. Use the View Transition API (default) instead.

### Built-in Animation Names

No.JS ships with these CSS animations: `fadeIn`, `fadeOut`, `fadeInUp`, `fadeInDown`, `fadeOutUp`, `fadeOutDown`, `slideInLeft`, `slideInRight`, `slideOutLeft`, `slideOutRight`, `zoomIn`, `zoomOut`, `bounceIn`, `bounceOut`

---

## Drag and Drop

> **Note:** As of v1.13.0, the `drag`, `drop`, `drag-list`, and `drag-multiple` directives have moved to `@erickxavier/nojs-elements`. Install the Elements plugin and call `NoJS.use(NoJSElements)` to enable them.

Declarative drag-and-drop system with sortable lists and multi-select.

### `drag`

Make an element draggable.

**Syntax:** `<element drag="expression">`

The expression value is the data being dragged, available as `$drag` in drop expressions.

**Attributes:**

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `drag` | expression | required | The value being dragged |
| `drag-type` | string | `"default"` | Named type -- only matching `drop-accept` zones respond |
| `drag-effect` | string | `"move"` | `"copy"`, `"move"`, `"link"` -- maps to `dataTransfer.effectAllowed` |
| `drag-handle` | CSS selector | -- | Restricts grab area to a child element |
| `drag-image` | CSS selector or `"none"` | -- | Custom drag ghost element |
| `drag-image-offset` | `"x,y"` | `"0,0"` | Pixel offset for custom drag image |
| `drag-disabled` | expression | `false` | When truthy, disables dragging |
| `drag-class` | string | `"nojs-dragging"` | Class added while dragging |
| `drag-ghost-class` | string | -- | Class added to the drag image element |
| `drag-axis` | `"x"` or `"y"` | -- | Constrain drag direction. Sets `touch-action: pan-y` (x) or `pan-x` (y) |
| `drag-group` | string | -- | Group name for multi-select |

```html
<!-- Basic draggable -->
<div drag="item">Drag me</div>

<!-- With type and handle -->
<div drag="task" drag-type="task" drag-handle=".grip">
  <span class="grip">&#x2801;&#x2801;</span>
  <span bind="task.name"></span>
</div>

<!-- Conditionally disabled -->
<div drag="item" drag-disabled="isLocked">Locked item</div>
```

### `drop`

Make an element a drop zone.

**Syntax:** `<element drop="expression">`

The `drop` expression executes when an item is dropped. Use `$drag` to access the dragged value.

**Attributes:**

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `drop` | statement | required | Expression executed on drop |
| `drop-accept` | string | `"default"` | Accepted `drag-type`(s), comma-separated. `"*"` for any |
| `drop-effect` | string | `"move"` | `"copy"`, `"move"`, `"link"` |
| `drop-class` | string | `"nojs-drag-over"` | Class added when valid item hovers |
| `drop-reject-class` | string | `"nojs-drop-reject"` | Class when item is rejected |
| `drop-disabled` | expression | `false` | When truthy, disables dropping |
| `drop-max` | expression | Infinity | Max items the zone accepts |
| `drop-sort` | string | -- | `"vertical"`, `"horizontal"`, or `"grid"` -- enables sortable reorder |
| `drop-placeholder` | template ID or `"auto"` | -- | Shows placeholder at insertion point |
| `drop-placeholder-class` | string | `"nojs-drop-placeholder"` | Class for the placeholder |

```html
<div drop="items = [...items, $drag]" drop-accept="task">
  Drop tasks here
</div>

<!-- With sortable positioning -->
<div drop="items.splice($dropIndex, 0, $drag)"
     drop-accept="task"
     drop-sort="vertical"
     drop-placeholder="auto">
</div>
```

### `drag-list`

High-level shorthand for sortable lists bound to state arrays. Combines `each` + `drag` + `drop`.

**Syntax:** `<element drag-list="arrayPath" template="tplId" drag-list-key="keyProp">`

**Attributes:**

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `drag-list` | path | required | Path to array in state |
| `template` | template ID | -- | Template for each item |
| `drag-list-key` | property name | -- | Unique key per item for stable identity |
| `drag-list-item` | variable name | `"item"` | Loop variable name in template |
| `drag-type` | string | auto | Named type for items. Default: `"__draglist_" + listPath` |
| `drop-sort` | string | `"vertical"` | `"vertical"`, `"horizontal"`, or `"grid"` |
| `drop-accept` | string | same as `drag-type` | Types accepted |
| `drag-list-copy` | boolean | -- | Copy items instead of moving |
| `drag-list-remove` | boolean | -- | Remove items when dragged out |
| `drag-disabled` | expression | `false` | Disables dragging from this list |
| `drop-disabled` | expression | `false` | Disables dropping into this list |
| `drop-max` | expression | Infinity | Max items allowed |
| `drag-class` | string | `"nojs-dragging"` | Class added to items while dragging |
| `drop-class` | string | `"nojs-drag-over"` | Class added to list while valid item hovers |
| `drop-reject-class` | string | `"nojs-drop-reject"` | Class when item is rejected |
| `drop-settle-class` | string | `"nojs-drop-settle"` | CSS class for settle animation after drop |
| `drop-empty-class` | string | `"nojs-drag-list-empty"` | CSS class for empty list state |
| `drop-placeholder` | template ID or `"auto"` | -- | Placeholder at drop position |
| `drop-placeholder-class` | string | `"nojs-drop-placeholder"` | Class for the placeholder |

```html
<!-- Basic sortable list -->
<div state="{ tasks: [{id:1,text:'A'},{id:2,text:'B'}] }">
  <div drag-list="tasks" template="task-tpl" drag-list-key="id" drop-sort="vertical"></div>
</div>
<template id="task-tpl">
  <div class="card" bind="item.text"></div>
</template>
```

**Kanban (two-list transfer):**

```html
<div state="{ todo: [...], done: [] }">
  <div drag-list="todo" template="task-tpl" drag-list-key="id"
       drag-type="task" drop-accept="task" drop-sort="vertical" drag-list-remove
       on:reorder="console.log('reordered')">
  </div>
  <div drag-list="done" template="task-tpl" drag-list-key="id"
       drag-type="task" drop-accept="task" drop-sort="vertical" drag-list-remove
       on:receive="console.log('received', $event.detail.item)">
  </div>
</div>
```

**Drag-List Events:**

| Event | `$event.detail` | Description |
|-------|-----------------|-------------|
| `on:reorder` | `{ list, item, from, to }` | Item reordered within same list |
| `on:receive` | `{ list, item, from, fromList }` | Item received from another list |
| `on:remove` | `{ list, item, index }` | Item removed (dragged out) |

### `drag-multiple`

Enable lasso/multi-select on children.

**Syntax:** `<element drag drag-multiple drag-group="groupName">`

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `drag-multiple` | boolean | -- | Enables click-to-select |
| `drag-multiple-class` | string | `"nojs-selected"` | Class added to selected items |
| `drag-group` | string | required | Group name -- all selected items move together |

Interactions:
- Click selects a single item (replaces previous selection)
- Ctrl/Cmd+Click adds to selection
- Escape clears the selection
- When dragging a selected item, `$drag` becomes an array of all selected items

### Implicit Drop Variables

Available inside `drop` expressions:

| Variable | Type | Description |
|----------|------|-------------|
| `$drag` | any | The dragged value. Array if multi-select |
| `$dragType` | string | The `drag-type` of the item |
| `$dragEffect` | string | The `drag-effect` |
| `$dropIndex` | number | Insertion index within the drop zone |
| `$source` | object or null | `{ list, index, el }` -- source info |
| `$target` | object or null | `{ list, index, el }` -- target info |
| `$el` | Element | The drop zone element |

### Automatic CSS Classes

| Class | When applied |
|-------|-------------|
| `.nojs-dragging` | On source element while dragging |
| `.nojs-drag-over` | On drop zone while a valid item hovers |
| `.nojs-drop-reject` | On drop zone when item is rejected |
| `.nojs-drop-placeholder` | On the insertion placeholder |
| `.nojs-selected` | On multi-selected items |
| `.nojs-drop-settle` | Brief settle animation on drop |
| `.nojs-drag-list-empty` | On a `drag-list` when it has no items |

### Custom DOM Events

Drag elements and drop zones dispatch custom DOM events that can be listened to with standard `addEventListener` or No.JS `on:event-name`:

| Event | Dispatched on | Bubbles | `detail` properties |
|-------|---------------|---------|---------------------|
| `drag-start` | Drag element | Yes | `{ item, index, el }` |
| `drag-end` | Drag element | Yes | `{ item, index, dropped }` (`dropped` is `true` if the item was successfully dropped) |
| `drag-enter` | Drop zone | No | `{ item, type }` |
| `drag-leave` | Drop zone | No | `{ item }` |
| `drag-over` | Drop zone (sortable only) | No | `{ item, index }` (throttled, fires during sortable reorder) |

```html
<div drag="task" on:drag-start="console.log('started', $event.detail.item)"
     on:drag-end="console.log('ended', $event.detail.dropped)">
  Drag me
</div>

<div drop="items.push($drag)" on:drag-enter="console.log('entered', $event.detail.type)">
  Drop here
</div>
```

### Multi-Drag Ghost (Stacked Cards)

When dragging multiple selected items (`drag-multiple`), the drag ghost displays a stacked-card visual: up to 3 layered card shadows with a count badge showing the total number of selected items. The top card clones the dragged element's content; back cards use a matching background and border.

### Accessibility

Automatic ARIA attributes: `draggable="true"`, `aria-grabbed`, `aria-dropeffect`, `role="listbox"` on containers, `role="option"` on items, `tabindex="0"` for keyboard access. Keyboard: Space to grab, Escape to cancel, Arrow keys to navigate, Enter to drop.

---

## Internationalization

Translation directives for multi-language apps.

### `t`

Translate element content using an i18n key.

**Syntax:** `<element t="namespace.key">`

```html
<h1 t="landing.hero.title"></h1>
<a route="/" t="nav.home"></a>
```

### `t-*`

Pass parameters to translation strings.

**Syntax:** `<element t="key" t-paramName="expression">`

```html
<!-- Translation: "Hello, {name}!" -->
<h1 t="greeting" t-name="user.name"></h1>

<!-- Pluralization: "{count} item | {count} items" -->
<span t="items" t-count="cart.items.length"></span>
```

### `t-html`

Render the translation value as sanitized HTML instead of plain text. Companion to `t`.

**Syntax:** `<element t="key" t-html>`

```html
<!-- Translation: "Read our <a href='/terms'>terms</a>" -->
<div t="legal.notice" t-html></div>
```

The output is sanitized via `_sanitizeHtml()` to prevent XSS.

### `i18n-ns`

Set the i18n namespace for an element and its descendants. Triggers loading of the namespace JSON file.

**Syntax:** `<element i18n-ns="namespace">` or `<element i18n-ns>` (auto-derive from route)

```html
<!-- Explicit namespace -->
<div i18n-ns="settings">
  <h2 t="settings.title"></h2>
</div>

<!-- Auto-derive on route-view -->
<main route-view src="templates/" route-index="landing" i18n-ns></main>
```

### i18n Configuration

```html
<script>
  NoJS.i18n({
    defaultLocale: 'en',
    fallbackLocale: 'en',
    locales: {
      en: {
        greeting: 'Hello, {name}!',
        items: '{count} item | {count} items'  // pluralization with |
      },
      'pt-BR': {
        greeting: 'Ola, {name}!',
        items: '{count} item | {count} itens'
      }
    }
  });
</script>
```

**External locale files (flat mode):**

```html
<script>
  NoJS.i18n({
    defaultLocale: 'en',
    loadPath: '/locales/{locale}.json'
  });
</script>
```

**Namespace mode** -- split translations by feature, loaded on demand:

```html
<script>
  NoJS.i18n({
    defaultLocale: 'en',
    loadPath: '/locales/{locale}/{ns}.json',
    ns: ['common']  // namespaces to load at startup
  });
</script>
```

Folder structure:

```text
locales/
  en/
    common.json
    settings.json
    dashboard.json
  pt-BR/
    common.json
    settings.json
    dashboard.json
```

Use `i18n-ns` on elements to trigger namespace loading. On `route-view` with `i18n-ns` (no value), the namespace is auto-derived from the route filename.

**Caching:**

Locale files are cached in memory by default. Disable for development:

```html
<script>
  NoJS.i18n({ cache: false });
</script>
```

**Number & date formatting filters:**

```html
<span bind="price | currency"></span>          <!-- $1,234.56 -->
<span bind="price | currency:'BRL'"></span>    <!-- R$ 1.234,56 -->
<span bind="total | number"></span>            <!-- 1,234.56 -->
<span bind="ratio | percent"></span>           <!-- 85% -->
<span bind="createdAt | date"></span>          <!-- Mar 23, 2026 -->
<span bind="createdAt | date:'long'"></span>   <!-- March 23, 2026 -->
<span bind="createdAt | datetime"></span>      <!-- Mar 23, 2026, 2:30 PM -->
<span bind="updatedAt | relative"></span>      <!-- 2 hours ago -->
```

These filters are locale-aware and use `Intl` APIs under the hood.

**Switch locale at runtime:**

```html
<button on:click="$i18n.locale = 'pt-BR'">Portugues</button>
<span bind="$i18n.locale"></span>
```

**`$i18n` context variable:**

| Property                | Description                      |
|-------------------------|----------------------------------|
| `$i18n.locale`          | Current active locale (get/set)  |
| `$i18n.t(key, params)`  | Translate a key programmatically |

---

## Head Management (Body Directives)

Priority 1 directives placed on `<div hidden>` in the page body. Update `<head>` elements reactively when surrounding state changes. Use for non-routing pages (product pages, landing pages without a router). For SPA routing use route head attributes on `<template route>` instead.

### `page-title`

Reactively set the document `<title>`. Value is a No.JS expression.

**Syntax:** `<div hidden page-title="expression">`

```html
<div hidden page-title="product.name + ' | My Store'"></div>
<div hidden page-title="'About Us | My Store'"></div>
```

Watches the expression and updates `<title>` whenever the reactive context changes.

### `page-description`

Reactively set `<meta name="description">` in `<head>`. Creates the tag if it doesn't exist.

**Syntax:** `<div hidden page-description="expression">`

```html
<div hidden page-description="product.description"></div>
```

### `page-canonical`

Reactively set `<link rel="canonical">` in `<head>`. Creates the tag if it doesn't exist.

**Syntax:** `<div hidden page-canonical="expression">`

```html
<div hidden page-canonical="'/products/' + product.slug"></div>
```

### `page-jsonld`

Reactively set `<script type="application/ld+json" data-nojs>` in `<head>`. Value is either a No.JS expression that evaluates to an object (JSON.stringify is applied) or a JSON string with `{interpolation}` placeholders in the element's text content.

**Syntax:** `<div hidden page-jsonld>{ JSON template with {placeholders} }</div>`

```html
<div hidden page-jsonld>
  { "@type": "Product", "name": "{product.name}", "price": "{product.price}" }
</div>
```

The `data-nojs` marker on the generated `<script>` tag distinguishes it from hand-written JSON-LD so they can coexist.

> **Note:** `<script>` elements are skipped by `processTree`, so use `<div hidden>` as the host element for all head management directives.
