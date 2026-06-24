# Changelog

All notable changes to the **NoJS Skill** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/no-js-dev/nojs-skill/compare/v1.15.5...HEAD)

## [1.15.5](https://github.com/no-js-dev/nojs-skill/compare/v1.15.4...v1.15.5) — 2026-06-24

### Fixed

- fix(docs): replace incorrect @nickeljs/elements references with CDN-only install across 17 element reference docs
- fix(docs): sync docs with core, remove CLI and npm references
- fix(docs): fix retry-delay example values

## [1.15.4](https://github.com/no-js-dev/nojs-skill/compare/v1.15.3...v1.15.4) — 2026-06-22

### Fixed

- fix(docs): remove jsDelivr badge from README
- fix(docs): fix install commands to use `claude install-skill`
- fix(docs): specify ~/.claude/skills/ as manual install target
- fix(docs): update directive count from 43+ to 45+
- fix(docs): update Elements ecosystem description (17 accessible components)
- fix(docs): remove npm install references from SKILL.md (Core and Elements are CDN-only)
- fix(docs): standardize Elements CDN URL to cdn-elements.no-js.dev/
- fix(docs): remove npm rows from SKILL.md quick-reference table

## [1.15.3] - 2026-06-20

### Changed

- chore: version bump for ecosystem sync

## [1.15.2] - 2026-06-20

### Fixed
- fix(build): ensure all dist files contain correct version on release

## [1.15.1](https://github.com/no-js-dev/nojs-skill/compare/v1.15.0...v1.15.1) — 2026-06-20

### Fixed

- chore(docs): fix README.md badges and miscellaneous documentation files

## [1.15.0](https://github.com/no-js-dev/nojs-skill/compare/v1.14.1...v1.15.0) — 2026-06-19

### Added

- `feat(i18n): document $i18n.[path] reactive translation proxy`
- **Skill commands** — `/nojs cdn`, `/nojs scaffold`, `/nojs component` for interactive code generation
- `templates/scaffold-core.html` — Starter app with state, binding, events, data fetching
- `templates/scaffold-elements.html` — Starter app with Elements: tabs, accordion, modal, toast
- `templates/scaffold-spa.html` — Multi-page SPA with routing, dynamic routes, 404 fallback
- `templates/scaffold-form.html` — Validated contact form with error display and character counter
- `references/directives/` — 12 granular directive files (binding, state, conditionals, loops, events, http, routing, templates, styling, i18n, animations, head-seo) replacing 8 mixed-concern files
- `references/elements/` — 17 new element reference files covering all NoJS-Elements components (accordion, breadcrumb, dnd, dropdown, modal, popover, scroll-spy, skeleton, split, stepper, table, tabs, toast, tooltip, tree, validate, virtual-list)
- `references/core/` — 6 new framework internals files (api, expressions, filters, config, security, plugins)
- `references/patterns/` — 6 domain-specific pattern files (auth, data-fetching, forms, spa, ecommerce, realtime) replacing monolithic patterns.md
- Complete expression syntax documentation (all operators, 49 safe globals, forbidden patterns)
- Error-boundary directive documentation in http.md
- 18 new usage patterns (infinite scroll, WebSocket, SSE, file upload, multi-step forms, etc.)

### Changed

- Elements CDN URL updated to `https://cdn-elements.no-js.dev/`
- **BREAKING (Core v1.15 sync):** removed all sibling-`else` loop teaching from SKILL.md and control-flow.md; loops document only the `else="templateId"` companion attribute
- Documented new `else` semantics: the else template renders when the list is empty (`[]`) or null/undefined/non-array
- Added orphan-`else` console warning entry to the troubleshooting reference
- SKILL.md rewritten from ~270 to ~605 lines as standalone quick-reference with inline examples
- File map converted to markdown links for AI navigability
- README.md and CONTRIBUTING.md updated with new file structure paths
- Filter count corrected to 32 (verified from source)
- devtools.md version updated to 1.14.1

### Removed

- `references/api.md` (superseded by `core/api.md`)
- `references/filters.md` (superseded by `core/filters.md`)
- `references/plugins.md` (superseded by `core/plugins.md`)
- `references/patterns.md` (split into `patterns/` directory)
- `references/directives/state-and-binding.md` (split into `state.md`, `binding.md`, `styling.md`)
- `references/directives/control-flow.md` (split into `conditionals.md`, `loops.md`)
- `references/directives/data-fetching.md` (renamed to `http.md`)
- `references/directives/extras.md` (distributed to `i18n.md`, `animations.md`, `head-seo.md`)
- `references/directives/forms.md` (distributed to `binding.md` and `elements/validate.md`)

## [1.14.1](https://github.com/no-js-dev/nojs-skill/compare/v1.14.0...v1.14.1) — 2026-06-11

### Fixed

- Replaced all 46 paren-style filter examples with colon syntax (filters.md, patterns.md)
- Replaced evaluator-unsafe examples (IntersectionObserver → native pagination, new Event → trigger directive)
- Fixed `on:keydown.ctrl.s` → `on:keydown.ctrl.enter` in events/validation docs
- Clarified `.backspace` vs `.delete` key modifier behavior
- Corrected "unknown modifiers trigger a warning" → "silently ignored by runtime"
- Added filters/evaluator context limitation caveat to SKILL.md
- Added `animate` to priority-15 row in directive table
- Updated version strings from 1.11.1/1.10.0 to 1.14.0
- Changed "removed in v1.15" to "removed — Unreleased" for sibling else pattern

## [1.14.0](https://github.com/no-js-dev/nojs-skill/compare/v1.13.3...v1.14.0) — 2026-06-09

### Added

- Pagination & Fetch Triggers reference section in data-fetching.md: `get-trigger`, `get-insert`, `get-page`, `get-cursor`, `get-cursor-field`, `get-threshold` with examples and composition rules
- Updated SKILL.md with pagination attributes in Data Fetching summary and CRUD examples

## [1.13.3](https://github.com/no-js-dev/nojs-skill/compare/v1.13.2...v1.13.3) — 2026-06-05

### Changed

- Version sync with NoJS ecosystem 1.13.3.

## [1.13.2](https://github.com/no-js-dev/nojs-skill/compare/v1.13.1...v1.13.2) — 2026-06-02

### Changed

- Version sync with NoJS ecosystem 1.13.2.

## [1.13.1](https://github.com/no-js-dev/nojs-skill/compare/v1.13.0...v1.13.1) — 2026-06-01

### Changed

- Version bump for ecosystem sync with NoJS v1.13.1 (no content changes)

## [1.13.0](https://github.com/no-js-dev/nojs-skill/compare/v1.12.0...v1.13.0) — 2026-06-01

### Changed

- `drag`, `drop`, `drag-list`, `drag-multiple`, and `validate` now require the `@no-js-dev/nojs-elements` plugin (`NoJS.use(NoJSElements)`); `error-boundary` and `NoJS.validator()` remain in core

## [1.12.0](https://github.com/no-js-dev/nojs-skill/compare/v1.11.1...v1.12.0) — 2026-05-21

### Changed

- Version bump for ecosystem sync with NoJS v1.12.0

## [1.11.1](https://github.com/no-js-dev/nojs-skill/compare/v1.11.0...v1.11.1) — 2026-05-21

### Added

- Split `references/directives.md` (2268 lines) into 8 focused files under `references/directives/`
- Decision tree and 5 workflow checklists in SKILL.md
- Dynamic context injection for project detection in SKILL.md
- `references/troubleshooting.md` — 10 sections, 23 real warning messages from source
- `references/devtools.md` — DevTools API, CustomEvent protocol, event stream
- Table of contents for all reference files >100 lines
- 91 documentation gaps closed after full source audit (all verified against framework source)
- Custom directive authoring utilities in api.md
- Expression security proxy documentation (blocked properties per object)

### Changed

- SKILL.md streamlined from 500+ to ~250 lines with progressive disclosure
- SKILL.md description rewritten to 3rd person (Anthropic skill guidelines)
- api.md expanded with interceptor security, cache config, plugin freeze behavior
- filters.md: fixed `fromNow` description, documented `nl2br` HTML-encoding
- README and CONTRIBUTING updated to reflect new project structure

### Removed

- Monolithic `references/directives.md` (replaced by 8 split files)
- `references/routing.md` (absorbed into `references/directives/routing.md`)
- Misleading SSG/pre-rendering pattern from patterns.md (NoJS is client-side only)
- Duplicate sections (Head Management 2x, Miscellaneous 2x, redundant error-boundary)
- NoJS-MCP references from README, CONTRIBUTING, and validation docs

### Fixed

- `persist-key` documented as required (was incorrectly described as optional)
- 12 directive discrepancies found by dev/QA verification against source
- All priority numbers, attribute lists, and modifier lists verified against source

## [1.11.0](https://github.com/no-js-dev/nojs-skill/compare/v1.10.1...v1.11.0) — 2026-03-26

### Added

- Plugin reference documentation for the plugin system ([`e6155b1`](https://github.com/no-js-dev/nojs-skill/commit/e6155b1))
- NoJS CLI reference and skill section ([`326710f`](https://github.com/no-js-dev/nojs-skill/commit/326710f))
- Head management directives (`page-title`, `page-description`, `page-canonical`, `page-jsonld`) reference ([`8ca73ff`](https://github.com/no-js-dev/nojs-skill/commit/8ca73ff))
- `focusBehavior` config option and validation notes ([`8ca73ff`](https://github.com/no-js-dev/nojs-skill/commit/8ca73ff))

### Fixed

- Add missing config options to SKILL.md ([`a0e47b7`](https://github.com/no-js-dev/nojs-skill/commit/a0e47b7))

## [1.10.1](https://github.com/no-js-dev/nojs-skill/compare/v1.10.0...v1.10.1) — 2026-03-23

### Fixed

- Sync skill reference documentation with NoJS v1.10.1 security model and hardening changes ([`4d0be1d`](https://github.com/no-js-dev/nojs-skill/commit/4d0be1d))

## [1.10.0](https://github.com/no-js-dev/nojs-skill/compare/v1.0.0...v1.10.0) — 2026-03-23

### Added

- README, LICENSE, CODE_OF_CONDUCT, SECURITY, CONTRIBUTING, GitHub issue/PR templates
- CHANGELOG
- Framework version in skill metadata (`metadata.version`)

### Changed

- Version references updated to 1.10.0

## [1.0.0](https://github.com/no-js-dev/nojs-skill/releases/tag/v1.0.0) — 2026-03-22

### Added

- SKILL.md with complete No.JS framework knowledge (39+ directives, 32 filters, expression syntax, API)
- Reference files: directives, filters, API, patterns, validation rules
- Activation triggers for No.JS-related prompts
