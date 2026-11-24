# nojs skill verification map

This directory is the maintained source for verifying what an agent gets from the nojs skill. Read this index, then the feature file for the check you run. Commands assume the shell from the skill's Launch section (`K=.claude/skills/verify-nojs-skill/scripts/vsk.mjs`, `NOJS_CORE_PATH`, `NOJS_ELEMENTS_PATH`, `PLAYWRIGHT_DIR`, `VSK_EVIDENCE` exported, cwd = your NoJS-Skill worktree).

## Baseline preconditions

- `$K doctor` prints only `PASS`.
- The worktree is clean or holds only the change under test (`git status`).
- `VSK_EVIDENCE` names a directory that outlives the run.

## Driving conventions

- Run checks through `vsk.mjs`; each prints `PASS`/`FAIL` lines and a final `OK <check>` or `FAILED <check>` with the evidence path.
- Narrow `examples` with `--file <substring>` while iterating on one reference file; finish with a full `$K all`.
- Treat commands as literal.

## Proof and skip reporting

- Cite the check, the exact failing line (`path:line` for examples and links), and the evidence file.
- A passing example proves that it renders and initializes in isolation. It does not prove the prose about it.
- Report a check you could not run (no core build, no Playwright) with the `doctor` line that failed. Do not substitute another check.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing what the agent consumes, then exactly four H2 sections: `Sub-features`, `How to get to it (user POV)`, `Driving it with vsk` (starting with `Preconditions:`, labeled bullets pairing each action with an exact command and observable result), `Gotchas`.

## Features

- [Registration](./registration.md) covers `.claude-plugin/plugin.json` and the `nojs/SKILL.md` frontmatter an agent host reads to register and trigger the skill.
- [References](./references.md) covers the relative links from `SKILL.md` and between reference files: the target files and heading anchors.
- [Version contract](./version.md) covers the shared ecosystem version in `plugin.json` and `SKILL.md`, as CI checks it.
- [Examples](./examples.md) covers every HTML example and template rendered with NoJS core in Chromium.
