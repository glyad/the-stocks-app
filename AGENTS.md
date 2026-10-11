# Repository instructions

## Superpowers

Superpowers is opt-in. Installing or customizing it does not enable automatic use. Apply its workflows only when the user explicitly requests Superpowers for the current task or chat. This rule overrides automatic startup and invocation requirements in the copied skills.

When authorized, prefer this repository's editable skills in `.agents/skills/superpowers-*/SKILL.md` over the globally installed plugin. Map requests for `superpowers:<name>` to the local `superpowers-<name>` skill. Read the selected skill before applying it and resolve supporting files relative to that local skill directory. Use its local prompt templates when a workflow calls for an implementer or reviewer. Repository copies do not grant authorization to message other chats or perform unrelated external actions.

See `.agents/superpowers/README.md` for customization and upstream version information.

## Git workflow

Start work branches from `develop` and integrate completed work back into `develop`. Use the branch name requested by the user; default feature branches use `feature/*`. Do not commit directly to `main` or `develop`. Use Conventional Commit messages.
