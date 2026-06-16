# No.JS Expression Engine Reference

No.JS uses a custom sandboxed recursive-descent parser and tree-walking evaluator for all template expressions. No `eval()` or `Function()` constructor is ever used.

## Contents

- [Where Expressions Appear](#where-expressions-appear)
- [Operators](#operators)
  - [Arithmetic](#arithmetic)
  - [Comparison](#comparison)
  - [Logical](#logical)
  - [Assignment](#assignment)
  - [Nullish and Optional Chaining](#nullish-and-optional-chaining)
  - [Spread](#spread)
  - [Exponentiation](#exponentiation)
  - [typeof and instanceof](#typeof-and-instanceof)
  - [in Operator](#in-operator)
  - [Increment and Decrement](#increment-and-decrement)
- [Literals and Data Types](#literals-and-data-types)
  - [Primitive Literals](#primitive-literals)
  - [Template Literals](#template-literals)
  - [Array Literals](#array-literals)
  - [Object Literals](#object-literals)
- [Arrow Functions](#arrow-functions)
- [Ternary Operator](#ternary-operator)
- [Destructuring](#destructuring)
- [Filter Pipe Syntax](#filter-pipe-syntax)
- [Safe Globals](#safe-globals)
  - [JavaScript Built-ins](#javascript-built-ins)
  - [Browser Globals](#browser-globals)
  - [Timer Wrappers](#timer-wrappers)
- [Security Proxies](#security-proxies)
  - [Window Proxy](#window-proxy)
  - [Document Proxy](#document-proxy)
  - [Location Proxy](#location-proxy)
  - [History Proxy](#history-proxy)
  - [Navigator Proxy](#navigator-proxy)
- [Forbidden Patterns](#forbidden-patterns)
  - [Forbidden Properties](#forbidden-properties)
  - [Blocked Globals](#blocked-globals)
  - [Forbidden Identifiers in Tokenizer](#forbidden-identifiers-in-tokenizer)
- [Expression Caching](#expression-caching)
- [Identifier Resolution](#identifier-resolution)
- [Keywords](#keywords)
- [Limitations](#limitations)

---

## Where Expressions Appear

Expressions are evaluated in every directive attribute value and in `bind` / `bind-*` text interpolation.

```html
<!-- Directive attribute value -->
<div if="items.length > 0">...</div>

<!-- Text binding -->
<span bind="user.name | uppercase"></span>

<!-- Event handler (statement context) -->
<button on:click="count += 1">+1</button>

<!-- Computed property -->
<div computed:fullName="first + ' ' + last"></div>
```

---

## Operators

### Arithmetic

| Operator | Description | Example |
|----------|-------------|---------|
| `+` | Addition / string concatenation | `a + b` |
| `-` | Subtraction | `price - discount` |
| `*` | Multiplication | `qty * price` |
| `/` | Division | `total / count` |
| `%` | Modulo (remainder) | `index % 2` |
| `**` | Exponentiation | `base ** exp` |

```html
<span bind="price * qty"></span>
<span bind="index % 2 === 0 ? 'even' : 'odd'"></span>
<span bind="2 ** 10"></span>  <!-- 1024 -->
```

### Comparison

| Operator | Description | Example |
|----------|-------------|---------|
| `===` | Strict equality | `status === 'active'` |
| `!==` | Strict inequality | `role !== 'admin'` |
| `==` | Loose equality | `value == null` |
| `!=` | Loose inequality | `value != null` |
| `>` | Greater than | `count > 0` |
| `<` | Less than | `age < 18` |
| `>=` | Greater than or equal | `score >= 90` |
| `<=` | Less than or equal | `qty <= max` |

```html
<div if="user.role === 'admin'">Admin panel</div>
<div if="items.length >= 1">Has items</div>
```

### Logical

| Operator | Description | Example |
|----------|-------------|---------|
| `&&` | Logical AND | `isLogged && isAdmin` |
| `\|\|` | Logical OR | `name \|\| 'Anonymous'` |
| `!` | Logical NOT | `!loading` |

```html
<div if="isAuth && user.verified">Welcome</div>
<span bind="nickname || name || 'Guest'"></span>
<button disabled="!canSubmit">Submit</button>
```

### Assignment

Assignment operators are available in statement context (e.g., `on:click`, `watch`, `computed`).

| Operator | Description | Example |
|----------|-------------|---------|
| `=` | Assignment | `count = 0` |
| `+=` | Add and assign | `total += price` |
| `-=` | Subtract and assign | `count -= 1` |
| `*=` | Multiply and assign | `score *= 2` |
| `/=` | Divide and assign | `value /= 10` |
| `%=` | Modulo and assign | `index %= length` |

```html
<button on:click="count += 1">Increment</button>
<button on:click="items = []">Clear</button>
```

### Nullish and Optional Chaining

| Operator | Description | Example |
|----------|-------------|---------|
| `??` | Nullish coalescing | `value ?? 'fallback'` |
| `?.` | Optional chaining | `user?.address?.city` |

```html
<span bind="user?.profile?.bio ?? 'No bio provided'"></span>
<span bind="config?.theme ?? 'light'"></span>
<span bind="items?.[0]?.name"></span>
```

The `??` operator returns the right-hand side only when the left side is `null` or `undefined` (unlike `||`, which also triggers on `0`, `""`, and `false`).

### Spread

| Operator | Description | Example |
|----------|-------------|---------|
| `...` | Spread | `{...defaults, ...overrides}` |

```html
<div state="{...baseConfig, theme: 'dark'}">...</div>
```

Spread operations automatically filter `_FORBIDDEN_PROPS` (`__proto__`, `constructor`, `prototype`) to prevent prototype pollution.

### typeof and instanceof

```html
<div if="typeof callback === 'function'">Has callback</div>
<div if="error instanceof Error">Error occurred</div>
```

### in Operator

```html
<div if="'name' in user">Has name</div>
```

### Increment and Decrement

| Operator | Description | Example |
|----------|-------------|---------|
| `++` | Increment | `count++` |
| `--` | Decrement | `count--` |

```html
<button on:click="count++">+1</button>
<button on:click="count--">-1</button>
```

---

## Literals and Data Types

### Primitive Literals

```html
<!-- String (single or double quotes) -->
<span bind="'Hello, world!'"></span>

<!-- Number (integer and float) -->
<span bind="42"></span>
<span bind="3.14"></span>

<!-- Boolean -->
<div if="true">Always visible</div>

<!-- null / undefined -->
<span bind="value ?? null"></span>
```

### Template Literals

Backtick-delimited strings with `${...}` interpolation.

```html
<span bind="`Hello, ${user.name}!`"></span>
<span bind="`${items.length} item${items.length !== 1 ? 's' : ''}`"></span>
<div bind-html="`<strong>${title}</strong>`"></div>
```

Template literals support escape sequences (`\n`, `\t`, `\r`, `\\`).

### Array Literals

```html
<div state="{ colors: ['red', 'green', 'blue'] }">
  <span bind="colors | join:', '"></span>
</div>
```

### Object Literals

```html
<div state="{ config: { theme: 'dark', lang: 'en' } }">
  <span bind="config.theme"></span>
</div>
```

Object literals support shorthand properties, computed keys, and spread:

```html
<!-- Shorthand: { name } is equivalent to { name: name } -->
<div state="{ user: { name, email } }">...</div>

<!-- Spread with filtering of forbidden keys -->
<div state="{ merged: { ...defaults, ...overrides } }">...</div>
```

---

## Arrow Functions

Arrow functions can be defined inline and used in callbacks, array methods, and event handlers.

```html
<!-- Single parameter (no parentheses) -->
<span bind="items.filter(x => x.active).length"></span>

<!-- Multiple parameters -->
<span bind="items.reduce((sum, item) => sum + item.price, 0)"></span>

<!-- With array methods -->
<span bind="users.map(u => u.name).join(', ')"></span>
<span bind="items.some(i => i.qty > 0)"></span>
<span bind="items.every(i => i.price >= 0)"></span>
<span bind="items.find(i => i.id === selectedId)?.name"></span>

<!-- In event handlers -->
<button on:click="items = items.filter(i => i.id !== removeId)">Remove</button>
```

---

## Ternary Operator

```html
<span bind="score >= 90 ? 'A' : score >= 80 ? 'B' : 'C'"></span>
<span class-active="isActive ? true : false"></span>
<img bind-src="user.avatar ? user.avatar : '/default.png'">
```

---

## Destructuring

Array destructuring in `for`/`each` loops:

```html
<div each="[key, value] in Object.entries(config)">
  <span bind="key"></span>: <span bind="value"></span>
</div>
```

---

## Filter Pipe Syntax

Filters transform expression values using the pipe (`|`) operator. Arguments are passed with `:` separators.

```
value | filterName
value | filterName:arg1
value | filterName:arg1:arg2
```

Filters can be chained:

```html
<span bind="name | trim | uppercase"></span>
<span bind="items | where:'active':true | count"></span>
<span bind="price | currency:'EUR'"></span>
<span bind="text | truncate:50 | stripHtml"></span>
```

The pipe operator has the lowest precedence in the expression grammar -- everything to its left is evaluated first, then the result is passed as the first argument to the filter function.

See the [Filters Reference](filters.md) for all 32 built-in filters.

---

## Safe Globals

The expression evaluator exposes a curated allow-list of globals. Anything not on this list is unreachable from template expressions.

### JavaScript Built-ins

These are available directly in any expression via the `_SAFE_GLOBALS` object:

| Global | Type | Description |
|--------|------|-------------|
| `Array` | Constructor | Array constructor and static methods (`Array.from`, `Array.isArray`, etc.) |
| `Object` | Constructor | Object static methods (`Object.keys`, `Object.entries`, `Object.assign`, etc.) |
| `String` | Constructor | String constructor and methods |
| `Number` | Constructor | Number constructor (`Number.isInteger`, `Number.parseFloat`, etc.) |
| `Boolean` | Constructor | Boolean constructor |
| `Math` | Object | Math utilities (`Math.floor`, `Math.random`, `Math.max`, etc.) |
| `Date` | Constructor | Date constructor and methods |
| `RegExp` | Constructor | Regular expression constructor |
| `Map` | Constructor | Map collection |
| `Set` | Constructor | Set collection |
| `JSON` | Object | `JSON.parse`, `JSON.stringify` |
| `parseInt` | Function | Parse integer from string |
| `parseFloat` | Function | Parse float from string |
| `isNaN` | Function | Check if value is NaN |
| `isFinite` | Function | Check if value is finite |
| `Infinity` | Value | Infinity constant |
| `NaN` | Value | Not-a-Number constant |
| `undefined` | Value | Undefined constant |
| `Error` | Constructor | Error constructor |
| `Symbol` | Constructor | Symbol constructor |
| `console` | Object | Console logging (`console.log`, `console.warn`, etc.) |

```html
<span bind="Math.floor(price * 100) / 100"></span>
<span bind="Object.keys(config).length"></span>
<span bind="Array.from({length: 5}, (_, i) => i + 1)"></span>
<span bind="JSON.stringify(data, null, 2)"></span>
<span bind="parseInt(input, 10)"></span>
<span bind="Date.now()"></span>
```

### Browser Globals

These are available via the `_BROWSER_GLOBALS` allow-list. `window`, `document`, `location`, `history`, and `navigator` are wrapped in security proxies (see [Security Proxies](#security-proxies)).

| Global | Description |
|--------|-------------|
| `window` | Window object (proxied -- blocks sensitive sub-properties) |
| `document` | Document object (proxied -- blocks `cookie`, `write`, etc.) |
| `console` | Console API |
| `location` | Location object (proxied -- read-only, blocks `assign`/`replace`/`reload`) |
| `history` | History object (proxied -- blocks `pushState`/`replaceState`/`go`/`back`/`forward`) |
| `navigator` | Navigator object (proxied -- blocks `sendBeacon`, `credentials`) |
| `screen` | Screen dimensions |
| `performance` | Performance timing API |
| `crypto` | Crypto API |
| `setTimeout` | Delayed execution (wrapped -- see [Timer Wrappers](#timer-wrappers)) |
| `clearTimeout` | Cancel timeout |
| `setInterval` | Repeated execution (wrapped) |
| `clearInterval` | Cancel interval |
| `requestAnimationFrame` | Animation frame scheduling (wrapped) |
| `cancelAnimationFrame` | Cancel animation frame |
| `alert` | Alert dialog |
| `confirm` | Confirm dialog |
| `prompt` | Prompt dialog |
| `CustomEvent` | Custom event constructor |
| `Event` | Event constructor |
| `URL` | URL constructor |
| `URLSearchParams` | URL query string utilities |
| `FormData` | Form data constructor |
| `FileReader` | File reader API |
| `Blob` | Binary large object constructor |
| `Promise` | Promise constructor |

```html
<span bind="window.innerWidth"></span>
<span bind="navigator.language"></span>
<span bind="screen.width + 'x' + screen.height"></span>
<span bind="new URL(link).hostname"></span>
```

### Timer Wrappers

`setTimeout`, `setInterval`, and `requestAnimationFrame` are wrapped in safe functions that:
- Only accept function callbacks (not strings)
- Prevent deferred code execution with captured scope access
- Return `undefined` if the callback is not a function

---

## Security Proxies

Browser globals that provide access to sensitive APIs are wrapped in `Proxy` objects that block dangerous sub-properties while allowing safe DOM and measurement operations.

### Window Proxy

The `window` object blocks writes (all property assignments are silently swallowed) and blocks access to:

| Blocked Property | Reason |
|------------------|--------|
| `fetch` | Network access |
| `XMLHttpRequest` | Network access |
| `localStorage` | Storage access |
| `sessionStorage` | Storage access |
| `WebSocket` | Network access |
| `indexedDB` | Storage access |
| `eval` | Code execution |
| `Function` | Code execution |
| `importScripts` | Code execution |
| `open` | Navigation / popup |
| `postMessage` | Cross-origin messaging |

Accessing `window.location`, `window.document`, `window.history`, and `window.navigator` returns the corresponding safe proxy instead of the raw object.

### Document Proxy

The `document` object blocks access to:

| Blocked Property | Reason |
|------------------|--------|
| `cookie` | Credential access |
| `domain` | Security-sensitive |
| `write` | DOM injection |
| `writeln` | DOM injection |
| `execCommand` | Arbitrary command execution |

`document.defaultView` returns the safe window proxy. `document.location` returns the safe location proxy.

### Location Proxy

The `location` object is read-only. All write operations (property assignments) are silently swallowed.

### History Proxy

The `history` object blocks navigation-mutating methods. Read-only properties like `history.length` and `history.state` remain accessible.

### Navigator Proxy

The `navigator` object blocks:

| Blocked Property | Reason |
|------------------|--------|
| `sendBeacon` | Network access |
| `credentials` | Credential access |

---

## Forbidden Patterns

### Forbidden Properties

The following properties are blocked on all property access (member expressions, spread, computed access):

| Property | Reason |
|----------|--------|
| `__proto__` | Prototype pollution |
| `constructor` | Prototype chain access |
| `prototype` | Prototype chain access |
| `alert` | Blocked on property access (available as top-level global) |
| `confirm` | Blocked on property access (available as top-level global) |
| `prompt` | Blocked on property access (available as top-level global) |

### Blocked Globals

The following are **not** on any allow-list and are completely unreachable from expressions:

- `eval()` -- direct code execution
- `Function()` constructor -- dynamic code generation
- `fetch()` -- network access (use `get`/`post`/`put`/`delete` directives instead)
- `XMLHttpRequest` -- network access
- `localStorage` / `sessionStorage` -- storage access
- `WebSocket` -- network access
- `indexedDB` -- storage access
- `import()` -- dynamic module loading
- `require()` -- CommonJS module loading
- `process` -- Node.js process access
- `importScripts()` -- worker script loading

### Forbidden Identifiers in Tokenizer

The tokenizer flags these identifiers as `Forbidden` token type, preventing them from being used as property names in expressions:

- `__proto__`
- `constructor`
- `prototype`

---

## Expression Caching

Parsed expression ASTs are cached using an LRU cache. The default capacity is 500 entries (configurable via `config.exprCacheSize`). Statement expressions use a separate cache. Both caches use the expression string as the key.

```javascript
NoJS.config({ exprCacheSize: 1000 }); // increase cache for large apps
```

---

## Identifier Resolution

When resolving an identifier in an expression, the evaluator follows this order:

1. **Scope chain** -- Walk the context's prototype chain checking `hasOwnProperty` at each level. Stop before `Object.prototype` to prevent inherited members (`toString`, `valueOf`, `hasOwnProperty`, `constructor`) from resolving.
2. **Safe globals** -- Check `_SAFE_GLOBALS` own properties (JS built-ins).
3. **Browser globals** -- Check `_BROWSER_GLOBALS` set, returning security proxies for `window`, `document`, `location`, `history`, and `navigator`. Timer functions return safe wrappers.
4. **undefined** -- If not found in any scope, return `undefined` (no `ReferenceError`).

---

## Keywords

The following keywords are recognized by the expression parser:

| Keyword | Value |
|---------|-------|
| `true` | Boolean `true` |
| `false` | Boolean `false` |
| `null` | `null` |
| `undefined` | `undefined` |
| `typeof` | Type-of operator |
| `in` | Property membership |
| `instanceof` | Instance check |

---

## Limitations

- **No `if`/`else`/`for`/`while` statements** -- Use ternary operator (`? :`) for conditionals in expressions; use `if`/`else`/`each`/`for` directives for control flow.
- **No `new` keyword in expression context** -- Constructors like `new Date()` work, but `new` followed by user-defined constructors may not behave as expected in all contexts.
- **No `try`/`catch`/`throw`** -- Errors in expressions are caught by the framework and logged as warnings.
- **No regular expression literals** -- Use `new RegExp('pattern')` instead of `/pattern/`.
- **Filter pipe `|` in nested expressions** -- When using filters inside ternary branches or function arguments, wrap the filtered expression in parentheses: `(value | filter)`.
- **Single-expression body for arrow functions** -- Arrow functions support only expression bodies, not block bodies with `{ ... }`.
- **No `async`/`await`** -- Expressions are evaluated synchronously.
