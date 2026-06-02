# NoJS Skill

[![jsDelivr hits](https://data.jsdelivr.com/v1/package/gh/erickxavier/nojs-skill/badge)](https://www.jsdelivr.com/package/gh/erickxavier/nojs-skill)

AI skill that gives [Claude Code](https://claude.com/claude-code) and compatible AI tools expert-level knowledge of the **[No.JS](https://no-js.dev)** framework — the HTML-first reactive framework for building dynamic web applications using only HTML attributes.

## What it does

When installed, this skill automatically activates whenever you work with No.JS directives. Your AI assistant will:

- **Know all 39+ directives** with correct priorities, syntax, and companion attributes
- **Generate valid No.JS templates** following best practices (scoped state, keyed loops, proper filters)
- **Validate templates** for common mistakes (missing `as`, wrong event syntax, unsanitized `bind-html`)
- **Explain any directive** with working examples
- **Apply 32 built-in filters** correctly via pipe syntax
- **Use head management directives** (`title`, `meta`, `link`, `script`, `base`) for declarative `<head>` control
- **Leverage the plugin system** to extend the framework with custom directives and lifecycle hooks
- **Use the full public API** (config, router, i18n, stores, interceptors, plugins)

## Installation

### Claude Code (Marketplace)

```bash
/plugin marketplace add ErickXavier/nojs-skill
/plugin install nojs@nojs-skill
```

### Claude Code (Skill)

```bash
claude skill install github:ErickXavier/nojs-skill
```

### Manual

Copy `nojs/SKILL.md` and the `nojs/references/` directory into your skills directory.

## Files

| File | Purpose |
| --- | --- |
| `nojs/SKILL.md` | Main skill file — framework overview, directive priorities, expression syntax, decision tree, workflow checklists |
| `nojs/references/directives/data-fetching.md` | GET/POST/PUT/PATCH/DELETE directives |
| `nojs/references/directives/state-and-binding.md` | state, store, computed, watch, bind, model, class-*, style-* |
| `nojs/references/directives/control-flow.md` | if/else, switch, foreach/each/for, show/hide |
| `nojs/references/directives/events.md` | on:* events, modifiers, lifecycle hooks |
| `nojs/references/directives/routing.md` | route, route-view, View Transitions, file-based routing |
| `nojs/references/directives/forms.md` | validate, $form, error handling |
| `nojs/references/directives/templates.md` | template, use, slot, include, lazy, call |
| `nojs/references/directives/extras.md` | animations, i18n, DnD, refs, head management, error-boundary |
| `nojs/references/filters.md` | All 32 built-in filters with syntax and arguments |
| `nojs/references/api.md` | Full JavaScript API, config, interceptors, plugin system, custom directive utilities |
| `nojs/references/patterns.md` | Common patterns, scaffolds, and best practices |
| `nojs/references/validation.md` | Template validation rules and common mistakes |
| `nojs/references/troubleshooting.md` | Common issues, console warnings, debugging guide |
| `nojs/references/devtools.md` | DevTools API, event protocol, inspector |
| `nojs/references/cli.md` | CLI commands, prebuild plugins |

## Activation

The skill activates when it detects:

- Mentions of **No.JS**, **NoJS**, or **HTML-first framework**
- HTML attributes matching No.JS directives (`bind`, `state`, `get`, `each`, `on:click`, `model`, `route`, `store`, `computed`, `watch`, `if`, `show`, `foreach`, `validate`, `animate`, `drag`, `drop`, `t`, `class-*`, `style-*`, `bind-*`)
- Questions about **declarative HTML frameworks** or building web apps **without JavaScript**

## Ecosystem

| Project | Description |
| --- | --- |
| [No.JS](https://github.com/ErickXavier/no-js) | Core framework (zero dependencies) |
| [NoJS Elements](https://github.com/ErickXavier/nojs-elements) | UI plugin — `drag`, `drop`, `drag-list`, `drag-multiple`, `validate` (new in v1.13.0) |
| [NoJS LSP](https://github.com/ErickXavier/nojs-lsp) | VS Code extension — completions, diagnostics, hover docs |
| [NoJS CLI](https://github.com/ErickXavier/nojs-cli) | Command-line tool for scaffolding and managing No.JS projects |
| **NoJS Skill** | This project — AI skill for Claude Code |

## Version

This skill documents **No.JS v1.11.1**. The framework source code is the ground truth — see [CONTRIBUTING.md](CONTRIBUTING.md) for how to keep the skill in sync.

## License

[MIT](LICENSE)
