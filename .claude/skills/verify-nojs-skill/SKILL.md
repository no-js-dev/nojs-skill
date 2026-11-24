---
name: verify-nojs-skill
description: Check the nojs skill (this repo's nojs/ folder and .claude-plugin/plugin.json) the way an AI agent consumes it - frontmatter that registers it, relative links that must resolve, the shared version contract, and whether every HTML example it teaches renders with NoJS core in Chromium without page or expression errors. Use it before merging a docs change to the skill, after a core release that may break examples, or when asked to verify, validate or smoke-test the NoJS skill.
---

# Verify the nojs skill

The product here is text an agent reads: `nojs/SKILL.md` (registered by `.claude-plugin/plugin.json`), `nojs/references/**/*.md` it links to, and `nojs/templates/*.html` it copies. `scripts/vsk.mjs` checks exactly that: it parses the frontmatter, follows every relative link, runs the repo's version check, and renders every ` ```html ` block and template in headless Chromium with a local NoJS core build in place of `https://cdn.no-js.dev/`.

The feature map in [`features/README.md`](features/README.md) lists what is checked and how to read the results.

## Ground rules

- Work in your own worktree (`git worktree add ../NoJS-Skill--<name> -b <branch> origin/main`), never the shared `../NoJS-Skill` checkout.
- Core and NoJS-Elements are read from built checkouts (`NOJS_CORE_PATH`, `NOJS_ELEMENTS_PATH`); nothing here builds or edits them.
- Nothing listens on a port and nothing reaches the network: example pages come from an in-memory origin (`http://nojs-skill.test`), core and Elements from local files, any other request gets 404 (same origin) or is aborted.
- The checks only read the repo. They never edit `nojs/`.

## Launch

There is no server. Launch means: prerequisites present, once per shell.

```bash
cd <your NoJS-Skill worktree>
export NOJS_CORE_PATH=<built core checkout at the skill's version>     # e.g. /Users/erick/_projects/_personal/NoJS/NoJS-v123
export NOJS_ELEMENTS_PATH=<built NoJS-Elements checkout>                # e.g. /Users/erick/_projects/_personal/NoJS/NoJS-Elements-main
export PLAYWRIGHT_DIR=<a directory whose node_modules has @playwright/test>   # e.g. a NoJS-Server worktree after npm ci
export VSK_EVIDENCE=<where proof should live>                           # default $TMPDIR/verifys-evidence/nojs-skill
K=.claude/skills/verify-nojs-skill/scripts/vsk.mjs
```

This repo has no `package.json`; Playwright is borrowed from `PLAYWRIGHT_DIR`, else `NOJS_SERVER_PATH`, else the core checkout. Its Chromium must be installed (`npx playwright install chromium` in that directory).

## Doctor

```bash
$K doctor
```

Read-only. `PASS`/`FAIL` for: node >= 20 (CI runs 20), `nojs/SKILL.md` present, git checkout, core built (`dist/iife/no.js`), core version equal to `plugin.json` version, NoJS-Elements built, `@playwright/test` importable. Last line `OK doctor (n/n)` (exit 0) or `FAILED` (exit 1).

## Drive

```bash
$K frontmatter                 # registration: plugin.json -> nojs/SKILL.md frontmatter
$K links                       # every relative link in nojs/**/*.md: file exists, heading anchor exists
$K version                     # node scripts/version.mjs check (the CI gate)
$K examples                    # every ```html block + templates/*.html rendered with core
$K examples --file elements/   # only examples whose id (path:line) contains the substring
$K all [--jobs <n>]           # all of the above; exit 0 only if every check passes
```

`examples` wraps a fragment in a minimal page with core in `<head>` (and Elements when the file is under `references/elements/` or the snippet uses an Elements directive); a full document (`<!DOCTYPE` / `<html`) is served as written, its CDN tags answered locally. Each page loads, waits 400 ms, and is classified:

- `pass` — `window.NoJS` initialized, no uncaught page error, no `[No.JS] Expression error`.
- `fail` — core did not initialize, or a page error, or an expression error. The page HTML and a screenshot go to `failed/`.
- `expected-bad` (printed `BAD?`) — would fail, but the four lines before the block (or its first line) read like a counter-example (`wrong`, `avoid`, `don't`, `❌`, `unsafe`, ...). Read it before trusting the label: it is a text heuristic.

Other `[No.JS]` warnings (unknown custom filter, failed fetch to a URL the example invents, security rejections the example demonstrates) are recorded per example in `examples.json` as `core`, not failures.

## Evidence

Each invocation writes a timestamped folder under `$VSK_EVIDENCE` (`all` shares one):

| File | What it proves |
|------|----------------|
| `doctor.json` | prerequisites, versions and paths used |
| `frontmatter.json` | each registration rule with the observed value (name, description length, version) |
| `links.json` | every relative link with its source file and result |
| `version.txt` | the `node scripts/version.mjs check` transcript and exit code |
| `examples.json` | per example: id (`path:line`), status, whether core initialized, Elements used, every captured `[No.JS]` message and page error; summary with core version |
| `failed/<id>.{html,png}` | the exact page that failed and what it rendered |

Proof standards: cite the example id (`nojs/references/...md:<line>`) and the message; a pass means "renders and initializes without errors in isolation", not "does what the prose says". Behavior claims need their own journey (open the failed page HTML in a browser, or drive it with the NoJS-Server or reference-site skills).

## Cleanup

Nothing keeps running: `examples` closes its browser before it exits, and an interrupted run leaves no server or port behind. Kill only a Chromium you started, by its pid, never by name. Evidence folders stay; delete them yourself only when the user no longer needs them.

## Helpers

| Helper | Invocation | What it does |
|--------|------------|--------------|
| `scripts/vsk.mjs` | `vsk.mjs doctor` · `frontmatter` · `links` · `version` · `examples [--file <substring>] [--jobs <n>]` · `all [--jobs <n>]` | The checks above. `vsk.mjs` with no command prints this usage. `--jobs` (default 4) is the number of pages rendered at once. |

Environment: `NOJS_CORE_PATH`, `NOJS_ELEMENTS_PATH`, `PLAYWRIGHT_DIR`, `VSK_EVIDENCE` (default `$TMPDIR/verifys-evidence/nojs-skill`), `VSK_DESCRIPTION_MAX` (default 1024, the Agent Skills limit for `description`).
