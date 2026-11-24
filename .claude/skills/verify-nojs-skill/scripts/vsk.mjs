#!/usr/bin/env node
// vsk — check the nojs skill the way an agent consumes it: the frontmatter
// that registers it, the files its links send the agent to, the version
// contract, and whether the HTML examples it teaches render with NoJS core.
//
//   vsk.mjs doctor
//   vsk.mjs frontmatter
//   vsk.mjs links
//   vsk.mjs version
//   vsk.mjs examples [--file <substring>] [--jobs <n>]
//   vsk.mjs all [--jobs <n>]
//
// Nothing listens on a port: examples are served to Chromium from an
// in-memory origin (http://nojs-skill.test), core and Elements from local
// checkouts in place of their CDN URLs, every other request answered 404.
// Environment: NOJS_CORE_PATH, NOJS_ELEMENTS_PATH (built checkouts),
// PLAYWRIGHT_DIR (a directory whose node_modules has @playwright/test),
// VSK_EVIDENCE (default $TMPDIR/verifys-evidence/nojs-skill), VSK_DESCRIPTION_MAX (default 1024).

import { execFileSync, spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '../../../..');
const SKILL_DIR = join(REPO, 'nojs');
const TMP = process.env.TMPDIR || os.tmpdir();
const EVIDENCE_ROOT = resolve(process.env.VSK_EVIDENCE || join(TMP, 'verifys-evidence', 'nojs-skill'));
const CORE_DIR = resolve(process.env.NOJS_CORE_PATH || join(REPO, '../NoJS'));
const ELEMENTS_DIR = resolve(process.env.NOJS_ELEMENTS_PATH || join(REPO, '../NoJS-Elements'));
const DESCRIPTION_MAX = Number(process.env.VSK_DESCRIPTION_MAX || 1024);
const ORIGIN = 'http://nojs-skill.test';

const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const pkgVersion = (d) => { try { return readJson(join(d, 'package.json')).version; } catch { return null; } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let evidence = null;
function evidenceDir() {
  if (!evidence) {
    evidence = join(EVIDENCE_ROOT, new Date().toISOString().replace(/[:.]/g, '-'));
    fs.mkdirSync(evidence, { recursive: true });
  }
  return evidence;
}
function report(name, rows, extra = {}) {
  for (const r of rows) console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.what}${r.detail ? ` — ${r.detail}` : ''}`);
  const ok = rows.every((r) => r.ok);
  fs.writeFileSync(join(evidenceDir(), `${name}.json`), `${JSON.stringify({ check: name, ok, rows, ...extra }, null, 2)}\n`);
  console.log(`${ok ? 'OK' : 'FAILED'} ${name} (${rows.filter((r) => r.ok).length}/${rows.length}); evidence ${join(evidenceDir(), `${name}.json`)}`);
  return ok;
}

function playwrightDir() {
  const candidates = [process.env.PLAYWRIGHT_DIR, process.env.NOJS_SERVER_PATH, CORE_DIR].filter(Boolean).map((d) => resolve(d));
  return candidates.find((d) => fs.existsSync(join(d, 'node_modules/@playwright/test/index.mjs'))) ?? null;
}

function markdownFiles() {
  return fs.readdirSync(SKILL_DIR, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith('.md'))
    .map((e) => join(e.parentPath ?? e.path, e.name)).sort();
}

// ── frontmatter ────────────────────────────────────────────────────────

function parseFrontmatter(text) {
  if (!text.startsWith('---\n')) return null;
  const end = text.indexOf('\n---\n', 4);
  if (end < 0) return null;
  const out = {};
  let parent = null;
  for (const line of text.slice(4, end).split('\n')) {
    const nested = /^ {2}([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    const top = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (nested && parent) out[parent][nested[1]] = nested[2];
    else if (top) { out[top[1]] = top[2] === '' ? {} : top[2]; parent = top[2] === '' ? top[1] : null; }
  }
  return out;
}

function cmdFrontmatter() {
  const rows = [];
  const add = (ok, what, detail = '') => rows.push({ ok, what, detail });
  const plugin = readJson(join(REPO, '.claude-plugin/plugin.json'));
  add(Array.isArray(plugin.skills) && plugin.skills.length > 0, '.claude-plugin/plugin.json lists skills', JSON.stringify(plugin.skills));
  for (const rel of plugin.skills ?? []) {
    const dir = resolve(REPO, rel);
    const file = join(dir, 'SKILL.md');
    add(fs.existsSync(file), `${rel}/SKILL.md exists`);
    if (!fs.existsSync(file)) continue;
    const fm = parseFrontmatter(fs.readFileSync(file, 'utf8'));
    add(!!fm, `${rel}/SKILL.md starts with a --- frontmatter block`);
    if (!fm) continue;
    const base = dir.split(sep).pop();
    add(typeof fm.name === 'string' && /^[a-z0-9-]{1,64}$/.test(fm.name), 'name is lowercase letters, digits and hyphens, at most 64 characters', String(fm.name));
    add(fm.name === base, 'name equals the skill folder name', `${fm.name} / ${base}`);
    const desc = typeof fm.description === 'string' ? fm.description : '';
    add(desc.length > 0, 'description is present');
    add(desc.length <= DESCRIPTION_MAX, `description is at most ${DESCRIPTION_MAX} characters`, `${desc.length} characters`);
    add(!/[<>]/.test(desc), 'description has no angle brackets');
    add(fm.metadata?.version === plugin.version, 'metadata.version equals plugin.json version', `${fm.metadata?.version} / ${plugin.version}`);
  }
  return report('frontmatter', rows);
}

// ── links ──────────────────────────────────────────────────────────────

function slugify(heading) {
  return heading.trim().toLowerCase().replace(/<[^>]+>/g, '').replace(/`/g, '')
    .replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-');
}

function anchorsOf(file) {
  const seen = new Map();
  const anchors = new Set();
  let fence = false;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (/^```/.test(line)) fence = !fence;
    if (fence) continue;
    const m = /^#{1,6}\s+(.*?)\s*#*\s*$/.exec(line);
    if (!m) continue;
    const base = slugify(m[1]);
    const n = seen.get(base) ?? 0;
    anchors.add(n ? `${base}-${n}` : base);
    seen.set(base, n + 1);
  }
  return anchors;
}

function cmdLinks() {
  const rows = [];
  let total = 0;
  for (const file of markdownFiles()) {
    const text = fs.readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g, '');
    for (const m of text.matchAll(/\]\(([^)\s]+)\)/g)) {
      const href = m[1];
      if (/^(https?:|mailto:)/.test(href)) continue;
      total++;
      const [path, anchor] = href.split('#');
      const target = path ? resolve(dirname(file), path) : file;
      const where = `${relative(REPO, file)} -> ${href}`;
      if (!fs.existsSync(target)) { rows.push({ ok: false, what: where, detail: 'file not found' }); continue; }
      if (anchor && target.endsWith('.md') && !anchorsOf(target).has(anchor)) { rows.push({ ok: false, what: where, detail: `no heading with anchor #${anchor}` }); continue; }
      rows.push({ ok: true, what: where });
    }
  }
  const failed = rows.filter((r) => !r.ok);
  for (const r of failed) console.log(`FAIL ${r.what} — ${r.detail}`);
  console.log(`${total - failed.length}/${total} relative links resolve (files and heading anchors) in ${markdownFiles().length} markdown files`);
  fs.writeFileSync(join(evidenceDir(), 'links.json'), `${JSON.stringify({ check: 'links', ok: failed.length === 0, total, rows }, null, 2)}\n`);
  console.log(`${failed.length ? 'FAILED' : 'OK'} links; evidence ${join(evidenceDir(), 'links.json')}`);
  return failed.length === 0;
}

// ── version ────────────────────────────────────────────────────────────

function cmdVersion() {
  const res = spawnSync(process.execPath, [join(REPO, 'scripts/version.mjs'), 'check'], { cwd: REPO, encoding: 'utf8' });
  const out = `${res.stdout}${res.stderr}`;
  fs.writeFileSync(join(evidenceDir(), 'version.txt'), `$ node scripts/version.mjs check\n${out}exit ${res.status}\n`);
  process.stdout.write(out);
  console.log(`${res.status === 0 ? 'OK' : 'FAILED'} version (exit ${res.status}); evidence ${join(evidenceDir(), 'version.txt')}`);
  return res.status === 0;
}

// ── examples ───────────────────────────────────────────────────────────

const ELEMENT_DIRECTIVES = /\s(modal|modal-open|tabs|tab|panel|accordion|tooltip|popover|dropdown|dropdown-toggle|toast-container|toast|tree|branch|stepper|step|skeleton|split|pane|sortable|virtual-list|scroll-spy|breadcrumb|drag|drop|drag-list|validate)(=|\s|>)/;
const BAD_CONTEXT = /(❌|\bwrong\b|\bbad\b|\bincorrect\b|\bdon['’]t\b|\bdo not\b|\bavoid\b|\banti-pattern\b|\binvalid\b|\bbroken\b|\bfails?\b|\bunsafe\b|\binsecure\b|\bvulnerable\b|\bxss\b|\bnot work\b)/i;

function collectExamples(filter) {
  const out = [];
  for (const file of markdownFiles()) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (!/^```html\s*$/.test(lines[i])) continue;
      const start = i + 1;
      let j = start;
      while (j < lines.length && !/^```\s*$/.test(lines[j])) j++;
      const code = lines.slice(start, j).join('\n');
      const before = lines.slice(Math.max(0, i - 4), i).join(' ');
      out.push({ id: `${relative(REPO, file)}:${start}`, file: relative(REPO, file), line: start, code, badContext: BAD_CONTEXT.test(before) || BAD_CONTEXT.test(code.split('\n')[0]) });
      i = j;
    }
  }
  for (const f of fs.readdirSync(join(SKILL_DIR, 'templates')).filter((n) => n.endsWith('.html')).sort()) {
    const file = join(SKILL_DIR, 'templates', f);
    out.push({ id: `${relative(REPO, file)}:1`, file: relative(REPO, file), line: 1, code: fs.readFileSync(file, 'utf8'), badContext: false });
  }
  return filter ? out.filter((e) => e.id.includes(filter)) : out;
}

function pageFor(example) {
  const usesElements = example.file.includes('/elements/') || /cdn-elements\.no-js\.dev|no-js\.dev\/elements/.test(example.code) || ELEMENT_DIRECTIVES.test(example.code);
  const isDocument = /^\s*(<!doctype|<html)/i.test(example.code);
  if (isDocument) return { html: example.code, usesElements, isDocument };
  const scripts = `<script src="https://cdn.no-js.dev/"></script>${usesElements ? '<script src="https://cdn-elements.no-js.dev/"></script>' : ''}`;
  const hasCore = /cdn\.no-js\.dev/.test(example.code);
  return { html: `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>example</title>${hasCore ? '' : scripts}</head><body>\n${example.code}\n</body></html>`, usesElements, isDocument };
}

async function cmdExamples(argv) {
  const fileArg = argv.indexOf('--file');
  const jobsArg = argv.indexOf('--jobs');
  const filter = fileArg >= 0 ? argv[fileArg + 1] : null;
  const jobs = jobsArg >= 0 ? Number(argv[jobsArg + 1]) : 4;
  const coreJs = join(CORE_DIR, 'dist/iife/no.js');
  const elementsJs = join(ELEMENTS_DIR, 'dist/iife/nojs-elements.js');
  if (!fs.existsSync(coreJs)) { console.error(`vsk: core is not built at ${coreJs}`); process.exit(2); }
  const pwDir = playwrightDir();
  if (!pwDir) { console.error('vsk: no @playwright/test found; set PLAYWRIGHT_DIR to a directory with node_modules/@playwright/test'); process.exit(2); }
  const { chromium } = await import(pathToFileURL(join(pwDir, 'node_modules/@playwright/test/index.mjs')).href);
  const core = fs.readFileSync(coreJs);
  const elements = fs.existsSync(elementsJs) ? fs.readFileSync(elementsJs) : null;
  const examples = collectExamples(filter);
  const dir = evidenceDir();
  fs.mkdirSync(join(dir, 'failed'), { recursive: true });
  const browser = await chromium.launch();
  const results = [];
  let next = 0;
  const worker = async () => {
    while (next < examples.length) {
      const ex = examples[next++];
      const { html, usesElements, isDocument } = pageFor(ex);
      const context = await browser.newContext({ viewport: { width: 1024, height: 700 }, locale: 'en-US', timezoneId: 'UTC' });
      await context.route('**/*', (route) => {
        const url = route.request().url();
        if (url === `${ORIGIN}/example.html`) return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: html });
        if (/^https:\/\/cdn-elements\.no-js\.dev\//.test(url) || url.startsWith('https://cdn.no-js.dev/elements')) {
          return elements ? route.fulfill({ status: 200, contentType: 'text/javascript', body: elements }) : route.fulfill({ status: 404, body: '' });
        }
        if (url.startsWith('https://cdn.no-js.dev/')) return route.fulfill({ status: 200, contentType: 'text/javascript', body: core });
        if (url.startsWith(`${ORIGIN}/`)) return route.fulfill({ status: 404, contentType: 'application/json', body: '{"message":"not served by vsk"}' });
        return route.abort();
      });
      const page = await context.newPage();
      const messages = [];
      page.on('pageerror', (e) => messages.push({ kind: 'pageerror', text: e.message }));
      page.on('console', (m) => {
        const text = m.text();
        if (!/^\[No\.JS\]/.test(text) && m.type() !== 'error') return;
        if (/Failed to load resource/.test(text)) return;
        messages.push({ kind: /Expression error/.test(text) ? 'expression' : (/^\[No\.JS\]/.test(text) ? 'core' : 'console-error'), type: m.type(), text: text.slice(0, 300) });
      });
      page.on('dialog', (d) => d.dismiss().catch(() => {}));
      let loaded = true;
      try {
        await page.goto(`${ORIGIN}/example.html`, { waitUntil: 'load', timeout: 10000 });
        await sleep(400);
      } catch (e) { loaded = false; messages.push({ kind: 'pageerror', text: `load: ${e.message.split('\n')[0]}` }); }
      const coreReady = loaded && await page.evaluate(() => typeof window.NoJS === 'object' && typeof window.NoJS.init === 'function').catch(() => false);
      const errors = messages.filter((m) => m.kind === 'pageerror' || m.kind === 'expression');
      const status = !coreReady || errors.length ? (ex.badContext ? 'expected-bad' : 'fail') : 'pass';
      if (status === 'fail') {
        const base = join(dir, 'failed', ex.id.replace(/[/:]/g, '_'));
        fs.writeFileSync(`${base}.html`, html);
        await page.screenshot({ path: `${base}.png` }).catch(() => {});
      }
      results.push({ id: ex.id, status, coreReady, usesElements, isDocument, badContext: ex.badContext, messages });
      await context.close();
    }
  };
  try {
    await Promise.all(Array.from({ length: Math.max(1, jobs) }, worker));
  } finally {
    await browser.close();
  }
  results.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  const count = (s) => results.filter((r) => r.status === s).length;
  for (const r of results.filter((x) => x.status !== 'pass')) {
    console.log(`${r.status === 'fail' ? 'FAIL' : 'BAD?'} ${r.id}${r.coreReady ? '' : ' (core did not initialize)'}`);
    for (const m of r.messages.filter((x) => x.kind === 'pageerror' || x.kind === 'expression').slice(0, 2)) console.log(`     ${m.kind}: ${m.text}`);
  }
  const summary = { total: results.length, pass: count('pass'), fail: count('fail'), expectedBad: count('expected-bad'), coreVersion: pkgVersion(CORE_DIR), elementsVersion: pkgVersion(ELEMENTS_DIR), core: CORE_DIR, filter };
  fs.writeFileSync(join(dir, 'examples.json'), `${JSON.stringify({ summary, results }, null, 2)}\n`);
  console.log(`${summary.pass}/${summary.total} examples render with core ${summary.coreVersion} without page or expression errors; ${summary.fail} fail; ${summary.expectedBad} fail inside a "wrong/avoid" context`);
  console.log(`${summary.fail ? 'FAILED' : 'OK'} examples; evidence ${join(dir, 'examples.json')}${summary.fail ? ` and ${join(dir, 'failed')}/` : ''}`);
  return summary.fail === 0;
}

// ── doctor / all ───────────────────────────────────────────────────────

function cmdDoctor() {
  const rows = [];
  const add = (ok, what, detail = '') => rows.push({ ok, what, detail });
  add(Number(process.versions.node.split('.')[0]) >= 20, 'node >= 20 (CI runs 20)', process.version);
  add(fs.existsSync(join(SKILL_DIR, 'SKILL.md')), 'nojs/SKILL.md present', REPO);
  let head = null; try { head = execFileSync('git', ['-C', REPO, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim(); } catch { /* reported */ }
  add(!!head, 'git checkout', head ?? 'not a git checkout');
  add(fs.existsSync(join(CORE_DIR, 'dist/iife/no.js')), 'core built (dist/iife/no.js)', `${CORE_DIR} (${pkgVersion(CORE_DIR)})`);
  const plugin = readJson(join(REPO, '.claude-plugin/plugin.json'));
  add(pkgVersion(CORE_DIR) === plugin.version, 'core version = skill version', `${pkgVersion(CORE_DIR)} / ${plugin.version}`);
  add(fs.existsSync(join(ELEMENTS_DIR, 'dist/iife/nojs-elements.js')), 'NoJS-Elements built (dist/iife)', `${ELEMENTS_DIR} (${pkgVersion(ELEMENTS_DIR)})`);
  const pw = playwrightDir();
  add(!!pw, '@playwright/test importable (PLAYWRIGHT_DIR, NOJS_SERVER_PATH or the core checkout)', pw ?? 'none found');
  return report('doctor', rows);
}

async function cmdAll(argv) {
  const results = { doctor: cmdDoctor(), frontmatter: cmdFrontmatter(), links: cmdLinks(), version: cmdVersion(), examples: await cmdExamples(argv) };
  console.log(Object.entries(results).map(([k, v]) => `${k} ${v ? 'OK' : 'FAILED'}`).join(' | '));
  return Object.values(results).every(Boolean);
}

const [cmd, ...rest] = process.argv.slice(2);
const commands = { doctor: cmdDoctor, frontmatter: cmdFrontmatter, links: cmdLinks, version: cmdVersion, examples: () => cmdExamples(rest), all: () => cmdAll(rest) };
if (!commands[cmd]) {
  const lines = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1);
  console.error(lines.slice(0, lines.findIndex((l) => !l.startsWith('//'))).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(cmd ? 2 : 0);
}
Promise.resolve(commands[cmd]()).then((ok) => { process.exitCode = ok ? 0 : 1; }).catch((err) => { console.error(`vsk: ${err.stack ?? err.message}`); process.exit(1); });
