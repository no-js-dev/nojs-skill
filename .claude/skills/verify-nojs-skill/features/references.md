# References

`nojs/SKILL.md` is a map: its tables and sections send the agent to `references/**/*.md` and `templates/*.html` by relative link, and reference files link to each other and to sections by heading anchor. A link to a missing file sends the agent nowhere; a stale anchor sends it to the top of the right file.

## Sub-features

- `ref-files` resolves every relative link target in `nojs/**/*.md` (outside code fences) to an existing file.
- `ref-anchors` finds a heading for every `#anchor` into a markdown file, using GitHub's slug rules (lowercase, punctuation dropped, each space a hyphen, `-1`, `-2` for repeats).

## How to get to it (user POV)

- An agent with the skill loaded follows a link from the Reference File Map in `SKILL.md`, or from a reference file's Contents list, to read the detail.

## Driving it with vsk

Preconditions:

- Baseline preconditions of the README hold.

- **Follow every link.** Run `$K links`. A `FAIL <file> -> <href> — file not found` or `— no heading with anchor #<x>` line per broken link, then `<ok>/<total> relative links resolve (files and heading anchors) in <n> markdown files` and `OK links` / `FAILED links`.
- **Inspect one target.** For a failing anchor, run `grep -n '^#' <target file>` and compare the heading text with the anchor.
- **Proof.** Keep the run's `links.json` (every link, ok or not).

## Gotchas

- At the time this map was written, 886 of 891 links resolve; the five failures are anchors only, all in Contents lists: `binding.md -> #bind-1`, `i18n.md -> #t-1`, `styling.md -> #class-1` and `#style-1` (headings like `` `bind-*` `` slug to `bind-`), and `routing.md -> #accessibility--focusbehavior` (the heading `Accessibility -- focusBehavior` slugs to `accessibility----focusbehavior`). The files resolve; only the jump target is off.
- The slug rules follow GitHub's renderer. Another renderer may slug differently; the agent reading raw markdown ignores anchors altogether, so file failures matter more than anchor failures.
- Links inside fenced code blocks are skipped (they are example content, not navigation).
