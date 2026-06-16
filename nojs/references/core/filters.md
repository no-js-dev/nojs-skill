# No.JS Built-in Filters Reference

No.JS ships with **32 built-in filters** organized into five categories. Filters transform expression values using the pipe (`|`) operator.

## Contents

- [Pipe Syntax](#pipe-syntax)
- [Text Filters (9)](#text-filters)
  - [uppercase](#uppercase) -- [lowercase](#lowercase) -- [capitalize](#capitalize) -- [truncate](#truncate) -- [trim](#trim) -- [stripHtml](#striphtml) -- [slugify](#slugify) -- [nl2br](#nl2br) -- [encodeUri](#encodeuri)
- [Number Filters (5)](#number-filters)
  - [number](#number) -- [currency](#currency) -- [percent](#percent) -- [filesize](#filesize) -- [ordinal](#ordinal)
- [Array Filters (9)](#array-filters)
  - [count](#count) -- [first](#first) -- [last](#last) -- [join](#join) -- [reverse](#reverse) -- [unique](#unique) -- [pluck](#pluck) -- [sortBy](#sortby) -- [where](#where)
- [Date Filters (4)](#date-filters)
  - [date](#date) -- [datetime](#datetime) -- [relative](#relative) -- [fromNow](#fromnow)
- [Utility Filters (5)](#utility-filters)
  - [default](#default) -- [json](#json) -- [debug](#debug) -- [keys](#keys) -- [values](#values)
- [Custom Filters](#custom-filters)
- [Chaining Patterns](#chaining-patterns)

---

## Pipe Syntax

```
value | filterName
value | filterName:arg1
value | filterName:arg1:arg2
value | filter1 | filter2 | filter3
```

The pipe operator has the lowest precedence -- everything to its left is evaluated first, then the result is passed as the first argument to the filter function. Additional arguments are separated by `:`.

```html
<span bind="name | uppercase"></span>
<span bind="price | currency:'EUR'"></span>
<span bind="items | where:'active':true | count"></span>
```

---

## Text Filters

### uppercase

Convert a string to all uppercase letters.

| | |
|---|---|
| **Syntax** | `value \| uppercase` |
| **Arguments** | None |

```html
<span bind="name | uppercase"></span>
<!-- "hello" -> "HELLO" -->
```

### lowercase

Convert a string to all lowercase letters.

| | |
|---|---|
| **Syntax** | `value \| lowercase` |
| **Arguments** | None |

```html
<span bind="status | lowercase"></span>
<!-- "ACTIVE" -> "active" -->
```

### capitalize

Capitalize the first letter of every word.

| | |
|---|---|
| **Syntax** | `value \| capitalize` |
| **Arguments** | None |

```html
<span bind="title | capitalize"></span>
<!-- "hello world" -> "Hello World" -->
```

### truncate

Truncate a string to a maximum length, appending `...` if truncated.

| | |
|---|---|
| **Syntax** | `value \| truncate:length` |
| **Arguments** | `length` (number, default: 100) -- maximum character count |

```html
<span bind="description | truncate:50"></span>
<!-- "A very long description..." -> "A very long description that goes on and on..." -->
```

### trim

Remove leading and trailing whitespace.

| | |
|---|---|
| **Syntax** | `value \| trim` |
| **Arguments** | None |

```html
<span bind="input | trim"></span>
<!-- "  hello  " -> "hello" -->
```

### stripHtml

Remove all HTML tags from a string.

| | |
|---|---|
| **Syntax** | `value \| stripHtml` |
| **Arguments** | None |

```html
<span bind="content | stripHtml"></span>
<!-- "<p>Hello <b>world</b></p>" -> "Hello world" -->
```

### slugify

Convert a string to a URL-friendly slug (lowercase, hyphens for non-alphanumeric characters).

| | |
|---|---|
| **Syntax** | `value \| slugify` |
| **Arguments** | None |

```html
<span bind="title | slugify"></span>
<!-- "Hello World!" -> "hello-world" -->
```

### nl2br

Convert newlines to `<br>` tags. HTML-escapes `&`, `<`, and `>` before converting. Use with `bind-html`.

| | |
|---|---|
| **Syntax** | `value \| nl2br` |
| **Arguments** | None |

```html
<div bind-html="message | nl2br"></div>
<!-- "Line 1\nLine 2" -> "Line 1<br>Line 2" -->
```

The filter escapes `&` to `&amp;`, `<` to `&lt;`, and `>` to `&gt;` before converting `\n` to `<br>`, making it safe against HTML injection.

### encodeUri

URL-encode a string using `encodeURIComponent`.

| | |
|---|---|
| **Syntax** | `value \| encodeUri` |
| **Arguments** | None |

```html
<a bind-href="'/search?q=' + (query | encodeUri)">Search</a>
<!-- "hello world" -> "hello%20world" -->
```

---

## Number Filters

### number

Format a number with locale-aware grouping separators and decimal places.

| | |
|---|---|
| **Syntax** | `value \| number:decimals` |
| **Arguments** | `decimals` (number, default: 0) -- decimal places |

```html
<span bind="count | number"></span>           <!-- 1234 -> "1,234" -->
<span bind="price | number:2"></span>         <!-- 1234.5 -> "1,234.50" -->
```

Uses `Intl.NumberFormat` with the browser's default locale.

### currency

Format a number as currency using `Intl.NumberFormat`.

| | |
|---|---|
| **Syntax** | `value \| currency:code` |
| **Arguments** | `code` (string, default: `"USD"`) -- ISO 4217 currency code |

```html
<span bind="price | currency"></span>            <!-- 29.99 -> "$29.99" -->
<span bind="price | currency:'EUR'"></span>       <!-- 29.99 -> "EUR 29.99" -->
<span bind="price | currency:'BRL'"></span>       <!-- 29.99 -> "R$ 29.99" -->
```

### percent

Format a number as a percentage.

| | |
|---|---|
| **Syntax** | `value \| percent:decimals` |
| **Arguments** | `decimals` (number, default: 0) -- decimal places |

```html
<span bind="ratio | percent"></span>          <!-- 0.42 -> "42%" -->
<span bind="ratio | percent:1"></span>        <!-- 0.4256 -> "42.6%" -->
```

Uses `Intl.NumberFormat` with `style: 'percent'`.

### filesize

Format a number of bytes into a human-readable file size string.

| | |
|---|---|
| **Syntax** | `value \| filesize` |
| **Arguments** | None |

```html
<span bind="size | filesize"></span>
<!-- 1536 -> "1.50 KB" -->
<!-- 1572864 -> "1.50 MB" -->
<!-- 1073741824 -> "1.00 GB" -->
```

Units: B, KB, MB, GB, TB. Uses 1024-based division.

### ordinal

Format a number with its English ordinal suffix (st, nd, rd, th).

| | |
|---|---|
| **Syntax** | `value \| ordinal` |
| **Arguments** | None |

```html
<span bind="rank | ordinal"></span>
<!-- 1 -> "1st", 2 -> "2nd", 3 -> "3rd", 4 -> "4th" -->
<!-- 11 -> "11th", 12 -> "12th", 13 -> "13th" -->
<!-- 21 -> "21st", 22 -> "22nd", 23 -> "23rd" -->
```

---

## Array Filters

### count

Return the length of an array. Returns `0` for non-arrays.

| | |
|---|---|
| **Syntax** | `value \| count` |
| **Arguments** | None |

```html
<span bind="items | count"></span>
<!-- [1, 2, 3] -> 3 -->
```

### first

Return the first element of an array.

| | |
|---|---|
| **Syntax** | `value \| first` |
| **Arguments** | None |

```html
<span bind="items | first"></span>
<!-- ["a", "b", "c"] -> "a" -->
```

### last

Return the last element of an array.

| | |
|---|---|
| **Syntax** | `value \| last` |
| **Arguments** | None |

```html
<span bind="items | last"></span>
<!-- ["a", "b", "c"] -> "c" -->
```

### join

Join array elements into a string with a separator.

| | |
|---|---|
| **Syntax** | `value \| join:separator` |
| **Arguments** | `separator` (string, default: `", "`) -- delimiter between elements |

```html
<span bind="tags | join:', '"></span>
<!-- ["js", "html", "css"] -> "js, html, css" -->

<span bind="parts | join:'-'"></span>
<!-- ["2026", "06", "15"] -> "2026-06-15" -->
```

### reverse

Reverse the order of an array. Returns a new array (non-mutating).

| | |
|---|---|
| **Syntax** | `value \| reverse` |
| **Arguments** | None |

```html
<div each="item in items | reverse">
  <span bind="item"></span>
</div>
```

### unique

Remove duplicate values from an array using `Set`. Returns a new array.

| | |
|---|---|
| **Syntax** | `value \| unique` |
| **Arguments** | None |

```html
<span bind="tags | unique | join:', '"></span>
<!-- ["js", "html", "js", "css"] -> "js, html, css" -->
```

### pluck

Extract a single property from each object in an array.

| | |
|---|---|
| **Syntax** | `value \| pluck:property` |
| **Arguments** | `property` (string) -- the property name to extract |

```html
<span bind="users | pluck:'name' | join:', '"></span>
<!-- [{name:"Alice"}, {name:"Bob"}] -> "Alice, Bob" -->
```

### sortBy

Sort an array of objects by a property. Prefix the property name with `-` for descending order. Returns a new array (non-mutating).

| | |
|---|---|
| **Syntax** | `value \| sortBy:property` |
| **Arguments** | `property` (string) -- property name; prefix with `-` for descending |

```html
<!-- Ascending -->
<div each="user in users | sortBy:'name'">
  <span bind="user.name"></span>
</div>

<!-- Descending -->
<div each="post in posts | sortBy:'-date'">
  <span bind="post.title"></span>
</div>
```

String comparison is locale-aware (uses `localeCompare`). Numeric values are compared numerically.

### where

Filter an array to objects matching a property condition.

| | |
|---|---|
| **Syntax** | `value \| where:property:value` |
| **Arguments** | `property` (string) -- property name to test; `value` (any) -- expected value |

```html
<!-- Filter active users -->
<div each="user in users | where:'active':true">
  <span bind="user.name"></span>
</div>

<!-- Filter by role -->
<div each="admin in users | where:'role':'admin'">
  <span bind="admin.name"></span>
</div>
```

When `value` is omitted, filters to items where the property is truthy.

---

## Date Filters

All date filters use an internal `_parseDate` helper that handles date-only ISO strings (`"2026-05-29"`) by appending `T00:00:00` to parse them as local time instead of UTC. This prevents off-by-one-day issues in negative-UTC-offset timezones.

### date

Format a date using `Intl.DateTimeFormat` with locale-aware formatting.

| | |
|---|---|
| **Syntax** | `value \| date:format` |
| **Arguments** | `format` (string, default: `"short"`) -- `"short"`, `"long"`, or `"full"` |

```html
<span bind="createdAt | date"></span>              <!-- "6/15/26" (short) -->
<span bind="createdAt | date:'long'"></span>        <!-- "June 15, 2026" -->
<span bind="createdAt | date:'full'"></span>        <!-- "Monday, June 15, 2026" -->
```

Returns the original value unchanged if the input cannot be parsed as a valid date.

### datetime

Format a date and time using `toLocaleString()`.

| | |
|---|---|
| **Syntax** | `value \| datetime` |
| **Arguments** | None |

```html
<span bind="updatedAt | datetime"></span>
<!-- "6/15/2026, 2:30:00 PM" (locale-dependent) -->
```

### relative

Format a past date as a human-readable relative time string (e.g., "2h ago"). For future dates, delegates to `fromNow`.

| | |
|---|---|
| **Syntax** | `value \| relative` |
| **Arguments** | None |

```html
<span bind="lastSeen | relative"></span>
```

| Time Elapsed | Output |
|-------------|--------|
| < 60 seconds | `"just now"` |
| < 1 hour | `"Xm ago"` |
| < 1 day | `"Xh ago"` |
| < 30 days | `"Xd ago"` |
| >= 30 days | Locale-formatted date |

### fromNow

Format a future date as a human-readable countdown string. For past dates, delegates to `relative`.

| | |
|---|---|
| **Syntax** | `value \| fromNow` |
| **Arguments** | None |

```html
<span bind="deadline | fromNow"></span>
```

| Time Remaining | Output |
|---------------|--------|
| < 60 seconds | `"just now"` |
| < 1 hour | `"in Xm"` |
| < 1 day | `"in Xh"` |
| < 30 days | `"in Xd"` |
| >= 30 days | Locale-formatted date |

---

## Utility Filters

### default

Return a fallback value when the input is `null`, `undefined`, or an empty string.

| | |
|---|---|
| **Syntax** | `value \| default:fallback` |
| **Arguments** | `fallback` (any, default: `""`) -- value to use when input is empty |

```html
<span bind="nickname | default:'Anonymous'"></span>
<!-- null -> "Anonymous", "Erick" -> "Erick" -->
```

Note: `0` and `false` are NOT considered empty by this filter (unlike `||`).

### json

Serialize a value to a formatted JSON string.

| | |
|---|---|
| **Syntax** | `value \| json:indent` |
| **Arguments** | `indent` (number, default: 2) -- indentation spaces |

```html
<pre bind="config | json"></pre>
<pre bind="data | json:4"></pre>
```

### debug

Log the value to the console and return it unchanged. Useful for inspecting intermediate values in a filter chain.

| | |
|---|---|
| **Syntax** | `value \| debug` |
| **Arguments** | None |

```html
<span bind="items | debug | where:'active':true | debug | count"></span>
<!-- Logs the array before and after filtering -->
```

### keys

Return an array of an object's own keys.

| | |
|---|---|
| **Syntax** | `value \| keys` |
| **Arguments** | None |

```html
<span bind="config | keys | join:', '"></span>
<!-- {a: 1, b: 2} -> "a, b" -->
```

Returns an empty array for non-object values.

### values

Return an array of an object's own values.

| | |
|---|---|
| **Syntax** | `value \| values` |
| **Arguments** | None |

```html
<span bind="config | values | join:', '"></span>
<!-- {a: 1, b: 2} -> "1, 2" -->
```

---

## Custom Filters

Register custom filters with `NoJS.filter(name, fn)`. Built-in filter names are protected and cannot be overridden.

```javascript
// Single-argument filter
NoJS.filter('initials', (name) => {
  return name.split(' ').map(w => w[0]).join('').toUpperCase();
});

// Multi-argument filter
NoJS.filter('pad', (value, length, char) => {
  return String(value).padStart(length, char || '0');
});

// Filter using external library
NoJS.filter('markdown', (text) => {
  return marked.parse(text);
});
```

```html
<span bind="fullName | initials"></span>         <!-- "John Doe" -> "JD" -->
<span bind="id | pad:6:'0'"></span>              <!-- 42 -> "000042" -->
<div bind-html="content | markdown"></div>
```

---

## Chaining Patterns

Filters can be chained to build complex transformations:

```html
<!-- Text processing pipeline -->
<span bind="content | stripHtml | trim | truncate:100"></span>

<!-- Array processing pipeline -->
<span bind="users | where:'active':true | sortBy:'name' | pluck:'name' | join:', '"></span>

<!-- Conditional display with default -->
<span bind="user.bio | stripHtml | truncate:200 | default:'No bio provided'"></span>

<!-- Debug intermediate values -->
<span bind="items | debug | where:'price':0 | debug | count"></span>
```
