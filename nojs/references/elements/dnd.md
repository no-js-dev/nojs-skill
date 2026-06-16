# Drag and Drop

Declarative drag-and-drop system covering four directives: `drag` (make elements draggable), `drop` (define drop zones), `drag-list` (sortable lists), and `drag-multiple` (multi-select with lasso). All directives work with standard HTML elements and NoJS reactive state.

## Contents

- [Installation](#installation)
- [drag -- Make an Element Draggable](#drag----make-an-element-draggable)
  - [Drag Attributes](#drag-attributes)
- [drop -- Define a Drop Zone](#drop----define-a-drop-zone)
  - [Drop Attributes](#drop-attributes)
- [Element-Level Events](#element-level-events)
- [drag-list -- Sortable List](#drag-list----sortable-list)
  - [Drag-List Attributes](#drag-list-attributes)
  - [Drag-List Events](#drag-list-events)
- [drag-multiple -- Multi-Select](#drag-multiple----multi-select)
- [Implicit Variables](#implicit-variables)
- [CSS Classes](#css-classes)
- [Accessibility](#accessibility)
- [Examples](#examples)
  - [Basic Drag and Drop](#basic-drag-and-drop)
  - [Sortable Task List](#sortable-task-list)
  - [Kanban Board with Multiple Lists](#kanban-board-with-multiple-lists)
- [Composition with NoJS Directives](#composition-with-nojs-directives)

---

## Installation

```html
<!-- CDN (auto-installs, no registration needed) -->
<script src="https://unpkg.com/@nickeljs/elements"></script>

<!-- ESM (register the full plugin or individually) -->
<script type="module">
  import NoJSElements from '@nickeljs/elements';
  NoJS.use(NoJSElements);
</script>
```

Requires No.JS >= 1.13.0.

---

## `drag` -- Make an Element Draggable

Add the `drag` attribute to any element to make it draggable. The attribute value is the data payload carried during the drag operation.

```html
<div state="{ item: { id: 1, name: 'Task' } }">
  <div drag="item">Drag me</div>
</div>
```

### Drag Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `drag` | expression | *required* | The value being dragged |
| `drag-type` | string | `"default"` | Named type -- only matching `drop-accept` zones respond |
| `drag-effect` | `"copy"` \| `"move"` \| `"link"` | `"move"` | Maps to `dataTransfer.effectAllowed` |
| `drag-handle` | CSS selector | -- | Restricts the grab area to a child element |
| `drag-image` | CSS selector \| `"none"` | -- | Custom drag ghost element |
| `drag-image-offset` | `"x,y"` | `"0,0"` | Pixel offset for custom drag image |
| `drag-disabled` | expression | `false` | When truthy, disables dragging |
| `drag-class` | string | `"nojs-dragging"` | Class added while dragging |
| `drag-ghost-class` | string | -- | Class added to the drag image element |
| `drag-group` | string | -- | Group name for multi-select |

---

## `drop` -- Define a Drop Zone

Add the `drop` attribute to create an area that accepts dragged items. The attribute value is the expression to execute when an item is dropped.

```html
<div state="{ items: [] }">
  <div drop="items.push($drag)" drop-accept="default">
    Drop items here
  </div>
</div>
```

### Drop Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `drop` | expression | *required* | Expression executed on drop. `$drag` holds the dragged value |
| `drop-accept` | string | `"*"` | Space-separated list of accepted `drag-type` values. `"*"` accepts all |
| `drop-effect` | `"copy"` \| `"move"` \| `"link"` | `"move"` | Maps to `dataTransfer.dropEffect` |
| `drop-disabled` | expression | `false` | When truthy, disables dropping |
| `drop-class` | string | `"nojs-drag-over"` | Class added when a valid drag hovers over the zone |
| `drop-reject-class` | string | `"nojs-drop-reject"` | Class added when a non-accepted type hovers |

---

## Element-Level Events

The `drag` and `drop` directives dispatch CustomEvents on their host elements at each stage of the drag-and-drop lifecycle.

| Event | Dispatched on | `$event.detail` | Description |
|-------|---------------|-----------------|-------------|
| `on:drag-start` | `[drag]` element | `{ data, type, effect }` | Drag operation started |
| `on:drag-end` | `[drag]` element | `{ data, type, dropped }` | Drag operation ended (`dropped` is true if successfully dropped) |
| `on:drag-enter` | `[drop]` element | `{ data, type }` | Valid drag entered the drop zone |
| `on:drag-leave` | `[drop]` element | `{ data, type }` | Drag left the drop zone |
| `on:drag-over` | `[drop]` element | `{ data, type }` | Drag is hovering over the drop zone |
| `on:drop` | `[drop]` element | `{ data, type, effect }` | Item was dropped |

---

## `drag-list` -- Sortable List

A high-level directive that combines drag, drop, and list management into a single attribute. Renders items from a state array and allows reordering via drag-and-drop.

```html
<div state="{ tasks: ['Design', 'Develop', 'Test'] }">
  <ul drag-list="tasks">
    <li bind="item"></li>
  </ul>
</div>
```

### Drag-List Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `drag-list` | path | *required* | Path to array in state |
| `template` | template ID | -- | Template for each item (same as `each`) |
| `drag-list-key` | property name | -- | Unique key per item for stable identity |
| `drag-list-item` | variable name | `"item"` | Loop variable name in template |
| `drop-sort` | `"vertical"` \| `"horizontal"` \| `"grid"` | `"vertical"` | Layout direction |
| `drop-accept` | string | *self* | Types accepted (defaults to same list only) |
| `drag-list-copy` | boolean attr | -- | Copy items instead of moving |
| `drag-list-remove` | boolean attr | -- | Remove items when dragged out |
| `drag-disabled` | expression | `false` | Disables dragging from this list |
| `drop-disabled` | expression | `false` | Disables dropping into this list |
| `drop-max` | expression (number) | `Infinity` | Maximum items allowed |
| `drop-settle-class` | string | `"nojs-drop-settle"` | CSS class for the settle animation |
| `drop-empty-class` | string | `"nojs-drag-list-empty"` | CSS class for empty state |
| `drop-placeholder` | template ID \| `"auto"` | -- | Placeholder shown at the drop position |

### Drag-List Events

| Event | `$event.detail` | Description |
|-------|-----------------|-------------|
| `on:reorder` | `{ list, item, from, to }` | Item reordered within same list |
| `on:receive` | `{ list, item, from, fromList }` | Item received from another list |
| `on:remove` | `{ list, item, index }` | Item removed (dragged out) |

---

## `drag-multiple` -- Multi-Select

Adds multi-select capability to draggable items. Users can select multiple items (click + Ctrl/Cmd, or lasso selection) and drag them together.

```html
<div state="{ items: [{id:1,name:'A'},{id:2,name:'B'},{id:3,name:'C'}] }">
  <ul drag-multiple>
    <li each="item in items" key="item.id"
        drag="item" drag-group="items">
      <span bind="item.name"></span>
    </li>
  </ul>
</div>
```

When dragging multiple selected items, the drag ghost displays a stacked-card visual: up to 3 layered card shadows with a count badge showing the total number of selected items. The top card clones the dragged element's content; back cards use a matching background and border.

Selection is indicated by the `.nojs-selected` class on each selected item.

---

## Implicit Variables

These variables are available inside `drop` expressions and drop event handlers:

| Variable | Type | Description |
|----------|------|-------------|
| `$drag` | any | The value from the `drag` attribute of the dragged element |
| `$dragType` | string | The `drag-type` of the dragged element |
| `$dropIndex` | number | The insertion index within a `drag-list` |

---

## CSS Classes

NoJS automatically applies these classes during drag-and-drop operations:

| Class | When Applied |
|-------|-------------|
| `.nojs-dragging` | On the element being dragged (customizable via `drag-class`) |
| `.nojs-drag-over` | On a drop zone when a valid drag hovers over it (customizable via `drop-class`) |
| `.nojs-drop-reject` | On a drop zone when a non-accepted type hovers (customizable via `drop-reject-class`) |
| `.nojs-drop-placeholder` | On the placeholder element in a `drag-list` |
| `.nojs-drop-settle` | On an item during the settle animation after drop (customizable via `drop-settle-class`) |
| `.nojs-drag-list-empty` | On a `drag-list` when it has no items (customizable via `drop-empty-class`) |
| `.nojs-selected` | On items selected via `drag-multiple` |

---

## Accessibility

NoJS adds ARIA attributes for assistive technology:

- `aria-grabbed="true"/"false"` on draggable elements
- `aria-dropeffect` on drop zones (set to the `drop-effect` value)
- `role="listbox"` on `drag-list` containers
- `role="option"` on `drag-list` items
- Keyboard support: `Space` to grab/release, arrow keys to move within a `drag-list`

---

## Examples

### Basic Drag and Drop

Move items between two zones using typed drag sources and drop targets.

```html
<div state="{ inbox: ['Email 1', 'Email 2', 'Email 3'], archive: [] }">
  <h3>Inbox</h3>
  <div each="email in inbox" key="email"
       drag="email" drag-type="email">
    <span bind="email"></span>
  </div>

  <h3>Archive</h3>
  <div drop="archive.push($drag)"
       drop-accept="email"
       style="min-height: 100px; border: 2px dashed #ccc; padding: 16px">
    <p if="archive.length === 0">Drop emails here to archive</p>
    <div each="email in archive" key="email" bind="email"></div>
  </div>
</div>
```

### Sortable Task List

Reorder tasks within a single list.

```html
<div state="{ tasks: [
  { id: 1, title: 'Design mockups' },
  { id: 2, title: 'Write tests' },
  { id: 3, title: 'Deploy to staging' }
] }">
  <ul drag-list="tasks" drag-list-key="id"
      drop-placeholder="auto"
      on:reorder="console.log('Reordered:', $event.detail)">
    <li>
      <span bind="item.title"></span>
    </li>
  </ul>
</div>
```

### Kanban Board with Multiple Lists

Transfer items between lists with constraints.

```html
<div state="{
  todo: [{ id: 1, title: 'Research' }],
  doing: [{ id: 2, title: 'Implement' }],
  done: []
}">
  <div style="display: flex; gap: 16px">
    <div>
      <h3>To Do</h3>
      <ul drag-list="todo" drag-list-key="id"
          drop-accept="task" drag-type="task"
          drag-list-remove
          on:reorder="console.log('reorder', $event.detail)"
          on:remove="console.log('removed', $event.detail)">
        <li bind="item.title"></li>
      </ul>
    </div>

    <div>
      <h3>In Progress</h3>
      <ul drag-list="doing" drag-list-key="id"
          drop-accept="task" drag-type="task"
          drag-list-remove drop-max="3"
          on:receive="console.log('received', $event.detail)">
        <li bind="item.title"></li>
      </ul>
    </div>

    <div>
      <h3>Done</h3>
      <ul drag-list="done" drag-list-key="id"
          drop-accept="task" drag-type="task"
          drag-list-remove>
        <li bind="item.title"></li>
      </ul>
    </div>
  </div>
</div>
```

---

## Composition with NoJS Directives

Drag and drop integrates with the full NoJS directive system:

- **`state`** -- drag values and drop targets reference reactive state
- **`each` / `foreach` / `for`** -- render draggable items from arrays
- **`if` / `show`** -- conditionally display drop zones or drag handles
- **`bind`** -- display drag data dynamically
- **`on:*` events** -- react to drag-start, drag-end, drop, reorder, receive, remove
- **`class-*`** -- apply conditional styles based on drag state
- **`drag-disabled` / `drop-disabled`** -- use reactive expressions to enable/disable at runtime

```html
<div state="{ items: [], canDrop: true, dragActive: false }">
  <ul drag-list="items" drag-list-key="id"
      drop-disabled="!canDrop"
      on:drag-start="dragActive = true"
      on:drag-end="dragActive = false">
    <li class-highlight="dragActive">
      <span bind="item.name"></span>
    </li>
  </ul>
</div>
```
