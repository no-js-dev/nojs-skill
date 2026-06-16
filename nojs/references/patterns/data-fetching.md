# Data Fetching Patterns

Patterns for loading, searching, paginating, polling, and caching data in No.JS applications.

## Contents

- [Data List with Search and Pagination](#data-list-with-search-and-pagination)
- [Search with Debounce](#search-with-debounce)
- [Live Search with Debounced GET](#live-search-with-debounced-get)
- [Infinite Scroll List](#infinite-scroll-list)
- [Cursor-Based Infinite Scroll](#cursor-based-infinite-scroll)
- [Load More Button](#load-more-button)
- [Pagination Component](#pagination-component)
- [Live Polling Dashboard](#live-polling-dashboard)
- [`into` -- Write Fetch Response to a Global Store](#into----write-fetch-response-to-a-global-store)
- [Detail View with Route Params](#detail-view-with-route-params)
- [Master-Detail Layout](#master-detail-layout)
- [Error Handling Strategies](#error-handling-strategies)
- [Dashboard with Multiple Stores](#dashboard-with-multiple-stores)

---

## When to Use These Patterns

Use data fetching patterns when your application needs:

- **Search** -- reactive search inputs that query an API with debouncing
- **Pagination** -- offset-based or cursor-based page navigation
- **Infinite scroll** -- automatic loading as the user scrolls, using `get-trigger`/`get-insert`/`get-page`
- **Polling** -- auto-refreshing data on a timer using `refresh`
- **Caching** -- avoiding redundant network requests with `cached`
- **Store hydration** -- writing API responses into global stores with `into`

---

## Data List with Search and Pagination

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
      <p bind="item.description | truncate:100"></p>
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

## Search with Debounce

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
      <p bind="item.snippet | truncate:80"></p>
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

## Live Search with Debounced GET

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

## Infinite Scroll List

Uses Core's built-in pagination directives (`get-trigger="scroll"`, `get-insert`, `get-page`) instead of manual JavaScript. The framework handles IntersectionObserver, page tracking, and end-of-data detection automatically.

```html
<!-- Infinite scroll — Core handles viewport detection and page incrementing -->
<div get="/api/feed?page={page}" as="items"
     get-trigger="scroll"
     get-insert="append"
     get-page="1"
     get-threshold="200"
     loading="#feedLoading"
     empty="#feedEmpty">

  <div each="item in items" key="item.id"
       animate="fadeIn" animate-stagger="30">
    <div class="feed-item">
      <h3 bind="item.title"></h3>
      <p bind="item.excerpt | truncate:150"></p>
      <span bind="item.date | relative"></span>
    </div>
  </div>
</div>

<template id="feedLoading">
  <div class="loading-indicator">Loading more...</div>
</template>

<template id="feedEmpty">
  <p class="end-message">No items found.</p>
</template>
```

> **How it works:** `get-trigger="scroll"` creates an IntersectionObserver on a sentinel element. When the sentinel enters the viewport (controlled by `get-threshold`), the next page is fetched and appended. Pagination stops automatically when the server returns an empty response.

### Directive Reference

| Attribute | Type | Description |
|-----------|------|-------------|
| `get-trigger` | `string` | How the next page is requested: `"scroll"` (IntersectionObserver-based), `"button"` (auto-generated "Load More"), or `"visible"` (fetch when element enters viewport) |
| `get-trigger-label` | `string` | Label text for the load-more button (default: `"Load More"`) |
| `get-insert` | `string` | How new data is inserted: `"append"` (after existing) or `"prepend"` (before existing). **Required** for `scroll` and `button` triggers -- without it, content is replaced |
| `get-page` | `number` | Enable offset-based pagination. Sets the initial page number (default: `1`). Auto-increments on each fetch. Use `{page}` in the URL |
| `get-cursor` | _(boolean)_ | Enable cursor-based pagination. The cursor value is extracted from each response and used via `{cursor}` in the URL |
| `get-cursor-field` | `string` | JSON field name to extract the next cursor from (e.g. `"nextCursor"`) |
| `get-threshold` | `string` | `rootMargin` for the IntersectionObserver. Default: `"200px"` for `scroll`, `"0px"` for `visible` |

> **Note:** `get-cursor` and `get-page` are mutually exclusive. If both are set, cursor-based pagination takes precedence with a console warning.

---

## Cursor-Based Infinite Scroll

For cursor-based APIs, replace `get-page` with `get-cursor`:

```html
<div get="/api/feed?after={cursor}" as="items"
     get-trigger="scroll"
     get-insert="append"
     get-cursor
     get-cursor-field="paging.next"
     get-threshold="200">
  <div each="item in items" key="item.id">
    <h3 bind="item.title"></h3>
  </div>
</div>
```

The cursor starts as an empty string on the first request. After each response, the value of the field specified by `get-cursor-field` is extracted and used for the next request.

---

## Load More Button

Use `get-trigger="button"` for manual "Load More" pagination instead of automatic scroll detection:

```html
<div get="/api/comments?page={page}" as="comments"
     get-trigger="button"
     get-trigger-label="Show older comments"
     get-insert="append"
     get-page="1">
  <div each="comment in comments" key="comment.id">
    <p bind="comment.text"></p>
    <span bind="comment.author + ' — ' + (comment.date | relative)"></span>
  </div>
</div>
```

The button is auto-generated and inserted after the content. It is automatically removed when the end of data is reached or while a fetch is in progress.

---

## Pagination Component

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

## Live Polling Dashboard

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

## `into` -- Write Fetch Response to a Global Store

Use `into` to write API responses directly into a named global store, making the data available across the entire page:

```html
<div store="user" value="{ profile: null }"></div>

<!-- Fetch and write into the store -->
<div get="/api/me" into="user.profile"></div>

<!-- Access from anywhere -->
<span bind="$store.user.profile.name"></span>
```

---

## Detail View with Route Params

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

## Master-Detail Layout

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

## Error Handling Strategies

### Per-Request Error Templates

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
    <button trigger="retry">
      Retry
    </button>
  </div>
</template>
```

### Error Boundaries

Isolate failures so they do not propagate to the entire page:

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

### Global Error Handler

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

## Dashboard with Multiple Stores

```html
<script>
  // DEVELOPMENT ONLY — localStorage token storage is XSS-vulnerable.
  // For production, use httpOnly cookies (see Authentication Flow warning).
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
