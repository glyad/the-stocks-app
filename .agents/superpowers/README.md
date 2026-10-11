# Repository-local Superpowers

This repository vendors the skills and supporting resources from the installed Codex-curated Superpowers **6.4.2** plugin. They are independent editable copies, not symlinks to the global plugin cache. Codex discovers repository skills under `.agents/skills`; see [official skill documentation](https://learn.chatgpt.com/docs/build-skills#where-codex-loads-local-skills).

## Use

Open a Codex chat with this repository as its working directory. Superpowers workflows are enabled automatically for this repository. You can also invoke a local skill explicitly, for example `$superpowers-systematic-debugging`. If the skills do not appear, start a new chat or restart Codex. This chat's working directory is a separate project, so its initial skill catalog may not include these repository skills.

All local skills set `policy.allow_implicit_invocation: true`. `AGENTS.md` explicitly authorizes automatic Superpowers use for this repository and routes requests to the repository copies. Other repositories retain the user’s opt-in preference. Installing these files does not register another marketplace plugin or change the global installation.

## Customize skills and agents

- Edit `.agents/skills/superpowers-<name>/SKILL.md` to change that workflow.
- Edit a skill's `agents/openai.yaml` for its UI metadata and invocation policy. This file is metadata, not a subagent system prompt.
- Edit `.agents/skills/superpowers-subagent-driven-development/implementer-prompt.md`, `task-reviewer-prompt.md`, and `re-review-prompt.md` to customize delegated implementation and review behavior.
- Edit `.agents/skills/superpowers-requesting-code-review/code-reviewer.md` for the code-review prompt.
- Keep helper scripts and references alongside their skill. When adding cross-skill references, use local `superpowers-<name>` names and the matching prefixed sibling directories.

These prompts are loaded by the relevant skill when it delegates work; they are not separately registered Codex agent roles. The stock plugin ships skill workflows and prompt templates rather than standalone Codex agent-role definitions.

## Version and maintenance

`source.json` records the source version, adaptations, and original skill hashes. `LICENSE` preserves the upstream MIT license. Global marketplace updates do not replace these repository copies. To update them, compare a new curated version with the pinned source and merge intentionally, preserving repository customizations and the repository-scoped automatic invocation policy. Review helper scripts before running them; installation does not execute any copied scripts.
