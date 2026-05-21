# No.JS Patterns & Scaffolds Reference

Complete, copy-paste-ready templates and patterns for building applications with No.JS.

## Contents

- [1. Component Scaffolds](#1-component-scaffolds) — Ready-to-use templates for common UI components
  - [Login / Registration Form](#login--registration-form-with-validation) — Form with built-in validation
  - [Data List with Search and Pagination](#data-list-with-search-and-pagination) — Searchable paginated list
  - [Detail View with Route Params](#detail-view-with-route-params) — Route-driven detail display
  - [Card Component with Expand/Collapse](#card-component-with-expandcollapse) — Togglable card UI
  - [Modal Dialog](#modal-dialog) — Overlay dialog pattern
  - [Navigation Bar with Routing](#navigation-bar-with-routing) — Route-aware navbar
  - [Dashboard with Multiple Stores](#dashboard-with-multiple-stores) — Multi-store dashboard layout
  - [CRUD Interface](#crud-interface-list--create--edit--delete) — Full create/read/update/delete pattern
  - [File Upload Form](#file-upload-form) — File upload handling
  - [Infinite Scroll List](#infinite-scroll-list) — Lazy-loading list pattern
- [2. Common Patterns](#2-common-patterns) — Reusable interaction and data patterns
  - [Authentication Flow](#authentication-flow-login-store-token-protected-routes) — Login, token storage, route guards
  - [Shopping Cart](#shopping-cart-global-store-addremove-total) — Global store cart with totals
  - [Theme Switcher](#theme-switcher-darklight-mode-via-store) — Dark/light mode toggling
  - [Search with Debounce](#search-with-debounce) — Debounced search input
  - [Master-Detail Layout](#master-detail-layout) — List-to-detail navigation
  - [Tabs Component](#tabs-component) — Tabbed content switcher
  - [Accordion](#accordion) — Collapsible content sections
  - [Toast Notifications](#toast-notifications) — Notification toast system
  - [Sortable Table with Headers](#sortable-table-with-headers) — Column-sortable data table
  - [Pagination Component](#pagination-component) — Page navigation controls
- [3. Route Transition Patterns](#3-route-transition-patterns) — View Transition API integration
  - [Basic Route Transition](#basic-route-transition-view-transition-api) — Simple view transition setup
  - [Custom View Transition CSS](#custom-view-transition-css) — Styling route transitions
  - [Direction-Aware Slide Transition](#direction-aware-slide-transition) — Directional slide animations
  - [Full SPA with Route Transitions](#full-spa-with-route-transitions) — Complete SPA transition example
  - [Disabling Transitions](#disabling-transitions-for-specific-outlets) — Opt out per outlet
  - [Opting Out of View Transition API](#opting-out-of-view-transition-api) — Disable globally
- [4. Best Practices](#4-best-practices) — Guidelines for production-quality apps
  - [State Scoping: Local vs Global](#state-scoping-local-vs-global) — When to use each scope
  - [Template Organization for Large Apps](#template-organization-for-large-apps) — File structure recommendations
  - [Performance Tips](#performance-tips) — Optimization strategies
  - [Form Validation Patterns](#form-validation-patterns) — Validation best practices
  - [Error Handling Strategies](#error-handling-strategies) — Graceful error management
  - [Live Search with Debounced GET](#live-search-with-debounced-get) — Fetch-based search pattern
  - [Live Polling Dashboard](#live-polling-dashboard) — Auto-refreshing data display
  - [Request + Response Interceptors](#request--response-interceptors-jwt-auth) — JWT auth interceptor setup
  - [`into` -- Write Fetch Response to a Global Store](#into----write-fetch-response-to-a-global-store) — Store fetch results globally
  - [Full SPA Example](#full-spa-example) — Complete single-page application
- [5. SSG / Pre-Rendering Pattern](#5-ssg--pre-rendering-pattern) — Static site generation approach
- [6. Resource Hints](#6-resource-hints) — Preload, prefetch, and preconnect
- [7. CLS Prevention with `skeleton=`](#7-cls-prevention-with-skeleton) — Prevent content layout shift

---

## 1. Component Scaffolds

### Login / Registration Form (with validation)

```html
<div state="{ email: '', password: '', loading: false }">
  <h2>Login</h2>
  <form post="/api/login" validate
        success="#loginSuccess"
        error="#loginError"
        loading="#loginLoading"
        on:submit.prevent="loading = true">
    <div class="field">
      <label>Email</label>
      <input model="email" type="email" name="email"
             validate="required,email"
             error-required="Email is required"
             error-email="Invalid email address">
    </div>
    <div class="field">
      <label>Password</label>
      <input model="password" type="password" name="password"
             validate="required"
             error-required="Password is required">
    </div>
    <p if="$form.firstError" class="error" bind="$form.firstError"></p>
    <button type="submit" bind-disabled="!$form.valid || loading">
      <span hide="loading">Login</span>
      <span show="loading">Signing in...</span>
    </button>
  </form>
</div>

<template id="loginSuccess" var="result">
  <p>Welcome, <span bind="result.user.name"></span>!</p>
</template>

<template id="loginError" var="err">
  <p class="error" bind="err.message"></p>
</template>

<template id="loginLoading">
  <div class="spinner">Logging in...</div>
</template>
```

**Registration variant** with confirm-password:

```html
<div state="{ name: '', email: '', password: '', confirmPassword: '' }">
  <h2>Register</h2>
  <form post="/api/register" validate
        success="#registerSuccess"
        error="#registerError">
    <input model="name" name="name" type="text" placeholder="Full Name"
           required minlength="2"
           error-required="Name is required" />
    <input model="email" name="email" type="email" placeholder="Email"
           required
           error-required="Email is required"
           error-email="Please enter a valid email" />
    <input model="password" name="password" type="password" placeholder="Password"
           required minlength="8"
           pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
           error-required="Password is required"
           error-pattern="Must contain uppercase, lowercase, and a number" />
    <input model="confirmPassword" name="confirmPassword" type="password"
           placeholder="Confirm Password" required
           error-required="Please confirm your password" />
    <p show="confirmPassword && password !== confirmPassword" class="error">
      Passwords do not match
    </p>
    <button type="submit"
            bind-disabled="!$form.valid || password !== confirmPassword">
      Create Account
    </button>
  </form>
</div>

<template id="registerSuccess" var="result">
  <p>Account created! Check your email for verification.</p>
</template>

<template id="registerError" var="err">
  <p class="error" bind="err.message"></p>
</template>
```

---

### Data List with Search and Pagination

```html
<div state="{ search: '', page: 1, perPage: 10 }">
  <input model="search" placeholder="Search..." type="text" />

  <div get="/api/items?q={search}&page={page}&limit={perPage}"
       as="result" debounce="300"
       loading="#listSkeleton"
       error="#listError"
       empty="#noItems">

    <div each="item in result.data" key="item.id"
         animate="fadeIn" animate-stagger="50">
      <h3 bind="item.title"></h3>
      <p bind="item.description | truncate(100)"></p>
      <span bind="item.createdAt | relative"></span>
    </div>

    <div class="pagination">
      <button on:click="page = Math.max(1, page - 1)"
              bind-disabled="page <= 1">Previous</button>
      <span bind="'Page ' + page + ' of ' + result.totalPages"></span>
      <button on:click="page++"
              bind-disabled="page >= result.totalPages">Next</button>
    </div>
  </div>
</div>

<template id="listSkeleton">
  <div class="skeleton-pulse">Loading items...</div>
</template>

<template id="listError" var="err">
  <div class="error">Failed to load: <span bind="err.message"></span></div>
</template>

<template id="noItems">
  <p>No items found.</p>
</template>
```

---

### Detail View with Route Params

```html
<div get="/api/items/{$route.params.id}" as="item"
     loading="#detailSkeleton"
     error="#detailError">
  <template if="item">
    <h1 bind="item.title"></h1>
    <p bind="item.description"></p>
    <span bind="item.createdAt | relative"></span>
    <span bind="item.author.name | capitalize"></span>

    <div class="actions">
      <a bind-href="'/items/' + item.id + '/edit'">Edit</a>
      <button call="/api/items/{item.id}"
              method="delete"
              confirm="Are you sure?"
              redirect="/items">
        Delete
      </button>
    </div>
  </template>
</div>

<template id="detailSkeleton">
  <div class="skeleton">
    <div class="skeleton-title"></div>
    <div class="skeleton-text"></div>
  </div>
</template>

<template id="detailError" var="err">
  <div class="error">
    <p bind="err.message"></p>
    <a route="/items">Back to list</a>
  </div>
</template>
```

---

### Card Component with Expand/Collapse

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

---

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

---

### Navigation Bar with Routing

```html
<nav class="navbar">
  <a route="/" class="logo">MyApp</a>
  <div class="nav-links">
    <a route="/" route-active="active">Home</a>
    <a route="/features" route-active="active">Features</a>
    <a route="/about" route-active="active">About</a>
    <a route="/contact" route-active="active">Contact</a>
  </div>
  <div class="nav-auth">
    <span show="$store.auth.user" bind="$store.auth.user.name"></span>
    <a show="!$store.auth.user" route="/login" route-active="active">Login</a>
    <button show="$store.auth.user"
            call="/api/logout" method="post"
            then="$store.auth.user = null; $store.auth.token = null"
            redirect="/login">
      Logout
    </button>
  </div>
</nav>

<main route-view></main>
```

---

### Dashboard with Multiple Stores

```html
<script>
  NoJS.config({
    baseApiUrl: 'https://api.myapp.com/v1',
    stores: {
      auth:  { user: null, token: localStorage.getItem('token') },
      stats: { revenue: 0, users: 0, orders: 0 },
      ui:    { sidebarOpen: true, theme: 'light' }
    }
  });
</script>

<div class="dashboard"
     class-sidebar-collapsed="!$store.ui.sidebarOpen"
     class-dark="$store.ui.theme === 'dark'">

  <!-- Sidebar -->
  <aside show="$store.ui.sidebarOpen">
    <a route="/dashboard" route-active="active">Overview</a>
    <a route="/dashboard/analytics" route-active="active">Analytics</a>
    <a route="/dashboard/users" route-active="active">Users</a>
    <a route="/dashboard/settings" route-active="active">Settings</a>
  </aside>

  <!-- Main area -->
  <main>
    <header>
      <button on:click="$store.ui.sidebarOpen = !$store.ui.sidebarOpen">
        Toggle Sidebar
      </button>
      <span bind="$store.auth.user.name"></span>
    </header>

    <!-- Stats cards fetched into store -->
    <div get="/api/stats" as="data" into="stats" refresh="60000">
      <div class="stat-grid">
        <div class="stat-card">
          <h3>Revenue</h3>
          <span bind="$store.stats.revenue | currency"></span>
        </div>
        <div class="stat-card">
          <h3>Users</h3>
          <span bind="$store.stats.users | number"></span>
        </div>
        <div class="stat-card">
          <h3>Orders</h3>
          <span bind="$store.stats.orders | number"></span>
        </div>
      </div>
    </div>

    <div route-view></div>
  </main>
</div>
```

---

### CRUD Interface (List + Create + Edit + Delete)

```html
<div state="{ editing: null, showForm: false, name: '', email: '' }">
  <h2>Users</h2>

  <button on:click="showForm = true; editing = null; name = ''; email = ''">
    + New User
  </button>

  <!-- Create / Edit Form -->
  <div show="showForm" animate="slideInDown">
    <form validate on:submit.prevent="true">
      <h3 bind="editing ? 'Edit User' : 'New User'"></h3>
      <input model="name" name="name" placeholder="Name" required />
      <input model="email" name="email" type="email" placeholder="Email" required />

      <!-- Create -->
      <button if="!editing"
              call="/api/users" method="post"
              body='{"name": "{name}", "email": "{email}"}'
              then="showForm = false"
              bind-disabled="!$form.valid">
        Create
      </button>

      <!-- Update -->
      <button if="editing"
              call="/api/users/{editing.id}" method="put"
              body='{"name": "{name}", "email": "{email}"}'
              then="showForm = false"
              bind-disabled="!$form.valid">
        Save
      </button>

      <button type="button" on:click="showForm = false">Cancel</button>
    </form>
  </div>

  <!-- List -->
  <div get="/api/users" as="users"
       loading="#usersSkeleton" empty="#noUsers">
    <table>
      <thead>
        <tr><th>Name</th><th>Email</th><th>Actions</th></tr>
      </thead>
      <tbody>
        <tr each="user in users" key="user.id">
          <td bind="user.name"></td>
          <td bind="user.email"></td>
          <td>
            <button on:click="editing = user; name = user.name; email = user.email; showForm = true">
              Edit
            </button>
            <button call="/api/users/{user.id}" method="delete"
                    confirm="Delete this user?"
                    then="users.splice($index, 1)">
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<template id="usersSkeleton">
  <div class="skeleton-pulse">Loading users...</div>
</template>

<template id="noUsers">
  <p>No users found. Create one above.</p>
</template>
```

---

### File Upload Form

```html
<div state="{ uploading: false, preview: null, fileName: '' }">
  <h2>Upload File</h2>
  <form post="/api/upload" validate
        loading="#uploadLoading"
        success="#uploadSuccess"
        error="#uploadError"
        on:submit.prevent="uploading = true">

    <div class="upload-zone"
         class-dragover="isDragOver"
         on:dragover.prevent="isDragOver = true"
         on:dragleave="isDragOver = false"
         on:drop.prevent="isDragOver = false">

      <input type="file" name="file" ref="fileInput" required
             on:change="fileName = $event.target.files[0]?.name || ''" />

      <p show="!fileName">Drag a file here or click to browse</p>
      <p show="fileName" bind="'Selected: ' + fileName"></p>
    </div>

    <input type="text" name="description" placeholder="Description (optional)" />

    <button type="submit" bind-disabled="!$form.valid || uploading">
      <span hide="uploading">Upload</span>
      <span show="uploading">Uploading...</span>
    </button>
  </form>
</div>

<template id="uploadLoading">
  <div class="progress-bar"><div class="progress-fill"></div></div>
</template>

<template id="uploadSuccess" var="result">
  <p class="success">File uploaded: <span bind="result.filename"></span></p>
</template>

<template id="uploadError" var="err">
  <p class="error" bind="err.message"></p>
</template>
```

---

### Infinite Scroll List

```html
<div state="{ items: [], page: 1, hasMore: true, loading: false }">

  <!-- Initial load -->
  <div get="/api/feed?page=1" as="initial"
       then="items = initial.data; hasMore = initial.hasMore">
  </div>

  <!-- Items -->
  <div each="item in items" key="item.id"
       animate="fadeIn" animate-stagger="30">
    <div class="feed-item">
      <h3 bind="item.title"></h3>
      <p bind="item.excerpt | truncate(150)"></p>
      <span bind="item.date | relative"></span>
    </div>
  </div>

  <!-- Load more trigger -->
  <div show="hasMore && !loading" on:mounted="
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        loading = true;
        page++;
      }
    }).observe($el)
  ">
    <div get="/api/feed?page={page}" as="more"
         then="items = [...items, ...more.data]; hasMore = more.hasMore; loading = false">
    </div>
    <div class="loading-indicator">Loading more...</div>
  </div>

  <p show="!hasMore" class="end-message">No more items to load.</p>
</div>
```

---

## 2. Common Patterns

### Authentication Flow (login, store token, protected routes)

```html
<script>
  NoJS.config({
    baseApiUrl: 'https://api.myapp.com/v1',
    stores: {
      auth: {
        user: null,
        token: localStorage.getItem('token')
      }
    }
  });

  // Attach token to every request
  NoJS.interceptor('request', (url, options) => {
    const token = NoJS.store.auth.token;
    if (token) {
      options.headers['Authorization'] = 'Bearer ' + token;
    }
    return options;
  });

  // Handle 401 globally
  NoJS.interceptor('response', (response) => {
    if (response.status === 401) {
      NoJS.store.auth.user = null;
      NoJS.store.auth.token = null;
      localStorage.removeItem('token');
      NoJS.notify();
      NoJS.router.push('/login');
      throw new Error('Session expired');
    }
    return response;
  });
</script>

<!-- Login page (redirect away if already authenticated) -->
<template route="/login" guard="!$store.auth.user" redirect="/dashboard">
  <div state="{ email: '', password: '', error: '' }">
    <h2>Login</h2>
    <form post="/api/auth/login" validate
          then="$store.auth.user = result.user; $store.auth.token = result.token; localStorage.setItem('token', result.token)"
          redirect="/dashboard"
          error="#loginError">
      <input model="email" name="email" type="email" required />
      <input model="password" name="password" type="password" required />
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<template id="loginError" var="err">
  <p class="error" bind="err.message"></p>
</template>

<!-- Protected route -->
<template route="/dashboard" guard="$store.auth.user" redirect="/login">
  <h1>Dashboard</h1>
  <p>Welcome, <span bind="$store.auth.user.name"></span>!</p>
</template>
```

---

### Shopping Cart (global store, add/remove, total)

```html
<script>
  NoJS.config({
    stores: {
      cart: { items: [], total: 0 }
    }
  });
</script>

<!-- Product list (any page) -->
<div get="/api/products" as="products">
  <div each="product in products" key="product.id" template="productCard"></div>
</div>

<template id="productCard">
  <div class="product-card">
    <h3 bind="product.name"></h3>
    <span bind="product.price | currency"></span>
    <button on:click="
      $store.cart.items.push(product);
      $store.cart.total = $store.cart.items.reduce((s, i) => s + i.price, 0)
    ">Add to Cart</button>
  </div>
</template>

<!-- Cart widget (header/navbar) -->
<div class="cart-widget">
  <span bind="$store.cart.items.length + ' items'"></span>
  <span bind="$store.cart.total | currency"></span>
</div>

<!-- Cart page -->
<template route="/cart">
  <h2>Shopping Cart</h2>
  <div if="$store.cart.items.length === 0">
    <p>Your cart is empty.</p>
  </div>
  <div each="item in $store.cart.items" key="item.id">
    <span bind="item.name"></span>
    <span bind="item.price | currency"></span>
    <button on:click="
      $store.cart.items.splice($index, 1);
      $store.cart.total = $store.cart.items.reduce((s, i) => s + i.price, 0)
    ">Remove</button>
  </div>
  <div class="cart-summary" show="$store.cart.items.length > 0">
    <strong>Total: <span bind="$store.cart.total | currency"></span></strong>
    <button call="/api/checkout" method="post"
            body='{"items": $store.cart.items}'
            then="$store.cart.items = []; $store.cart.total = 0"
            redirect="/checkout/success">
      Checkout
    </button>
  </div>
</template>
```

---

### Theme Switcher (dark/light mode via store)

```html
<script>
  NoJS.config({
    stores: {
      theme: { mode: localStorage.getItem('theme') || 'light' }
    }
  });
</script>

<body class-dark="$store.theme.mode === 'dark'"
      class-light="$store.theme.mode === 'light'">

  <button on:click="
    $store.theme.mode = $store.theme.mode === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', $store.theme.mode)
  ">
    <span show="$store.theme.mode === 'light'">Switch to Dark Mode</span>
    <span show="$store.theme.mode === 'dark'">Switch to Light Mode</span>
  </button>

</body>
```

---

### Search with Debounce

```html
<div state="{ query: '', results: [] }">
  <input model="query" placeholder="Search..."
         type="text" autofocus />

  <div show="query.length >= 2"
       get="/api/search?q={query}"
       as="results"
       debounce="300"
       loading="#searchLoading">

    <div each="item in results" key="item.id"
         animate="fadeIn" animate-stagger="30">
      <a bind-href="'/items/' + item.id" bind="item.title"></a>
      <p bind="item.snippet | truncate(80)"></p>
    </div>

    <p if="results.length === 0">No results for "<span bind="query"></span>"</p>
  </div>

  <p show="query.length > 0 && query.length < 2" class="hint">
    Type at least 2 characters to search.
  </p>
</div>

<template id="searchLoading">
  <div class="skeleton-pulse">Searching...</div>
</template>
```

---

### Master-Detail Layout

```html
<div class="master-detail" state="{ selectedId: null }">

  <!-- Master list -->
  <aside>
    <div get="/api/items" as="items">
      <div each="item in items" key="item.id"
           on:click="selectedId = item.id"
           class-selected="selectedId === item.id">
        <span bind="item.name"></span>
      </div>
    </div>
  </aside>

  <!-- Detail pane -->
  <main>
    <div if="!selectedId">
      <p>Select an item to view details.</p>
    </div>
    <div if="selectedId"
         get="/api/items/{selectedId}" as="detail"
         loading="#detailSkeleton">
      <h2 bind="detail.name"></h2>
      <p bind="detail.description"></p>
      <span bind="detail.updatedAt | relative"></span>
    </div>
  </main>
</div>

<template id="detailSkeleton">
  <div class="skeleton-pulse">Loading details...</div>
</template>
```

---

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

---

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

### Toast Notifications

```html
<script>
  NoJS.config({
    stores: {
      toasts: { items: [] }
    }
  });

  // Helper to show toasts from JavaScript
  function showToast(message, type = 'info', duration = 3000) {
    const id = Date.now();
    NoJS.store.toasts.items.push({ id, message, type });
    NoJS.notify();
    setTimeout(() => {
      const idx = NoJS.store.toasts.items.findIndex(t => t.id === id);
      if (idx > -1) NoJS.store.toasts.items.splice(idx, 1);
      NoJS.notify();
    }, duration);
  }
</script>

<!-- Toast container (place at root level) -->
<div class="toast-container">
  <div each="toast in $store.toasts.items" key="toast.id"
       class-toast-info="toast.type === 'info'"
       class-toast-success="toast.type === 'success'"
       class-toast-error="toast.type === 'error'"
       animate-enter="slideInRight"
       animate-leave="fadeOut">
    <span bind="toast.message"></span>
    <button on:click="
      $store.toasts.items.splice($index, 1)
    ">&times;</button>
  </div>
</div>

<!-- Usage from HTML -->
<button on:click="
  $store.toasts.items.push({ id: Date.now(), message: 'Item saved!', type: 'success' })
">Save</button>
```

---

### Sortable Table with Headers

```html
<div state="{ sortField: 'name', sortDir: 'asc' }">
  <div get="/api/users" as="users">
    <table>
      <thead>
        <tr>
          <th on:click="sortDir = sortField === 'name' && sortDir === 'asc' ? 'desc' : 'asc'; sortField = 'name'"
              class-sorted="sortField === 'name'">
            Name <span show="sortField === 'name'" bind="sortDir === 'asc' ? '&#9650;' : '&#9660;'"></span>
          </th>
          <th on:click="sortDir = sortField === 'email' && sortDir === 'asc' ? 'desc' : 'asc'; sortField = 'email'"
              class-sorted="sortField === 'email'">
            Email <span show="sortField === 'email'" bind="sortDir === 'asc' ? '&#9650;' : '&#9660;'"></span>
          </th>
          <th on:click="sortDir = sortField === 'role' && sortDir === 'asc' ? 'desc' : 'asc'; sortField = 'role'"
              class-sorted="sortField === 'role'">
            Role <span show="sortField === 'role'" bind="sortDir === 'asc' ? '&#9650;' : '&#9660;'"></span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr foreach="user in users"
            key="user.id"
            sort="user[sortField]"
            filter="true">
          <td bind="user.name"></td>
          <td bind="user.email"></td>
          <td bind="user.role | capitalize"></td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

**Alternate with `foreach` sort direction:**

```html
<li foreach="user in users"
    sort="sortDir === 'desc' ? '-' + sortField : sortField"
    key="user.id">
  <span bind="user[sortField]"></span>
</li>
```

---

### Pagination Component

```html
<div state="{ page: 1, perPage: 20 }">

  <div get="/api/data?page={page}&per_page={perPage}" as="result">

    <!-- Content -->
    <div each="item in result.items" key="item.id">
      <span bind="item.name"></span>
    </div>

    <!-- Pagination controls -->
    <div class="pagination" show="result.totalPages > 1">
      <button on:click="page = 1" bind-disabled="page === 1">First</button>
      <button on:click="page = Math.max(1, page - 1)"
              bind-disabled="page === 1">Prev</button>

      <span bind="'Page ' + page + ' of ' + result.totalPages"></span>

      <button on:click="page = Math.min(result.totalPages, page + 1)"
              bind-disabled="page === result.totalPages">Next</button>
      <button on:click="page = result.totalPages"
              bind-disabled="page === result.totalPages">Last</button>
    </div>

    <div class="page-info">
      <span bind="result.total + ' total items'"></span>
      <select model="perPage" on:change="page = 1">
        <option value="10">10 per page</option>
        <option value="20">20 per page</option>
        <option value="50">50 per page</option>
      </select>
    </div>
  </div>
</div>
```

---

## 3. Route Transition Patterns

### Basic Route Transition (View Transition API)

The recommended way to add transitions between routes. Just add `transition` to the `route-view` outlet:

```html
<main route-view transition="slide"></main>
```

No additional CSS or configuration needed -- built-in presets handle everything.

### Custom View Transition CSS

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

### Direction-Aware Slide Transition

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

### Full SPA with Route Transitions

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

### Disabling Transitions for Specific Outlets

Use `transition="none"` on outlets that should not animate:

```html
<main route-view transition="slide"></main>
<aside route-view="sidebar" transition="none"></aside>
```

### Opting Out of View Transition API

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

## 4. Best Practices

### State Scoping: Local vs Global

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

### Template Organization for Large Apps

Use file-based routing with remote templates to keep things modular:

```
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

### Performance Tips

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

### Form Validation Patterns

**Progressive validation** -- show errors only after the user interacts:

```html
<form validate validate-on="blur" error-class="is-invalid">
  <input name="email" type="email" required
         error-required="Email is required"
         error-email="Please enter a valid email" />
  <!-- error class appears only after focus+blur -->
</form>
```

**Conditional fields:**

```html
<form validate>
  <label>
    <input type="checkbox" on:change="hasCompany = $event.target.checked" />
    I represent a company
  </label>
  <input name="company" required
         validate-if="hasCompany"
         placeholder="Company name" />
</form>
```

**Custom validators:**

```html
<script>
  NoJS.validator('strongPassword', (value) => {
    if (value.length < 8) return 'At least 8 characters required';
    if (!/[A-Z]/.test(value)) return 'Must contain an uppercase letter';
    if (!/[0-9]/.test(value)) return 'Must contain a number';
    return true;
  });
</script>

<input type="password" name="password" validate="strongPassword" />
```

**Per-field state display:**

```html
<form validate>
  <input name="email" type="email" required as="emailField" />
  <p show="emailField.touched && !emailField.valid"
     bind="emailField.error"
     class="field-error"></p>
</form>
```

---

### Error Handling Strategies

**Per-request error templates:**

```html
<div get="/api/data" as="data"
     error="#dataError"
     retry="3"
     retry-delay="2000">
  <span bind="data.value"></span>
</div>

<template id="dataError" var="err">
  <div class="error-box">
    <p bind="err.message"></p>
    <button on:click="$el.parentElement.dispatchEvent(new Event('retry'))">
      Retry
    </button>
  </div>
</template>
```

**Error boundaries** for isolating failures:

```html
<div error-boundary="#fallback">
  <!-- If anything here throws, fallback renders instead -->
  <div get="/api/fragile" as="data">
    <span bind="data.deep.nested.value"></span>
  </div>
</div>

<template id="fallback" var="err">
  <div class="error-boundary">
    <h3>Something went wrong</h3>
    <pre bind="err.message"></pre>
  </div>
</template>
```

**Global error handler** for logging and 401 redirects:

```html
<script>
  NoJS.on('error', (error, context) => {
    console.error('[NoJS]', error);
    // Send to error tracking (Sentry, etc.)
  });

  NoJS.on('fetch:error', (url, error) => {
    if (error.status === 401) {
      NoJS.store.auth.user = null;
      NoJS.notify();
      NoJS.router.push('/login');
    }
  });
</script>
```

---

### Live Search with Debounced GET

Uses `watch` + `debounce` on a reactive URL to fire requests 300ms after typing stops:

```html
<div state="{ query: '' }">
  <input model="query" placeholder="Search products...">

  <div get="/products?q={query}"
       watch="query"
       debounce="300"
       as="results">

    <p show="!results.length && query">
      No results for <strong bind="query"></strong>
    </p>

    <div each="item in results">
      <span bind="item.name"></span>
      <span bind="item.price | currency"></span>
    </div>
  </div>
</div>
```

---

### Live Polling Dashboard

Auto-refreshes every 5 seconds using `refresh`. Polling stops when the element disconnects from the DOM:

```html
<div get="/api/status" refresh="5000" as="s">
  <span class-success="s.healthy"
        class-error="!s.healthy"
        bind="s.healthy ? 'Online' : 'Degraded'">
  </span>

  <div each="metric in s.metrics">
    <span bind="metric.label"></span>
    <span bind="metric.value | number"></span>
  </div>
</div>
```

---

### Request + Response Interceptors (JWT Auth)

Pair a request interceptor (stamps tokens) with a response interceptor (revokes on 401):

```html
<script>
  // Stamp JWT on every outgoing request
  NoJS.interceptor('request', (url, opts) => {
    const token = NoJS.store.auth?.token;
    if (token) {
      opts.headers = opts.headers || {};
      opts.headers['Authorization'] = 'Bearer ' + token;
    }
    return opts;
  });

  // Revoke session on 401/403
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
```

---

### `into` -- Write Fetch Response to a Global Store

Use `into` to write API responses directly into a named global store, making the data available across the entire page:

```html
<div store="user" value="{ profile: null }"></div>

<!-- Fetch and write into the store -->
<div get="/api/me" into="user.profile"></div>

<!-- Access from anywhere -->
<span bind="$store.user.profile.name"></span>
```

---

### Full SPA Example

Login + JWT interceptors + dashboard + validation -- all integrated:

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

## 5. SSG / Pre-Rendering Pattern

No.JS reads its initial state from the `state=` attribute. Pre-populating it server-side means the browser displays content instantly — no fetch required, fully indexed by Googlebot.

```html
<!-- HTML generated by SSG / server with inline data -->
<div id="app" state='{"product": {"name": "Sneaker X", "price": 299, "slug": "sneaker-x"}}'>
  <h1 bind="product.name"></h1>           <!-- "Sneaker X" — in initial HTML -->
  <span bind="'$' + product.price"></span> <!-- "$299" — in initial HTML -->
  <button post="/api/cart/add" body='{"id":"sneaker-x"}' then="cart.count++">
    Add to cart
  </button>
</div>
```

**When to use `state=` vs `get=`:**

| Content type | Approach | Why |
|---|---|---|
| SEO-critical (title, description, main content) | `state=` pre-rendered | Indexed immediately, no fetch required |
| User-specific (cart, preferences, session) | `get=` | Changes per user — can't be pre-rendered |
| Frequently updated (stock, prices) | `get=` + `refresh=` | Needs to be live |
| Static references (nav, categories) | `state=` pre-rendered | Rarely changes |

**Eleventy example (`product.njk`):**

```html
---
layout: base.html
---
<div id="app" state='{{ product | dump }}'>
  <!-- {{ product | dump }} serializes product to a JSON string (Nunjucks filter) -->
  <h1 bind="product.name"></h1>
  <p bind="product.description"></p>
</div>
```

**Security:** Always HTML-escape JSON values to prevent XSS:

```js
const stateJson = JSON.stringify(product)
  .replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
```

**Head management in SSG:** For multi-page SSG sites, `<title>` and `<meta>` are rendered by the SSG template. For SPAs with a router, use route head attributes (`page-title`, `page-description`, etc.) on `<template route>`.

---

## 6. Resource Hints

No.JS automatically injects resource hints into `<head>` for performance:

- **`preload`** — for static `get=` URLs (API requests started before JS renders the component)
- **`preconnect`** — for cross-origin `get=` URLs (DNS + TLS handshake resolved early)
- **`prefetch`** — for `<template route src="...">` entries (route files loaded in background)

All hints are deduplicated — no duplicates if the same URL already has a hint.

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

## 7. CLS Prevention with `skeleton=`

The `skeleton=` attribute keeps a pre-rendered placeholder visible while a request is in flight, preventing Cumulative Layout Shift (CLS). Unlike `loading=` (which clones a template via JS), the skeleton is already in the DOM — no layout shift.

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

The skeleton is hidden automatically when the response arrives (success, cache hit, empty, or error). Start the skeleton **visible** — No.JS controls its `display` via inline style.
