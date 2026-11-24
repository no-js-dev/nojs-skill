# Examples

Agents copy the skill's HTML: the ` ```html ` blocks in `SKILL.md` and the reference files, and the four scaffold templates. Each one should be NoJS that loads and runs with the core release the skill describes, so what an agent pastes into a page works. This feature renders every one of them in Chromium with that core build.

## Sub-features

- `ex-render` loads each example; core initializes (`window.NoJS.init` exists).
- `ex-no-errors` raises no uncaught page error and no `[No.JS] Expression error`.
- `ex-elements` loads NoJS-Elements for examples under `references/elements/` or using an Elements directive.
- `ex-templates` renders `templates/scaffold-{core,elements,form,spa}.html` as full documents.
- `ex-counter` labels a failing block that the prose presents as a counter-example (`BAD?`).

## How to get to it (user POV)

- Ask an agent with the skill for a NoJS snippet, or run `/nojs scaffold <kind>` / `/nojs component <name>`; it copies these examples.

## Driving it with vsk

Preconditions:

- Baseline preconditions of the README hold; `$K doctor` shows the core and Elements paths and versions it will use.

- **Render everything.** Run `$K examples`. A `FAIL <path>:<line>` line (with up to two messages) per failing example, then `<pass>/<total> examples render with core <version> without page or expression errors; <n> fail; <m> fail inside a "wrong/avoid" context` and `OK examples` / `FAILED examples`. A full run renders about 530 pages in under a minute with `--jobs 6`.
- **One file.** Run `$K examples --file references/directives/events.md`. Only that file's blocks.
- **Look at a failure.** Open `$VSK_EVIDENCE/<run>/failed/<id>.html` in a browser and view `<id>.png`; `examples.json` lists every `[No.JS]` message of that example.
- **Templates only.** Run `$K examples --file templates/`. Four documents, all `pass`.
- **Proof.** Keep the run's `examples.json` and `failed/`.

## Gotchas

- Examples render in isolation: no API behind invented URLs (`GET /users` answers 404), no custom filters or functions defined elsewhere on the page, no surrounding markup. Such context gaps show as `core` messages (`Unknown filter`, `GET /users failed`) and do not fail; an undefined function in a handler or a script that reads missing markup does fail, because an agent pasting the snippet hits the same error.
- At the time this map was written two examples fail that way: `nojs/references/directives/events.md:242` calls `initChart($el)` and `fetchInitialData()` without defining them (`Expression error: ... is not defined`), and `nojs/references/validation.md:342` reads `document.querySelector('meta[name="csrf-token"]').content` without the meta tag (`Cannot read properties of null`). Report them as documentation findings; do not edit the examples from a verification run.
- `pass` means renders and initializes without errors after 400 ms. Asynchronous behavior after that (timers, polling, SSE) and the visual result are not asserted.
- `expected-bad` is a text heuristic over the four lines before a block; check the prose before accepting the label.
- Dialogs (`confirm`, `alert`) are dismissed automatically.
