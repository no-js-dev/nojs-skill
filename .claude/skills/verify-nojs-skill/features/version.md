# Version contract

The skill shares one version with every NoJS repository. `.claude-plugin/plugin.json` holds it; `nojs/SKILL.md` declares it twice (frontmatter `metadata.version` and the `| **Version** |` row); no tracked file may still mention the previous release outside the history files. An agent reads the version to know which core release the skill describes.

## Sub-features

- `ver-declared` finds the version at every location `.versionrc.json` declares, with the exact count.
- `ver-stale` finds no mention of the previous release tag in tracked files outside `scanExclude` (`CHANGELOG.md`, `.github/reviews/`, `*.pen`).
- `ver-core` matches the core checkout the examples render with (`doctor`: core version = skill version).

## How to get to it (user POV)

- Read the Version and Metadata table of the skill, or the plugin version the host shows.

## Driving it with vsk

Preconditions:

- Baseline preconditions of the README hold; the release tags are fetched (`git fetch --tags`), because the stale scan compares against the highest `v*` tag below the current version.

- **Run the CI gate.** Run `$K version`. It prints the script's own output, `version: OK <version>: 2/2 declared locations match, scanned for <previous>`, then `OK version (exit 0)`.
- **Core alignment.** Run `$K doctor`. The line `core version = skill version` is `PASS`.
- **Proof.** Keep the run's `version.txt` (transcript and exit code).

## Gotchas

- Never edit version strings by hand; `node scripts/version.mjs sync X.Y.Z` (or `git release X.Y.Z`) does it. A failing check after a manual edit is the check working.
- Without the tags locally the stale scan reports `no previous release tag found; stale-version scan skipped`, which is not a pass of that rule.
- This skill's own files must not name a release number: the next release's stale scan would flag them.
