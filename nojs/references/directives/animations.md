# Animation Directives

Enter/leave animations and CSS transitions. No.JS ships with built-in CSS animation names.

## Contents

- [animate](#animate) -- CSS animation on entry
- [animate-enter](#animate-enter) -- CSS animation for entering DOM
- [animate-leave](#animate-leave) -- CSS animation for leaving DOM
- [animate-duration](#animate-duration) -- animation duration in ms
- [animate-stagger](#animate-stagger) -- stagger delay for list items
- [transition](#transition) -- class-based transitions for non-router elements
- [Built-in Animation Names](#built-in-animation-names) -- shipped CSS animation names

---

## Syntax Reference

| Directive | Syntax | Description |
|-----------|--------|-------------|
| `animate` | `animate="animationName"` | Apply CSS animation on entry (shorthand for `animate-enter`) |
| `animate-enter` | `animate-enter="animationName"` | CSS animation when element enters DOM |
| `animate-leave` | `animate-leave="animationName"` | CSS animation when element leaves DOM |
| `animate-duration` | `animate-duration="300"` | Duration in ms to wait before removing animation classes |
| `animate-stagger` | `animate-stagger="50"` | Incremental delay in ms between each loop item's animation |
| `transition` | `transition="name"` | Class-based enter/leave transition (non-router elements) |

---

## `animate`

Apply a CSS animation on element entry. Shorthand for `animate-enter`.

**Syntax:** `<element animate="animationName">`

```html
<div if="visible" animate="fadeIn">Content</div>
```

---

## `animate-enter`

CSS animation for entering the DOM.

**Syntax:** `<element animate-enter="animationName">`

---

## `animate-leave`

CSS animation for leaving the DOM.

**Syntax:** `<element animate-leave="animationName">`

```html
<div if="visible"
     animate-enter="slideInRight"
     animate-leave="slideOutLeft"
     animate-duration="300">
  Content
</div>
```

---

## `animate-duration`

Animation duration in milliseconds. Controls how long No.JS waits before removing animation classes.

**Syntax:** `<element animate="fadeIn" animate-duration="300">`

### Edge Cases

- If `animate-duration` is not set, the animation class is added but not automatically removed. The CSS `animation-duration` in your stylesheet controls the visual timing.
- For leave animations, the element is removed from the DOM after the duration elapses.

---

## `animate-stagger`

Stagger delay between animated list items (milliseconds). Only meaningful on loop elements.

**Syntax:** `<element each="item in items" animate="fadeIn" animate-stagger="50">`

Adds an incremental delay between each item in a loop animation. The first item has no delay, the second has `1 * stagger` ms, the third has `2 * stagger` ms, and so on.

```html
<div each="item in items"
     template="itemTpl"
     animate-enter="fadeInUp"
     animate-leave="fadeOutDown"
     animate-stagger="50">
</div>
```

---

## `transition`

Applies class-based transitions when elements enter/leave the DOM. Used on non-router elements (e.g., with `if`, `show`).

> For route transitions (View Transition API), see the [Routing](routing.md) reference.

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

### Edge Cases

- Class-based transitions on `route-view` elements are deprecated. Use the View Transition API instead.
- The transition name can be any string; the class names are derived by appending `-enter`, `-enter-active`, etc.
- Both `transition` and `animate-*` can be used on the same element, but this is not recommended.

### Complete Example -- Slide Transition

```html
<div state="{ open: false }">
  <button on:click="open = !open">Toggle Panel</button>

  <div show="open" transition="slide" animate-duration="300">
    <p>This panel slides in and out.</p>
  </div>
</div>

<style>
  .slide-enter-active, .slide-leave-active {
    transition: transform 0.3s ease, opacity 0.3s ease;
    overflow: hidden;
  }
  .slide-enter, .slide-leave-to {
    transform: translateY(-10px);
    opacity: 0;
  }
</style>
```

---

## Built-in Animation Names

No.JS ships with these CSS animations ready to use:

| Animation | Type | Description |
|-----------|------|-------------|
| `fadeIn` | Enter | Fade in from transparent |
| `fadeOut` | Leave | Fade out to transparent |
| `fadeInUp` | Enter | Fade in while sliding up |
| `fadeInDown` | Enter | Fade in while sliding down |
| `fadeOutUp` | Leave | Fade out while sliding up |
| `fadeOutDown` | Leave | Fade out while sliding down |
| `slideInLeft` | Enter | Slide in from left |
| `slideInRight` | Enter | Slide in from right |
| `slideOutLeft` | Leave | Slide out to left |
| `slideOutRight` | Leave | Slide out to right |
| `zoomIn` | Enter | Scale up from small |
| `zoomOut` | Leave | Scale down to small |
| `bounceIn` | Enter | Bounce effect on entry |
| `bounceOut` | Leave | Bounce effect on exit |

### Usage Patterns

```html
<!-- Conditional with animation -->
<div if="showAlert"
     animate-enter="bounceIn"
     animate-leave="fadeOut"
     animate-duration="400">
  <p>Alert message!</p>
</div>

<!-- Show/hide with animation -->
<div show="isVisible"
     animate-enter="fadeInUp"
     animate-leave="fadeOutDown"
     animate-duration="300">
  Animated content
</div>

<!-- List with staggered animation -->
<ul>
  <li each="item in items"
      key="item.id"
      animate-enter="slideInRight"
      animate-leave="slideOutLeft"
      animate-stagger="50"
      animate-duration="300">
    <span bind="item.name"></span>
  </li>
</ul>
```

### Complete Example -- Animated Notification Stack

```html
<div state="{ notifications: [] }">
  <button on:click="notifications.push({
    id: Date.now(),
    text: 'Notification ' + (notifications.length + 1)
  })">
    Add Notification
  </button>

  <div each="note in notifications"
       key="note.id"
       animate-enter="slideInRight"
       animate-leave="fadeOutUp"
       animate-stagger="100"
       animate-duration="300"
       class="notification">
    <span bind="note.text"></span>
    <button on:click="notifications.splice($index, 1)">Dismiss</button>
  </div>
</div>
```
