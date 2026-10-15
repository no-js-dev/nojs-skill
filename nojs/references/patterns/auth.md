# Authentication & Authorization Patterns

Patterns for login flows, JWT token management, protected routes, role-based access control, and session handling in No.JS applications.

## Contents

- [Login Form with Validation](#login-form-with-validation)
- [Registration Form](#registration-form)
- [Authentication Flow (Login, Token, Protected Routes)](#authentication-flow)
- [Request + Response Interceptors (JWT)](#request--response-interceptors-jwt)
- [Protected Route with Guard](#protected-route-with-guard)
- [Role-Based Access Control](#role-based-access-control)
- [Token Refresh with Async Interceptor](#token-refresh-with-async-interceptor)
- [Navigation Bar with Auth State](#navigation-bar-with-auth-state)

---

## When to Use These Patterns

Use authentication patterns when your application needs:

- **User login/registration** -- forms that submit credentials to an API and store session data
- **Protected routes** -- pages that require authentication before rendering
- **Token management** -- attaching JWT tokens to outgoing requests and handling expiration
- **Role-based UI** -- showing or hiding content based on user roles or permissions

---

## Login Form with Validation

A login form with built-in validation, loading states, and success/error templates.

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

---

## Registration Form

Registration with confirm-password matching and strong validation.

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

## Authentication Flow

Full authentication flow: login, store token, attach to requests, handle 401, and protect routes.

> **Security warning -- development only.** The examples below store auth tokens in `localStorage` for simplicity. In production, `localStorage` is accessible to **any** JavaScript running on the page, making it vulnerable to XSS (cross-site scripting) attacks. A single XSS vulnerability allows an attacker to steal every token in storage.
>
> **For production use**, store tokens in **httpOnly cookies** set by the server. httpOnly cookies are inaccessible to client-side JavaScript and are automatically sent with requests to the issuing domain. Pair them with `Secure`, `SameSite=Strict` (or `Lax`), and short expiry times. The NoJS request interceptor still works -- the browser attaches the cookie automatically, so no `Authorization` header manipulation is needed.

```html
<script>
  // DEVELOPMENT ONLY — uses localStorage for token persistence.
  // For production, use httpOnly cookies instead (see warning above).
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
<!-- DEVELOPMENT ONLY — localStorage.setItem('token', ...) below is XSS-vulnerable.
     In production, have the server set an httpOnly cookie instead. -->
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

## Request + Response Interceptors (JWT)

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

## Protected Route with Guard

Use the `guard` attribute to protect routes. When the guard expression evaluates to falsy, the user is redirected.

```html
<!-- Only authenticated users can access -->
<template route="/dashboard"
          guard="$store.auth.token"
          redirect="/login">
  <h1>Dashboard</h1>
  <div get="/api/dashboard" as="data" loading="#dashLoading">
    <h2 bind="'Welcome, ' + data.user.name"></h2>
    <div each="metric in data.metrics"
         animate-enter="fadeInUp" animate-stagger="50">
      <span bind="metric.label"></span>
      <span bind="metric.value | number"></span>
    </div>
  </div>
</template>

<template id="dashLoading">
  <div class="skeleton">Loading dashboard...</div>
</template>

<!-- Login page redirects away if already logged in -->
<template route="/login"
          guard="!$store.auth.token"
          redirect="/dashboard">
  <h2>Sign In</h2>
  <form post="/api/auth/login" validate
        success="#authOk" error="#authErr">
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
```

---

## Role-Based Access Control

Combine `guard` expressions with store-based role data to restrict routes and UI elements by user role.

```html
<script>
  NoJS.config({
    stores: {
      auth: {
        user: null,
        token: null,
        role: null    // 'admin', 'editor', 'viewer'
      }
    }
  });
</script>

<!-- Admin-only route -->
<template route="/admin"
          guard="$store.auth.token && $store.auth.role === 'admin'"
          redirect="/">
  <h1>Admin Panel</h1>
  <div get="/api/admin/users" as="users">
    <table>
      <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
      <tbody>
        <tr each="user in users" key="user.id">
          <td bind="user.name"></td>
          <td bind="user.email"></td>
          <td bind="user.role | capitalize"></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<!-- Editor or admin route -->
<template route="/editor"
          guard="$store.auth.token && ($store.auth.role === 'admin' || $store.auth.role === 'editor')"
          redirect="/">
  <h1>Content Editor</h1>
  <p>Manage articles and pages.</p>
</template>

<!-- Conditional UI within a page based on role -->
<div>
  <button show="$store.auth.role === 'admin'"
          call="/api/admin/reset" method="post"
          confirm="Reset all data?">
    Reset System
  </button>
  <span show="$store.auth.role === 'viewer'" class="hint">
    You have read-only access.
  </span>
</div>
```

---

## Token Refresh with Async Interceptor

Use an async request interceptor to refresh expired tokens before sending requests. Each interceptor has a 5-second timeout.

```html
<script>
  let refreshPromise = null;

  async function refreshTokenIfExpired() {
    const token = NoJS.store.auth.token;
    if (!token) return null;

    // Decode JWT payload to check expiry (simplified — no signature verification)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresAt = payload.exp * 1000;
      const bufferMs = 60000; // refresh 1 minute before expiry

      if (Date.now() < expiresAt - bufferMs) return token;
    } catch (e) {
      return token; // if decode fails, let the server handle it
    }

    // Deduplicate concurrent refresh calls
    if (!refreshPromise) {
      refreshPromise = fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
      })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        NoJS.store.auth.token = data.token;
        NoJS.notify();
        return data.token;
      })
      .catch(() => {
        NoJS.store.auth.user = null;
        NoJS.store.auth.token = null;
        NoJS.notify();
        NoJS.router.push('/login');
        return null;
      })
      .finally(() => { refreshPromise = null; });
    }

    return refreshPromise;
  }

  // Async interceptor — refreshes token before each request if needed
  NoJS.interceptor('request', async (url, options) => {
    const token = await refreshTokenIfExpired();
    if (token) {
      options.headers = options.headers || {};
      options.headers['Authorization'] = 'Bearer ' + token;
    }
    return options;
  });
</script>
```

---

## Navigation Bar with Auth State

A navigation bar that reacts to authentication state, showing login/logout and the user name.

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
