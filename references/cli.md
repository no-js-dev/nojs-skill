# NoJS CLI Reference

The official command-line tool for the No.JS framework. Scaffold projects, optimize HTML for production, run a dev server with live reload, validate templates, and manage plugins.

## Contents

- [Install](#install) — How to install the CLI globally
- [Commands Overview](#commands-overview) — Summary table of all CLI commands
- [`nojs init`](#nojs-init) — Scaffold a new No.JS project
  - [Interactive Wizard](#interactive-wizard) — Guided project setup prompts
  - [Generated Files](#generated-files) — Files created by init
- [`nojs dev`](#nojs-dev) — Start local dev server with live reload
  - [Features](#features) — Dev server capabilities
  - [Reload Script](#reload-script) — Auto-injected reload mechanism
- [`nojs prebuild`](#nojs-prebuild) — Optimize HTML for production
  - [Configuration](#configuration) — Prebuild config options
  - [Plugins](#plugins) — Built-in prebuild plugins
- [`nojs validate`](#nojs-validate) — Lint and validate No.JS templates
  - [Rules](#rules) — Validation rule list
  - [Output Formats](#output-formats) — JSON, text, and CI output
  - [Exit Codes](#exit-codes) — Process exit code meanings
- [`nojs plugin`](#nojs-plugin) — Manage framework plugins
  - [Actions](#actions) — Add, remove, list, and info
  - [Plugin Config in `nojs.config.json`](#plugin-config-in-nojsconfigjson) — Plugin configuration format
  - [SRI (Subresource Integrity)](#sri-subresource-integrity) — Integrity hash verification
- [`nojs.config.json`](#nojsconfigjson) — Project configuration file format
- [Typical Workflow](#typical-workflow) — Recommended dev-to-deploy flow

## Install

```bash
npm install -g @erickxavier/nojs-cli
```

Requires **Node.js >= 18**. After installing, the `nojs` command is available globally.

---

## Commands Overview

| Command | Alias | Description |
|---------|-------|-------------|
| `nojs init [path]` | `i` | Scaffold a new No.JS project |
| `nojs prebuild [dir]` | `b` | Build-time HTML optimization |
| `nojs dev [path]` | `d` | Local dev server with live reload |
| `nojs validate [files]` | `v` | Validate No.JS templates |
| `nojs plugin <action>` | `p` | Manage plugins (search, install, update, remove, list) |
| `nojs help` | | Show help |
| `nojs version` | | Show CLI version |

All commands support `-h` or `--help` for command-specific help.

---

## `nojs init`

Interactive wizard that generates a ready-to-go No.JS project.

### Usage

```bash
nojs init [path] [options]
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--name <name>` | Project name | Directory name |
| `--routing, -r <y\|n>` | Enable SPA routing | Prompt |
| `--i18n <y\|n>` | Enable internationalization | Prompt |
| `--locales <list>` | Comma-separated locale codes | `en,pt` |
| `--default-locale <locale>` | Default locale | First locale |
| `--api <url>` | Base API URL for fetch directives | None |
| `--yes, -y` | Skip wizard, accept defaults | Off |

### Interactive Wizard

When not all flags are provided and `--yes` is not set, the wizard asks:

1. **Project name** (default: directory name)
2. **Use SPA routing?** (y/N)
3. **Use i18n?** (y/N)
4. If i18n: **Locales** (default: `en, pt`)
5. If i18n: **Default locale** (default: first locale)
6. **Base API URL** (default: none)

Boolean flags accept: `y`, `yes`, `s`, `sim`, `true`, `1` (case-insensitive).

### Generated Files

```plaintext
my-app/
├── index.html              # Main entry with CDN script, routes, i18n
├── assets/
│   └── style.css           # Base stylesheet
├── pages/                  # (if routing)
│   ├── home.tpl
│   └── about.tpl
├── locales/                # (if i18n)
│   ├── en.json
│   └── pt.json
└── nojs.config.json        # Project metadata + plugins list
```

### Examples

```bash
# Interactive mode
nojs init my-app

# Non-interactive with all options
nojs init my-app --routing --i18n --locales en,pt,es --api https://api.example.com --yes

# Minimal project, no prompts
nojs init my-app -y
```

---

## `nojs dev`

Local HTTP dev server with Server-Sent Events (SSE) live reload.

### Usage

```bash
nojs dev [path] [options]
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--port <port>` | Port number | `3000` |
| `--open` | Open browser on start | Off |
| `--quiet, -q` | Suppress request logging | Off |
| `--no-reload` | Disable live reload | Off |

### Features

- **Live reload via SSE** — watches all files (except hidden and `node_modules/`), broadcasts reload on changes with 100ms debounce
- **SPA fallback** — serves root `index.html` for unmatched clean URLs (no extension), enabling client-side routing
- **Path traversal protection** — resolves all paths and rejects requests outside the served root, blocks null bytes
- **Colored request logging** — green (2xx), cyan (3xx), yellow (4xx), red (5xx)
- **MIME detection** — supports `.html`, `.tpl`, `.css`, `.js`, `.mjs`, `.json`, `.svg`, `.png`, `.jpg`, `.gif`, `.webp`, `.ico`, `.woff`, `.woff2`, `.ttf`, `.md`, `.xml`, `.txt`

### Reload Script

When live reload is enabled, the server injects an SSE client script before `</body>` in every HTML response. The script auto-reconnects on disconnect (2s delay). Max 100 concurrent SSE clients.

### Examples

```bash
nojs dev                  # Serve current directory on port 3000
nojs dev ./docs/          # Serve a specific directory
nojs dev --port 8080      # Custom port
nojs dev --open           # Open browser on start
nojs dev --quiet          # No request logging
nojs dev --no-reload      # Static server only
```

---

## `nojs prebuild`

Build-time HTML optimization pipeline with 6 plugins.

### Usage

```bash
nojs prebuild [options]
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--input <glob>` | HTML files glob pattern | `**/*.html` |
| `--output <dir>` | Output directory | In-place |
| `--config <path>` | Config file path | Auto-detect |
| `--plugin <name>` | Run only specific plugin(s) | All |
| `--list` | List available plugins | |
| `--dry-run` | Preview without writing | |

### Configuration

Auto-detected from project root:
1. `nojs-prebuild.config.js`
2. `nojs-prebuild.config.mjs`

```javascript
export default {
  input: "**/*.html",
  output: null,             // null = overwrite in-place
  plugins: {
    "inject-resource-hints": true,
    "inject-head-attrs": true,
    "inject-speculation-rules": { action: "prerender", eagerness: "moderate" },
    "inject-og-twitter": { siteName: "My Site", twitterSite: "@handle" },
    "generate-sitemap": { baseUrl: "https://example.com" },
    "optimize-images": { lcpSelector: "img.hero" }
  }
}
```

### Plugins

#### `inject-resource-hints`

Adds `<link rel="preload">` and `<link rel="preconnect">` for fetch directive URLs and route template sources. Skips interpolated URLs (`{...}` expressions).

#### `inject-head-attrs`

Extracts static `page-*` directive values and injects into `<head>`:
- `page-title` → `<title>`
- `page-description` → `<meta name="description">`
- `page-canonical` → `<link rel="canonical">`
- `page-jsonld` → `<script type="application/ld+json">`

#### `inject-speculation-rules`

Generates a [Speculation Rules API](https://developer.chrome.com/docs/web-platform/prerender-pages) script from `<template route="...">` definitions for near-instant navigation.

| Option | Default | Values |
|--------|---------|--------|
| `action` | `"prerender"` | `"prerender"`, `"prefetch"` |
| `eagerness` | `"moderate"` | `"eager"`, `"moderate"`, `"conservative"` |
| `excludePatterns` | `[]` | Array of route patterns to skip |

Only includes static routes (no `:param` segments). Skips `route="*"`.

#### `inject-og-twitter`

Generates Open Graph and Twitter Card meta tags from `page-*` directives.

| Option | Default | Description |
|--------|---------|-------------|
| `type` | `"website"` | `og:type` value |
| `defaultImage` | — | `og:image` and `twitter:image` |
| `siteName` | — | `og:site_name` |
| `twitterCard` | `"summary"` | `twitter:card` value |
| `twitterSite` | — | `twitter:site` handle |

#### `generate-sitemap`

Generates `sitemap.xml` from route definitions and canonical URLs.

| Option | Default | Description |
|--------|---------|-------------|
| `baseUrl` | (required) | Base URL for sitemap entries |
| `changefreq` | `"weekly"` | Change frequency |
| `priority` | `0.8` | URL priority |
| `excludePatterns` | `[]` | Routes to exclude |

#### `optimize-images`

Adds lazy loading, LCP preload, and `fetchpriority` hints to `<img>` tags.

| Option | Default | Description |
|--------|---------|-------------|
| `lcpSelector` | — | CSS selector for LCP image (gets `fetchpriority="high"` + preload) |
| `skipLazy` | — | CSS selector for images to exclude from lazy loading |

Non-LCP images get `loading="lazy"` and `decoding="async"`.

### Examples

```bash
nojs prebuild                         # Process all HTML in-place
nojs prebuild --output dist/          # Write to dist/
nojs prebuild --plugin generate-sitemap --plugin optimize-images
nojs prebuild --dry-run               # Preview changes
nojs prebuild --list                  # Show available plugins
```

---

## `nojs validate`

Validate No.JS templates against 10 rules. CI-friendly with JSON output.

### Usage

```bash
nojs validate [glob] [options]
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--format <format>` | Output format: `pretty` or `json` | `pretty` |

### Rules

#### Errors (cause exit code 1)

| Rule | Triggers when |
|------|--------------|
| `fetch-missing-as` | `get`, `post`, `put`, `patch`, `delete` without `as` attribute |
| `each-missing-in` | `each="..."` without the `in` keyword |
| `foreach-missing-in` | `foreach="..."` without the `in` keyword |
| `for-missing-in` | `for="..."` without the `in` keyword |
| `validate-outside-form` | `validate="..."` outside a `<form validate>` |
| `event-empty-handler` | `on:*` attribute with empty value |

#### Warnings (exit code 0)

| Rule | Triggers when |
|------|--------------|
| `model-non-form-element` | `model` on non-input/select/textarea elements |
| `bind-html-warning` | Any use of `bind-html` (reminder to trust content) |
| `route-without-route-view` | `<template route>` exists but no `route-view` element |
| `loop-missing-key` | `foreach`, `each`, or `for` without `key` attribute |
| `duplicate-store-name` | Multiple `store="name"` with the same name |

### Output Formats

**Pretty** (default):
```
src/index.html
  x get="/users" is missing the "as" attribute [fetch-missing-as]
  ! each="item" without a "key" attribute [loop-missing-key]

1 error(s), 1 warning(s) in 1 file(s)
```

**JSON** (for CI):
```json
[{
  "filePath": "src/index.html",
  "issues": [{
    "rule": "fetch-missing-as",
    "severity": "error",
    "message": "..."
  }]
}]
```

### Exit Codes

- **0** — No errors (warnings may exist)
- **1** — One or more errors found

### Examples

```bash
nojs validate *.html                  # Validate HTML files
nojs validate src/ --format json      # JSON output for CI pipelines
nojs validate "**/*.html"             # Recursive glob
```

---

## `nojs plugin`

Hybrid plugin manager — CDN for official plugins, npm for community packages.

### Usage

```bash
nojs plugin <action> [name]
```

### Actions

#### `search <query>`

Searches both the CDN registry (`cdn.no-js.dev/plugins/registry.json`) and npm simultaneously.

```bash
nojs plugin search analytics
```

#### `install <name>`

Install a plugin. Prefix with `npm:` for npm packages.

```bash
nojs plugin install carousel              # CDN (official)
nojs plugin install npm:@someone/carousel # npm (community)
```

- **CDN plugins**: Fetched from `cdn.no-js.dev/plugins/{name}.js`, SRI integrity hash (sha384) computed automatically
- **npm plugins**: Installed via `npm install`, referenced from `node_modules/`

After install, outputs the HTML `<script>` snippet to add to your page.

#### `update <name>`

Re-fetches CDN plugins (recomputes integrity) or runs `npm update` for npm plugins.

```bash
nojs plugin update carousel
```

#### `remove <name>`

Removes a plugin from the project config and uninstalls npm packages.

```bash
nojs plugin remove carousel
```

#### `list`

Lists all installed plugins with source and URL.

```bash
nojs plugin list
```

### Plugin Config in `nojs.config.json`

```json
{
  "plugins": [
    {
      "name": "carousel",
      "source": "cdn",
      "url": "https://cdn.no-js.dev/plugins/carousel.js",
      "integrity": "sha384-...",
      "installed": "2025-03-25"
    },
    {
      "name": "@someone/carousel",
      "source": "npm",
      "installed": "2025-03-25"
    }
  ]
}
```

### SRI (Subresource Integrity)

CDN plugins automatically get SHA384 integrity hashes. The generated `<script>` tag includes `integrity` and `crossorigin` attributes for tamper protection.

---

## `nojs.config.json`

Project configuration file generated by `nojs init` and managed by `nojs plugin`.

```json
{
  "name": "my-app",
  "version": "0.1.0",
  "plugins": []
}
```

| Key | Type | Description |
|-----|------|-------------|
| `name` | string | Project name |
| `version` | string | Project version (semver) |
| `plugins` | array | Installed plugins (managed by `nojs plugin`) |

---

## Typical Workflow

```bash
# 1. Scaffold a project
nojs init my-app --routing --i18n --locales en,pt -y
cd my-app

# 2. Develop with live reload
nojs dev --open

# 3. Install a plugin
nojs plugin install analytics

# 4. Validate templates before deploy
nojs validate *.html

# 5. Optimize for production
nojs prebuild --output dist/
```
