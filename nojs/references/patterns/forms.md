# Form Patterns

Patterns for form validation, multi-step wizards, file uploads, dynamic fields, and CRUD interfaces in No.JS applications.

## Contents

- [Form Validation Patterns](#form-validation-patterns)
- [Custom Validators](#custom-validators)
- [Per-Field State Display](#per-field-state-display)
- [Conditional Validation](#conditional-validation)
- [CRUD Interface (List + Create + Edit + Delete)](#crud-interface)
- [File Upload Form](#file-upload-form)
- [File Upload with Progress Tracking](#file-upload-with-progress-tracking)
- [Multi-Step Form with Validation](#multi-step-form-with-validation)
- [Dynamic Form Fields](#dynamic-form-fields)

---

## When to Use These Patterns

Use form patterns when your application needs:

- **Validation** -- progressive, conditional, or custom validation rules beyond HTML5 built-ins
- **CRUD interfaces** -- create/read/update/delete with inline editing
- **File uploads** -- drag-and-drop zones with progress tracking
- **Multi-step wizards** -- step-by-step forms with per-step validation
- **Dynamic fields** -- adding or removing form fields based on user interaction

---

## Form Validation Patterns

### Progressive Validation

Show errors only after the user interacts (blur-based):

```html
<form validate validate-on="blur" error-class="is-invalid">
  <input name="email" type="email" required
         error-required="Email is required"
         error-email="Please enter a valid email" />
  <!-- error class appears only after focus+blur -->
</form>
```

### Conditional Fields

Only validate a field when a condition is met:

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

When `validate-if` evaluates to `false`, the field is treated as valid and excluded from `$form.errors`.

---

## Custom Validators

Register custom validation functions with `NoJS.validator()`:

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

---

## Per-Field State Display

Access individual field validation state through `$form.fields`:

```html
<form validate>
  <input name="email" type="email" required as="emailField" />
  <p show="emailField.touched && !emailField.valid"
     bind="emailField.error"
     class="field-error"></p>
</form>
```

---

## Conditional Validation

Validate fields only when related conditions are true:

```html
<form validate>
  <select model="contactMethod" name="contactMethod">
    <option value="email">Email</option>
    <option value="phone">Phone</option>
  </select>

  <input name="email" type="email"
         validate-if="contactMethod === 'email'"
         required
         error-required="Email is required when email contact is selected" />

  <input name="phone" type="tel"
         validate-if="contactMethod === 'phone'"
         required
         pattern="[0-9]{10,}"
         error-required="Phone number is required"
         error-pattern="Enter at least 10 digits" />

  <button type="submit" bind-disabled="!$form.valid">Send</button>
</form>
```

---

## CRUD Interface

Full create/read/update/delete pattern with inline form switching:

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

## File Upload Form

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

## File Upload with Progress Tracking

For real-time upload progress, use `XMLHttpRequest` with `on:init` to set up the progress listener. The NoJS state system drives the progress bar reactively.

```html
<div state="{
  uploading: false,
  progress: 0,
  fileName: '',
  uploadResult: null,
  uploadError: null
}">
  <h2>Upload with Progress</h2>

  <div class="upload-zone"
       class-dragover="isDragOver"
       on:dragover.prevent="isDragOver = true"
       on:dragleave="isDragOver = false"
       on:drop.prevent="isDragOver = false">

    <input type="file" ref="fileInput"
           on:change="fileName = $event.target.files[0]?.name || ''; uploadResult = null; uploadError = null" />

    <p show="!fileName">Drag a file here or click to browse</p>
    <p show="fileName" bind="'Selected: ' + fileName"></p>
  </div>

  <!-- Progress bar -->
  <div class="progress-bar" show="uploading">
    <div class="progress-fill"
         bind-style:width="progress + '%'"></div>
    <span class="progress-text" bind="Math.round(progress) + '%'"></span>
  </div>

  <button on:click="
    if (!$refs.fileInput.files[0]) return;
    uploading = true;
    progress = 0;
    uploadResult = null;
    uploadError = null;

    var formData = new FormData();
    formData.append('file', $refs.fileInput.files[0]);

    var xhr = new XMLHttpRequest();
    xhr.upload.onprogress = function(e) {
      if (e.lengthComputable) { progress = (e.loaded / e.total) * 100; }
    };
    xhr.onload = function() {
      uploading = false;
      if (xhr.status >= 200 && xhr.status < 300) {
        uploadResult = JSON.parse(xhr.responseText);
      } else {
        uploadError = 'Upload failed: ' + xhr.statusText;
      }
    };
    xhr.onerror = function() { uploading = false; uploadError = 'Network error'; };
    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  " bind-disabled="!fileName || uploading">
    <span hide="uploading">Upload</span>
    <span show="uploading">Uploading...</span>
  </button>

  <p show="uploadResult" class="success"
     bind="'Uploaded: ' + (uploadResult?.filename || '')"></p>
  <p show="uploadError" class="error" bind="uploadError"></p>
</div>
```

---

## Multi-Step Form with Validation

A wizard-style form where each step validates independently before proceeding. Uses local state to track the current step and per-step visibility.

```html
<div state="{
  step: 1,
  name: '',
  email: '',
  address: '',
  city: '',
  cardNumber: '',
  expiry: '',
  submitting: false
}">
  <h2>Checkout</h2>

  <!-- Step indicators -->
  <div class="steps">
    <span class-active="step === 1" class-done="step > 1">1. Personal</span>
    <span class-active="step === 2" class-done="step > 2">2. Address</span>
    <span class-active="step === 3">3. Payment</span>
  </div>

  <!-- Step 1: Personal Info -->
  <form show="step === 1" validate validate-on="blur">
    <input model="name" name="name" placeholder="Full Name"
           required minlength="2"
           error-required="Name is required" />
    <input model="email" name="email" type="email" placeholder="Email"
           required
           error-required="Email is required"
           error-email="Enter a valid email" />
    <button type="button"
            on:click="if ($form.valid) step = 2"
            bind-disabled="!$form.valid">
      Next
    </button>
  </form>

  <!-- Step 2: Address -->
  <form show="step === 2" validate validate-on="blur">
    <input model="address" name="address" placeholder="Street Address"
           required
           error-required="Address is required" />
    <input model="city" name="city" placeholder="City"
           required
           error-required="City is required" />
    <div class="form-actions">
      <button type="button" on:click="step = 1">Back</button>
      <button type="button"
              on:click="if ($form.valid) step = 3"
              bind-disabled="!$form.valid">
        Next
      </button>
    </div>
  </form>

  <!-- Step 3: Payment -->
  <form show="step === 3" validate validate-on="blur"
        post="/api/checkout"
        success="#checkoutSuccess"
        error="#checkoutError"
        on:submit.prevent="submitting = true">
    <input model="cardNumber" name="cardNumber" placeholder="Card Number"
           required pattern="[0-9]{13,19}"
           error-required="Card number is required"
           error-pattern="Enter a valid card number" />
    <input model="expiry" name="expiry" placeholder="MM/YY"
           required pattern="(0[1-9]|1[0-2])\/[0-9]{2}"
           error-required="Expiry date is required"
           error-pattern="Use MM/YY format" />
    <div class="form-actions">
      <button type="button" on:click="step = 2">Back</button>
      <button type="submit" bind-disabled="!$form.valid || submitting">
        <span hide="submitting">Place Order</span>
        <span show="submitting">Processing...</span>
      </button>
    </div>
  </form>
</div>

<template id="checkoutSuccess" var="result">
  <div class="success">
    <h3>Order Confirmed</h3>
    <p bind="'Order #' + result.orderId"></p>
  </div>
</template>

<template id="checkoutError" var="err">
  <p class="error" bind="err.message"></p>
</template>
```

---

## Dynamic Form Fields

Add or remove form fields dynamically using loop directives and array manipulation:

```html
<div state="{ contacts: [{ name: '', email: '' }] }">
  <h2>Team Members</h2>

  <div each="contact in contacts" key="$index">
    <div class="field-row">
      <input model="contacts[$index].name"
             bind-name="'contact_name_' + $index"
             placeholder="Name" required />
      <input model="contacts[$index].email"
             bind-name="'contact_email_' + $index"
             type="email" placeholder="Email" required />
      <button type="button"
              on:click="contacts.splice($index, 1)"
              show="contacts.length > 1"
              class="btn-remove">
        Remove
      </button>
    </div>
  </div>

  <button type="button"
          on:click="contacts.push({ name: '', email: '' })">
    + Add Member
  </button>

  <div class="summary">
    <p bind="contacts.length + ' member(s) added'"></p>
  </div>
</div>
```
