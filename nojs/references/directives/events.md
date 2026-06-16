# Event Directives

Event handling, modifiers, lifecycle hooks, and custom event emission. Priority 20.

## Contents

- [on:*](#on) -- event handler for all DOM events and lifecycle hooks
- [Event Modifiers](#event-modifiers) -- prevent, stop, once, self, debounce, throttle
- [Key Modifiers](#key-modifiers) -- enter, escape, tab, space, arrow keys, ctrl, alt, shift, meta
- [$event and $el](#event-and-el) -- native event object and current element
- [Lifecycle Hooks](#lifecycle-hooks) -- on:init, on:mounted, on:updated, on:unmounted, on:error
- [trigger](#trigger) -- emit custom events

---

## Syntax Reference

| Directive | Syntax | Description |
|-----------|--------|-------------|
| `on:*` | `on:event="expression"` | Attach event handler for any DOM event |
| `on:*.modifier` | `on:event.modifier="expression"` | Event handler with modifier(s) |
| `trigger` | `trigger="event-name"` | Emit custom event on click |
| `trigger-data` | `trigger-data="expression"` | Data attached to custom event |

---

## `on:*`

Event handler -- supports all DOM events plus lifecycle hooks.

**Syntax:** `<element on:event="expression">` or `<element on:event.modifier="expression">`

```html
<button on:click="count++">Click me</button>
<form on:submit.prevent="handleSubmit()">
<input on:keydown.enter="search()">
<input on:input="name = $event.target.value" />
<div on:mouseenter="hovered = true" on:mouseleave="hovered = false">
```

### Edge Cases

- Multiple handlers on the same event are not supported. The last `on:click` wins.
- The expression is evaluated in the element's reactive context, so all state variables are available.
- Void expressions (e.g. `on:click="count++"`) work fine; the return value is ignored.

### Complete Example

```html
<div state="{ count: 0, lastEvent: 'none' }">
  <button on:click="count++; lastEvent = 'click'">
    Clicked <span bind="count"></span> times
  </button>

  <input type="text"
         on:focus="lastEvent = 'focus'"
         on:blur="lastEvent = 'blur'"
         on:input="lastEvent = 'input: ' + $event.target.value" />

  <p>Last event: <span bind="lastEvent"></span></p>
</div>
```

---

## Event Modifiers

| Modifier | Description |
|----------|-------------|
| `.prevent` | Calls `preventDefault()` |
| `.stop` | Calls `stopPropagation()` |
| `.once` | Listener fires only once |
| `.self` | Only fires if target is the element itself |
| `.debounce.{ms}` | Debounce the handler (e.g. `.debounce.300`) |
| `.throttle.{ms}` | Throttle the handler (e.g. `.throttle.100`) |

Modifiers can be combined: `on:submit.prevent.once="register()"`.

> **Note:** `capture` and `passive` are not supported modifiers. They are silently ignored by the runtime and flagged by NoJS-LSP during development.

```html
<!-- Prevent default form submission -->
<form on:submit.prevent="handleSubmit()">

<!-- Stop event propagation -->
<button on:click.stop="handleClick()">

<!-- Fire handler only once -->
<button on:click.once="initializeApp()">

<!-- Only fire if click is on this element (not children) -->
<div on:click.self="closeModal()">

<!-- Debounced search input -->
<input on:input.debounce.300="search($event.target.value)" />

<!-- Throttled scroll handler -->
<div on:scroll.throttle.100="handleScroll()">

<!-- Combine modifiers -->
<form on:submit.prevent.once="register()">
```

### Complete Example -- Form with Modifiers

```html
<div state="{ query: '', submitted: false }">
  <form on:submit.prevent="submitted = true">
    <input on:input.debounce.300="query = $event.target.value"
           on:keydown.escape="query = ''"
           placeholder="Search..." />
    <button on:click.stop>Submit</button>
  </form>

  <p show="submitted">Form submitted with query: <span bind="query"></span></p>
</div>
```

---

## Key Modifiers

| Modifier | Key |
|----------|-----|
| `.enter` | Enter |
| `.escape` | Escape |
| `.tab` | Tab |
| `.space` | Space |
| `.delete` | Delete or Backspace |
| `.backspace` | Backspace only |
| `.up` | ArrowUp |
| `.down` | ArrowDown |
| `.left` | ArrowLeft |
| `.right` | ArrowRight |
| `.ctrl` | Control |
| `.alt` | Alt |
| `.shift` | Shift |
| `.meta` | Meta/Command |

Key modifiers can be combined with each other and with event modifiers:

```html
<input on:keydown.enter="submit()" />
<input on:keydown.ctrl.enter="save()" />
<input on:keydown.shift.delete="deleteAll()" />
<input on:keydown.escape="cancel()" />
```

### Edge Cases

- `.delete` matches both the Delete and Backspace keys. Use `.backspace` to match only Backspace.
- Modifier key modifiers (`.ctrl`, `.alt`, `.shift`, `.meta`) require the modifier key to be held while the other key is pressed.
- Key modifiers are only meaningful on keyboard events (`keydown`, `keyup`, `keypress`).

### Complete Example -- Keyboard Shortcuts

```html
<div state="{ text: '', saved: false }">
  <textarea model="text"
            on:keydown.ctrl.enter="saved = true"
            on:keydown.escape="text = ''"
            on:keydown.ctrl.shift.delete="text = ''; saved = false"
            placeholder="Type here... Ctrl+Enter to save, Escape to clear">
  </textarea>

  <p>Characters: <span bind="text.length"></span></p>
  <p show="saved" class="success">Saved!</p>
</div>
```

---

## `$event` and `$el`

Inside any `on:*` handler, two special variables are available:

| Variable | Description |
|----------|-------------|
| `$event` | The native DOM event object |
| `$el` | The current element |

```html
<input on:input="name = $event.target.value" />
<input on:focus="$el.select()" />
<button on:click="console.log($event.type, $el.tagName)">Log</button>
```

### Edge Cases

- `$event` is only available inside `on:*` handlers, not in `bind` or other expressions.
- `$el` refers to the element the handler is attached to, not necessarily the `$event.target` (which could be a child element).

---

## Lifecycle Hooks

Lifecycle hooks are special `on:*` events that fire at key moments in an element's lifecycle:

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

### Edge Cases

- `on:mounted` fires after the element is fully inserted into the visible DOM and all child directives have been processed.
- `on:updated` fires frequently -- it observes all MutationObserver categories, not just data changes. Use with caution on elements with many child mutations.
- `on:unmounted` fires when the element is removed from the DOM (e.g., by an `if` directive turning false).
- `$el` is available in lifecycle hooks. `$event` is not available (there is no DOM event).

### Complete Example -- Chart Initialization

```html
<div state="{ showChart: false }">
  <button on:click="showChart = !showChart">Toggle Chart</button>

  <div if="showChart"
       on:mounted="console.log('Chart mounted', $el)"
       on:unmounted="console.log('Chart unmounted')">
    <canvas ref="myChart" width="400" height="200"></canvas>
    <p>Chart is visible.</p>
  </div>
</div>
```

---

## `trigger`

Emit a custom event from the element. The `trigger` directive always attaches a **click** listener -- when the element is clicked, it dispatches a `CustomEvent` with the given name and optional detail data. This applies to all element types, including form elements.

**Syntax:** `<element trigger="event-name" trigger-data="expression">`

**Attributes:**

| Attribute | Type | Description |
|-----------|------|-------------|
| `trigger` | string | Name of the custom event to emit |
| `trigger-data` | expression | Data to include in `event.detail` |

The event is dispatched as a `CustomEvent` that bubbles up the DOM. Parent elements can listen with `on:{event-name}`.

```html
<!-- Child emits -->
<button on:click trigger="item-selected" trigger-data="item">Select</button>

<!-- Parent listens -->
<div on:item-selected="handleSelection($event.detail)">
  <div each="item in items" template="itemTpl"></div>
</div>
```

### Edge Cases

- The `trigger` directive always uses the `click` event, regardless of the element type.
- `trigger-data` is optional. If omitted, `$event.detail` is `undefined`.
- Custom events bubble, so any ancestor can listen for them.

### Complete Example -- Parent-Child Communication

```html
<div state="{ selectedItem: null, items: [{id: 1, name: 'Apple'}, {id: 2, name: 'Banana'}, {id: 3, name: 'Cherry'}] }">
  <div on:item-selected="selectedItem = $event.detail">
    <div each="item in items" key="item.id">
      <button trigger="item-selected" trigger-data="item">
        Select <span bind="item.name"></span>
      </button>
    </div>
  </div>

  <p show="selectedItem">
    Selected: <span bind="selectedItem.name"></span>
  </p>
</div>
```
