# NoJS Skill — Complete Gap Report

**Date:** 2026-05-21
**Source:** `/Users/erick/_projects/_personal/NoJS/NoJS/src/`
**Skill:** `/Users/erick/_projects/_personal/NoJS/NoJS-Skill/`
**Method:** Line-by-line audit of all source files vs all skill documentation

---

## Summary

| Category | Gaps | Severity |
|----------|------|----------|
| Directives (attributes, behaviors, modifiers) | 30 | High |
| Public API & Config | 8 | High |
| Router | 13 | High |
| Expressions & Evaluator | 7 | High |
| Filters | 2 | Medium |
| Context & Reactivity | 6 | Medium |
| DOM & Templates | 7 | Medium |
| Security (sanitization, proxies, redaction) | 12 | High |
| DevTools | 4 | Medium |
| Custom Directive Authoring (internals) | 8 | Low |
| **TOTAL** | **~91 unique gaps** | |

---

## 1. Directive Gaps (references/directives/)

### data-fetching.md

| # | Gap | Source | Severity |
|---|-----|--------|----------|
| 1 | `el.refresh` programmatic method — each HTTP element gets `.refresh()` via `$refs.myEl.refresh()` for re-fetch | http.js:325 | HIGH |
| 2 | `success`/`error` template `var` priority chain: `tplEl.var` > directive `var` > `"result"`/`"err"` default | http.js:197-200, 249-250 | MEDIUM |
| 3 | Form auto-serialization applies to `put`/`patch` too (not just `post`) | http.js:136-139 | MEDIUM |
| 4 | Non-GET on non-FORM triggers on `click` (not submit) | http.js:282-288 | MEDIUM |
| 5 | SwitchMap/abort: rapid calls abort in-flight request | http.js:79 | MEDIUM |
| 6 | Reactive URL debounce skips re-fetch if resolved URL unchanged | http.js:301 | LOW |

### state-and-binding.md

| # | Gap | Source | Severity |
|---|-----|--------|----------|
| 7 | `persist-key` is REQUIRED — docs say "defaults to auto-generated" but source warns and skips if missing | state.js:22-26 | HIGH (wrong) |
| 8 | Sensitive key warning on `persist` — keys matching `token`, `password`, `secret`, `key`, `auth`, `credential`, `session` | state.js:62-67 | MEDIUM |
| 9 | `watch` exposes `$old` and `$new` in `on:change` handler | state.js:134 | HIGH |
| 10 | `bind-value` on input/textarea/select is two-way (attaches `input` listener) | binding.js:119-129 | HIGH |
| 11 | `bind-html` debug/devtools security warning for dynamic expressions | binding.js:27-32 | LOW |
| 12 | `bind-*` boolean attribute special handling — `disabled`, `readonly`, `checked`, `selected`, `hidden`, `required` | binding.js:136-148 | MEDIUM |
| 13 | `bind-*` URL sanitization — `href`, `src`, `action`, `formaction`, `poster`, `data` block `javascript:` and unsafe `data:` | binding.js:99-109 | HIGH |
| 14 | `model` supports `type="range"` (coerced to Number) | binding.js:187 | MEDIUM |
| 15 | `class-map` supports space-separated class keys: `'bg-sky-500 text-white': x` | styling.js:19-26 | MEDIUM |
| 16 | `class-*` watches i18n locale changes when expression contains `$i18n`/`NoJS.locale` | styling.js:58 | LOW |

### control-flow.md

| # | Gap | Source | Severity |
|---|-----|--------|----------|
| 17 | `else-if` and `else` support `then` attribute (template reference) | conditionals.js:113-119, 167-170 | MEDIUM |
| 18 | `show`/`hide` support `animate-enter`, `animate-leave`, `transition`, `animate-duration` | conditionals.js:192-196, 228-232 | HIGH |
| 19 | `switch` `case`/`default` children support `then` attribute — not in attribute tables | conditionals.js:263 | MEDIUM |
| 20 | Deprecated `from` attribute on loops: `foreach="item" from="list"` — logs warning, no migration note | loops.js:60-66 | LOW |
| 21 | `animate-duration` works on loop directives (only documented for `if`) | loops.js:79 | MEDIUM |
| 22 | Custom `index="i"` AND `$index` are both available simultaneously | loops.js:68, 162 | MEDIUM |

### events.md

| # | Gap | Source | Severity |
|---|-----|--------|----------|
| 23 | `trigger` only responds to click events (not submit/other) | events.js:165 | MEDIUM |
| 24 | `on:updated` fires on ALL DOM mutations (attribute, text, child changes) — broader than data-driven updates | events.js:28-37 | MEDIUM |

### forms.md

| # | Gap | Source | Severity |
|---|-----|--------|----------|
| 25 | `validate="custom:myValidator"` syntax for calling named validators | validation.js:74-79 | MEDIUM |
| 26 | `error` attribute `#` prefix rule distinguishes template ID from message string | validation.js:348-352 | MEDIUM |
| 27 | `submit` event marks ALL fields as touched for immediate error display | validation.js:484-491 | MEDIUM |
| 28 | `$form.submitting` resets after `requestAnimationFrame` (brief async lifecycle) | validation.js:486 | LOW |

### templates.md

| # | Gap | Source | Severity |
|---|-----|--------|----------|
| 29 | `call` disables the button during loading (`el.disabled = true`) | refs.js:115-117 | MEDIUM |
| 30 | `call` sensitive header warning (same as HTTP directives) | refs.js:133-138 | LOW |
| 31 | `call` success template appended to `closest([route-view])` or `parentElement` (not a content-swap) | refs.js:173-174 | HIGH |

### extras.md

| # | Gap | Source | Severity |
|---|-----|--------|----------|
| 32 | `drag`/`drop` dispatch custom DOM events: `drag-start`, `drag-end`, `drag-enter`, `drag-leave`, `drag-over` | dnd.js:357, 387, 519, 545, 567 | HIGH |
| 33 | Stacked-cards ghost visual for multi-drag (count badge + stacked layers) | dnd.js:175-233 | LOW |

---

## 2. Router Gaps (references/directives/routing.md)

| # | Gap | Source | Severity |
|---|-----|--------|----------|
| 34 | `router.destroy()` public method | router.js | LOW |
| 35 | Hash-only navigation (same path, different #hash) skips re-render, only scrolls | router.js | MEDIUM |
| 36 | History-mode also intercepts plain `a[href^="#"]` for smooth scroll (not only hash mode) | router.js | MEDIUM |
| 37 | `route-active-exact` vs `route-active` prefix/exact matching not clearly explained | router.js | HIGH |
| 38 | `router.replace()` does not set nav direction to "forward" (affects View Transition direction) | router.js | MEDIUM |
| 39 | Hierarchical file-based routing: automatic layout probe logic (first-segment.tpl check before flat fallback) | router.js | HIGH |
| 40 | Nested outlets receive remaining path segments recursively (unlimited nesting) | router.js | MEDIUM |
| 41 | `<a route lazy="priority">` and `<a route lazy="ondemand">` affect prefetch scheduling | router.js | MEDIUM |
| 42 | Layout-aware prefetch optimization (skip layout re-fetch when cached) | router.js | LOW |
| 43 | `route-view src="./..."` resolves relative paths against parent template's `__srcBase` | router.js | MEDIUM |
| 44 | `route-view[route-index]` auto-loads index template when empty after navigation | router.js | MEDIUM |
| 45 | View Transition default: duration 0.3s, timing-function ease | animations.js | MEDIUM |
| 46 | `::view-transition-group(route-content)` has `overflow: hidden` | animations.js | LOW |

---

## 3. Public API & Config Gaps (references/api.md)

| # | Gap | Source | Severity |
|---|-----|--------|----------|
| 47 | `NoJS._initialized` getter/setter for resetting init state | index.js | LOW |
| 48 | Plugin `capabilities` field is only logged, not enforced | index.js | LOW |
| 49 | `_config.sanitizeHtml` custom function hook — listed in table but has no description | dom.js, api.md | HIGH |
| 50 | `resolveUrl()` checks ANY ancestor element for `base` attribute, not only `<body>` | fetch.js | MEDIUM |
| 51 | HTTP response LRU cache max 200 entries | globals.js | MEDIUM |
| 52 | Interceptor recursion depth guard (max 1) | fetch.js | MEDIUM |
| 53 | Untrusted interceptors receive frozen shell response, not real Response | fetch.js | MEDIUM |
| 54 | HTTP retry: `AbortError` is never retried regardless of `retries` config | fetch.js | LOW |

---

## 4. Expression & Evaluator Gaps (SKILL.md + references/)

| # | Gap | Source | Severity |
|---|-----|--------|----------|
| 55 | `_safeWindow` blocks: `fetch`, `XMLHttpRequest`, `localStorage`, `sessionStorage`, `WebSocket`, `indexedDB`, `eval`, `Function`, `importScripts`, `open`, `postMessage`; blocks writes to `name`, `status` | evaluate.js | HIGH |
| 56 | `_safeDocument` blocks: `cookie`, `domain`, `write`, `writeln`, `execCommand` | evaluate.js | HIGH |
| 57 | `_safeLocation` is read-only; `assign`, `replace`, `reload` are no-ops | evaluate.js | MEDIUM |
| 58 | `_safeHistory` is read-only; `pushState`, `replaceState`, `back`, `forward`, `go` are no-ops | evaluate.js | MEDIUM |
| 59 | `_safeNavigator` blocks `sendBeacon`, `credentials` | evaluate.js | MEDIUM |
| 60 | Assignment operators `+=`, `-=`, `*=`, `/=`, `%=`, `++`, `--` all supported in event expressions | evaluate.js | MEDIUM |
| 61 | Statement executor supports semicolon-separated multi-statement execution | evaluate.js | MEDIUM |

---

## 5. Filter Gaps (references/filters.md)

| # | Gap | Source | Severity |
|---|-----|--------|----------|
| 62 | `fromNow` ToC entry says "Time elapsed since date" — should be "Time until a future date" | filters.js | HIGH (wrong) |
| 63 | `nl2br` also HTML-encodes `&`, `<`, `>` before converting newlines | filters.js | MEDIUM |

---

## 6. Context & Reactivity Gaps

| # | Gap | Source | Severity |
|---|-----|--------|----------|
| 64 | Statement write-back: mutated context vars auto-written to owning context | evaluate.js | HIGH |
| 65 | New vars created during statement execution persisted via `$set` | evaluate.js | MEDIUM |
| 66 | Both `_exprCache` and `_stmtCache` use LRU eviction (not FIFO) | evaluate.js | LOW |
| 67 | Route-loaded i18n namespaces (`_loadedNs`) also fetched for new locale on switch | i18n.js | MEDIUM |
| 68 | `createContext` `data` has trap checks parent chain (`key in proxy` = true for inherited) | context.js | LOW |
| 69 | Disconnected element watcher auto-cleanup via `fn._el` guard | context.js | LOW |

---

## 7. DOM & Template Gaps

| # | Gap | Source | Severity |
|---|-----|--------|----------|
| 70 | Insecure template URL warning (HTTP from HTTPS page) | dom.js | MEDIUM |
| 71 | Template HTML cache: resolved-URL key, route templates pre-warm sub-template caches | dom.js | MEDIUM |
| 72 | `./`-relative template `src` resolves against parent template folder | dom.js | MEDIUM |
| 73 | Built-in sanitizer blocked tags: `script`, `style`, `iframe`, `object`, `embed`, `base`, `form`, `meta`, `link`, `noscript` | dom.js | HIGH |
| 74 | SVG `data:image/svg+xml` deep-sanitization in `bind-html` | dom.js | MEDIUM |
| 75 | Three-phase template loading: Phase 0 (priority), Phase 1 (blocking), Phase 2 (background) | dom.js | HIGH |
| 76 | MutationObserver-based store watcher auto-cleanup | globals.js | LOW |

---

## 8. Security Gaps (scattered across docs)

| # | Gap | Source | Severity |
|---|-----|--------|----------|
| 77 | Sensitive request headers redacted from untrusted interceptors (full list) | globals.js | HIGH |
| 78 | Sensitive response headers redacted (full list) | globals.js | HIGH |
| 79 | URL query param redaction for untrusted interceptors (`token\|key\|secret\|auth\|password\|credential`) | fetch.js | HIGH |
| 80 | `_freezeDirectives()` prevents plugins from overriding core directive names | registry.js | MEDIUM |

---

## 9. DevTools Gaps (entirely undocumented)

| # | Gap | Source | Severity |
|---|-----|--------|----------|
| 81 | `NoJS.config({ devtools: true })` — entire devtools subsystem | devtools.js | MEDIUM |
| 82 | `window.__NOJS_DEVTOOLS__` API: `inspect`, `inspectStore`, `inspectTree`, `stats`, `mutate`, `mutateStore`, `highlight`, `unhighlight`, `on` | devtools.js | MEDIUM |
| 83 | DevTools CustomEvent protocol: `nojs:devtools:cmd` / `nojs:devtools:response` | devtools.js | LOW |
| 84 | DevTools event stream: `store:created`, `global:set`, `ctx:created`, `ctx:updated`, `ctx:disposed`, `directive:init`, `route:navigate`, `batch:start`, `batch:end` | devtools.js | LOW |
| 85 | DevTools silently disabled on non-local hostnames | devtools.js | LOW |

---

## 10. Custom Directive Authoring Gaps (for plugin/directive developers)

| # | Gap | Source | Severity |
|---|-----|--------|----------|
| 86 | `_onDispose(fn)` cleanup callback utility | globals.js | MEDIUM |
| 87 | `_watchExpr(expr, ctx, fn)` combining context + store watchers | globals.js | MEDIUM |
| 88 | Registry wildcard pattern matching for custom directives (`my-*`) | registry.js | MEDIUM |
| 89 | `_disposeTree(root)` / `_disposeChildren(parent)` for subtree disposal | registry.js | LOW |
| 90 | `el.__declared = false` to force re-processing | registry.js | LOW |
| 91 | Default priority when omitted is 50 (outside documented 0-30 range) | registry.js | MEDIUM |

---

## Documentation Errors (Wrong Information)

| # | What's wrong | Where | Correct behavior |
|---|-------------|-------|-----------------|
| 7 | `persist-key` described as optional with auto-generated default | state-and-binding.md | REQUIRED — source warns and skips if missing |
| 62 | `fromNow` filter described as "Time elapsed since date" | filters.md TOC | Should be "Time until a future date" |

---

# Fix Plan

## Phase 1: Critical Fixes (wrong information + HIGH gaps)

**Priority: Immediate — these cause user confusion or broken code**

### Task 1A: Fix documentation errors
- Fix `persist-key` from "optional" to "required" in state-and-binding.md
- Fix `fromNow` description in filters.md

### Task 1B: High-severity directive gaps (18 items)
Files: data-fetching.md, state-and-binding.md, control-flow.md, templates.md, extras.md, routing.md

- `el.refresh` method (#1)
- `watch` `$old`/`$new` variables (#9)
- `bind-value` two-way behavior (#10)
- `bind-*` URL sanitization (#13)
- `show`/`hide` animation support (#18)
- `call` success template behavior (#31)
- `drag`/`drop` custom DOM events (#32)
- `route-active-exact` vs `route-active` semantics (#37)
- Hierarchical file-based routing layout probe (#39)

### Task 1C: High-severity non-directive gaps (8 items)
Files: api.md, SKILL.md, troubleshooting.md

- `sanitizeHtml` config description (#49)
- Expression security proxies: blocked properties per object (#55-56)
- Statement write-back mutation model (#64)
- Sanitizer blocked tags list (#73)
- Three-phase template loading (#75)
- Sensitive header redaction lists (#77-79)

## Phase 2: Medium-severity gaps (40 items)

### Task 2A: Directive attribute completions
- `var` priority chain in success/error templates (#2)
- Form serialization for put/patch (#3)
- Non-GET click trigger (#4)
- SwitchMap abort (#5)
- Persist sensitive key warning (#8)
- Boolean attribute handling (#12)
- `model` range input (#14)
- `class-map` space-separated keys (#15)
- `else-if`/`else` `then` support (#17)
- `switch` case/default `then` attribute (#19)
- `animate-duration` on loops (#21)
- `index` + `$index` coexistence (#22)
- `trigger` click-only (#23)
- `on:updated` MutationObserver scope (#24)
- `custom:myValidator` syntax (#25)
- `error` `#` prefix rule (#26)
- Submit marks all touched (#27)
- `call` disabled during loading (#29)

### Task 2B: Router completions
- Hash-only navigation scroll (#35)
- History-mode anchor smooth scroll (#36)
- `router.replace()` direction (#38)
- Nested outlet recursion (#40)
- `<a route lazy>` prefetch (#41)
- `route-view src="./..."` resolution (#43)
- `route-view[route-index]` auto-load (#44)
- View Transition defaults (#45)

### Task 2C: API, expression, filter completions
- `resolveUrl()` ancestor `base` (#50)
- HTTP cache max 200 (#51)
- Interceptor recursion guard (#52)
- Frozen shell response for untrusted interceptors (#53)
- `_safeLocation` read-only (#57)
- `_safeHistory` no-ops (#58)
- `_safeNavigator` blocks (#59)
- Assignment operators (#60)
- Multi-statement `;` support (#61)
- `nl2br` HTML-encoding (#63)
- Statement var persistence (#65)
- i18n namespace reload on locale switch (#67)
- Insecure template URL warning (#70)
- Template HTML cache (#71)
- `./`-relative template resolution (#72)
- SVG deep-sanitization (#74)

## Phase 3: Low-severity + DevTools (22 items)

### Task 3A: Create references/devtools.md
New file documenting:
- `NoJS.config({ devtools: true })` (#81)
- `window.__NOJS_DEVTOOLS__` API (#82)
- CustomEvent protocol (#83)
- Event stream types (#84)
- Local-hostname restriction (#85)

### Task 3B: Custom directive authoring section in api.md
- `_onDispose(fn)` (#86)
- `_watchExpr()` (#87)
- Wildcard pattern registration (#88)
- `_disposeTree()` / `_disposeChildren()` (#89)
- `el.__declared` re-processing (#90)
- Default priority 50 (#91)

### Task 3C: Remaining low-severity items
- Reactive URL skip (#6)
- `class-*` i18n reactivity (#16)
- `from` deprecated syntax (#20)
- `$form.submitting` lifecycle (#28)
- `call` sensitive header warning (#30)
- Stacked-cards multi-drag ghost (#33)
- `router.destroy()` (#34)
- Layout-aware prefetch (#42)
- View Transition overflow hidden (#46)
- `_initialized` reset (#47)
- Plugin capabilities logging (#48)
- `AbortError` retry skip (#54)
- LRU eviction detail (#66)
- Context parent chain `in` operator (#68)
- Disconnected element cleanup (#69)
- Store watcher auto-cleanup (#76)
- `_freezeDirectives()` (#80)

## Verification Protocol (same as EPIC SKILL-3)

Every content task must:
1. Writer verifies against framework source code
2. @dev verification: 5 passes against source
3. @qa verification: 5 passes independent audit
