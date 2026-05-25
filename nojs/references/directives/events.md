# Event Directives

Event handling, modifiers, and lifecycle hooks. Priority 20.

## Contents

- [on:*](#on) -- event handler for all DOM events and lifecycle hooks
- [Event Modifiers](#event-modifiers) -- prevent, stop, once, self, debounce, throttle
- [Key Modifiers](#key-modifiers) -- enter, escape, tab, space, arrow keys, ctrl, alt, shift, meta
- [$event and $el](#event-and-el) -- native event object and current element
- [Lifecycle Hooks](#lifecycle-hooks) -- on:init, on:mounted, on:updated, on:unmounted, on:error
- [trigger](#trigger) -- emit custom events

---

## Events

Event handling, modifiers, and lifecycle hooks.

### `on:*`

Event handler -- supports all DOM events plus lifecycle hooks.

**Syntax:** `<element on:event="expression">` or `<element on:event.modifier="expression">`

```html
<button on:click="count++">Click me</button>
<form on:submit.prevent="handleSubmit()">
<input on:keydown.enter="search()">
<input on:input="name = $event.target.value" />
<div on:mouseenter="hovered = true" on:mouseleave="hovered = false">
```

### Event Modifiers

| Modifier | Description |
|----------|-------------|
| `.prevent` | Calls `preventDefault()` |
| `.stop` | Calls `stopPropagation()` |
| `.once` | Listener fires only once |
| `.self` | Only fires if target is the element itself |
| `.debounce.{ms}` | Debounce the handler (e.g. `.debounce.300`) |
| `.throttle.{ms}` | Throttle the handler (e.g. `.throttle.100`) |

### Key Modifiers

| Modifier | Key |
|----------|-----|
| `.enter` | Enter |
| `.escape` | Escape |
| `.tab` | Tab |
| `.space` | Space |
| `.delete` | Delete or Backspace |
| `.up` | ArrowUp |
| `.down` | ArrowDown |
| `.left` | ArrowLeft |
| `.right` | ArrowRight |
| `.ctrl` | Control |
| `.alt` | Alt |
| `.shift` | Shift |
| `.meta` | Meta/Command |

Modifiers can be combined: `on:submit.prevent.once="register()"`, `on:keydown.ctrl.s="save()"`

```html
<input on:input.debounce.300="search($event.target.value)" />
<div on:scroll.throttle.100="handleScroll()">
<input on:keydown.ctrl.s="save()" />
```

### `$event` and `$el`

Inside any `on:*` handler:
- `$event` -- the native DOM event object
- `$el` -- the current element

```html
<input on:input="name = $event.target.value" />
<input on:focus="$el.select()" />
```

### Lifecycle Hooks

| Hook | When |
|------|------|
| `on:init` | Directive first processed |
| `on:mounted` | Element inserted into visible DOM |
| `on:updated` | Any DOM mutation in subtree -- fires on **all** MutationObserver events (childList, attributes, characterData) within the element, not just data-driven updates |
| `on:unmounted` | Element removed from DOM |
| `on:error` | Any error in this element's subtree |

```html
<div on:mounted="initChart($el)">
  <canvas ref="chart"></canvas>
</div>
<div on:unmounted="cleanup()"></div>
<div on:init="fetchInitialData()"></div>
```

### `trigger`

Emit a custom event from the element. The `trigger` directive always attaches a **click** listener -- when the element is clicked, it dispatches a `CustomEvent` with the given name and optional detail data. This applies to all element types, including form elements.

**Syntax:** `<element trigger="event-name" trigger-data="expression">`

The parent can listen with `on:event-name`.

```html
<!-- Child emits -->
<button on:click trigger="item-selected" trigger-data="item">Select</button>

<!-- Parent listens -->
<div on:item-selected="handleSelection($event.detail)">
  <div each="item in items" template="itemTpl"></div>
</div>
```
