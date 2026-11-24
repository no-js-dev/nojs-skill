# Registration

An agent host installs the plugin from `.claude-plugin/plugin.json`, finds the skill folders it lists, and registers each `SKILL.md` by its YAML frontmatter: `name` identifies the skill, `description` decides when it triggers, `metadata.version` states the release. A malformed or oversized frontmatter means the skill never registers, or registers with a truncated trigger.

## Sub-features

- `reg-plugin` lists the skill folders (`"skills": ["./nojs"]`) and each holds a `SKILL.md`.
- `reg-frontmatter` opens `SKILL.md` with a `---` block.
- `reg-name` is lowercase letters, digits and hyphens (at most 64) and equals the folder name.
- `reg-description` is present, at most 1024 characters (the Agent Skills limit), without angle brackets.
- `reg-version` equals `plugin.json` `version`.

## How to get to it (user POV)

- Install the plugin in Claude Code (or any Agent Skills host) and type `/nojs`, or mention No.JS in a prompt so the description triggers the skill.

## Driving it with vsk

Preconditions:

- Baseline preconditions of the README hold.

- **Check the registration.** Run `$K frontmatter`. One `PASS`/`FAIL` line per rule, then `OK frontmatter (9/9)` or `FAILED frontmatter (n/9)`.
- **Read the observed values.** Run `jq '.rows[] | {what, ok, detail}' "$(ls -d $VSK_EVIDENCE/*/ | tail -1)frontmatter.json"`. The description row's `detail` is its length in characters; the version row shows both versions.
- **Proof.** Keep the `frontmatter.json` of the run.

## Gotchas

- At the time this map was written the `description` of `nojs/SKILL.md` is 1039 characters, so `description is at most 1024 characters` fails. That is a real finding against the Agent Skills limit, not a harness bug; shorten the description in a docs change rather than raising `VSK_DESCRIPTION_MAX`.
- The parser reads the flat `key: value` lines and one nested level (`metadata:` / `  version:`). A multi-line YAML value (`>` or `|`) would read as empty; keep the description on one line, as it is now.
- CI's own frontmatter step only checks that a `version:` line exists; `vsk.mjs frontmatter` is stricter.
