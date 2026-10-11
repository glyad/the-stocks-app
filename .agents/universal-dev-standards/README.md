# Universal Dev Standards Git skills

Repository-local copies of the requested AsiaOstrich/universal-dev-standards skills live in `.agents/skills`:

| Folder               | Skill invocation      | Purpose                                |
| -------------------- | --------------------- | -------------------------------------- |
| `commit-standards`   | `$commit`             | Conventional Commit messages           |
| `git-workflow-guide` | `$git-workflow-guide` | Branches, PRs, and merges              |
| `checkin-assistant`  | `$checkin`            | Reference for pre-commit quality gates |

`source.json` pins the upstream commit and records original file hashes. Local supporting files are included. References outside the installed folders point to that pinned upstream revision. `LICENSE` preserves upstream licensing; individual documentation files also retain their license notices.

The skills are editable. This repository's `AGENTS.md` and explicit user instructions take precedence over generic upstream examples. Git Flow uses `develop`, English Conventional Commit messages are the default, and `$checkin` is a reference rather than an installed enforcement toolchain. Existing Husky hooks continue to enforce the repository's checks. Installing skills does not execute Git or GitHub mutations or install slash commands from another agent platform.
