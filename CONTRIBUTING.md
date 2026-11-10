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
- [ ] Do not edit version strings by hand — see [Version Management](#version-management)

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

## Version Management

- All NoJS repositories (Core, Elements, LSP, Server, Skill) share **one version**
- **Contributors should NOT bump versions** — maintainers handle version bumps and releases
- [`.versionrc.json`](.versionrc.json) is the source of truth for every place that declares the current version:
  - `.claude-plugin/plugin.json` — `version` (source of truth)
  - `nojs/SKILL.md` — frontmatter `metadata.version`
  - `nojs/SKILL.md` — `| **Version** | X.Y.Z |` row in "Version and Metadata"
- [`scripts/version.mjs`](scripts/version.mjs) rewrites (`sync`) and verifies (`check`) those locations; `node scripts/version.mjs install` (run once per clone; this repo has no `package.json`) sets `git config core.hooksPath .githooks` and adds the `git release` / `git release-check` aliases

### Releasing / version bumps

1. On the release branch, update `CHANGELOG.md`, then run `git release X.Y.Z`. It rewrites every declared location, stages them with `CHANGELOG.md` and commits `chore: release vX.Y.Z`. It never creates a tag. (Without the alias: `node scripts/version.mjs sync X.Y.Z`, then commit.)
2. Push the branch, open the release PR and merge it (merge commit).
3. Tag the merge commit: `git tag vX.Y.Z <merge-commit>`. The `reference-transaction` hook runs `scripts/version.mjs check --tag vX.Y.Z` against that commit's files and refuses the tag on any mismatch.
4. Push the tag: `git push origin vX.Y.Z`. The `pre-push` hook runs the same check again before the tag leaves your machine.

CI runs `node scripts/version.mjs check` on every push and pull request. Run it locally with `node scripts/version.mjs check` or `git release-check`.

The check fails (exit 1, with `file:line`) when:

- a `files` entry in `.versionrc.json` does not contain the `.claude-plugin/plugin.json` version exactly `count` times (default 1)
- `--tag vX.Y.Z` is given and does not match the version
- a tracked file still mentions the previous release (the highest `v*` tag below the current version) outside `scanExclude`, the declared files and `reviewAllowlist`

Version mentions come in three kinds:

| Kind | Example | Handling |
|------|---------|----------|
| Declaration of the current version | the locations above | Listed in `files` — always synced and verified |
| Historical mention | `CHANGELOG.md`, "migrated from core in v1.13.0" | Never touched — excluded via `scanExclude`, or simply not the previous version |
| State claim | "Counts on main at X.Y.Z" | Never changed automatically — listed in `reviewAllowlist` and reported as `REVIEW`, not as a failure |

**Adding a version location:** add `{ "file": "path", "pattern": "literal text with {v}" }` to `files` (or `"regex"` instead of `"pattern"`; `{v}` stands for the version). Add `"count": N` when the pattern legitimately occurs N times, and `"generated": true` when the build writes the file. Then run `node scripts/version.mjs check`.

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
