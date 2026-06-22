# NoJS Skill

![version](https://img.shields.io/github/v/tag/no-js-dev/nojs-skill?label=version)

AI skill that gives [Claude Code](https://claude.com/claude-code) and compatible AI tools expert-level knowledge of the **[No.JS](https://no-js.dev)** framework — the HTML-first reactive framework for building dynamic web applications using only HTML attributes.

## What it does

When installed, this skill automatically activates whenever you work with No.JS directives. Your AI assistant will:

- **Know all 45+ directives** with correct priorities, syntax, and companion attributes
- **Generate valid No.JS templates** following best practices (scoped state, keyed loops, proper filters)
- **Validate templates** for common mistakes (missing `as`, wrong event syntax, unsanitized `bind-html`)
- **Explain any directive** with working examples
- **Apply 32 built-in filters** correctly via pipe syntax
- **Use head management directives** (`title`, `meta`, `link`, `script`, `base`) for declarative `<head>` control
- **Leverage the plugin system** to extend the framework with custom directives and lifecycle hooks
- **Use the full public API** (config, router, i18n, stores, interceptors, plugins)

## Installation

### GitHub

```bash
claude install-skill github:no-js-dev/nojs-skill
```

### Manual

Copy the `nojs/` directory (including `SKILL.md`, `references/`, and `templates/`) into `~/.claude/skills/`.

## Files

| File | Purpose |
| --- | --- |
| `nojs/SKILL.md` | Main skill file — framework overview, directive priorities, expression syntax, decision tree, workflow checklists |
| `nojs/references/directives/http.md` | GET/POST/PUT/PATCH/DELETE directives, pagination, caching |
| `nojs/references/directives/state.md` | state, store, computed, watch, persist |
| `nojs/references/directives/binding.md` | bind, bind-html, bind-*, model, class-*, style-* |
| `nojs/references/directives/conditionals.md` | if/else, switch/case, show/hide |
| `nojs/references/directives/loops.md` | foreach/each/for, filter, sort, key, loop vars |
| `nojs/references/directives/events.md` | on:* events, modifiers, lifecycle hooks |
| `nojs/references/directives/routing.md` | route, route-view, View Transitions, file-based routing |
| `nojs/references/directives/templates.md` | template, use, slot, include, lazy loading |
| `nojs/references/directives/i18n.md` | t, t-html, i18n-ns, locale setup, pluralization |
| `nojs/references/directives/animations.md` | animate, transition, stagger, view transitions |
| `nojs/references/directives/head-seo.md` | page-title, page-description, page-canonical, page-jsonld |
| `nojs/references/directives/styling.md` | class-*, class-map, style-*, style-map |
| `nojs/references/core/filters.md` | All 32 built-in filters, custom filter API |
| `nojs/references/core/api.md` | Full JavaScript API, config, interceptors, plugin system, custom directive utilities |
| `nojs/references/core/plugins.md` | Plugin system — lifecycle, globals, interceptors, sentinels, security |
| `nojs/references/core/config.md` | All config options with defaults |
| `nojs/references/core/expressions.md` | Expression parser, safe globals, security proxies |
| `nojs/references/core/security.md` | XSS, CSRF, CSP, sanitization |
| `nojs/references/patterns/` | 6 files: auth, data-fetching, ecommerce, forms, realtime, spa |
| `nojs/references/elements/` | 17 files: accordion, breadcrumb, dnd, dropdown, modal, popover, scroll-spy, skeleton, split, stepper, table, tabs, toast, tooltip, tree, validate, virtual-list |
| `nojs/references/validation.md` | Template validation rules and common mistakes |
| `nojs/references/troubleshooting.md` | Common issues, console warnings, debugging guide |
| `nojs/references/devtools.md` | DevTools API, event protocol, inspector |

## Commands

| Command | Description |
| --- | --- |
| `/nojs cdn` | Output CDN `<script>` tags (core, elements, or both) |
| `/nojs scaffold` | Generate a starter HTML app (core, elements, spa, form) |
| `/nojs component <name>` | Generate a NoJS Elements component snippet |

## Activation

The skill activates when it detects:

- Mentions of **No.JS**, **NoJS**, or **HTML-first framework**
- HTML attributes matching No.JS directives (`bind`, `state`, `get`, `each`, `on:click`, `model`, `route`, `store`, `computed`, `watch`, `if`, `show`, `foreach`, `validate`, `animate`, `drag`, `drop`, `t`, `class-*`, `style-*`, `bind-*`)
- Questions about **declarative HTML frameworks** or building web apps **without JavaScript**

## Ecosystem

| Project | Description |
| --- | --- |
| [No.JS](https://github.com/no-js-dev/nojs) | Core framework (zero dependencies) |
| [NoJS Elements](https://github.com/no-js-dev/nojs-elements) | UI plugin — 17 accessible components (drag-and-drop, validation, modal, tabs, toast, and more) |
| [NoJS LSP](https://github.com/no-js-dev/nojs-lsp) | VS Code extension — completions, diagnostics, hover docs |
| **NoJS Skill** | This project — AI skill for Claude Code |

## Version

This skill documents **No.JS**. The framework source code is the ground truth — see [CONTRIBUTING.md](CONTRIBUTING.md) for how to keep the skill in sync.

## License

[MIT](LICENSE)
