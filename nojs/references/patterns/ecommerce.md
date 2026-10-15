# E-Commerce Patterns

Patterns for shopping carts, product listings, checkout flows, quantity management, and sortable product tables in No.JS applications.

## Contents

- [Shopping Cart (Global Store)](#shopping-cart)
- [Product Listing with Add to Cart](#product-listing-with-add-to-cart)
- [Cart with Quantity Management](#cart-with-quantity-management)
- [Checkout Flow](#checkout-flow)
- [Sortable Table with Headers](#sortable-table-with-headers)

---

## When to Use These Patterns

Use e-commerce patterns when your application needs:

- **Shopping cart** -- a global store that tracks cart items across routes
- **Product listing** -- displaying products from an API with add-to-cart actions
- **Quantity management** -- incrementing, decrementing, and removing cart items
- **Checkout** -- submitting cart contents to an API and clearing the cart on success
- **Sortable tables** -- column-sortable product or data tables

---

## Shopping Cart

A global store cart with add/remove and computed total:

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

## Product Listing with Add to Cart

A product grid fetched from an API, with search filtering and add-to-cart buttons tied to the global cart store:

```html
<div state="{ search: '' }">
  <input model="search" placeholder="Search products..." type="text" />

  <div get="/api/products?q={search}" as="products"
       debounce="300"
       loading="#productsLoading"
       empty="#noProducts">

    <div class="product-grid">
      <div each="product in products" key="product.id"
           animate="fadeIn" animate-stagger="40">
        <div class="product-card">
          <img bind-src="product.imageUrl" bind-alt="product.name" />
          <h3 bind="product.name"></h3>
          <p bind="product.description | truncate:80"></p>
          <span class="price" bind="product.price | currency"></span>
          <button on:click="
            $store.cart.items.push({ ...product, qty: 1 });
            $store.cart.total = $store.cart.items.reduce((s, i) => s + (i.price * (i.qty || 1)), 0)
          ">Add to Cart</button>
        </div>
      </div>
    </div>
  </div>
</div>

<template id="productsLoading">
  <div class="skeleton-pulse">Loading products...</div>
</template>

<template id="noProducts">
  <p>No products found.</p>
</template>
```

---

## Cart with Quantity Management

An enhanced cart that supports incrementing and decrementing quantities per item:

```html
<script>
  NoJS.config({
    stores: {
      cart: { items: [], total: 0 }
    }
  });

  function recalcTotal() {
    NoJS.store.cart.total = NoJS.store.cart.items.reduce(
      (sum, item) => sum + item.price * item.qty, 0
    );
    NoJS.notify();
  }

  function addToCart(product) {
    const existing = NoJS.store.cart.items.find(i => i.id === product.id);
    if (existing) {
      existing.qty++;
    } else {
      NoJS.store.cart.items.push({ ...product, qty: 1 });
    }
    recalcTotal();
  }
</script>

<!-- Cart page -->
<template route="/cart">
  <h2>Shopping Cart</h2>

  <div if="$store.cart.items.length === 0">
    <p>Your cart is empty. <a route="/products">Browse products</a></p>
  </div>

  <table show="$store.cart.items.length > 0">
    <thead>
      <tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr>
    </thead>
    <tbody>
      <tr each="item in $store.cart.items" key="item.id">
        <td bind="item.name"></td>
        <td bind="item.price | currency"></td>
        <td>
          <button on:click="item.qty = Math.max(1, item.qty - 1); recalcTotal()">-</button>
          <span bind="item.qty"></span>
          <button on:click="item.qty++; recalcTotal()">+</button>
        </td>
        <td bind="(item.price * item.qty) | currency"></td>
        <td>
          <button on:click="
            $store.cart.items.splice($index, 1);
            recalcTotal()
          ">Remove</button>
        </td>
      </tr>
    </tbody>
  </table>

  <div class="cart-summary" show="$store.cart.items.length > 0">
    <strong>Total: <span bind="$store.cart.total | currency"></span></strong>
  </div>
</template>
```

---

## Checkout Flow

Submit the cart to an API and clear it on success. Combines the cart store with a checkout form:

```html
<template route="/checkout" guard="$store.cart.items.length > 0" redirect="/cart">
  <h2>Checkout</h2>

  <!-- Order summary -->
  <div class="order-summary">
    <h3>Order Summary</h3>
    <div each="item in $store.cart.items" key="item.id">
      <span bind="item.name"></span>
      <span bind="'x' + item.qty"></span>
      <span bind="(item.price * item.qty) | currency"></span>
    </div>
    <div class="order-total">
      <strong>Total: <span bind="$store.cart.total | currency"></span></strong>
    </div>
  </div>

  <!-- Shipping / payment form -->
  <form post="/api/orders" validate
        success="#orderSuccess"
        error="#orderError"
        on:submit.prevent="true">
    <h3>Shipping</h3>
    <input name="name" placeholder="Full Name" required
           error-required="Name is required" />
    <input name="address" placeholder="Address" required
           error-required="Address is required" />
    <input name="email" type="email" placeholder="Email" required
           error-required="Email is required"
           error-email="Enter a valid email" />

    <!-- Hidden field to send cart items -->
    <input type="hidden" name="items"
           bind-value="JSON.stringify($store.cart.items)" />

    <button type="submit" bind-disabled="!$form.valid || $form.submitting">
      <span hide="$form.submitting">Place Order</span>
      <span show="$form.submitting">Processing...</span>
    </button>
  </form>
</template>

<template id="orderSuccess" var="result">
  <div class="success">
    <h3>Order Placed</h3>
    <p bind="'Order #' + result.orderId + ' confirmed.'"></p>
    <p>You will receive a confirmation email shortly.</p>
    <script>
      // Clear cart after successful order
      NoJS.store.cart.items = [];
      NoJS.store.cart.total = 0;
      NoJS.notify();
    </script>
  </div>
</template>

<template id="orderError" var="err">
  <p class="error" bind="err.message"></p>
</template>
```

---

## Sortable Table with Headers

Column-sortable data table using `foreach` with `sort`:

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
