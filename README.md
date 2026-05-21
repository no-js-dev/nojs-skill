# NoJS Skill

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

### Claude Code

```bash
claude skill install github:ErickXavier/nojs-skill
```

### Manual

Copy `SKILL.md` and the `references/` directory into your skills directory.

## Files

| File | Purpose |
| --- | --- |
| `SKILL.md` | Main skill file — framework overview, directive priorities, expression syntax, decision tree, workflow checklists |
| `references/directives/data-fetching.md` | GET/POST/PUT/PATCH/DELETE directives |
| `references/directives/state-and-binding.md` | state, store, computed, watch, bind, model, class-*, style-* |
| `references/directives/control-flow.md` | if/else, switch, foreach/each/for, show/hide |
| `references/directives/events.md` | on:* events, modifiers, lifecycle hooks |
| `references/directives/routing.md` | route, route-view, View Transitions, file-based routing |
| `references/directives/forms.md` | validate, $form, error handling |
| `references/directives/templates.md` | template, use, slot, include, lazy, call |
| `references/directives/extras.md` | animations, i18n, DnD, refs, head management, error-boundary |
| `references/filters.md` | All 32 built-in filters with syntax and arguments |
| `references/api.md` | Full JavaScript API, config, interceptors, plugin system, custom directive utilities |
| `references/patterns.md` | Common patterns, scaffolds, and best practices |
| `references/validation.md` | Template validation rules and common mistakes |
| `references/troubleshooting.md` | Common issues, console warnings, debugging guide |
| `references/devtools.md` | DevTools API, event protocol, inspector |
| `references/cli.md` | CLI commands, prebuild plugins |

## Activation

The skill activates when it detects:

- Mentions of **No.JS**, **NoJS**, or **HTML-first framework**
- HTML attributes matching No.JS directives (`bind`, `state`, `get`, `each`, `on:click`, `model`, `route`, `store`, `computed`, `watch`, `if`, `show`, `foreach`, `validate`, `animate`, `drag`, `drop`, `t`, `class-*`, `style-*`, `bind-*`)
- Questions about **declarative HTML frameworks** or building web apps **without JavaScript**

## Ecosystem

| Project | Description |
| --- | --- |
| [No.JS](https://github.com/ErickXavier/no-js) | Core framework (zero dependencies) |
| [NoJS LSP](https://github.com/ErickXavier/nojs-lsp) | VS Code extension — completions, diagnostics, hover docs |
| [NoJS CLI](https://github.com/ErickXavier/nojs-cli) | Command-line tool for scaffolding and managing No.JS projects |
| **NoJS Skill** | This project — AI skill for Claude Code |

## Version

This skill documents **No.JS v1.11.1**. The framework source code is the ground truth — see [CONTRIBUTING.md](CONTRIBUTING.md) for how to keep the skill in sync.

## License

[MIT](LICENSE)
