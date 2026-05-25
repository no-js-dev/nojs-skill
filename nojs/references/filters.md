# No.JS Built-in Filters Reference

No.JS includes 32 built-in filters for transforming values in bind expressions using pipe syntax.

## Contents

- [Pipe Syntax](#pipe-syntax) — How to apply filters with `|` in expressions
- [Text Filters](#text-filters) — String transformation filters
  - [uppercase](#uppercase) — Convert text to upper case
  - [lowercase](#lowercase) — Convert text to lower case
  - [capitalize](#capitalize) — Capitalize first letter of each word
  - [truncate](#truncate) — Shorten text to a max length
  - [trim](#trim) — Remove leading/trailing whitespace
  - [stripHtml](#striphtml) — Remove HTML tags from strings
  - [slugify](#slugify) — Convert text to URL-safe slugs
  - [nl2br](#nl2br) — Convert newlines to `<br>` tags
  - [encodeUri](#encodeuri) — Percent-encode URI components
- [Number Filters](#number-filters) — Numeric formatting filters
  - [number](#number) — Format numbers with locale support
  - [currency](#currency) — Format as currency values
  - [percent](#percent) — Format as percentage
  - [filesize](#filesize) — Human-readable file sizes
  - [ordinal](#ordinal) — Add ordinal suffix (1st, 2nd, etc.)
- [Array Filters](#array-filters) — Collection manipulation filters
  - [count](#count) — Return array length
  - [first](#first) — Get first element
  - [last](#last) — Get last element
  - [join](#join) — Join elements with separator
  - [reverse](#reverse) — Reverse array order
  - [unique](#unique) — Remove duplicate values
  - [pluck](#pluck) — Extract property from objects
  - [sortBy](#sortby) — Sort by object property
  - [where](#where) — Filter by property value
- [Date Filters](#date-filters) — Date and time formatting
  - [date](#date) — Format date strings
  - [datetime](#datetime) — Format date with time
  - [relative](#relative) — Relative time description
  - [fromNow](#fromnow) — Time remaining until a future date (or relative for past dates)
- [Utility Filters](#utility-filters) — General-purpose utility filters
  - [default](#default) — Fallback value for nullish data
  - [json](#json) — Pretty-print as JSON
  - [debug](#debug) — Console-log and pass through
  - [keys](#keys) — Get object keys as array
  - [values](#values) — Get object values as array
- [Custom Filters](#custom-filters) — How to register your own filters
- [Chaining Patterns](#chaining-patterns) — Combining multiple filters in sequence

## Pipe Syntax

Filters are applied with `|` inside expressions:

```html
<!-- Single filter -->
<span bind="name | uppercase"></span>

<!-- Chained filters -->
<span bind="name | trim | uppercase"></span>

<!-- Filter with argument -->
<span bind="description | truncate(50)"></span>

<!-- Filter with multiple arguments -->
<span bind="items | where('active', true) | count"></span>
```

Arguments are passed with parentheses or colon syntax: `filter(arg)` or `filter:arg`.

---

## Text Filters

### uppercase

Convert a string to uppercase.

| | |
|---|---|
| **Syntax** | `value | uppercase` |
| **Arguments** | None |

```html
<span bind="name | uppercase"></span>
<!-- "john doe" -> "JOHN DOE" -->
```

### lowercase

Convert a string to lowercase.

| | |
|---|---|
| **Syntax** | `value | lowercase` |
| **Arguments** | None |

```html
<span bind="status | lowercase"></span>
<!-- "ACTIVE" -> "active" -->
```

### capitalize

Capitalize the first letter of each word.

| | |
|---|---|
| **Syntax** | `value | capitalize` |
| **Arguments** | None |

```html
<span bind="title | capitalize"></span>
<!-- "hello world" -> "Hello World" -->
```

### truncate

Truncate a string to N characters and append an ellipsis.

| | |
|---|---|
| **Syntax** | `value | truncate(length)` |
| **Arguments** | `length` (number, default: 100) -- max characters before truncation |

```html
<p bind="description | truncate(50)"></p>
<!-- "This is a very long description..." (truncated at 50 chars) -->
```

### trim

Remove whitespace from both ends of a string.

| | |
|---|---|
| **Syntax** | `value | trim` |
| **Arguments** | None |

```html
<span bind="input | trim"></span>
<!-- "  hello  " -> "hello" -->
```

### stripHtml

Remove all HTML tags from a string.

| | |
|---|---|
| **Syntax** | `value | stripHtml` |
| **Arguments** | None |

```html
<span bind="richText | stripHtml"></span>
<!-- "<b>Hello</b> <i>world</i>" -> "Hello world" -->
```

### slugify

Convert a string to a URL-friendly slug.

| | |
|---|---|
| **Syntax** | `value | slugify` |
| **Arguments** | None |

```html
<span bind="title | slugify"></span>
<!-- "Hello World!" -> "hello-world" -->
```

### nl2br

Convert newline characters to `<br>` tags. Before converting newlines, the filter HTML-encodes `&`, `<`, and `>` to prevent XSS when used with `bind-html`.

| | |
|---|---|
| **Syntax** | `value | nl2br` |
| **Arguments** | None |

```html
<span bind-html="message | nl2br"></span>
<!-- "line 1\nline 2" -> "line 1<br>line 2" -->
<!-- "<script>alert(1)</script>\nSafe" -> "&lt;script&gt;alert(1)&lt;/script&gt;<br>Safe" -->
```

### encodeUri

URL-encode a string using `encodeURIComponent`.

| | |
|---|---|
| **Syntax** | `value | encodeUri` |
| **Arguments** | None |

```html
<a bind-href="'/search?q=' + (query | encodeUri)">Search</a>
<!-- "hello world" -> "hello%20world" -->
```

---

## Number Filters

### number

Format a number with locale-aware thousand separators and decimal places.

| | |
|---|---|
| **Syntax** | `value | number(decimals)` |
| **Arguments** | `decimals` (number, default: 0) -- number of decimal places |

```html
<span bind="total | number(2)"></span>
<!-- 1234.5 -> "1,234.50" -->

<span bind="count | number"></span>
<!-- 15000 -> "15,000" -->
```

### currency

Format a number as currency using the browser locale.

| | |
|---|---|
| **Syntax** | `value | currency(code)` |
| **Arguments** | `code` (string, default: "USD") -- ISO 4217 currency code |

```html
<span bind="price | currency"></span>
<!-- 29.99 -> "$29.99" -->

<span bind="price | currency('EUR')"></span>
<!-- 29.99 -> "29,99 EUR" (varies by locale) -->
```

### percent

Format a number as a percentage (multiplies by 100).

| | |
|---|---|
| **Syntax** | `value | percent(decimals)` |
| **Arguments** | `decimals` (number, default: 0) -- decimal places |

```html
<span bind="rate | percent(1)"></span>
<!-- 0.856 -> "85.6%" -->

<span bind="progress | percent"></span>
<!-- 0.5 -> "50%" -->
```

### filesize

Format a byte count as a human-readable file size.

| | |
|---|---|
| **Syntax** | `value | filesize` |
| **Arguments** | None |

```html
<span bind="size | filesize"></span>
<!-- 1536 -> "1.5 KB" -->
<!-- 1048576 -> "1.0 MB" -->
<!-- 500 -> "500 B" -->
```

### ordinal

Add an ordinal suffix (st, nd, rd, th) to a number.

| | |
|---|---|
| **Syntax** | `value | ordinal` |
| **Arguments** | None |

```html
<span bind="rank | ordinal"></span>
<!-- 1 -> "1st", 2 -> "2nd", 3 -> "3rd", 4 -> "4th", 11 -> "11th", 21 -> "21st" -->
```

---

## Array Filters

### count

Return the length of an array.

| | |
|---|---|
| **Syntax** | `array | count` |
| **Arguments** | None |

```html
<span bind="items | count"></span>
<!-- [1, 2, 3] -> 3 -->
```

### first

Return the first element of an array.

| | |
|---|---|
| **Syntax** | `array | first` |
| **Arguments** | None |

```html
<span bind="users | first | uppercase"></span>
<!-- ["alice", "bob"] -> "ALICE" -->
```

### last

Return the last element of an array.

| | |
|---|---|
| **Syntax** | `array | last` |
| **Arguments** | None |

```html
<span bind="messages | last"></span>
<!-- ["hello", "world"] -> "world" -->
```

### join

Join array elements into a string with a separator.

| | |
|---|---|
| **Syntax** | `array | join(separator)` |
| **Arguments** | `separator` (string, default: ", ") |

```html
<span bind="tags | join(', ')"></span>
<!-- ["html", "css", "js"] -> "html, css, js" -->

<span bind="parts | join(' - ')"></span>
<!-- ["a", "b", "c"] -> "a - b - c" -->
```

### reverse

Reverse the order of array elements. Returns a new array (non-mutating).

| | |
|---|---|
| **Syntax** | `array | reverse` |
| **Arguments** | None |

```html
<div each="item in items | reverse">
  <span bind="item"></span>
</div>
```

### unique

Remove duplicate values from an array. Returns a new array.

| | |
|---|---|
| **Syntax** | `array | unique` |
| **Arguments** | None |

```html
<span bind="categories | unique | join(', ')"></span>
<!-- ["a", "b", "a", "c", "b"] -> "a, b, c" -->
```

### pluck

Extract a single property from each object in an array.

| | |
|---|---|
| **Syntax** | `array | pluck(property)` |
| **Arguments** | `property` (string) -- the property name to extract |

```html
<span bind="users | pluck('name') | join(', ')"></span>
<!-- [{name:"Alice"}, {name:"Bob"}] -> "Alice, Bob" -->
```

### sortBy

Sort an array of objects by a property. Prefix the property name with `-` for descending order. Returns a new array (non-mutating).

| | |
|---|---|
| **Syntax** | `array | sortBy(property)` |
| **Arguments** | `property` (string) -- property name; prefix with `-` for descending |

```html
<!-- Ascending -->
<div each="user in users | sortBy('name')">
  <span bind="user.name"></span>
</div>

<!-- Descending -->
<div each="post in posts | sortBy('-date')">
  <span bind="post.title"></span>
</div>
```

### where

Filter an array to only include objects where a property matches a value.

| | |
|---|---|
| **Syntax** | `array | where(property, value)` |
| **Arguments** | `property` (string), `value` (any) -- the property and value to match |

```html
<div each="user in users | where('active', true)">
  <span bind="user.name"></span>
</div>

<span bind="tasks | where('status', 'done') | count"></span>
```

---

## Date Filters

### date

Format a date value. Accepts format presets: `"short"`, `"long"`, or `"full"`.

| | |
|---|---|
| **Syntax** | `value | date(format)` |
| **Arguments** | `format` (string, default: "short") -- `"short"`, `"long"`, or `"full"` |

```html
<span bind="createdAt | date"></span>
<!-- "2025-03-15" -> "3/15/25" (short, varies by locale) -->

<span bind="createdAt | date('long')"></span>
<!-- "2025-03-15" -> "March 15, 2025" -->

<span bind="createdAt | date('full')"></span>
<!-- "2025-03-15" -> "Saturday, March 15, 2025" -->
```

### datetime

Format a value as both date and time using the browser locale.

| | |
|---|---|
| **Syntax** | `value | datetime` |
| **Arguments** | None |

```html
<span bind="updatedAt | datetime"></span>
<!-- "2025-03-15T14:30:00Z" -> "3/15/2025, 2:30:00 PM" (varies by locale) -->
```

### relative

Display a past date as relative time (e.g., "5m ago", "2h ago"). Falls back to a formatted date for dates older than 30 days.

| | |
|---|---|
| **Syntax** | `value | relative` |
| **Arguments** | None |

```html
<span bind="post.createdAt | relative"></span>
<!-- (30 seconds ago) -> "just now" -->
<!-- (5 minutes ago) -> "5m ago" -->
<!-- (3 hours ago) -> "3h ago" -->
<!-- (2 days ago) -> "2d ago" -->
<!-- (45 days ago) -> "2/5/2025" (falls back to formatted date) -->
```

### fromNow

Display a future date as relative time (e.g., "in 3h", "in 5d"). Falls back to `relative` for past dates.

| | |
|---|---|
| **Syntax** | `value | fromNow` |
| **Arguments** | None |

```html
<span bind="deadline | fromNow"></span>
<!-- (in 30 seconds) -> "in a moment" -->
<!-- (in 45 minutes) -> "in 45m" -->
<!-- (in 6 hours) -> "in 6h" -->
<!-- (in 3 days) -> "in 3d" -->
```

---

## Utility Filters

### default

Provide a fallback value when the input is `null`, `undefined`, or an empty string.

| | |
|---|---|
| **Syntax** | `value | default(fallback)` |
| **Arguments** | `fallback` (any, default: "") -- the value to use as fallback |

```html
<span bind="user.nickname | default('Anonymous')"></span>
<!-- null -> "Anonymous" -->
<!-- "" -> "Anonymous" -->
<!-- "John" -> "John" -->
```

### json

Pretty-print a value as formatted JSON.

| | |
|---|---|
| **Syntax** | `value | json(indent)` |
| **Arguments** | `indent` (number, default: 2) -- spaces for indentation |

```html
<pre bind="data | json"></pre>
<!-- { name: "John", age: 30 } -> '{\n  "name": "John",\n  "age": 30\n}' -->

<pre bind="data | json(4)"></pre>
<!-- 4-space indentation -->
```

### debug

Log the value to the browser console and pass it through unchanged. Useful for debugging filter chains.

| | |
|---|---|
| **Syntax** | `value | debug` |
| **Arguments** | None |

```html
<!-- Logs the value to console, then continues the chain -->
<span bind="items | debug | count"></span>

<!-- Inspect intermediate values in a chain -->
<span bind="users | where('active', true) | debug | pluck('name') | join(', ')"></span>
```

### keys

Return the keys of an object as an array.

| | |
|---|---|
| **Syntax** | `value | keys` |
| **Arguments** | None |

```html
<span bind="config | keys | join(', ')"></span>
<!-- { name: "a", color: "red" } -> "name, color" -->

<span bind="data | keys | count"></span>
<!-- Count the number of properties -->
```

### values

Return the values of an object as an array.

| | |
|---|---|
| **Syntax** | `value | values` |
| **Arguments** | None |

```html
<span bind="scores | values | join(', ')"></span>
<!-- { math: 90, eng: 85 } -> "90, 85" -->
```

---

## Custom Filters

Register custom filters with `NoJS.filter(name, fn)`. The function receives the piped value as its first argument, followed by any additional arguments.

```html
<script>
  NoJS.filter('initials', (name) => {
    return name.split(' ').map(w => w[0]).join('').toUpperCase();
  });

  NoJS.filter('multiply', (value, factor) => {
    return Number(value) * Number(factor);
  });

  NoJS.filter('wrap', (value, before, after) => {
    return (before || '') + value + (after || '');
  });
</script>

<!-- Usage -->
<span bind="fullName | initials"></span>
<!-- "John Doe" -> "JD" -->

<span bind="price | multiply(1.1) | currency"></span>
<!-- 100 -> "$110.00" -->

<span bind="name | wrap('[', ']')"></span>
<!-- "test" -> "[test]" -->
```

## Chaining Patterns

Filters can be combined to build powerful display transformations:

```html
<!-- Format a user list -->
<span bind="users | where('active', true) | pluck('name') | sortBy('name') | join(', ')"></span>

<!-- Safe truncated display -->
<p bind="content | stripHtml | trim | truncate(200)"></p>

<!-- Number with fallback -->
<span bind="score | number(1) | default('N/A')"></span>

<!-- Debug a filter chain -->
<span bind="data | debug | where('type', 'a') | debug | count"></span>
```
