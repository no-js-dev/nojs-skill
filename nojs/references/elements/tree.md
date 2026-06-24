# Tree

Hierarchical tree view with expand/collapse, selection, keyboard navigation, and optional drag-and-drop. Built on standard HTML lists with NoJS directive attributes -- no custom elements needed. Three directives: `tree` (container), `branch` (expandable item), `subtree` (nested group).

## Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Attributes](#attributes)
- [Nested Trees](#nested-trees)
- [Dynamic Trees](#dynamic-trees)
- [Selected State](#selected-state)
- [Keyboard Navigation](#keyboard-navigation)
- [CSS Classes](#css-classes)
- [Built-in Style Behavior](#built-in-style-behavior)
- [Drag & Drop](#drag--drop)
- [Accessibility](#accessibility)
- [Examples](#examples)
  - [Basic File Tree](#basic-file-tree)
  - [Dynamic Tree with Drag-and-Drop](#dynamic-tree-with-drag-and-drop)
  - [Tree with Protected System Items](#tree-with-protected-system-items)
- [Composition with NoJS Directives](#composition-with-nojs-directives)

---

## Installation

```html
<!-- CDN (auto-installs, no registration needed) -->
<script src="https://cdn-elements.no-js.dev/nojs-elements.iife.js"></script>
```

Requires No.JS >= 1.13.0.

---

## Basic Usage

Add the `tree` attribute to a container (typically `<ul>`), then mark expandable items with `branch` and their nested groups with `subtree`.

```html
<ul tree>
  <li branch>
    Folder
    <ul subtree>
      <li>File A</li>
      <li>File B</li>
    </ul>
  </li>
  <li>Standalone File</li>
</ul>
```

Clicking a branch toggles its nested subtree open or closed.

---

## Attributes

### Tree Container

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `tree` | boolean attr | -- | Declares the tree container |
| `tree-drag-mode` | `"reorder"` \| `"transfer"` \| `"both"` | -- | Enables drag-and-drop on the tree |

### Branch (Expandable Item)

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `branch` | boolean attr | -- | Declares an expandable tree item |
| `open` | boolean attr | -- | Start expanded |
| `tree-drag-disabled` | boolean attr | -- | Prevents this specific item from being dragged |

### Subtree (Nested Group)

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `subtree` | boolean attr | -- | Declares a nested group container |

---

## Nested Trees

Trees can be arbitrarily nested. Each `[subtree]` can contain more `[branch]` + `[subtree]` pairs to any depth.

### Initially Expanded Branches

Use the `open` attribute on `[branch]` elements to have them expanded on load:

```html
<ul tree>
  <li branch open>
    Parent (starts expanded)
    <ul subtree>
      <li>Child</li>
    </ul>
  </li>
</ul>
```

---

## Dynamic Trees

Use NoJS loops to render tree structures from data:

```html
<ul tree>
  <li branch each="folder in folders" key="folder.id">
    <span bind="folder.name"></span>
    <ul subtree if="folder.children.length > 0">
      <li each="file in folder.children" key="file.id" bind="file.name"></li>
    </ul>
  </li>
</ul>
```

---

## Selected State

Clicking a branch or leaf item toggles `.nojs-branch-selected` on it. Only one item can be selected at a time within a tree.

---

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `ArrowDown` | Move focus to next visible item |
| `ArrowUp` | Move focus to previous visible item |
| `ArrowRight` | Expand focused branch (if collapsed), or move to first child |
| `ArrowLeft` | Collapse focused branch (if expanded), or move to parent |
| `Home` | Move focus to first item |
| `End` | Move focus to last visible item |
| `Enter` / `Space` | Toggle expand/collapse or select a leaf |

---

## CSS Classes

| Class | When Applied |
|-------|-------------|
| `.nojs-tree` | On the `[tree]` root and every `[subtree]` |
| `.nojs-branch` | On each `[branch]` element |
| `.nojs-subtree` | On each `[subtree]` element |
| `.nojs-branch-selected` | On the currently selected branch |

---

## Built-in Style Behavior

| Selector | Style |
|----------|-------|
| `.nojs-tree` | `list-style: none; padding-left: 0` |
| `.nojs-subtree` | `list-style: none; padding-left: 1.25rem` |
| `.nojs-branch` | `cursor: pointer` with expand/collapse icon via `::before` |
| `.nojs-branch[open] > .nojs-subtree` | Visible |
| `.nojs-branch:not([open]) > .nojs-subtree` | Hidden |
| `.nojs-branch-selected` | `background: rgba(59,130,246,0.1)` |

### Hiding Icons

By default, branches show expand/collapse icons. Override with CSS:

```css
[data-tree-icon]::before { content: none; }
```

---

## Drag & Drop

Enable with `tree-drag-mode` on the tree container.

### Drag Modes

| Mode | Description |
|------|-------------|
| `"reorder"` | Reorder items within the same tree |
| `"transfer"` | Move items between trees |
| `"both"` | Both reorder and transfer |

### Drag Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `tree-drag-mode` | `"reorder"` \| `"transfer"` \| `"both"` | Drag-and-drop mode on the tree container |
| `tree-drag-disabled` | boolean attr | Disable drag on specific items |

### Drag Events

| Event | `$event.detail` | Description |
|-------|-----------------|-------------|
| `tree:drag-start` | `{ item, source }` | Item drag started |
| `tree:drag-over` | `{ item, target, position }` | Dragging over a potential drop target |
| `tree:drop` | `{ item, target, position, source }` | Item dropped |
| `tree:drag-end` | `{ item }` | Drag operation ended |

`position` can be `"before"`, `"after"`, or `"inside"`.

### Visual Feedback

Drop indicators show where the item will land (before, after, or nested inside a branch). The following CSS classes are applied to the target:

| Class | Meaning |
|-------|---------|
| `.nojs-tree-drop-before` | Item will be inserted before the target |
| `.nojs-tree-drop-after` | Item will be inserted after the target |
| `.nojs-tree-drop-inside` | Item will be nested inside the target branch |

### Safety Checks

Cannot drop a branch inside itself or its own descendants (prevents circular nesting).

---

## Accessibility

NoJS automatically applies:

- `role="tree"` on the container
- `role="treeitem"` on each item
- `role="group"` on each subtree
- `aria-expanded="true"/"false"` on branches
- `aria-selected="true"` on the selected item
- `aria-level` indicates nesting depth

---

## Examples

### Basic File Tree

```html
<ul tree>
  <li branch>
    src
    <ul subtree>
      <li branch>
        components
        <ul subtree>
          <li>Header.html</li>
          <li>Footer.html</li>
        </ul>
      </li>
      <li>index.html</li>
      <li>style.css</li>
    </ul>
  </li>
  <li branch>
    docs
    <ul subtree>
      <li>README.md</li>
    </ul>
  </li>
</ul>
```

### Dynamic Tree with Drag-and-Drop

```html
<div state="{ folders: [] }" get="/api/folders | folders">
  <ul tree tree-drag-mode="both"
      on:tree:drop="console.log('Dropped:', $event.detail)">
    <li branch each="folder in folders" key="folder.id">
      <span bind="folder.name"></span>
      <ul subtree if="folder.children.length > 0">
        <li each="file in folder.children" key="file.id" bind="file.name"></li>
      </ul>
    </li>
  </ul>
</div>
```

### Tree with Protected System Items

Use `tree-drag-disabled` to prevent specific items from being dragged:

```html
<ul tree tree-drag-mode="both">
  <li branch tree-drag-disabled>
    System (cannot be moved)
    <ul subtree>
      <li>config.json</li>
    </ul>
  </li>
  <li branch>
    User Files (can be moved)
    <ul subtree>
      <li>notes.txt</li>
    </ul>
  </li>
</ul>
```

---

## Composition with NoJS Directives

The tree directives work with any NoJS directive:

```html
<div state="{ folders: [], selectedFile: null }"
     get="/api/folders | folders">
  <ul tree on:tree:drop="console.log('Moved:', $event.detail)">
    <li branch each="folder in folders" key="folder.id" open>
      <span bind="folder.name"></span>
      <ul subtree if="folder.children.length > 0">
        <li each="file in folder.children" key="file.id"
            on:click="selectedFile = file"
            bind="file.name"></li>
      </ul>
    </li>
  </ul>
  <div if="selectedFile">
    <p>Selected: <span bind="selectedFile.name"></span></p>
  </div>
</div>
```

- Use `each` / `foreach` / `for` to render tree items from data
- Use `bind` / `bind-html` for dynamic item labels
- Use `if` / `show` for conditional subtrees or items
- Use `on:tree:drop` to react to drag-and-drop events
- Use `state` on a parent to share selection state across the tree
