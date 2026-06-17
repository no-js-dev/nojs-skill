# Contributing to NoJS Skill

Thank you for your interest in contributing to the NoJS Skill! This guide will help you get started.

---

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing. We are committed to a welcoming and inclusive community.

---

## Getting Started

The NoJS Skill is part of the No.JS ecosystem:

| Repository | Purpose |
| --- | --- |
| [no-js](https://github.com/no-js-dev/nojs) | Core framework (source of truth) |
| [nojs-elements](https://github.com/no-js-dev/nojs-elements) | UI plugin — `drag`, `drop`, `drag-list`, `drag-multiple`, `validate` (new in v1.13.0) |
| [nojs-lsp](https://github.com/no-js-dev/nojs-lsp) | VS Code language server extension |
| [nojs-skill](https://github.com/no-js-dev/nojs-skill) | AI skill for Claude Code and others |

---

## Project Structure

```plaintext
SKILL.md                    # Main skill file (loaded by AI tools)
references/
├── core/
│   ├── api.md              # Framework API, config, custom directive utilities
│   ├── config.md           # All config options with defaults
│   ├── expressions.md      # Expression parser, safe globals, security proxies
│   ├── filters.md          # All 32 built-in filters, custom filter API
│   ├── plugins.md          # Plugin lifecycle, interceptors, sentinels
│   └── security.md         # XSS, CSRF, CSP, sanitization
├── directives/
│   ├── animations.md       # animate, transition, stagger, view transitions
│   ├── binding.md          # bind, bind-html, bind-*, model
│   ├── conditionals.md     # if/else, switch/case, show/hide
│   ├── events.md           # on:* events, modifiers, lifecycle hooks
│   ├── head-seo.md         # page-title, page-description, page-canonical, page-jsonld
│   ├── http.md             # GET/POST/PUT/PATCH/DELETE, pagination, caching
│   ├── i18n.md             # t, t-html, i18n-ns, locale setup, pluralization
│   ├── loops.md            # foreach/each/for, filter, sort, key, loop vars
│   ├── routing.md          # route, route-view, View Transitions, file-based
│   ├── state.md            # state, store, computed, watch, persist
│   ├── styling.md          # class-*, class-map, style-*, style-map
│   └── templates.md        # template, use, slot, include, lazy loading
├── elements/               # 17 files: accordion, breadcrumb, dnd, dropdown, etc.
├── patterns/               # 6 files: auth, data-fetching, ecommerce, forms, realtime, spa
├── devtools.md             # DevTools API & event protocol
├── troubleshooting.md      # Common issues & debugging guide
└── validation.md           # Template validation rules
```

---

## Contribution Workflows

### Updating Skill Content

When the No.JS framework changes, the skill must stay in sync:

- [ ] Update `SKILL.md` if directives, priorities, or core concepts changed
- [ ] Update the relevant file in `references/directives/` for new/changed directives
- [ ] Update `references/core/filters.md` for new/changed filters
- [ ] Update `references/core/api.md` for API changes
- [ ] Update `references/core/config.md` for config option changes
- [ ] Update `references/core/plugins.md` for plugin system changes
- [ ] Update the relevant file in `references/patterns/` for new best practices
- [ ] Update `references/validation.md` for new validation rules
- [ ] Update `references/troubleshooting.md` for new warnings or common issues
- [ ] Update `references/devtools.md` for DevTools API changes
- [ ] Update the `version` in `SKILL.md` frontmatter metadata

### Ground Truth

The **No.JS source code** (`src/`) is always the source of truth. When in doubt, verify against:

- `src/directives/*.js` — directive names, priorities, and all attributes
- `src/filters.js` — filter names and signatures
- `src/directives/events.js` — event modifiers and key modifiers
- `src/animations.js` — built-in animation names
- `src/router.js` — router methods, route config, View Transitions
- `src/evaluate.js` — expression syntax, security proxies
- `src/context.js` — reactive context, proxy behavior
- `src/dom.js` — template loading, sanitization
- `src/devtools.js` — DevTools API
- `src/globals.js` — config defaults, interceptor security

### Writing Style

- Be precise and concise — AI tools have limited context windows
- Include working examples for every directive and pattern
- Use the pipe syntax `value | filter` consistently
- Always show the `as` attribute on fetch directives

---

## Version Sync Checklist

When releasing a new version, bump **all** of the following in a single commit:

- [ ] `nojs/SKILL.md` — frontmatter `metadata.version` field
- [ ] `.claude-plugin/plugin.json` — `version` field
- [ ] `README.md` — version reference in the "Version" section
- [ ] Git tag — `git tag -a vX.Y.Z -m "vX.Y.Z"` and push with `git push origin vX.Y.Z`

All NoJS ecosystem repos share the same version. Never bump this repo independently — coordinate with Core, Elements, LSP, and CLI.

---

## Branch & Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Type | Purpose |
| --- | --- |
| `feat` | New content or reference section |
| `fix` | Accuracy fix (wrong priority, missing filter, etc.) |
| `docs` | README or meta-documentation update |
| `chore` | Maintenance (version bump, formatting) |

Branch naming: `feat/`, `fix/`, `docs/`, `chore/` prefixes from `main`.

---

## Pull Request Guidelines

1. **One concern per PR** — don't mix unrelated changes
2. **Cite the source** — reference the framework source file that validates your change
3. **Link related issues** with `Closes #123` or `Fixes #456`

---

## Need Help?

- **Questions?** Open a [Discussion](https://github.com/no-js-dev/nojs-skill/discussions)
- **Found an inaccuracy?** Open an [Issue](https://github.com/no-js-dev/nojs-skill/issues)

We appreciate every contribution!
