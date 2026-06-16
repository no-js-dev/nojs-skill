# SPA & Routing Patterns

Patterns for single-page application routing, view transitions, nested routes, file-based routing, 404 handling, UI components, and template organization in No.JS applications.

## Contents

- [Full SPA Example](#full-spa-example)
- [Full SPA with Route Transitions](#full-spa-with-route-transitions)
- [Basic Route Transition (View Transition API)](#basic-route-transition)
- [Custom View Transition CSS](#custom-view-transition-css)
- [Direction-Aware Slide Transition](#direction-aware-slide-transition)
- [Disabling Transitions](#disabling-transitions)
- [Opting Out of View Transition API](#opting-out-of-view-transition-api)
- [Nested Routes with Named Outlets](#nested-routes-with-named-outlets)
- [File-Based Routing](#file-based-routing)
- [404 Catch-All Route](#404-catch-all-route)
- [UI Components](#ui-components)
  - [Card with Expand/Collapse](#card-with-expandcollapse)
  - [Modal Dialog](#modal-dialog)
  - [Tabs Component](#tabs-component)
  - [Accordion](#accordion)
- [Template Organization for Large Apps](#template-organization-for-large-apps)
- [State Scoping: Local vs Global](#state-scoping-local-vs-global)
- [Performance Tips](#performance-tips)
- [Resource Hints](#resource-hints)
- [CLS Prevention with `skeleton=`](#cls-prevention-with-skeleton)

---

## When to Use These Patterns

Use SPA patterns when your application needs:

- **Client-side routing** -- navigating between views without full page reloads
- **View transitions** -- animated transitions between routes using the View Transition API or class-based fallbacks
- **Nested layouts** -- shared layouts with multiple outlets (e.g. sidebar + main content)
- **File-based routing** -- automatic route resolution from a folder of `.tpl` files
- **404 handling** -- catch-all routes for unmatched URLs
- **Template modularity** -- splitting a large app into remote template files

---

## Full SPA Example

Login + JWT interceptors + dashboard + validation -- all integrated.

> **Note:** This example uses `localStorage` for token persistence for demonstration purposes only. See the [auth patterns security warning](auth.md#authentication-flow) for production guidance.

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.no-js.dev/"></script>
  <script>
    NoJS.config({
      baseApiUrl: 'https://api.myapp.com/v1',
      router: { useHash: false }
    });

    NoJS.interceptor('request', (url, opts) => {
      const token = NoJS.store.auth.token;
      if (token) {
        opts.headers = opts.headers || {};
        opts.headers['Authorization'] = 'Bearer ' + token;
      }
      return opts;
    });

    NoJS.interceptor('response', (response) => {
      if (response.status === 401 || response.status === 403) {
        NoJS.store.auth.user = null;
        NoJS.store.auth.token = null;
        NoJS.notify();
        NoJS.router.push('/login');
        throw new Error('Session expired');
      }
      return response;
    });
  </script>
</head>
<body>

  <div store="auth" value="{ user: null, token: null }"></div>

  <nav>
    <a route="/" route-active="active">Home</a>
    <a route="/dashboard" route-active="active" show="$store.auth.token">Dashboard</a>
    <a route="/login" show="!$store.auth.token">Login</a>
    <button on:click="$store.auth.user = null; $store.auth.token = null"
            show="$store.auth.token">
      Sign out
    </button>
  </nav>

  <main route-view></main>

  <template route="/">
    <h1>Welcome to MyApp</h1>
  </template>

  <template route="/login" guard="!$store.auth.token" redirect="/dashboard">
    <form post="/auth/login" validate success="#auth-ok" error="#auth-err">
      <input name="email" type="email" required validate="email"
             error-required="Email is required"
             error-email="Please enter a valid email">
      <input name="password" type="password" required minlength="8"
             error-required="Password is required">
      <button type="submit" bind-disabled="!$form.valid || $form.submitting">
        <span hide="$form.submitting">Sign in</span>
        <span show="$form.submitting">Signing in...</span>
      </button>
      <p if="$form.firstError" bind="$form.firstError" class="error"></p>
    </form>
  </template>

  <template id="auth-ok" var="res">
    <script>
      NoJS.store.auth.user = res.user;
      NoJS.store.auth.token = res.token;
      NoJS.notify();
      NoJS.router.push('/dashboard');
    </script>
  </template>
  <template id="auth-err" var="err">
    <p bind="err.message" animate="shake" class="error"></p>
  </template>

  <template route="/dashboard" guard="$store.auth.token" redirect="/login">
    <div get="/me/dashboard" as="data" loading="#dashLoading">
      <h1 bind="'Welcome, ' + data.user.name"></h1>
      <div each="m in data.metrics" animate-enter="fadeInUp" animate-stagger="50">
        <span bind="m.label"></span>
        <span bind="m.value | number"></span>
      </div>
    </div>
  </template>

  <template id="dashLoading">
    <div class="skeleton">Loading dashboard...</div>
  </template>

</body>
</html>
```

---

## Full SPA with Route Transitions

```html
<script src="https://cdn.no-js.dev/"></script>

<nav>
  <a route="/" route-active="active">Home</a>
  <a route="/about" route-active="active">About</a>
  <a route="/contact" route-active="active">Contact</a>
</nav>

<main route-view transition="slide"></main>

<template route="/">
  <h1>Home</h1>
  <p>Welcome to our site.</p>
</template>

<template route="/about">
  <h1>About</h1>
  <p>Learn more about us.</p>
</template>

<template route="/contact">
  <h1>Contact</h1>
  <p>Get in touch.</p>
</template>
```

---

## Basic Route Transition

The recommended way to add transitions between routes. Just add `transition` to the `route-view` outlet:

```html
<main route-view transition="slide"></main>
```

No additional CSS or configuration needed -- built-in presets handle everything.

---

## Custom View Transition CSS

Override the built-in presets with custom animations using `::view-transition-*` pseudo-elements:

```css
/* Custom cross-fade with blur effect */
::view-transition-old(route-content) {
  animation: blur-fade-out 0.4s ease-out;
}
::view-transition-new(route-content) {
  animation: blur-fade-in 0.4s ease-in;
}

@keyframes blur-fade-out {
  from { opacity: 1; filter: blur(0); }
  to { opacity: 0; filter: blur(4px); }
}
@keyframes blur-fade-in {
  from { opacity: 0; filter: blur(4px); }
  to { opacity: 1; filter: blur(0); }
}
```

---

## Direction-Aware Slide Transition

The `slide` preset automatically handles direction. To customize the directional behavior:

```css
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

@keyframes slide-out-left {
  to { transform: translateX(-100%); opacity: 0; }
}
@keyframes slide-in-right {
  from { transform: translateX(100%); opacity: 0; }
}
@keyframes slide-out-right {
  to { transform: translateX(100%); opacity: 0; }
}
@keyframes slide-in-left {
  from { transform: translateX(-100%); opacity: 0; }
}
```

---

## Disabling Transitions

Use `transition="none"` on outlets that should not animate:

```html
<main route-view transition="slide"></main>
<aside route-view="sidebar" transition="none"></aside>
```

---

## Opting Out of View Transition API

Fall back to legacy class-based transitions:

```html
<script>
  NoJS.config({
    router: { viewTransition: false }
  });
</script>

<!-- Now transition="fade" uses class-based {name}-enter / {name}-leave -->
<main route-view transition="fade"></main>
```

```css
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
```

---

## Nested Routes with Named Outlets

Use named `route-view` outlets to render different content areas from the same route:

```html
<script>
  NoJS.config({
    stores: {
      auth: { user: null },
      ui: { sidebarOpen: true }
    }
  });
</script>

<!-- Layout shell -->
<div class="app-layout">
  <aside show="$store.ui.sidebarOpen">
    <a route="/dashboard" route-active="active">Overview</a>
    <a route="/dashboard/analytics" route-active="active">Analytics</a>
    <a route="/dashboard/settings" route-active="active">Settings</a>
  </aside>

  <main route-view transition="slide"></main>
</div>

<!-- Parent route with nested outlet -->
<template route="/dashboard">
  <h1>Dashboard</h1>
  <div get="/api/stats" as="stats" refresh="30000">
    <div class="stat-grid">
      <div class="stat-card">
        <span bind="stats.users | number"></span>
        <label>Users</label>
      </div>
      <div class="stat-card">
        <span bind="stats.revenue | currency"></span>
        <label>Revenue</label>
      </div>
    </div>
  </div>
</template>

<template route="/dashboard/analytics">
  <h1>Analytics</h1>
  <div get="/api/analytics" as="data" loading="#analyticsLoading">
    <div each="metric in data.metrics" key="metric.id">
      <span bind="metric.label"></span>
      <span bind="metric.value | number"></span>
    </div>
  </div>
</template>

<template route="/dashboard/settings">
  <h1>Settings</h1>
  <form post="/api/settings" validate success="#settingsSaved">
    <input name="displayName" required placeholder="Display Name" />
    <button type="submit" bind-disabled="!$form.valid">Save</button>
  </form>
</template>

<template id="analyticsLoading">
  <div class="skeleton-pulse">Loading analytics...</div>
</template>

<template id="settingsSaved">
  <p class="success">Settings saved.</p>
</template>
```

---

## File-Based Routing

Enable automatic route resolution from a folder of `.tpl` files. No explicit `<template route="...">` needed for simple pages.

```html
<!-- File-based routing is enabled by default (config router.templates: "pages") -->
<main route-view src="./pages/"></main>
```

When a user navigates to `/analytics`, No.JS resolves it to `pages/analytics.tpl`, fetches it, caches it, and renders it automatically.

### Mixing Explicit and File-Based Routes

Explicit `<template route="...">` declarations always take priority. Combine both approaches for maximum flexibility:

```html
<!-- File-based routing handles most pages automatically -->
<main route-view src="./pages/"></main>

<!-- Explicit route for param-based pages -->
<template route="/users/:id" src="./pages/user-detail.tpl"></template>

<!-- Explicit route with guard -->
<template route="/admin" src="./pages/admin.tpl"
          guard="$store.auth.isAdmin" redirect="/"></template>
```

### File-Based Routing Attributes

| Attribute | Default | Description |
|-----------|---------|-------------|
| `src` | `"pages"` | Base folder for template resolution (per-outlet override) |
| `route-index` | `"index"` | Filename for the root route `/` |
| `ext` | `".tpl"` | File extension appended to route segments |
| `i18n-ns` | -- | When present, auto-derives i18n namespace from filename |

---

## 404 Catch-All Route

Use a wildcard route to handle unmatched URLs. If you do not define a `route="*"` template, No.JS shows a minimal built-in 404 page automatically.

```html
<!-- Custom 404 page -->
<template route="*">
  <div class="not-found">
    <h1>404</h1>
    <p>Page not found.</p>
    <a route="/">Go Home</a>
  </div>
</template>
```

You can also use `$route.path` to show what was requested:

```html
<template route="*">
  <div class="not-found">
    <h1>404 -- Not Found</h1>
    <p>The page <code bind="$route.path"></code> does not exist.</p>
    <a route="/">Return to Home</a>
  </div>
</template>
```

---

## UI Components

Common UI building blocks used across SPA pages and routes.

### Card with Expand/Collapse

```html
<div class="card" state="{ expanded: false }">
  <div class="card-header">
    <h3 bind="title"></h3>
    <button on:click="expanded = !expanded">
      <span hide="expanded">&#x25B8;</span>
      <span show="expanded">&#x25BE;</span>
    </button>
  </div>
  <div class="card-body" show="expanded" animate="slideDown">
    <p bind="description"></p>
  </div>
</div>
```

**Reusable card via template:**

```html
<template id="expandable-card" var="card">
  <div class="card" state="{ expanded: false }">
    <div class="card-header" on:click="expanded = !expanded">
      <h3 bind="card.title"></h3>
      <span bind="expanded ? '−' : '+'"></span>
    </div>
    <div class="card-body" show="expanded"
         animate-enter="slideInDown"
         animate-leave="slideOutUp"
         animate-duration="200">
      <p bind="card.body"></p>
      <span class="meta" bind="card.date | relative"></span>
    </div>
  </div>
</template>

<!-- Usage -->
<div each="card in cards" key="card.id" template="expandable-card"></div>
```

### Modal Dialog

```html
<div state="{ open: false }">
  <button on:click="open = true">Open Modal</button>

  <div class="modal-overlay" show="open" on:click.self="open = false"
       animate-enter="fadeIn" animate-leave="fadeOut">
    <div class="modal-content"
         animate-enter="slideInUp"
         animate-leave="slideOutDown">
      <div class="modal-header">
        <h2>Modal Title</h2>
        <button on:click="open = false">&times;</button>
      </div>
      <div class="modal-body">
        <p>Modal content goes here.</p>
      </div>
      <div class="modal-footer">
        <button on:click="open = false" class="btn-secondary">Cancel</button>
        <button on:click="handleConfirm(); open = false" class="btn-primary">
          Confirm
        </button>
      </div>
    </div>
  </div>
</div>
```

**Reusable confirm dialog:**

```html
<template id="confirm-dialog">
  <div class="modal-overlay" show="confirmOpen" on:click.self="confirmOpen = false"
       animate-enter="fadeIn" animate-leave="fadeOut">
    <div class="modal-content modal-sm">
      <h3 bind="confirmTitle"></h3>
      <p bind="confirmMessage"></p>
      <div class="modal-footer">
        <button on:click="confirmOpen = false">Cancel</button>
        <button on:click="confirmCallback(); confirmOpen = false" class="btn-danger">
          Confirm
        </button>
      </div>
    </div>
  </div>
</template>
```

### Tabs Component

```html
<div state="{ activeTab: 'overview' }">
  <div class="tab-bar">
    <button on:click="activeTab = 'overview'"
            class-active="activeTab === 'overview'">Overview</button>
    <button on:click="activeTab = 'details'"
            class-active="activeTab === 'details'">Details</button>
    <button on:click="activeTab = 'reviews'"
            class-active="activeTab === 'reviews'">Reviews</button>
  </div>

  <div class="tab-content">
    <div show="activeTab === 'overview'" animate="fadeIn">
      <h3>Overview</h3>
      <p>Overview content here.</p>
    </div>
    <div show="activeTab === 'details'" animate="fadeIn">
      <h3>Details</h3>
      <p>Detail content here.</p>
    </div>
    <div show="activeTab === 'reviews'" animate="fadeIn">
      <h3>Reviews</h3>
      <p>Review content here.</p>
    </div>
  </div>
</div>
```

### Accordion

```html
<div state="{ openIndex: -1 }">
  <div each="section in sections" key="section.id">
    <div class="accordion-header"
         on:click="openIndex = openIndex === $index ? -1 : $index"
         class-open="openIndex === $index">
      <span bind="section.title"></span>
      <span bind="openIndex === $index ? '−' : '+'"></span>
    </div>
    <div class="accordion-body"
         show="openIndex === $index"
         animate="slideDown">
      <p bind="section.content"></p>
    </div>
  </div>
</div>
```

**Multi-open variant** (tracks open state per item):

```html
<div state="{ openItems: {} }">
  <div each="section in sections" key="section.id">
    <div class="accordion-header"
         on:click="openItems[section.id] = !openItems[section.id]"
         class-open="openItems[section.id]">
      <span bind="section.title"></span>
    </div>
    <div class="accordion-body"
         show="openItems[section.id]"
         animate="slideDown">
      <p bind="section.content"></p>
    </div>
  </div>
</div>
```

---

## Template Organization for Large Apps

Use file-based routing with remote templates to keep things modular:

```text
project/
  index.html
  components/
    header.tpl
    sidebar.tpl
    footer.tpl
  pages/
    index.tpl          <- /
    dashboard.tpl      <- /dashboard
    users.tpl          <- /users
    settings.tpl       <- /settings
  locales/
    en.json
    es.json
```

```html
<!-- index.html - minimal shell -->
<script src="https://cdn.no-js.dev/"></script>
<script>
  NoJS.config({
    stores: { auth: { user: null } },
    router: { templates: 'pages' }
  });
</script>

<template src="./components/header.tpl"></template>
<main route-view src="./pages/" route-index="index"></main>
<template src="./components/footer.tpl"></template>
```

Each `.tpl` file is a self-contained piece of HTML. No.JS fetches and caches them automatically.

---

## State Scoping: Local vs Global

**Use `state` (local)** for UI-only concerns:

- Form field values
- Toggle states (expanded, visible, active tab)
- Temporary data that does not need to survive navigation

**Use `store` (global)** for cross-component, cross-route data:

- Auth/user session
- Shopping cart
- Theme/locale preferences
- Data that multiple routes read

```html
<!-- LOCAL: toggle only matters to this element -->
<div state="{ open: false }">
  <button on:click="open = !open">Toggle</button>
  <div show="open">Content</div>
</div>

<!-- GLOBAL: auth state is shared everywhere -->
<div store="auth" value="{ user: null, token: null }"></div>
<span bind="$store.auth.user.name"></span>
```

**Rule of thumb:** If only one DOM subtree cares about the value, use `state`. If two or more unrelated sections need it, use `store`.

---

## Performance Tips

| Tip | Why |
|-----|-----|
| Prefer `show`/`hide` over `if` for frequently toggled content | `show` toggles CSS display; `if` destroys and recreates DOM nodes |
| Always add `key` on loops | Enables efficient DOM diffing so only changed items re-render |
| Use `cached` on GET requests for static data | Avoids redundant network requests; supports memory, localStorage, sessionStorage |
| Use `debounce` on reactive URLs driven by user input | Prevents rapid re-fetches while typing |
| Use `lazy="ondemand"` on heavy route templates | Templates are only fetched the first time the user navigates there |
| Use `template` attribute on loops instead of inline content | Named templates are cloned more efficiently and are reusable |
| Keep expressions simple | Complex logic in attribute values is hard to read; use `computed` for derived state |
| Use `foreach`/`each`/`for` with `limit`/`offset` for large lists | Renders only a subset; combine with pagination for virtual-scroll-like behavior |

---

## Resource Hints

No.JS automatically injects resource hints into `<head>` for performance:

- **`preload`** -- for static `get=` URLs (API requests started before JS renders the component)
- **`preconnect`** -- for cross-origin `get=` URLs (DNS + TLS handshake resolved early)
- **`prefetch`** -- for `<template route src="...">` entries (route files loaded in background)

All hints are deduplicated -- no duplicates if the same URL already has a hint.

**Build-time injection** (recommended for LCP):

```sh
node scripts/inject-resource-hints.js "dist/**/*.html"
```

Add to `package.json`:

```json
{ "scripts": { "build": "your-bundler && node scripts/inject-resource-hints.js" } }
```

The build-time script injects the same hints into static HTML before the browser executes any JavaScript, maximizing LCP improvement. Dynamic URLs with `{interpolation}` are skipped.

**Note on `crossorigin`:** All hints use `crossorigin="anonymous"`. For APIs that require cookies or an `Authorization` header, write the hint manually with `crossorigin="use-credentials"`.

---

## CLS Prevention with `skeleton=`

The `skeleton=` attribute keeps a pre-rendered placeholder visible while a request is in flight, preventing Cumulative Layout Shift (CLS). Unlike `loading=` (which clones a template via JS), the skeleton is already in the DOM -- no layout shift.

```html
<!-- Skeleton starts visible in HTML (no display:none in CSS) -->
<div id="product-skeleton" class="skeleton-card">
  <div class="skeleton-line"></div>
  <div class="skeleton-line short"></div>
</div>

<!-- skeleton= points to the element's id (without #) -->
<div get="/api/products/42" as="product" skeleton="product-skeleton">
  <h1 bind="product.name"></h1>
  <p bind="product.description"></p>
</div>
```

The skeleton is hidden automatically when the response arrives (success, cache hit, empty, or error). Start the skeleton **visible** -- No.JS controls its `display` via inline style.
