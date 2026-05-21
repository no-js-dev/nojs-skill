# Changelog

All notable changes to the **NoJS Skill** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.12.0](https://github.com/ErickXavier/nojs-skill/compare/v1.11.1...v1.12.0) — 2026-05-21

### Changed

- Version bump for ecosystem sync with NoJS v1.12.0

## [1.11.1](https://github.com/ErickXavier/nojs-skill/compare/v1.11.0...v1.11.1) — 2026-05-21

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

## [1.11.0](https://github.com/ErickXavier/nojs-skill/compare/v1.10.1...v1.11.0) — 2026-03-26

### Added

- Plugin reference documentation for the plugin system ([`e6155b1`](https://github.com/ErickXavier/nojs-skill/commit/e6155b1))
- NoJS CLI reference and skill section ([`326710f`](https://github.com/ErickXavier/nojs-skill/commit/326710f))
- Head management directives (`page-title`, `page-description`, `page-canonical`, `page-jsonld`) reference ([`8ca73ff`](https://github.com/ErickXavier/nojs-skill/commit/8ca73ff))
- `focusBehavior` config option and validation notes ([`8ca73ff`](https://github.com/ErickXavier/nojs-skill/commit/8ca73ff))

### Fixed

- Add missing config options to SKILL.md ([`a0e47b7`](https://github.com/ErickXavier/nojs-skill/commit/a0e47b7))

## [1.10.1](https://github.com/ErickXavier/nojs-skill/compare/v1.10.0...v1.10.1) — 2026-03-23

### Fixed

- Sync skill reference documentation with NoJS v1.10.1 security model and hardening changes ([`4d0be1d`](https://github.com/ErickXavier/nojs-skill/commit/4d0be1d))

## [1.10.0](https://github.com/ErickXavier/nojs-skill/compare/v1.0.0...v1.10.0) — 2026-03-23

### Added

- README, LICENSE, CODE_OF_CONDUCT, SECURITY, CONTRIBUTING, GitHub issue/PR templates
- CHANGELOG
- Framework version in skill metadata (`metadata.version`)

### Changed

- Version references updated to 1.10.0

## [1.0.0](https://github.com/ErickXavier/nojs-skill/releases/tag/v1.0.0) — 2026-03-22

### Added

- SKILL.md with complete No.JS framework knowledge (39+ directives, 32 filters, expression syntax, API)
- Reference files: directives, filters, API, patterns, validation rules
- Activation triggers for No.JS-related prompts
