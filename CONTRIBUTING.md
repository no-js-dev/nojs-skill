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
| [no-js](https://github.com/ErickXavier/no-js) | Core framework (source of truth) |
| [nojs-elements](https://github.com/ErickXavier/nojs-elements) | UI plugin — `drag`, `drop`, `drag-list`, `drag-multiple`, `validate` (new in v1.13.0) |
| [nojs-lsp](https://github.com/ErickXavier/nojs-lsp) | VS Code language server extension |
| [nojs-skill](https://github.com/ErickXavier/nojs-skill) | AI skill for Claude Code and others |

---

## Project Structure

```plaintext
SKILL.md                  # Main skill file (loaded by AI tools)
references/
├── directives/
│   ├── data-fetching.md  # GET/POST/PUT/PATCH/DELETE
│   ├── state-and-binding.md # state, store, computed, watch, bind, model, class-*, style-*
│   ├── control-flow.md   # if/else, switch, foreach/each/for, show/hide
│   ├── events.md         # on:* events, modifiers, lifecycle hooks
│   ├── routing.md        # route, route-view, View Transitions
│   ├── forms.md          # validate, $form
│   ├── templates.md      # template, use, slot, include, lazy, call
│   └── extras.md         # animations, i18n, DnD, refs, head, error-boundary
├── filters.md            # All 32 built-in filters
├── api.md                # Framework API, config, plugins, custom directive utilities
├── patterns.md           # Common patterns & best practices
├── validation.md         # Template validation rules
├── troubleshooting.md    # Common issues & debugging guide
├── devtools.md           # DevTools API & event protocol
└── cli.md                # CLI commands & prebuild plugins
```

---

## Contribution Workflows

### Updating Skill Content

When the No.JS framework changes, the skill must stay in sync:

- [ ] Update `SKILL.md` if directives, priorities, or core concepts changed
- [ ] Update the relevant file in `references/directives/` for new/changed directives
- [ ] Update `references/filters.md` for new/changed filters
- [ ] Update `references/api.md` for API changes
- [ ] Update `references/patterns.md` for new best practices
- [ ] Update `references/validation.md` for new validation rules
- [ ] Update `references/troubleshooting.md` for new warnings or common issues
- [ ] Update `references/devtools.md` for DevTools API changes
- [ ] Update `references/cli.md` for CLI changes
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

- **Questions?** Open a [Discussion](https://github.com/ErickXavier/nojs-skill/discussions)
- **Found an inaccuracy?** Open an [Issue](https://github.com/ErickXavier/nojs-skill/issues)

We appreciate every contribution!
